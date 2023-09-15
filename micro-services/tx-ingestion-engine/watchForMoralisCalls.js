// deprecated - to be removed when finalizing tx-ingestion-engine rearchitecture/reorganization


// this script is called by the watcher to check for moralis lookup requests from mongodb 
// if there are lookup requests to process, call them sequentially following throttle rules 
// and update the db with the results

// this way we can have as many lookup requests as we want, and they will be processed without 
// breaking the moralis api rate limit

import * as MongoClientQ from 'mongodb';
import axios from 'axios';
import chalk from 'chalk';
import * as h from '../../helpers/h.cjs'; 
import dotenv from 'dotenv';
import web3 from 'web3';
import getAllPaginatedData  from '../../helpers/fetchMoralisWithCursor.js';
import {checkContractTokenIdForTokensHeld} from './v3-pool-info-grabber/v3-liq-token0and1.js';


dotenv.config({path:'./.env'});
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
                            await dispatcher(requests[i].instructionMap, requests[i].requestUrl, requests[i].requestPostData, requests[i]._id);
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
                        // h.fancylog('no requests to process. Sleeping..', 'system');
                        await dbDoingLookup.collection('doingALookup').updateOne( {}, { $set: { lookingUp: false } }, { upsert: true } );
                        client.close();
                    }
                });
            }
        });
    });

}

function dispatcher(instructionMap, url, postData, mongoCollectionId){
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
                console.log('fulfilling data lookup request: '+chalk.cyan('/detectedLiquidityPools/:watchedToken'));
                getownerOfForLPTokenArray(url, postData)
                .then((result)=>{ resolve() });
                break;
            case 3: 
                console.log('fulfilling data lookup request: '+chalk.cyan('/detectedLiquidityPools/:watchedToken (Held Tokens)'));
                getAndUpdateTokensHeldForTokenIds(url, postData, mongoCollectionId)
                .then((result)=>{ resolve() });
                break;
            case 101: 
                console.log('fulfilling data lookup request: '+chalk.cyan('/tokenInfo/:tokenAddress (token metadata info)'));
                getTokenMetadataInfo(url, postData, mongoCollectionId)
                .then((result)=>{ resolve() });
                break;
            default:
                console.log(chalk.cyan('default instruction'));

        }
    });
}


//dispatcher instruction map 1 
function getAddressTXsforToken(url, postData){

    return new Promise((resolve, reject) => {
        MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
            if (err) {
                h.fancylog(err, 'error');
            }
            const dbStatus = client.db('systemStats');
            const collectionStatus = dbStatus.collection('messages');
            collectionStatus.updateOne( { name: 'erc20TransfersForSelectedAddy' }, { $set: { statusMsg: 'gathering TXs from Moralis', page: 0, maxPage: 1, timestamp: new Date().getTime() } }, { upsert: true } , function(err, result) {
                client.close();
            });
        });


        getAllPaginatedData(url).then((result) => {
            console.log('-------\n\n');
            console.log('finished getting ALL the great many TXS from Moralis.', result.length);
            console.log('result[0]: ', result[0]);
            console.log('-------\n\n');
            //to do: rewrite this into a function because we're going to be updating system status messages all over the place
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
                if (err) {
                    h.fancylog(err, 'error');
                }
                const dbStatus = client.db('systemStats');
                const collectionStatus = dbStatus.collection('messages');
                collectionStatus.updateOne( { name: 'erc20TransfersForSelectedAddy' }, { $set: { statusMsg: 'complete', page: 0, maxPage: 0, timestamp: new Date().getTime() } }, { upsert: true } , function(err, result) {
                    client.close();
                });
            });
            //cleanup status message so UI does not constantly reload this data
            setTimeout(()=>{
                MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
                    if (err) {
                        h.fancylog(err, 'error');
                    }
                    const dbStatus = client.db('systemStats');
                    const collectionStatus = dbStatus.collection('messages');
                    collectionStatus.updateOne( { name: 'erc20TransfersForSelectedAddy' }, { $set: { statusMsg: 'idle', page: 0, maxPage: 0, timestamp: new Date().getTime() } }, { upsert: true } , function(err, result) {
                        client.close();
                    });
                });
            }, 3000);

            // put them in the collection
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
                if (err) {
                    h.fancylog(err, 'error');
                }
                
                const db2 = client.db('externalLookupRequests');
                const collectionBucket = db2.collection('rBucket');
                
                
                const db = client.db('TokenTXsByAddress');
                result.forEach(tx => {
                    var collectionFrom = db.collection('a_'+tx.from_address);
                    var collectionTo = db.collection('a_'+tx.to_address);
                    
                    // check if TX already exists (all fields exactly the same) (I couldnt find a way to do a compound index in mongo for this) 
                    collectionFrom.find({
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
                        token_metadata: tx.token_metadata,
                    }).toArray(async function(err, requests) {
                        //if it doesnt exist, insert it
                        if(requests.length == 0) {
                            collectionFrom.insertOne({
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
                                token_metadata: tx.token_metadata,
                            });
                        }
                    });

                    // check if TX already exists (all fields exactly the same) (I couldnt find a way to do a compound index in mongo for this) 
                    collectionTo.find({
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
                        token_metadata: tx.token_metadata,
                    }).toArray(async function(err, requests) {
                        //if it doesnt exist, insert it
                        if(requests.length == 0) {
                            collectionTo.insertOne({
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
                                token_metadata: tx.token_metadata,
                            });
                        }
                    });

                    

                    if (result.indexOf(tx) === result.length - 1) {
                        //remove the document matching the URL from the collection, then close client
                        collectionBucket.deleteOne ({ requestUrl : url }, function(err, obj) {
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

//dispatcher instruction map 2
async function getownerOfForLPTokenArray(url, postData){
    return new Promise(async (resolve, reject) => {
        console.log('looking up array of LPTokens to determine ownerOf values');
        
        for (var i = 0; i < postData.length; i++) {
            console.log('checking: ', postData[i], ' for ownerOf')
            await checkContractTokenIdForOwnerOf(postData[i])
            await new Promise(r => setTimeout(r, 1000));

            if (i === postData.length - 1) {
                MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
                    if (err) {
                        h.fancylog(err, 'error');
                    }
                    
                    const db = client.db('externalLookupRequests');
                    const collectionBucket = db.collection('rBucket');
                    //remove the document matching the URL from the collection, then close client
                    collectionBucket.deleteOne ({ requestUrl : 'coolio URL blah blah' }, function(err, obj) {
                        if (err) console.log('ERROR deleting document: ', err);
                        console.log(chalk.green("cleaned up rBucket request (by requestUrl match)") );
                        // client.close();
                        resolve();
                    });
                
                });
            }
        }

        
    });
}

//dispatcher instruction map 3
async function getAndUpdateTokensHeldForTokenIds(url, postData, mongoCollectionId){
    return new Promise(async (resolve, reject) => {
        console.log('looking up array of tokenIds to determine tokensHeld values');
        
        
            console.log('checking: ', postData.id, ' for tokensHeld')
            let q = await checkContractTokenIdForTokensHeld(postData.id)
            console.log('q: ', q)
            await new Promise(r => setTimeout(r, 500));
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client1) {
                if (err){
                    h.fancylog(err, 'error');
                }

                //update the document matching the tokenId from collection postData.collectionName, then close client
                const dbLP = client1.db('uniswap-v3-position-managers');
                const collectionLP = dbLP.collection(postData.collectionName);
                // timestamp
                let d = new Date();
                collectionLP.updateOne ({ tokenId : postData.id }, { $set: { token0Held: q.token0Held, token1Held: q.token1Held, heldLastUpdated: d } },{ upsert: true }, function(err, obj) {
                    
                    const collectionBucket = client1.db('externalLookupRequests').collection('rBucket');
                    collectionBucket.deleteOne ({ _id : mongoCollectionId }, function(err, obj) {
                    if (err) console.log('ERROR deleting document: ', err);
                        console.log(chalk.green("___cleaned up rBucket request ID") );
                        resolve();
                        client1.close();
                    });
                    
                    
                });

            });


            
            // MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
            //     if (err) {
            //         h.fancylog(err, 'error');
            //     }
                
            //     const db = client.db('externalLookupRequests');
            //     const collectionBucket = db.collection('rBucket');
            //     //remove the document matching the URL from the collection, then close client
            //     collectionBucket.deleteOne ({ requestUrl : 'coolio URL blah blah' }, function(err, obj) {
            //         if (err) console.log('ERROR deleting document: ', err);
            //         console.log(chalk.green("cleaned up rBucket request (by requestUrl match)") );
            //         // client.close();
            //         resolve();
            //     });
            
            // });
            
        

        
    });
}


async function checkContractTokenIdForOwnerOf(tokenId){
    return new Promise(async (resolve, reject) => {
        tokenId = parseInt(tokenId);
        console.log('>\tchecking tokenId: ',tokenId);
        const options = {
            method: 'POST',
            url: 'https://deep-index.moralis.io/api/v2/0xC36442b4a4522E871399CD717aBDD847Ab11FE88/function',
            params: {chain: 'eth', function_name: 'ownerOf'},
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              'X-API-Key': moralisApiKey
            },
            data: {abi: uniswapv3Abi, params: {tokenId: tokenId}}
          };
          
          axios
            .request(options)
            .then(function (response) {
                console.log('tokenId: '+tokenId+'\towner: '+response.data);

                MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
                    if (err) {
                        console.log('fat mongo error: '+err);
                    }
                    //lookup friendly name for owner address
                    const dbStatus = client.db('friendlyNames');
                    const collection = dbStatus.collection("lookup");
                    const regex = new RegExp(response.data, 'i');
                    collection.find({address : regex}).toArray(async function(err, requests) {
                        let finalOwnerOf = {};
                        if(requests.length == 0) {
                            console.log('\t->no friendly name found for: '+response.data);
                            finalOwnerOf = {
                                ownerOf: response.data,
                                friendlyName: response.data
                            }
                        } else {
                            console.log('\t->friendly name found.');
                            // console.log(requests[0]);
                            // console.log('-----------------')
                            finalOwnerOf = {
                                ownerOf: response.data,
                                friendlyName: requests[0]
                            }
                        }

                        

                        // upsert the ownerOf value into the db
                        const v3db          = client.db('uniswap-v3-position-managers');
                        const v3collection  = v3db.collection("a_0xC36442b4a4522E871399CD717aBDD847Ab11FE88");
                        await v3collection.updateOne( { tokenId: tokenId }, { $set: { ownerOf: finalOwnerOf } }, { upsert: true }  );
                        console.log('updated ownerOf for tokenId: '+tokenId+' to: '+finalOwnerOf.ownerOf+' ('+finalOwnerOf.friendlyName+')');
                        client.close();
                        resolve();


                    });
                    

                    
                });
                


            })
            .catch(function (error) {
              if (error && error.response && error.response.data) {
                console.error(error.response.data); // { message: 'Returned error: execution reverted' }
              }
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
////////////////////////////////////////////////////////////////////////////////////////
// instruction maps >100 are lookup calls invoked by a main instruction map (1-99)


//instruction map 101
async function getTokenMetadataInfo(url, postData, mongoCollectionId){
    return new Promise(async (resolve, reject) => {
        MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
            
            if (err) {
                h.fancylog(err, 'error');
            }
            const db = client.db('tokensMetadataCache');
            const collection = db.collection('erc20');
                

            await new Promise(r => setTimeout(r, 1000));
            const url = 'https://deep-index.moralis.io/api/v2/erc20/metadata?chain=eth&addresses='+postData;
            // console.log('>>>>>> url: ', url);
            axios.get(url ,{
                headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
                "X-API-Key" : moralisApiKey
                },
            })
            .then(({data}) => {
                //cache data to mongo
                console.log('erc20 token metadata: ', data);
                collection.insertOne(data[0], function(err, res) {
                    if (err) throw err;
                    console.log("1 document inserted");



                    const db1 = client.db('externalLookupRequests');
                    const collectionBucket = db1.collection('rBucket');
                    //remove the document matching the URL from the collection, then close client
                    collectionBucket.deleteOne ({ _id : mongoCollectionId }, function(err, obj) {
                        if (err) console.log('ERROR deleting document: ', err);
                        console.log(chalk.green("cleaned up rBucket request (by requestUrl match)") );
                        
                        client.close();
                        resolve();
                    });


                });
            });



        });
    });
}



const uniswapv3Abi = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},



	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "tokenURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]
