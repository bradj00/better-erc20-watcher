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
    console.log(chalk.cyan.underline.inverse('chainData.js')+'\n');
    helpers.bullets('cold start...');
    //get all collection names from mongo for database "watchedTokens"
    MongoClient.connect(mongoUrl, function(err, client) {
        if (err) throw err;
        const db = client.db(dbName);
        db.listCollections().toArray(function(err, collections) {
            if (err) throw err;
            // helpers.bullets(collections);
            let temp = [];
            collections.forEach(collection => {
                temp.push(collection.name);
            });
            // helpers.bullets(temp);
            // for each in array, filter from all documents sorted by timestamp and select the most recent one
            temp.map((collectionName, index) => {
                const collection = db.collection(collectionName);
                collectionName = collectionName.replace(/._/g,"");
                collection.find().sort({block_timestamp: -1}).limit(1).toArray(function(err, result) {
                    if (err) throw err; 
                    if (result.length > 0){
                        const timeAgo = new TimeAgo('en-US')
                        helpers.bullets('most recent cached tx was [ '+ chalk.cyan(timeAgo.format(new Date(result[0].block_timestamp)) )+' ] for ERC20 token '+chalk.cyan.underline(collectionName)+': ');

                        console.log('\n');
                        console.log(result[0]);
                        console.log('\n');
                        getTokenTranscationsFromMoralis(0, 100, collectionName, 1, parseInt(result[0].block_number));

                    }else {
                        
                        helpers.bullets(chalk.red('no txs for: '), collectionName );
                        
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
    
    // helpers.bullets('getting Moralis txs for: ', tokenAddress);
    // helpers.bullets(chalk.red('offset: '), offset);
    // helpers.bullets(chalk.red('limit: '), limit);
    // helpers.bullets(chalk.red('pageCount: '), pageCount);
    // helpers.bullets(chalk.red('fromBlock: '), fromBlock);
    // helpers.bullets(chalk.red('-----------------------'));

    const url = "https://deep-index.moralis.io/api/v2/erc20/"+tokenAddress+"/transfers?chain=eth&limit="+limit+"&offset="+offset+"&from_block="+fromBlock+"&to_block="+(new Date().getTime() );
    
    

    axios.get(url ,{
        headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
        "X-API-Key" : moralisApiKey
        },
    })
    .then(({data}) => {
        helpers.bullets('[ '+data.total+' total ]\tfetched page: ', pageCount  ," / ", Math.ceil((data.total / limit)) );
        // helpers.bullets(typeof (data.result));
        // helpers.bullets(data.result);
        const timeAgo = new TimeAgo('en-US')

        // helpers.bullets(Object.keys(data), data.result.length);
        // helpers.bullets(data.result[0]);
        // data.result.map((tx, index) => {
        //     helpers.bullets(chalk.cyan(timeAgo.format(new Date(tx.block_timestamp)))+'\n  ',chalk.rgb(0,255,0)(helpers.getEllipsisTxt( tx.transaction_hash, 6 )), tx.from_address, tx.to_address, (tx.value / (10**18)).toFixed(4));
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
            helpers.bullets('done fetching token: ', tokenAddress);
            helpers.bullets('total txs: ', tokenTxs.length);
            // helpers.bullets(tokenTxs);

            //put tokenTxs into mongoDB
            
            var duplicateCount = 0;

            // helpers.bullets(chalk.cyan('putting tokens into mongo...') );
            MongoClient.connect(mongoUrl, function(err, client) {
                if (err) throw err;
                const db = client.db(dbName);
                const collection = db.collection("a_"+tokenAddress);
                collection.insertMany(tokenTxs, function(err, res) {
                    if (err) {
                        // helpers.bullets('err:\t',Object.keys(err));
                        // helpers.bullets('err:\t',err.writeErrors[0].errmsg);
                        if (err && err.writeErrors[0].errmsg.includes("duplicate key error collection")){
                            duplicateCount++;
                            helpers.bullets(chalk.red('[ '+duplicateCount+' ] ignoring duplicate tx'));
                        } else if (res && res.insertedCount) {
                            helpers.bullets("Number of documents inserted: " + res.insertedCount);
                        } else {
                            helpers.bullets(chalk.red('err: '), err);
                        }
                    } else {
                        helpers.bullets('caching '+chalk.cyan('new TXs')+' into mongo...') ;
                    }
                    client.close();
                });
            });


        }

    })
}

