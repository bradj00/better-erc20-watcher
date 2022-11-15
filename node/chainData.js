console.clear();

// const TimeAgo = require('javascript-time-ago');
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

import chalk from 'chalk';
import axios from 'axios';
import ora from 'ora';

import * as MongoClientQ from 'mongodb';
const MongoClient = MongoClientQ.MongoClient;
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'watchedTokens';

const apiRateLimitMs = 1000; //delay for Moralis API limit when fetching new pages
const sleepTimer = 60000;    //delay for Moralis API limit for how often to update token TXs

const moralisApiKey = "T7pqHUU2RfiIe9i7Ppo0WNC3trCzDRs6bWAMhraTZSJBU1KqiJoLpHKejgUrNQJD";
import * as h from './helpers/h.cjs';
TimeAgo.addDefaultLocale(en)

const spinner = ora(`[`+Date().substr(15,9)+` ] `+'Begin checking '+chalk.magenta('Moralis')+' every '+chalk.magenta(sleepTimer/1000+'s')+' for new TXs...');
spinner.color = 'white'



//function that connects to mongodb, uses db "watchedTokens" and for each collection, check if document exists where field "isSyncing" is true. If so console.log('syncing...') and resolve true.
function checkIfSyncing(tokenName){
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
            if (err) {
                h.fancylog(err, 'error');
                reject(err);
            }
            const db = client.db(dbName);
            let isSyncing = false;
            
            let t = "a_"+tokenName;
            db.collection("isSyncing").findOne({t: true}, function(err, result) {
                if (err) {
                    h.fancylog(err, 'error');
                    reject(err);
                }
                if (result){
                    isSyncing = true;
                    resolve(true);
                }
            });
            
            // client.close();
            resolve(isSyncing);
            
        });
    });
}

setInterval(()=>{
    updateAllWatchedTokens('not cold start');
},30000);




function updateSingleTokenList(tokenAddresses, coldStart) {
    return tokenAddresses.reduce(
        (acc, collectionName) =>
        acc.then((res) =>
            new Promise((resolve) =>{
                
                //if collectionName is "isSyncing" then skip
                if (collectionName == "isSyncing"){
                    resolve(true);
                    return;
                }
                    

                collectionName = collectionName.replace(/._/g,"");
                checkIfSyncing(collectionName).then((isSyncing)=>{
                    if (!isSyncing){
                        h.fancylog('not syncing. Proceeding to gathering updated TXs..', 'mongo', collectionName);


                        MongoClient.connect(mongoUrl, function(err, client) {
                            const db = client.db(dbName);        
                            const collection = db.collection(collectionName);
                            collection.find().sort({block_timestamp: -1}).limit(1).toArray(function(err, result) {
                                if (err) throw err; 
                                if (result.length > 0){
                                    const timeAgo = new TimeAgo('en-US')
                                    if (!coldStart){h.fancylog('most recent cached tx was [ '+ chalk.cyan(timeAgo.format(new Date(result[0].block_timestamp)) )+' ] for ERC20 token '+chalk.cyan.underline(collectionName)+': ', 'mongo', collectionName);}
                                    // if (!coldStart){h.fancylog('most recent cached tx was [  ] for ERC20 token '+chalk.cyan.underline(collectionName)+': ', 'mongo', collectionName);}

                                    result[0].value = parseFloat(result[0].value/(10**18).toFixed(4));
                                    if (!coldStart){
                                        console.log('\n');
                                        console.log(result[0]);
                                        console.log('\n');
                                    }
                                    getTokenTranscationsFromMoralis(0, 100, collectionName, 1, parseInt(result[0].block_number), coldStart, resolve);
                                    // client.close();
                                    // if (!spinner.isSpinning){spinner.start();}
                                    
                                }else {
                                    
                                    if (!coldStart){h.fancylog('no txs for token (empty collection?)', 'mongo', collectionName  );}
                                    if (!coldStart){console.log(result);}

                                    let q = 0;
                                    if (collectionName != "0x1892f6ff5fbe11c31158f8c6f6f6e33106c5b10e"){
                                        q = 15978891;   //super active tokens wont start from beginning of time (only for testing while building the ingestion engine)
                                    }
                                    getTokenTranscationsFromMoralis(0, 100, collectionName, 1, q, coldStart, resolve); 
                                }
                            });
                        });
                    } else {
                        h.fancylog('is syncing. Skipping..', 'mongo', collectionName);
                        resolve(true);
                    }
                    
                   

                });


            }
            )
        ),
        Promise.resolve()
    )
}














updateAllWatchedTokens();
function updateAllWatchedTokens(coldStart){
    


    if (!coldStart){
        console.log(chalk.cyan.underline.inverse('chainData.js')+'\n');
        h.fancylog('cold start...');
    }
    //get all collection names from mongo for database "watchedTokens"
    MongoClient.connect(mongoUrl, function(err, client) {
        if (err) throw err;
        const db = client.db(dbName);
        db.listCollections().toArray(function(err, collections) {
            if (err) throw err;
            

            // h.fancylog(collections);
            let watchedTokenContracts = [];
            collections.forEach(collection => {
                watchedTokenContracts.push(collection.name);
            });
            // h.fancylog(watchedTokenContracts);
            
          

            updateSingleTokenList(watchedTokenContracts, coldStart).then((q) =>
                console.log(`all token TXs are up to date for all watched tokens. sleeping..`)
            );

            watchedTokenContracts.map((collectionName, index) => {

            });
            
        });
    });


}


var tokenTxs = [];


function getTokenTranscationsFromMoralis(offset, limit, tokenAddress, pageCount, fromBlock, coldStart, resolve){
    if ((fromBlock == undefined)){
        fromBlock = 0;
    }
    

    const url = "https://deep-index.moralis.io/api/v2/erc20/"+tokenAddress+"/transfers?chain=eth&limit="+limit+"&offset="+offset+"&from_block="+(fromBlock+1)+"&to_block="+(new Date().getTime() );

    axios.get(url ,{
        headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
        "X-API-Key" : moralisApiKey
        },
    })
    .then(({data}) => {
        if (data.result.length > 0){
            h.fancylog('[ '+chalk.cyan(data.total+' TXs')+' ]\tfetched page: '+ pageCount  +" / "+ Math.ceil((data.total / limit)) , 'moralis', tokenAddress) ;
        }
        // h.fancylog(typeof (data.result));
        // h.fancylog(data.result);
        const timeAgo = new TimeAgo('en-US')

        // h.fancylog(Object.keys(data), data.result.length);
        // h.fancylog(data.result[0]);
        // data.result.map((tx, index) => {
        //     h.fancylog(chalk.cyan(timeAgo.format(new Date(tx.block_timestamp)))+'\n  ',chalk.rgb(0,255,0)(h.getEllipsisTxt( tx.transaction_hash, 6 )), tx.from_address, tx.to_address, (tx.value / (10**18)).toFixed(4));
        // });

        //for each tx in data.result, push to tokenTxs array
        data.result.map((tx, index) => {
            tokenTxs.push(tx);
        });
        if (offset + limit < data.total){
            setTimeout( ()=>{
                getTokenTranscationsFromMoralis(offset + limit, limit, tokenAddress, pageCount+1, fromBlock, coldStart, resolve);
            }, apiRateLimitMs);
        } else {
            // h.fancylog('total txs: ', tokenTxs.length);
            // h.fancylog(tokenTxs);

            //put tokenTxs into mongoDB
            
            var duplicateCount = 0;

            //if there are TXs to put into mongo
            if (tokenTxs.length > 0){
            if (!coldStart){h.fancylog('Done fetching token TXs. Attempting to put TXs into mongo...', 'mongo', tokenAddress) ;}
            MongoClient.connect(mongoUrl, function(err, client) {
                if (err) throw err;
                const db = client.db(dbName);
                const collection = db.collection("a_"+tokenAddress);
                collection.insertMany(tokenTxs, function(err, res) {
                    if (err) {
                        // h.fancylog('err:\t',Object.keys(err));
                        // h.fancylog('err:\t',err.writeErrors[0].errmsg);
                        if (err && err.writeErrors[0].errmsg.includes("duplicate key error collection")){
                            duplicateCount++;
                            h.fancylog('ignoring ['+chalk.red(duplicateCount)+'] duplicate tx', 'mongo') ;
                        } else if (res && res.insertedCount) {
                            h.fancylog("Number of documents inserted: " + res.insertedCount, 'mongo') ;
                        } else {
                            h.fancylog(chalk.red('err: '), err, 'mongo') ;
                        }
                        resolve(true);
                    } else {
                        h.fancylog('caching '+chalk.cyan('new TXs')+' into mongo...', 'mongo') ;
                        resolve(true);
                        // client.close();
                    }
                    // client.close();
                });
            });
            }  else {
                if (!coldStart){
                    // h.fancylog('no new TXs to cache', 'moralis');
                    // if (!spinner.isSpinning){spinner.start();}else {spinner.succeed('ayyyyy')}
                    // if (!spinner.isSpinning){spinner.start();}
                }
                else {  }
            } 


        }

    })
    .catch(function (error) {
        console.log(chalk.red('there was an error making the web fetch call: '),error);
      })
}

