console.clear();

// const TimeAgo = require('javascript-time-ago');
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

import chalk from 'chalk';
import axios from 'axios';
import ora from 'ora';
import dotenv from 'dotenv';
import * as h from './helpers/h.cjs';
import * as MongoClientQ from 'mongodb';

dotenv.config();


// import  lookupSingleAddress from './translator.js';

const MongoClient = MongoClientQ.MongoClient; 
const mongoUrl = 'mongodb://127.0.0.1:27017';
const dbName = 'watchedTokens';
const dbNameFriendlyNames = 'friendlyNames';

const apiRateLimitMs = 1000; //delay for Moralis API limit when fetching new pages
const sleepTimer = 15000;    //delay for Moralis API limit for how often to update token TXs
var latestBlock = 0;

const moralisApiKey = process.env.API_KEY;
TimeAgo.addDefaultLocale(en)



setInterval(()=>{
    const timestamp = new Date().getTime();
    timestamp.toString();
    try{
        // console.log('1\t');
        MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
            if (err) {
                h.fancylog('1'+err, 'error');
                client.close();
            }else {
                const db = client.db('heartbeats');
                db.collection("chainData").updateOne({heartbeat: { $lt: timestamp }}, {$set:{heartbeat:timestamp}}, { upsert: true }, function(err, result) {
                    if (err){
                        console.log('error updating heartbeat');
                        client.close();
                    }
                    if (result){
                        // console.log('updated heartbeat: '+timestamp);
                        client.close();
                    }
                });
            }

        });
    }catch(err){
        h.fancylog('2'+err, 'error');
    }
}, 1000);



var spinner = ora(`[ `+theDate+` ] `+"[" + chalk.bold.rgb(0,255,255)('system ') + "]"+' [ block '+chalk.cyan(latestBlock)+' ] all token TXs are up to date for all watched tokens. sleeping..')
// const spinner = ora(`[`+Date().substr(15,9)+` ] `+'Begin checking '+chalk.magenta('Moralis')+' every '+chalk.magenta(sleepTimer/1000+'s')+' for new TXs...');
spinner.color = 'white'

function lookupSingleAddress(address, delay5){
    return new Promise(async (resolve, reject) => {
    try {
        // console.log('2\t');
        const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
        const dbFN = client.db(dbNameFriendlyNames);
        const collection = await dbFN.collection('lookup').find({address: address}).toArray();
    

        if (collection.length === 0) {
            // even if it's blank lets move the task of looking up new addresses to translator.js and only use this function for mongo lookups
            // setTimeout( async ()=>{
            //     // console.log(count+' / '+uniqueAddys.length+'\tOpenSea lookup: ' + address);
            //     const data  = await checkAddress(address);
            //     if (data ) {
            //         // console.log(chalk.green(`Found username ${data}`));
            //         resolve(data);
            //         client.close();
            //     } 
            //     else {
            //         // console.log(chalk.red(`No username found for ${address}`));
            //         resolve(data);
            //         client.close();
            //     }
            // }, 500 * delay5);
            client.close();
            resolve(address);
        } else {
            client.close();
            resolve(collection[0]);
        }
    
    } catch (error) {
        console.error(error);
        resolve(error);
    }
    });
}

//function that connects to mongodb, uses db "watchedTokens" and for each collection, check if document exists where field "isSyncing" is true. If so console.log('syncing...') and resolve true.
function checkIfSyncing(tokenName){
    
    // console.log('checking if [', chalk.yellow(tokenName), '] is in the middle of fetching/caching...');
    return new Promise((resolve, reject) => {
    //     try{
    //     // console.log('333\t');
    //     MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
    //         if (err) {
    //             h.fancylog('3'+err, 'error');
    //             client.close();
    //             resolve(err);
    //         }else {
    //         const db = client.db(dbName);
    //         let isSyncing = false;
            
    //         let t = "a_"+tokenName;
    //         db.collection("isSyncing").findOne({t: true}, function(err, result) {
    //             if (err) {
    //                 h.fancylog('4'+err, 'error');
    //                 client.close();
    //                 resolve(err);
    //             }
    //             if (result){
    //                 // isSyncing = true;
    //                 client.close();
    //                 resolve(true);
    //             }
    //         });
            
    //         client.close();
    //         // resolve(isSyncing);
    //         }
    //     });
    // } catch (error) {
    //     console.log(error);
    //     resolve(error);
    // }
        resolve();
    });
}

var theDate = Date().substr(15,9)
var spinner = ora(`[ `+theDate+` ] `+"[" + chalk.bold.rgb(0,255,255)('system ') + "]"+' [ block '+chalk.cyan(latestBlock)+' ] all token TXs are up to date for all watched tokens. sleeping..')
setInterval(()=>{
    getLatestBlockFromMoralis();
    updateAllWatchedTokens('not cold start');
    spinner.stop();
    theDate = Date().substr(15,9)
    spinner = ora(`[ `+theDate+` ] `+"[" + chalk.bold.rgb(0,255,255)('system ') + "]"+' [ block '+chalk.cyan(latestBlock)+' ] all token TXs are up to date for all watched tokens. sleeping..')
    spinner.start();
},sleepTimer);
getLatestBlockFromMoralis();



function updateSingleTokenList(tokenAddresses, coldStart) {
    return tokenAddresses.reduce(
        (acc, collectionName) =>
        acc.then((res) =>
            new Promise((resolve) =>{
                var tokenTxs = [];
                //if collectionName is "isSyncing" then skip
                if (collectionName == "isSyncing"){
                    // console.log(chalk.cyan('IGNORING isSyncing collection'));
                    resolve(true);
                    return;
                }
                    

                collectionName = collectionName.replace(/._/g,"");
                checkIfSyncing(collectionName).then((isSyncing)=>{
                    if (!isSyncing){
                        // h.fancylog('not in the middle of a sync. Proceeding to gathering updated TXs..', ' mongo ', collectionName);

                        try {
                        // console.log('4\t');
                        MongoClient.connect(mongoUrl, function(err, client) {
                            if (err) {
                                h.fancylog('5'+err, 'error');
                                client.close();
                                resolve(err);
                                return;
                            }else {
                            const db = client.db(dbName);        
                            const collection = db.collection(("a_"+collectionName));
                            collection.find().sort({block_timestamp: -1}).limit(1).toArray(function(err, result) {
                                if (err) console.log(err); 
                                if (result && result.length > 0){
                                    const timeAgo = new TimeAgo('en-US')
                                    if (!coldStart && result[0]&& result[0].blockTimestamp){h.fancylog('most recent cached tx was [ '+ chalk.cyan(timeAgo.format(new Date(result[0].block_timestamp)) )+' ] for ERC20 token '+chalk.cyan.underline(collectionName)+': ', ' mongo ', collectionName,spinner);}
                                    // if (!coldStart){h.fancylog('most recent cached tx was [  ] for ERC20 token '+chalk.cyan.underline(collectionName)+': ', ' mongo ', collectionName);}

                                    result[0].value = parseFloat(result[0].value/(10**18).toFixed(4));
                                    if (!coldStart){
                                        // console.log('\n');
                                        // // console.log(result[0]);
                                        // console.log('\n');
                                    }
                                    client.close();
                                    getTokenTranscationsFromMoralis(0, 100, collectionName, 1, parseInt(result[0].block_number), coldStart, resolve, tokenTxs);
                                    // client.close();
                                    // if (!spinner.isSpinning){spinner.start();}
                                    
                                }else {
                                    
                                    if (!coldStart){h.fancylog('no txs for token (empty collection?)', ' mongo ', collectionName, spinner  );}
                                   

                                    let q = 0;
                                    if (collectionName != "0x1892f6ff5fbe11c31158f8c6f6f6e33106c5b10e"){
                                        q = 16017606 ;   //WALRUS - super active tokens wont start from beginning of time (only for testing while building the ingestion engine)
                                    }       
                                    client.close();
                                    getTokenTranscationsFromMoralis(0, 100, collectionName, 1, q, coldStart, resolve, tokenTxs); 
                                }
                            });
                            }
                        });
                    } catch (error) {
                        console.log(error);
                        resolve(error);
                    }
                    } else {
                        // h.fancylog('is syncing. Skipping..', ' mongo ', collectionName, spinner);
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

    try {
    // console.log('5\t');
    MongoClient.connect(mongoUrl, function(err, client) {
        if (err) console.log('THERE WAS AN ERROR: ',err);
        if (!client ){ h.fancylog('mongo client not connected. exiting..', 'error'); client.close(); return;}

        const db = client.db(dbName);
        db.listCollections().toArray(function(err, collections) {
            if (err) {
                console.log('THERE WAS AN ERROR: ',err);
                client.close();
                return;
            }
            

            // h.fancylog(collections);
            let watchedTokenContracts = [];
            collections.forEach((collection, index) => {
                watchedTokenContracts.push(collection.name);

                //if last collection then update all token lists
                if (index == collections.length-1){
                    client.close();
                }
            });
            // h.fancylog(watchedTokenContracts,'watched tokens');
            
          

            updateSingleTokenList(watchedTokenContracts, coldStart).then((q) =>{
                // h.fancylog(`all token TXs are up to date for all watched tokens. sleeping..`, 'system ')
                if (!spinner.isSpinning){spinner.start();}
                client.close();
            });

            // watchedTokenContracts.map((collectionName, index) => {

            // });
            
        });
    });
    } catch (error) {
        console.log(error);
        // client.close();
        resolve(error);
    }


}

function getLatestBlockFromMoralis(){
    const url = "https://deep-index.moralis.io/api/v2/dateToBlock?chain=eth&date="+(new Date().getTime() );

    axios.get(url ,{
        headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
        "X-API-Key" : moralisApiKey
        },
    })
    .then(({data}) => {
        latestBlock = data.block;
    })
    .catch((error) => {
        console.error('error fetching new block from moralis: ',error.code)
    })


}

function getTokenTranscationsFromMoralis(offset, limit, tokenAddress, pageCount, fromBlock, coldStart, resolve, tokenTxs){
    if ((fromBlock == undefined) || (!fromBlock)){
        // fromBlock = 16017606; //WALRUS - super active tokens wont start from beginning of time (only for testing while building the ingestion engine)
        fromBlock = 0; //WALRUS - super active tokens wont start from beginning of time (only for testing while building the ingestion engine)
    }
    
    //1 block past the last block we have in our db
    const url = "https://deep-index.moralis.io/api/v2/erc20/"+tokenAddress+"/transfers?chain=eth&limit="+limit+"&offset="+offset+"&from_block="+(fromBlock+1)+"&to_date="+(new Date().getTime() );

    axios.get(url ,{
        headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
        "X-API-Key" : moralisApiKey
        },
    })
    .then(({data}) => {
        if (data.result.length > 0){
            h.fancylog('[ '+chalk.cyan(data.total+' TXs')+' ]\tfetched page: '+ pageCount  +" / "+ Math.ceil((data.total / limit)) , 'moralis', tokenAddress, spinner) ;
            // console.log('\t'+data.result.length+'\t'+data.result[0].transaction_hash);
        }

        const timeAgo = new TimeAgo('en-US')


        let delay5 = 0;
        // tokenTxs = [];
        for (let i = 0; i < data.result.length; i++) {
            delay5++;
            let tx = data.result[i];

            lookupSingleAddress(tx.from_address, delay5).then((q) => {
                lookupSingleAddress(tx.to_address, delay5).then((x) => {
                    // console.log('\n\t\t'+chalk.cyan('from: '),tx.from_address, chalk.cyan('to: '),tx.to_address);

                    tokenTxs.push({
                        block_number: tx.block_number,
                        block_timestamp: tx.block_timestamp,
                        from_address: tx.from_address,
                        to_address: tx.to_address,
                        value: tx.value,
                        transaction_hash: tx.transaction_hash,
                        from_address_friendlyName: q,
                        to_address_friendlyName: x
                    });

                });
            });

            

        } 
        if ((offset) < (data.total)){ //if there are more pages
            setTimeout( ()=>{
                getTokenTranscationsFromMoralis(offset + limit, limit, tokenAddress, pageCount+1, fromBlock, coldStart, resolve, tokenTxs);
            }, apiRateLimitMs);
        } 
        else {

            var duplicateCount = 0;

            setTimeout(()=>{
            if (tokenTxs.length > 0){
                if (!coldStart){h.fancylog('Done fetching token TXs. Attempting to put TXs into mongo...', ' mongo ', tokenAddress, spinner) ;}
                
                try{
                // console.log('6\t');
                MongoClient.connect(mongoUrl, function(err, client) {
                    if (err) console.log('THERE WAS AN ERROR: ',err);
                    const db = client.db(dbName);
                    const collection = db.collection("a_"+tokenAddress);
                    
                    

                    //for each token in tokenTxs, look up the friendlyNames for from and to addresses and add them to the object
                    tokenTxs.map((tx, index) => {
                        // return new Promise((resolve, reject) => {
                            lookupSingleAddress(tx.from_address).then((q) => {
                                lookupSingleAddress(tx.to_address).then((x) => {
                                    console.log('\n\t\t'+chalk.cyan('from: '),tx.from_address, chalk.cyan('to: '),tx.to_address);
                                    
                                    tokenTxs[index].from_address_friendlyName = q;
                                    tokenTxs[index].to_address_friendlyName = x;

                                    // if (index == tx.length-1){
                                    //     resolve(true);
                                    // }
                                });
                            });
                        // });
                    })

                    // console.log('---------------------')
                    // console.log(tokenTxs);
                    // console.log('tokenTxs: ',tokenTxs.length);
                    // console.log('---------------------')

                    collection.insertMany(tokenTxs, [{"continueOnError": true}], function(err, res) {
                        if (err) {

                            if (err && err.writeErrors[0].errmsg.includes("duplicate key error collection")){
                                duplicateCount++;
                                h.fancylog('ignoring ['+chalk.red(duplicateCount)+'] duplicate tx', ' mongo ', spinner) ;
                            } else if (res && res.insertedCount) {
                                h.fancylog("Number of documents inserted: " + res.insertedCount, ' mongo ', spinner) ;
                            } else {
                                h.fancylog(chalk.red('mongo err: '), err, ' error ', spinner) ;
                            }
                            client.close();
                            resolve(true);
                        } else {
                            //there's no error and insertion was successful. 
                            h.fancylog('cached ('+chalk.cyan(res.insertedCount)+') new TXs', ' mongo ', tokenAddress, spinner) ;
                            client.close();
                            resolve(true);
                        }
                        // client.close();
                    });
                
                        
                    
                });
                } catch (error) {
                    console.log(error);
                    client.close();
                    resolve(error);
                }

            }  
            else {
                if (!coldStart){
                    // h.fancylog('no new TXs to cache', 'moralis');
                    // if (!spinner.isSpinning){spinner.start();}else {spinner.succeed('ayyyyy')}
                    // if (!spinner.isSpinning){spinner.start();}
                }
                else {  }
                resolve(true);
            } 
            }, 100);


        }

    })
    .catch(function (error) {
        console.log(chalk.red('there was an error making the web fetch call: '),error.code);
      })
}
