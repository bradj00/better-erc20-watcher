console.clear();

const TimeAgo = require('javascript-time-ago');
const en = require('javascript-time-ago/locale/en')
const chalk = require('chalk');
const axios = require('axios');

const MongoClient = require('mongodb').MongoClient;
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'watchedTokens';


const moralisApiKey = "T7pqHUU2RfiIe9i7Ppo0WNC3trCzDRs6bWAMhraTZSJBU1KqiJoLpHKejgUrNQJD";
const apiRateLimitMs = 500;
const h = require('./helpers/h.js');

TimeAgo.addDefaultLocale(en)

//runs once upon script startup. 
function coldStart(){
    console.log(chalk.cyan.underline.inverse('chainData.js')+'\n');
    h.fancylog('cold start...');
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
            // for each in array, filter from all documents sorted by timestamp and select the most recent one
            watchedTokenContracts.map((collectionName, index) => {
                const collection = db.collection(collectionName);
                collectionName = collectionName.replace(/._/g,"");
                collection.find().sort({block_timestamp: -1}).limit(1).toArray(function(err, result) {
                    if (err) throw err; 
                    if (result.length > 0){
                        const timeAgo = new TimeAgo('en-US')
                        h.fancylog('most recent cached tx was [ '+ chalk.cyan(timeAgo.format(new Date(result[0].block_timestamp)) )+' ] for ERC20 token '+chalk.cyan.underline(collectionName)+': ', 'mongo');

                        console.log('\n');
                        console.log(result[0]);
                        console.log('\n');
                        getTokenTranscationsFromMoralis(0, 100, collectionName, 1, parseInt(result[0].block_number));

                    }else {
                        
                        h.fancylog(chalk.red('no txs for: '), collectionName );
                        
                        //                             (offset, limit, tokenAddress, pageCount, fromBlock)
                        getTokenTranscationsFromMoralis(0, 100, collectionName, 1, 0); //from block 0
                    }
                });
            });
            // client.close();
        });
    });


}
coldStart();

var tokenTxs = [];

function getTokenTranscationsFromMoralis(offset, limit, tokenAddress, pageCount, fromBlock){
    if (fromBlock == undefined){
        fromBlock = 0;
    }
    
    // h.fancylog('getting Moralis txs for: ', tokenAddress);
    // h.fancylog(chalk.red('offset: '), offset);
    // h.fancylog(chalk.red('limit: '), limit);
    // h.fancylog(chalk.red('pageCount: '), pageCount);
    // h.fancylog(chalk.red('fromBlock: '), fromBlock);
    // h.fancylog(chalk.red('-----------------------'));

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
            h.fancylog('[ '+chalk.cyan(data.total+' TXs')+' ]\tfetched page: ', pageCount  ," / ", Math.ceil((data.total / limit)) , 'moralis') ;
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
                getTokenTranscationsFromMoralis(offset + limit, limit, tokenAddress, pageCount+1, fromBlock);
            }, apiRateLimitMs);
        } else {
            // h.fancylog('total txs: ', tokenTxs.length);
            // h.fancylog(tokenTxs);

            //put tokenTxs into mongoDB
            
            var duplicateCount = 0;

            //if there are TXs to put into mongo
            if (tokenTxs.length > 0){
            h.fancylog('Done fetching token TXs. Attempting to put TXs into mongo...', 'mongo') ;
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
                    } else {
                        h.fancylog('caching '+chalk.cyan('new TXs')+' into mongo...', 'mongo') ;
                    }
                    client.close();
                });
            });
            }  else {
                h.fancylog('no new TXs to cache', 'moralis');
            } 


        }

    })
}

