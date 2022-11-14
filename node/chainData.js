console.clear();

const TimeAgo = require('javascript-time-ago');
const en = require('javascript-time-ago/locale/en')
const chalk = require('chalk');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'watchedTokens';
const moralisApiKey = "T7pqHUU2RfiIe9i7Ppo0WNC3trCzDRs6bWAMhraTZSJBU1KqiJoLpHKejgUrNQJD";
const apiRateLimitMs = 5000;
const helpers = require('./helpers/helpers.js');

TimeAgo.addDefaultLocale(en)

//runs once upon script startup. 
function coldStart(){
    //get all collection names for database "watchedTokens"
    //  [ 0x00asdf, 0x00123, 0x1234556 ] array of token addresses

    // for each in array, filter from all documents sorted by timestamp
    // get timestamp of latest tx. 
    // poll Moralis for token transactions from that timestamp forward

    // if no entries for token, poll for all transactions (watching new token)


}
// coldStart();


function getTokenTranscationsFromMoralis(offset, limit, tokenAddress, pageCount){
    

    const url = "https://deep-index.moralis.io/api/v2/erc20/"+tokenAddress+"/transfers?chain=eth&limit="+limit+"&offset="+offset
    // axios.post(url, data, {
    axios.get(url ,{
        headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
        "X-API-Key" : moralisApiKey
        },
    })
    .then(({data}) => {
        console.log('fetched page: ', pageCount  ," / ", Math.ceil((data.total / limit)) );

        const timeAgo = new TimeAgo('en-US')

        console.log(Object.keys(data), data.result.length);
        console.log(data.result[0]);
        data.result.map((tx, index) => {
            console.log(chalk.cyan(timeAgo.format(new Date(tx.block_timestamp)))+'\n  ',chalk.rgb(0,255,0)(helpers.getEllipsisTxt( tx.transaction_hash, 6 )), tx.from_address, tx.to_address, (tx.value / (10**18)).toFixed(4));
        });



        if (offset + limit < data.total){
            setTimeout( ()=>{
                getTokenTranscationsFromMoralis(offset + limit, limit, tokenAddress, pageCount+1);
            }, apiRateLimitMs);
        } else {
            console.log('done fetching token: ', tokenAddress);
        }

    })
}
getTokenTranscationsFromMoralis(0, 100, "0x1892f6ff5fbe11c31158f8c6f6f6e33106c5b10e", 1);



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