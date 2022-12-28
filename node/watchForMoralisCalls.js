// this script is called by the watcher to check for moralis lookup requests from mongodb 
// if there are lookup requests to process, call them sequentially following throttle rules 
// and update the db with the results

// this way we can have as many lookup requests as we want, and they will be processed without 
// breaking the moralis api rate limit

import * as MongoClientQ from 'mongodb';
import axios from 'axios';
import chalk from 'chalk';
import * as h from './helpers/h.cjs'; 
import dotenv from 'dotenv';
import web3 from 'web3';
import getAllPaginatedData  from './helpers/fetchMoralisWithCursor.js';

dotenv.config();
const MongoClient = MongoClientQ.MongoClient;

// const mongoUrl = 'mongodb://localhost:27017';
const mongoUrl = process.env.MONGO_CONNECT_STRING;
const listenPort = process.env.API_LISTEN_PORT; 
const moralisApiKey = process.env.API_KEY;


console.clear();
console.log(chalk.cyan.underline.inverse('watchForMoralisCalls.js')+'\n');


clearLookupLock();
checkLookupRequests()
.then((requests)=>{
    // console.log(requests);
    performLookups(requests);
});



setInterval(()=>{
    checkLookupRequests()
    .then((requests)=>{
        // console.log(requests);
        performLookups(requests);
    });
}, 2000); // Can be adjusted up or down later

function doingAlookup(){
    //set flag in database so we know we're doing a lookup and wont start another one, even though we check frequently.
    
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
            if (err) {
                h.fancylog(err, 'error');
                console.log('ERROR: ', err)
            }
            const db = client.db('externalLookupRequests');
            const lookupRequests = db.collection('doingALookup').find({lookingUp: true}).toArray(async function(err, requests) {
                if(err) {
                    h.fancylog(err, 'error');
                }
                if(requests.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });

        });
    });
}

async function clearLookupLock(){
    MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
        if (err) {h.fancylog(err, 'error');}
        const dbDoingLookup = client.db('externalLookupRequests');
        await dbDoingLookup.collection('doingALookup').updateOne( {}, { $set: { lookingUp: false } }, { upsert: true } );
        client.close();
    });
}

async function checkLookupRequests()  {
    MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
        if (err) {h.fancylog(err, 'error');}

        const dbDoingLookup = client.db('externalLookupRequests');
        dbDoingLookup.collection('doingALookup').find({lookingUp: true}).toArray(async function(err, requests) {
            if(err) {h.fancylog(err, 'error');}

            if(requests.length > 0) {
                // h.fancylog('already doing a lookup. Sleeping..', 'system');
                client.close();
            }
            else {
                // set lookingUp to true
                // console.log(chalk.green('locking the lookup process with lookingUp: true'));
                await dbDoingLookup.collection('doingALookup').updateOne( {}, { $set: { lookingUp: true } }, { upsert: true } );

                const db = client.db('externalLookupRequests');
                const lookupRequests = db.collection('rBucket').find({}).toArray(async function(err, requests) {
                    if(err) {
                        h.fancylog(err, 'error');
                    }
                    if(requests.length > 0) {
                        h.fancylog('external api requests to process: ' + requests.length, 'system');
                        // console.log('---------------------')
                        // console.log(requests);
                        // console.log('---------------------\n\n')
                        // do something with the requests
                        for (let i = 0; i < requests.length; i++) {
                            console.log(chalk.magenta('request: '), requests[i]);
                            await dispatcher(requests[i].instructionMap, requests[i].requestUrl, requests[i].requestPostData);
                            // await new Promise(r => setTimeout(r, 1000));
                            //if we're on the last request, set lookingUp to false
                            if (i == requests.length - 1) {
                                console.log(chalk.green('unlocking the lookup process with lookingUp: false'));
                                await dbDoingLookup.collection('doingALookup').updateOne( {}, { $set: { lookingUp: false } }, { upsert: true } );
                            }
                        }

                        client.close();
                    }
                    else {
                        h.fancylog('no requests to process. Sleeping..', 'system');
                        await dbDoingLookup.collection('doingALookup').updateOne( {}, { $set: { lookingUp: false } }, { upsert: true } );
                        client.close();
                    }
                });
            }
        });
    });

}

function dispatcher(instructionMap, url, postData){
    return new Promise((resolve, reject) => {
        switch(instructionMap){
            case 1:
                console.log('fulfilling data lookup request: '+chalk.cyan('/getAddressTXsforToken/:address/:tokenAddress'));
                console.log('url: ', url);
                console.log('postData: ', postData+'\n\n');
                getAddressTXsforToken(url, postData)
                .then((result)=>{ resolve() });
                break;
            case 2:
                console.log('fulfilling data lookup request: '+chalk.cyan('/updateTokenBalances/:address'));
                break;
            default:
                console.log(chalk.cyan('default instruction'));

        }
    });
}

function getAddressTXsforToken(url, postData){

    return new Promise((resolve, reject) => {
        getAllPaginatedData(url).then((result) => {
            console.log('finished getting ALL the great many TXS from Moralis.', result.length);
            
            // put them in the collection
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
                if (err) {
                    h.fancylog(err, 'error');
                }
                const db = client.db('pivotTables');
                const collection = db.collection('addressTXsByToken');

                const db2 = client.db('externalLookupRequests');
                const collection2 = db2.collection('rBucket');


                result.forEach(tx => {
                    collection.insertOne({
                        address: tx.address,
                        transaction_hash: tx.transaction_hash,
                        address: tx.address,
                        block_timestamp: tx.block_timestamp,
                        block_number: tx.block_number,
                        block_hash: tx.block_hash,
                        to_address: tx.to_address,
                        from_address: tx.from_address,
                        value: tx.value,
                        transaction_index: tx.transaction_index,
                        log_index: tx.log_index,
                        from_address_friendlyName: tx.from_address_friendlyName,
                        to_address_friendlyName: tx.to_address_friendlyName,
                    });

                    
                    if (result.indexOf(tx) === result.length - 1) {
                        //remove the document matching the URL from the collection, then close client
                        collection2.deleteOne ({ requestUrl : url }, function(err, obj) {
                            if (err) console.log('ERROR deleting document: ', err);
                            console.log(chalk.green("cleaned up rBucket request (by requestUrl match)") );
                            // client.close();
                            resolve();
                        });
                    }
                });
            });
        });
    });
}



async function performLookups(requests) {
    if (!requests) return;
    let throttle = 0;
    requests.forEach(async (request)=>{
        setTimeout(async ()=>{
            // let url = request.url;
            // let id = request._id;
            // let result = await axios.get(url);
            // console.log(result);
            console.log('throttle: ', throttle);
        }, throttle);
        throttle += 1000;
    });
}
