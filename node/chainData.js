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
const helpers = require('./helpers/helpers.js');

TimeAgo.addDefaultLocale(en)

//runs once upon script startup. 
function coldStart(){
    console.log(chalk.cyan.underline('cold start'));

    //get all collection names from mongo for database "watchedTokens"
    MongoClient.connect(mongoUrl, function(err, client) {
        if (err) throw err;
        const db = client.db(dbName);
        db.listCollections().toArray(function(err, collections) {
            if (err) throw err;
            // console.log(collections);
            let temp = [];
            collections.forEach(collection => {
                temp.push(collection.name);
            });
            // console.log(temp);
            // for each in array, filter from all documents sorted by timestamp and select the most recent one
            temp.map((collectionName, index) => {
                const collection = db.collection(collectionName);
                collectionName = collectionName.replace(/._/g,"");
                collection.find().sort({block_timestamp: -1}).limit(1).toArray(function(err, result) {
                    if (err) throw err; 
                    if (result.length > 0){
                        const timeAgo = new TimeAgo('en-US')
                        console.log( chalk.cyan(timeAgo.format(new Date(result[0].block_timestamp)) ));
                        console.log('most recent tx for [ '+chalk.cyan(collectionName)+' ]: ',result[0]);
                        getTokenTranscationsFromMoralis(0, 100, collectionName, 1, parseInt(result[0].block_number));

                    }else {
                        
                        console.log(chalk.red('no txs for: '), collectionName );
                        
                        //                             (offset, limit, tokenAddress, pageCount, fromBlock)
                        getTokenTranscationsFromMoralis(0, 100, collectionName, 1, 0); //from block 0
                    }
                });
            });
            // client.close();
        });
    });

    // get timestamp of latest tx. 
    // poll Moralis for token transactions from that timestamp forward

    // if no entries for token, poll for all transactions (watching new token)






}
coldStart();

var tokenTxs = [];

function getTokenTranscationsFromMoralis(offset, limit, tokenAddress, pageCount, fromBlock){
    if (fromBlock == undefined){
        fromBlock = 0;
    }
    
    // console.log('getting Moralis txs for: ', tokenAddress);
    // console.log(chalk.red('offset: '), offset);
    // console.log(chalk.red('limit: '), limit);
    // console.log(chalk.red('pageCount: '), pageCount);
    // console.log(chalk.red('fromBlock: '), fromBlock);
    // console.log(chalk.red('-----------------------'));

    const url = "https://deep-index.moralis.io/api/v2/erc20/"+tokenAddress+"/transfers?chain=eth&limit="+limit+"&offset="+offset+"&from_block="+fromBlock+"&to_block="+(new Date().getTime() );
    
    

    axios.get(url ,{
        headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
        "X-API-Key" : moralisApiKey
        },
    })
    .then(({data}) => {
        console.log('[ '+data.total+' total ]\tfetched page: ', pageCount  ," / ", Math.ceil((data.total / limit)) );
        // console.log(typeof (data.result));
        // console.log(data.result);
        const timeAgo = new TimeAgo('en-US')

        // console.log(Object.keys(data), data.result.length);
        // console.log(data.result[0]);
        // data.result.map((tx, index) => {
        //     console.log(chalk.cyan(timeAgo.format(new Date(tx.block_timestamp)))+'\n  ',chalk.rgb(0,255,0)(helpers.getEllipsisTxt( tx.transaction_hash, 6 )), tx.from_address, tx.to_address, (tx.value / (10**18)).toFixed(4));
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
            console.log('done fetching token: ', tokenAddress);
            console.log('total txs: ', tokenTxs.length);
            // console.log(tokenTxs);

            //put tokenTxs into mongoDB
            console.log(chalk.cyan('putting tokens into mongo...') );
            var duplicateCount = 0;

            MongoClient.connect(mongoUrl, function(err, client) {
                if (err) throw err;
                const db = client.db(dbName);
                const collection = db.collection("a_"+tokenAddress);
                collection.insertMany(tokenTxs, function(err, res) {
                    if (err && err.errmsg.includes("ignoring duplicate tx")){
                        duplicateCount++;
                        console.log(chalk.red('[ '+duplicateCount+' ] duplicate key error collection'));
                    } else {
                        console.log("Number of documents inserted: " + res.insertedCount);
                    }
                    client.close();
                });
            });


        }

    })
}



// function giveMeAName(){
//     MongoClient.connect(mongoUrl, function(err, client) {
//     console.log("Connected successfully to server");
    
//     const db = client.db(dbName);
    
//     db.listCollections().toArray().then(function(docs) {
//         console.log("Available collections:");
//         docs.forEach(function(doc) {
//         console.log(doc.name);
//         });
//     }).catch(function(err) {
//         console.log(err);
//     });
    
//     client.close();
//     });
// }