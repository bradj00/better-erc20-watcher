
import * as MongoClientQ from 'mongodb';
import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import axios from 'axios';
import dotenv from 'dotenv';
import * as h from './helpers/h.cjs'; 
dotenv.config();
// console.log('API_KEY: ', process.env.API_KEY);
import getAllPaginatedData  from './helpers/fetchMoralisWithCursor.js';
import getLiquidityPoolPriceFromOnChain from '../node/v3-pool-info-grabber/v3-liq-poolPrice.js';

const MongoClient = MongoClientQ.MongoClient;
// const mongoUrl = 'mongodb://localhost:27017';
const mongoUrl = process.env.MONGO_CONNECT_STRING;
const dbName = process.env.DB_NAME;  
const dbNameFN = process.env.DB_NAME_FN;
const listenPort = process.env.API_LISTEN_PORT; 
const moralisApiKey = process.env.API_KEY;
const INFURA_ENDPOINT = process.env.INFURA_ENDPOINT

import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_ENDPOINT));

const IgnoredAddresses = ["0x333e3763085fc14854978f89261890339cb2f6a9", "0x1892f6ff5fbe11c31158f8c6f6f6e33106c5b10e"]
// const IgnoredAddresses = []



const app = express();



console.clear(); 
console.log(chalk.cyan.underline.inverse('apiListen.js')+'\n');



app.use(express.json());

app.listen(listenPort, () => { 
    console.log(`Server Started at ${listenPort}`)

    // console.log('q\t');MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
    //     if (err) { console.log('error connecting to mongo: ', err); }
    //     console.log('MongoDB Connected');
    
        app.get('/addToBlacklist/:address', cors(),(req, res) => {
            const theAddy = req.params.address;
            console.log('>>>>>> blacklist: ', theAddy);

            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
                if (err) {
                    h.fancylog(err, 'error');
                }
                const db = client.db('pivotTables');
                const collection = db.collection('tokenUsdValues');
                const result = await collection.updateOne ( { address: theAddy }, { $set: { blacklisted: true } } );
                console.log('result: ', result);
                res.send(result);
            });


        });

        app.get('/TokenTXsByAddress/:address', cors(),(req, res) => { 
            const getFreshData = req.query.getFreshData;
            console.log('getFreshData: ', req.query.getFreshData);
            if (!req.params.address) { res.send('no address provided'); return; }

            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
                if (err) {
                    h.fancylog(err, 'error');
                }
                const db = client.db('TokenTXsByAddress');
                
                const collectionExists = async (collectionName, db) => {
                    const collections = await db.listCollections({name: collectionName}).toArray();
                    return collections.length > 0;
                };
                
                const regex = new RegExp("a_"+req.params.address, 'i');
                if (await collectionExists(regex, db) && ( getFreshData != 1 )) {
                    console.log('collection exists: ', regex);
                    const collection = db.collection("a_"+req.params.address);

                    collection.find({ $or: [ { from_address: req.params.address }, { to_address: req.params.address } ] }).toArray((err, docs)=> {                         
                        console.log('docs: ', docs.length);
                        res.send(docs)
                    });
                }
                else { 
                    let requestUrl = `https://deep-index.moralis.io/api/v2/${req.params.address}/erc20/transfers?chain=eth&limit=100&key=${moralisApiKey}`;
                    const db2 = client.db('externalLookupRequests');
                    const c2 = db2.collection('rBucket');

                    c2.insertOne({requestUrl: requestUrl, requestPostData: null, instructionMap: 1});
                    console.log('_-_---sent request to get data from external api.');
                    res.send('update request sent')
                }

                

            });
        });

        app.get('/removeFromBlacklist/:address', cors(),(req, res) => {
            const theAddy = req.params.address;
            console.log('>>>>>> blacklist: ', theAddy);

            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
                if (err) {
                    h.fancylog(err, 'error');
                }
                const db = client.db('pivotTables');
                const collection = db.collection('tokenUsdValues');
                const result = await collection.updateOne ( { address: theAddy }, { $set: { blacklisted: false } } );
                console.log('result: ', result);
                res.send(result);
            });


        });

        app.get('/latestBlock', cors(), async (req, res) => {
            
            // const url = "https://deep-index.moralis.io/api/v2/dateToBlock?chain=eth&date="+(new Date().getTime() );
            const block = await web3.eth.getBlock('latest')
            try {
                console.log('LATEST BLOCK IS: ',data)
                res.send(data);
            }catch (err){
                console.log('error: ', err);
            }

        });
        
        app.get('/updateTokenBalances/:address', cors(),(req, res) => {
            const theAddy = req.params.address;
            console.log('>>>>>> update balances for: ', theAddy);
            let url = 'https://deep-index.moralis.io/api/v2/'+theAddy+'/erc20?chain=eth';
            // console.log('>>>>>> url: ', url);
            axios.get(url ,{
                headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
                "X-API-Key" : moralisApiKey
                },
            })
            .then(({data}) => {
                MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
                    if (err) {
                        h.fancylog(err, 'error');
                    }
                    console.log('data: ', data);
                    const db = client.db('pivotTables');
                    const collection = db.collection('allAddresses');
                    // update document where "address" == theAddy
                    const updateDoc = await collection.updateOne ({address: theAddy}, {$set: {data}}, {upsert: true});
                    
                    //after we update the info, pull it from mongo and send it back to the client
                    const regex = new RegExp(theAddy, 'i');

                    let temp = [{address: theAddy}];
                    temp[0]["data"] = [];
                    if (data) {
                        for (const token of data) {
                            let update = await db.collection('allAddresses').updateOne({ address: theAddy }, { $set: { [token.token_address]: {metadata: token} } });
                            //push token to temp array
                            // temp.push({[token.token_address]: token});
                            console.log(token)
                            temp[0][token.token_address] = {metadata: token};
                            temp[0]["data"].push(token);
                            //if last item in array, send temp array to client
                            if (data.indexOf(token) === data.length - 1) {
                                client.close();
                                res.send(temp);
                            }
                        }
                    }
                    // res.send(addressColumns)


                    // const addressColumns = await collection.find({address: regex}).toArray();
                    //     console.log('addressColumns: ', addressColumns);
                        
                });

            })
            .catch((err) => {
                console.log('error: ', err);
                res.send('{success: false}');
            });

        });

        // get token balances for a given address
        app.get('/tokenBalances/:address', cors(),(req, res) => {
            const lookupAddy = req.params.address;
            console.log('>>>>>> lookupAddy: ', lookupAddy);
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
                if (err) {
                    h.fancylog(err, 'error');
                }
                const db = client.db('pivotTables');
                const collection = db.collection('allAddresses');
                //get all columns where address = address
                // create regex variable to search for lookupAddy with case insensitive
                const regex = new RegExp(lookupAddy, 'i');
                let addressColumns = await collection.find({address: regex}).toArray();
                if (!addressColumns[0]) {
                    res.send();
                }else {
                    // console.log('addressColumns: ', addressColumns);
                    // console.log(Object.keys(addressColumns[0]));
                    
                    const keys = Object.keys(addressColumns[0]);
                    //remove "_id" "address" and "data" from keys array
                    const index = keys.indexOf("_id");
                    if (index > -1) {
                        keys.splice(index, 1);
                    }
                    const index2 = keys.indexOf("address");
                    if (index2 > -1) {
                        keys.splice(index2, 1);
                    }
                    const index3 = keys.indexOf("data");
                    if (index3 > -1) {
                        keys.splice(index3, 1);
                    }
                    // console.log('keys: ', keys);
                    // update keys into mongo collection "tokenUsdValues" in database "pivotTables"
                    //get current timestamp
                    const timestamp = new Date().getTime();
                    
                    //independent of call, trigger update of backend usd token values (in cache)
                    getAllTokenBalanceUsdPrices(keys);

                    for (const key of keys) {
                        // const updateDoc = await db.collection('tokenUsdValues').updateOne ({address: key}, {$set: {dataRequested: true}}, {upsert: true});
                        const regex = new RegExp(key, 'i');
                        const query = await db.collection('tokenUsdValues').findOne({address: regex});
                        
                        if (query){
                            if (!("dataRequested" in query)) { 
                                await db.collection('tokenUsdValues').updateOne ({address: key}, {$set: {dataRequested: true}}, {upsert: true});
                            } else {
                                // console.log('\n\ndata already requested for: ', key);    
                            }
                        }
                    }
                    
                    // go through addressColumns[0] and add usdValue to each token
                    for (const key of keys) {
                        if (typeof addressColumns[0][key] !== 'undefined' && key !== 'probablyContract' ) { 
                            const knownUsdTokenValueObj = await db.collection('tokenUsdValues').find({address: key}).toArray();
                            addressColumns[0][key]["usdValue"] = knownUsdTokenValueObj;
                            if (addressColumns[0][key]["usdValue"][0] && addressColumns[0][key]["usdValue"][0].usdValue){
                                addressColumns[0][key]["usdValue"][0].usdValue["extendedValue"] = addressColumns[0][key]["usdValue"][0].usdValue.usdPrice * (addressColumns[0][key]["metadata"]["balance"] / 10**addressColumns[0][key]["metadata"]["decimals"]);
                            }   
                        }else {
                            console.log('weird key: ', key);
                            console.log('weird addressColumns[0][key]: ', addressColumns[0][key]);
                        }
                    }

                    res.send(addressColumns)
                }
            });
            



        });
        





        //this needs to be paginated on the API side and infinitescrolled on the front end or else it wont be performant for large lists
        app.get('/findCommonHeld/:token', cors(),(req, res) => {
            const token = req.params.token;
            console.log('>>>>>> token: ', token);
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
                if (err) {
                    h.fancylog(err, 'error');
                }
                const db = client.db('pivotTables');
                const collection = db.collection('allAddresses');
                const regex = new RegExp(token, 'i');
                const communityHeldArr = await collection.find({[token]: {$exists: true}}).toArray();
                // console.log('communityHeldArr: ', communityHeldArr);
                console.log(Object.keys(communityHeldArr[0]), communityHeldArr.length);


                for(let i = 0; i < communityHeldArr.length; i++){
                    const db = client.db('friendlyNames');
                    const collection = db.collection('lookup');
                    const friendlyName = await collection.find({address: communityHeldArr[i].address}).toArray();
                    // place friendlyName[0].friendlyName into communityHeldArr[i].friendlyName
                    communityHeldArr[i].friendlyName = friendlyName[0];

                    // console.log('['+chalk.magenta(communityHeldArr[i].address)+']\tfriendlyName: ', friendlyName[0].friendlyName);
                }
                


                res.send(communityHeldArr)
            });
        });







        app.get('/', cors(),(req, res) => {
            // console.log('5\t'); 
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
                if (err) {
                    h.fancylog(err, 'error');
                     
                }
                const db = client.db('heartbeats');
                db.collection("chainData").find({"heartbeat": {$exists: true}}).sort({block_timestamp: -1}).limit(1).toArray(function(err, result) {
                    if (err) { 
                        h.fancylog(err, 'error');
                    }

                    res.send(result);
                    client.close();
                });
            });
            // const timestamp = new Date().getTime();
            // res.send(timestamp.toString()) // used for heartbeat
            
        }) 
        
        //get system status object, which contains any activity properties the frontend needs to know about.
        app.get('/system/systemStatus', cors(), async (req, res) => {
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
                if (err) {
                    h.fancylog(err, 'error');
                }
                const db = client.db('systemStats');
                const collection = db.collection('messages');
                
                // find all documents in the collection and return them as an an object together
                const systemStatus = await collection.find({}).toArray();
                // convert the array of objects into a single object where each key "name" is the name of the object and the value is the object itself.
                const systemStatusObj = systemStatus.reduce((obj, item) => {
                    obj[item.name] = item;
                    return obj;
                }, {});

                




                // const systemStatus = await collection.find({}).toArray();
                // console.log('systemStatus: ', systemStatus);
                //send the array to the frontend.
                client.close();
                // res.send(systemStatus);
                res.send(systemStatusObj);
            });
        });

        //request to set up new watched token
        app.get('/system/watchNewToken/:tokenAddress', cors(), async (req, res) => {
            const tokenAddress = req.params.tokenAddress;
            
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
                const db = client.db('watchedTokens');
                const collectionlist = await db.listCollections().toArray();
                //from collectionList, get all collections that start with 'a_' and remove the 'a_' prefix. push them into an array.
                const existingCollections = [];
                collectionlist.forEach((collection) => {
                    if (collection.name.startsWith('a_')) {
                        existingCollections.push(collection.name.replace('a_', ''));
                    }
                    
                    if (collectionlist.indexOf(collection) == collectionlist.length - 1) {
                        //if existingCollections includes tokenAddress, console log "new token." Else "not new"
                        if (existingCollections.includes(tokenAddress)) {
                            // console.log('not new token');
                            res.send('not new token');
                        } else {
                            // console.log('new token');
                            //create new collection with name 'a_'+tokenAddress.
                            db.createCollection("a_"+tokenAddress, function(err, res) {
                                if (err) {
                                    h.fancylog(err, 'error');
                                }
                                console.log("Collection created: a_"+tokenAddress);
                                h.fancylog('new token added to watchedTokens database: '+tokenAddress, 'system');

                                //create an index on the collection for { transaction_hash: 1, address: 1, block_timestamp: 1, block_number: 1, block_hash: 1, from_address: 1, to_address: 1, value: 1 }, { unique: true }
                                db.collection("a_"+tokenAddress).createIndex({ transaction_hash: 1, address: 1, block_timestamp: 1, block_number: 1, block_hash: 1, from_address: 1, to_address: 1, value: 1 }, { unique: true }, function(err, res) {
                                    if (err) {
                                        h.fancylog(err, 'error');
                                    }
                                    console.log("Index created on a_"+tokenAddress);
                                    h.fancylog('new token added to watchedTokens database: '+tokenAddress, 'system');
                                });
                            });
                        }
                        
                    }
                })
            }); 
             

        });
        

        app.get('/fetchTokenUsdPrice/:address', cors(), async (req, res1) => {
            //get token price from Moralis
            getUsdPrice(req.params.address).then((price) => {
                res1.send(price);
            });
        });



        app.get('/getStakedMegaBalances/:address', cors(), async (req, res1) => {
            const address = req.params.address;
            const slicedAddress = req.params.address.replace('0x', '');
            const getFreshData = req.query.getFreshData;
            console.log('getFreshData: ', getFreshData)
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
                const db = client.db('pivotTables');
                const collection = db.collection('stakedBalances');
                const stakedBalances = await collection.find({address: address}).toArray();
                
                if ((stakedBalances.length == 0) || getFreshData==1) {
                    //fetch in-game balances
                    console.log('fetching................')
                    let payload = {"jsonrpc":"2.0","id":17,"method":"eth_call","params":[{"data":"0xf8b2cb4f000000000000000000000000"+slicedAddress,"to":"0x0d4a54716005d11f1e42c4d615ab8221f9a0d7e3"},"latest"]}
                    const url = "https://misty-dawn-mountain.matic.quiknode.pro/4a6d10967c8875ef8d3488a9efc37234045b809b/"
                    let res2 = await axios.post(url, payload)
                    let data = res2.data;
                    let megaBalance = parseInt(data.result, 16) / (10 ** 18)
                    await collection.updateOne({address: address}, {$set: {address: address, megaBalance: megaBalance}}, {upsert: true});
                    ////////////////////////////
                    
                    //fetch perk staked balances 
                    let payload2 = {"address":address}
                    const url2 = "https://ws.mcp3d.com/perks/address"

                    let res3 = await axios.post(url2, payload2);
                    let data2 = res3.data;
                    let totalPerkStaked = 0;
                    for (let districts in data2){
                        for (let perk in data2[districts]){
                            // console.log('perk: ', data2[districts][perk]);
                            totalPerkStaked += parseInt(data2[districts][perk] / (10**18)) ;
                        }
                    }
                    console.log(address+'\ttotalPerkStaked: ', totalPerkStaked)
                    await collection.updateOne({address: address}, {$set: {perkStaked: totalPerkStaked}}, {upsert: true});
                    ////////////////////////////    



                    //fetch office accrued un-collected balance
                    let payload3 = {"region_id":43,"address":address,"withToday":true}
                    const url3 = "https://ws.mcp3d.com/balances"

                    let res4 = await axios.post(url3, payload3);
                    let data3 = res4.data;
                    let totalAccruedMega = (data3.centers.collect / (10**18));
                    console.log(address+'\ttotalAccruedMega: ', totalAccruedMega)
                    await collection.updateOne({address: address}, {$set: {officeAccruedMega: totalAccruedMega}}, {upsert: true});









                    client.close();
                    res1.send({megaBalance: megaBalance, perkStaked: totalPerkStaked, officeAccruedMega: totalAccruedMega});
                }
                else { 
                    console.log('cached mega wallet balance: ', stakedBalances);
                    res1.send(stakedBalances[0]); 
                    client.close();
                }



                
            });
        });
        
        app.get('/getLiquidityPoolPrice', cors(), async (req, res) => {
            const token0 = req.query.token0;
            const token1 = req.query.token1;
            const feeAmount = req.query.feeAmount;

            
            const poolPrice = await getLiquidityPoolPriceFromOnChain(token0, token1, feeAmount)
            res.send(poolPrice);
        });

        app.get('/updateLiquidityPoolsHeldAmounts/:watchedToken', cors(), async (req, res) => {
            const watchedToken = req.params.watchedToken;
            const tokenIds = req.query.tokenIds;
            // tokenIds is delimited by a comma. put it in delimitedTokenIds array
            const delimitedTokenIds = tokenIds.split(',');
            console.log(chalk.cyan(req.params.watchedToken), '\n\tupdating held liquidity amounts for token ids: ', delimitedTokenIds);

            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
                if (err){
                    h.fancylog('error connecting to mongo: ', err);
                }

                for (let i = 0; i < delimitedTokenIds.length; i++){
                    const c3 = client.db('externalLookupRequests').collection('rBucket');
                    c3.insertOne({requestUrl: 'blank..', requestPostData: {id: parseInt(delimitedTokenIds[i]), collectionName: 'a_0xC36442b4a4522E871399CD717aBDD847Ab11FE88'}, instructionMap: 3});
                    


                    if (i == delimitedTokenIds.length - 1){
                        setTimeout(()=>{client.close();}, 100);
                    }

                }
                
                
            });
            res.send();
        });

        app.get('/detectedLiquidityPools/:watchedToken', cors(), async (req, res) => {
            // get all liquidity positions from db "uniswap-v3-position-managers" collection "a_"+0xC36442b4a4522E871399CD717aBDD847Ab11FE88 (uniswap position manager contract)
            // where watchedToken.symbol exists as a key value in the columns object (MEGA Address: exists as a key in the columns object) 
            if (!req.params.watchedToken) { res.send('no token address provided'); return; }
            
            console.log('the token: ', req.params.watchedToken);
            ////////////////////////////
            //temp direct external api lookup until we re-write the lookup requests to match how we changed it to a lookup request in the db
            // WALRUS
            //
            ////////////////////////////
            
            const url = 'https://deep-index.moralis.io/api/v2/erc20/metadata?chain=eth&addresses='+req.params.watchedToken;
            
            // console.log('>>>>>> url: ', url);
            axios.get(url ,{
                headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
                "X-API-Key" : moralisApiKey
                },
            })
            .then(({data}) => {
                // console.log('data: ', data[0].symbol);
                // res.send(data[0].symbol);

                //mongo lookup 
                MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
                    const db = client.db('uniswap-v3-position-managers');
                    const collection = db.collection('a_0xC36442b4a4522E871399CD717aBDD847Ab11FE88');
                    let keyName = data[0].symbol+" Address";
                    console.log('keyname is: >'+keyName);
                    // collection.find({keyName : {$exists: true}}).toArray(function(err, docs) {
                    collection.find({[keyName]:  {$eq: req.params.watchedToken}}).toArray(function(err, docs) {
                        // console.log('docs: ', docs);
                        // forEach document, if there is no 'ownerOf' column, add it to an array to request from the external api
                        let requestArr = [];
                        let newObj = {};
                        docs.forEach(async (doc, index) => {
                            // console.log('doc: ', doc);

                            let result = await determineT0andT1HeldExists(doc.tokenId, 'a_0xC36442b4a4522E871399CD717aBDD847Ab11FE88')
                            if (result == false) {
                                let requestUrl = `blank..`; 
                                const c3 = client.db('externalLookupRequests').collection('rBucket');
                                console.log(doc.tokenId,'no t0 and t1 held cached. requesting lookup..');
                                c3.insertOne({requestUrl: requestUrl, requestPostData: {id: doc.tokenId, collectionName: 'a_0xC36442b4a4522E871399CD717aBDD847Ab11FE88'}, instructionMap: 3});
                            }


                            if (!doc.ownerOf) {
                                requestArr.push(doc['Token ID']);
                            }
                            if (index == docs.length - 1) { 
                                // console.log('requestArr: ', requestArr);
                                // put the requestArr into db 'externalLookupRequests' and collection 'rBucket' 
                                let requestUrl = `coolio URL blah blah`; 
                                const db2 = client.db('externalLookupRequests');
                                const c2 = db2.collection('rBucket');
                                if (requestArr.length > 0) {
                                    c2.insertOne({requestUrl: requestUrl, requestPostData: requestArr, instructionMap: 2});
                                    console.log('---------')
                                    console.log(requestArr)
                                    console.log('created request to get data from external api. Next time it will be cached and show up');
                                }
                                // each liquidityPoolStats is a v3 pool addy with token stats
                                // client.close();
                                res.send({uniswap_v3_pools:docs, someOtherPools:[], liquidityPoolStats: {'0xdb6897039084a2f8fb2b719716ba7a734f84aa66': {madeUpTempNumbers: 0, nativeHeld:620123, counterHeld:4.3}  }}); //send it regardless. next time it will be cached and show up
                            }
                        });
           
                        
                    });
                });


            })
            ////////////////////////////
            ////////////////////////////

            //then..
        
        });
        
        app.get('/txs/:collectionName', cors(), async (req, res) => { 
            // console.log('query: ', req.params.collectionName, req.query);
            const pageNumber = req.query.pageNumber;
            const filterMin = req.query.filterMin;
            const filterMax = req.query.filterMax;
            // console.log('3\t');
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
                const db = client.db(dbName);
                const collection = db.collection(("a_"+req.params.collectionName));
                
                
                if (pageNumber == 'allData') { //bad. temporary to display all data while I mock up the summarized chart loading. This will be replaced by paginated data + infinite scrolling
                    collection.find({ $and: [ { from_address: { $nin: IgnoredAddresses } }, { to_address: { $nin: IgnoredAddresses } } ] }).sort({block_timestamp: -1}).limit(200).toArray(function(err, result) {  
                        client.close();
                        res.send({totalPages: 1, result: result})
                    });
                }
                else if (pageNumber == 'chart') {
                    collection.find({ $and: [ { from_address: { $nin: IgnoredAddresses } }, { to_address: { $nin: IgnoredAddresses } } ] }).sort({block_timestamp: -1}).limit(1000).toArray(function(err, result) {    
                        const db = client.db('watchedTokens-addresses-over-time');
                        const collectionOT = db.collection("a_"+req.params.collectionName);
                        collectionOT.find({}).toArray(function(err, resultOT) {
                            //sort resultOT by date field ascending
                            const sorted = resultOT.sort(function(a, b) {
                                return new Date(a.date) - new Date(b.date);
                            });


                            client.close();
                            res.send({totalPages: 1, result: condenseArray(result, filterMin, filterMax), resultOT: sorted})                    

                        });
                        
                        // res.send({totalPages: 1, result: result}) 
                    });
                }
                else {
                    const pageLimit = 10;
                    collection.find({ $and: [ { from_address: { $nin: IgnoredAddresses } }, { to_address: { $nin: IgnoredAddresses } } ] }).sort({block_timestamp: -1}).skip(pageNumber * pageLimit).limit(pageLimit).toArray(function(err, result) {  
                        
                        collection.count({ $and: [ { from_address: { $nin: IgnoredAddresses } }, { to_address: { $nin: IgnoredAddresses } } ] }, function(err, count) {
                        const totalPages = Math.ceil(count/pageLimit);
                        client.close();
                        res.send({totalPages: totalPages-1, result: result});
                        });
                    });
                }
            });
        });

        // SUMMARY STATS FOR A GIVEN RANGE.  Aggregate  SEND/RECEIVE by address
        app.get('/txs/summary/:collectionName', cors(), async (req, res) => { 
            // console.log('query: ', req.params.collectionName, req.query);
            const pageNumber = req.query.pageNumber;
            const filterMin = req.query.filterMin;
            const filterMax = req.query.filterMax;
            // console.log('3\t');
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
                const db = client.db(dbName);
                const collection = db.collection(("a_"+req.params.collectionName));
                
                
                if (pageNumber == 'allData') { //bad. temporary to display all data while I mock up the summarized chart loading. This will be replaced by paginated data + infinite scrolling
                    collection.find({ $and: [ { from_address: { $nin: IgnoredAddresses } }, { to_address: { $nin: IgnoredAddresses } } ] }).sort({block_timestamp: -1}).toArray(function(err, result) {  
                        client.close();
                        fetchSummaryStats(result).then((summarized)=>{
                            res.send({totalPages: 1, result: summarized})
                        })
                    });
                }
                else {
                    const pageLimit = 10;
                    collection.find({ $and: [ { from_address: { $nin: IgnoredAddresses } }, { to_address: { $nin: IgnoredAddresses } } ] }).sort({block_timestamp: -1}).skip(pageNumber * pageLimit).limit(pageLimit).toArray(function(err, result) {  
                        
                        collection.count({ $and: [ { from_address: { $nin: IgnoredAddresses } }, { to_address: { $nin: IgnoredAddresses } } ] }, function(err, count) {
                        const totalPages = Math.ceil(count/pageLimit);
                        client.close();

                        fetchSummaryStats(result).then((summarized)=>{
                            res.send({totalPages: totalPages-1, result: summarized})
                        })

                        });
                    });
                }
            });
        });



        app.get('/txs/:collectionName/txDetails/:txDetails', cors(), async (req, res) => {
            const pageNumber = req.query.pageNumber;
            // console.log('2\t');
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
                const db = client.db(dbName);
                const collection = db.collection(("a_"+req.params.collectionName));
                // console.log(req.params.txDetails) 
                collection.find({"transaction_hash": req.params.txDetails}).sort({block_timestamp: -1}).limit(50).toArray(function(err, result) {
                    res.send(result)
                });
            });
        });


        //gets the list of tokens we are watching top-level in the frontend UI
        app.get('/tokenInfo/:tokenAddress', cors(), async (req, res) => {
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
                const db = client.db('tokensMetadataCache');
                const collection = db.collection('erc20');
                
                collection.find({"address": req.params.tokenAddress}).toArray(function(err, result) {
                    if (result.length > 0) {
                        console.log('found token metadata in mongo cache')
                        res.send([result[0]]);
                    }
                    if (result.length == 0) {
                        console.log('have to look up token metadata from external api..')
                        const url = 'https://deep-index.moralis.io/api/v2/erc20/metadata?chain=eth&addresses='+req.params.tokenAddress;
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
                            console.log('data: ', data);
                            collection.insertOne(data[0], function(err, res) {
                                if (err) throw err;
                                console.log("1 document inserted");
                            });

                            res.send(data);
                        })
                    }    
                });
            });
        });

        //get transactions for a token by a holder address
        app.get('/txs/:collectionName/:filterAddress', cors(), async (req, res) => {
            // console.log('filtered by address query: ', req.query);
            
            // console.log('1\t');
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
                const db = client.db(dbName);
                // console.log('req.params.filterAddress: ', req.params.filterAddress);
                // console.log('req.params.collectionName: ', req.params.collectionName);
                const collection = db.collection(("a_"+req.params.collectionName));

                collection.find({ $or: [ {to_address: {$regex: req.params.filterAddress, $options: 'i'}} ,  {from_address: {$regex: req.params.filterAddress, $options: 'i'}} ]}).sort({block_timestamp: -1}).limit(50000).toArray(function(err, result) {
                    client.close();
                    res.send(result)
                });
            });
        });    


        //add a new address to the list of addresses we are watching closely/realtime
        app.get('/addCloselyWatchedAddress/:theAddress', cors(), async (req, res) => {
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
                const db = client.db('closelyWatchedAddresses');
                //create a collection with the name of the address
                const collection = db.collection("a_"+req.params.theAddress);
                collection.insertOne({address: req.params.theAddress}, function(err, res) {
                    if (err) throw err;
                    console.log("added new address to closelyWatchedAddresses collection: ", req.params.theAddress);
                    client.close();
                });
                
            });
        });
        
        //remove an address from the list of addresses we are watching closely/realtime
        app.get('/removeCloselyWatchedAddress/:theAddress', cors(), async (req, res) => {
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
                const db = client.db('closelyWatchedAddresses');
                //create a collection with the name of the address
                const collection = db.collection("a_"+req.params.theAddress);
                //drop collection with the name of the address
                collection.drop(function(err, delOK) {
                    if (err) throw err;
                    if (delOK) console.log("closelyWatchedAddresses collection deleted: ", req.params.theAddress);
                    client.close();
                });
                
            });
        });



        app.get('/friendlyName/:theAddress', cors(), async (req, res) => {
            // console.log('q\t');
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
                const db = client.db(dbNameFN);

                console.log('looking up: ', req.params.theAddress);
                const collection = db.collection('lookup'); 
                const regex = new RegExp(`${req.params.theAddress}`, `i`);
                console.log('REGEX: ', regex);
        
                //if req.params.theAddress starts with 0x and has 42 characters, it's an address. Otherwise, it's a name
                if (req.params.theAddress.startsWith('0x') && req.params.theAddress.length == 42) {
                    collection.find({address: regex }).toArray(function(err, result) {
                        if (err) {
                            console.log('error: ', err);
                        }
                        console.log('~~Friendly Name: ', result);
                        client.close();
                        res.send(result)
                    });
                }
                else {
                    
                    collection.find({$or: [{manuallyDefined: regex }, {OpenSea: regex}, {ENS: regex}, {MegaWorld: regex}] }).toArray(function(err, result) {
                        if (err) {
                            console.log('error: ', err);
                        }
                        console.log('__Friendly Name: ', result);
                        client.close();
                        res.send(result)
                    });
                }
            });
        });




        app.get('/updateFN/:address/:friendlyName',  cors(), async (req, res) => {
            console.log('got FN update request: ', chalk.red(req.params.address), chalk.rgb(0,255,0)(req.params.friendlyName));


            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
                const db1 = client.db(dbNameFN);
                const collection = db1.collection('lookup');
                const address = req.params.address;
                const friendlyName = req.params.friendlyName;
                    if (err) {
                        h.fancylog(err, 'error');
                        
                    }
                    const db2 = client.db('friendlyNames');
                    //update or insert the friendlyName into the collection where address matches the address in the request
                    db2.collection("lookup").updateOne({address: address}, {$set: {manuallyDefined: friendlyName}}, {upsert: true}, function(err, result) {
                        if (err) { 
                            h.fancylog(err, 'error');
                        }
                        console.log('updated friendlyName result: ', result);
                        client.close();
                        res.send(result);
                    });
                
            });
            
        });




        app.get('/watchedTokenList', cors(), async (req, res) => {
            // console.log('6\t');
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
                const db = client.db(dbName);
                const collectionlist = await db.listCollections().toArray();
                //remove isSyncing from list
                const filteredList = collectionlist.filter((item) => {
                    return item.name !== 'isSyncing';
                });
                //remove a_ from list
                const filteredList2 = filteredList.map((item) => {
                    return item.name.replace('a_', '');
                });


                // let temp = [{}];
                // for (let i = 0; i < filteredList2.length; i++) {
                //     const tokenAddress = filteredList2[i];

                //     const url = 'http://10.0.3.240:4000/tokenInfo/'+tokenAddress;
                //     axios.get(url ,{
                //     })
                //     .then(({data}) => {
                //         temp.push({tokenAddress :  data[0] });
                //         // console.log('temp: ', temp);
                //         if (i === filteredList2.length - 1) {
                //             res.send(temp);
                //         }
                //     }) 
                // }
                
                // rewrite the above function to wait for all the axios calls to finish before sending the response
                let temp = [{}];
                let promises = [];
                for (let i = 0; i < filteredList2.length; i++) {
                    const tokenAddress = filteredList2[i];

                    const url = 'http://10.0.3.240:4000/tokenInfo/'+tokenAddress;
                    promises.push(axios.get(url ,{
                    })
                    )
                    
                }
                Promise.all(promises).then(function(values) {
                    for(let i = 0; i < values.length; i++) {
                        temp.push({tokenAddress :  values[i].data[0] });
                    }
                    client.close();
                    res.send(temp);
                })
                
                


            });    
            
        });    
            
        
    // }); 

});
                                            //the address of the uniswap v3 position manager contract
function determineT0andT1HeldExists(tokenId, managerAddress){
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
            const db = client.db('uniswap-v3-position-managers');
            const collection = db.collection(managerAddress);
            collection.find({tokenId: tokenId}).toArray(function(err, result) {
                // console.log(chalk.cyan('FOUND: '), result)
                if (err) {
                    h.fancylog(err, 'error');
                    console.log('big fat error: ', err);
                    reject(err);
                }
                if (result.length > 0) {
                    if (("token0Held" in result[0] && "token1Held" in result[0])) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                } else {
                    console.log('BIG FAT ERROR: ', 'tokenId not found in uniswap-v3-position-managers')
                    resolve(false);
                }
                client.close();
            });
        });
    });
}

function condenseArray(tempArray, filterMin, filterMax) {
    // console.log('filterMin: ', filterMin), console.log('filterMax: ', filterMax);

    let tempArray2 = [];
    let tempObj = {};
    for (let i = 0; i < tempArray.length; i++) {
      let currElement = tempArray[i];
      let day = currElement.block_timestamp.split('T')[0];
      let value = parseInt(currElement.value);
      
      if (tempObj[day]) {
        if (filterMin > 1 && filterMax > 1) {               //if filterMin and filterMax are set, only add to the total if the value is within the range
            if (value >= filterMin && value <= filterMax){
                tempObj[day].value += value;
            }
        } else {                                            //if filterMin and filterMax are not set, add all values to the total
            tempObj[day].value += value;
        }
      } else {
        if (filterMin > 1 && filterMax > 1) {               //if filterMin and filterMax are set, only add to the array if the value is within the range   
            if (value >= filterMin && value <= filterMax){
                tempObj[day] = {
                    block_timestamp: currElement.block_timestamp,
                    value: value
                };
            }
        } else {                                            //if filterMin and filterMax are not set, add all values to the array
            tempObj[day] = {
                block_timestamp: currElement.block_timestamp,
                value: value
            };
        }
      }
    }
  
    for (let key in tempObj) {
      tempArray2.push(tempObj[key]);
    }
    // console.log('condensed array: ', tempArray2.length)
    return tempArray2;
}




async function getUsdPrice(tokenAddress){
    return new Promise((resolve, reject) => {
        let url = 'https://api.coingecko.com/api/v3/coins/1/contract/'+tokenAddress+'';
            
        console.log('getting usd price from API ', chalk.yellow(url))
        axios.get(url,{
            headers: {
                'Accept-Encoding': 'gzip'
            }
        })
        .then(response => {
            console.log('RESPONSARINO: ',Object.keys(response.data));
            resolve(response.data);
        })
        .catch(error => {
            console.error('Error fetching data from API:', error.message);
        });
    });
}








async function fetchSummaryStats(transactions) {
    if (!transactions){console.log('empty??? returning.'); return;}
    const summary = {};

    for (let tx of transactions) {
        if (!summary[tx.from_address]) {
            summary[tx.from_address] = { sent: '0', received: '0', sentTxCount: 0, receivedTxCount: 0 };
        }
        if (!summary[tx.to_address]) {
            summary[tx.to_address] = { sent: '0', received: '0', sentTxCount: 0, receivedTxCount: 0 };
        }

        summary[tx.from_address].sent = (BigInt(summary[tx.from_address].sent) + BigInt(tx.value)).toString();
        summary[tx.to_address].received = (BigInt(summary[tx.to_address].received) + BigInt(tx.value)).toString();

        // Increment transaction count for sender and receiver
        summary[tx.from_address].sentTxCount++;
        summary[tx.to_address].receivedTxCount++;
    }

    // Convert values from Wei to Ether and parse them into integers
    const convertedSummary = [];
    for (let address in summary) {
        convertedSummary.push({
            address: address,
            sent: parseInt(web3.utils.fromWei(summary[address].sent, 'ether')),
            received: parseInt(web3.utils.fromWei(summary[address].received, 'ether')),
            sentTxCount: summary[address].sentTxCount,
            receivedTxCount: summary[address].receivedTxCount
        });
    }

    // Sort the array by the received amount in descending order
    convertedSummary.sort((a, b) => b.received - a.received);


    // Sort by received value
    const sortedAddresses = Object.keys(convertedSummary).sort((a, b) => convertedSummary[b].sentTxCount - convertedSummary[a].sentTxCount);

    // Console log the summary stats in a neat table format
    // console.log("Address".padEnd(42), "||", "SENT".padStart(20), "||", "RECEIVED".padStart(20), "||", "SENT TXs".padStart(10), "||", "RECEIVED TXs".padStart(12));
    // console.log("-".repeat(120));
    // for (let address of sortedAddresses) {
    //     console.log(address, "||", 
    //                 convertedSummary[address].sent.toString().padStart(20), "||", 
    //                 convertedSummary[address].received.toString().padStart(20), "||", 
    //                 convertedSummary[address].sentTxCount.toString().padStart(10), "||", 
    //                 convertedSummary[address].receivedTxCount.toString().padStart(12));
    // }
    return convertedSummary;

}
























async function getAllTokenBalanceUsdPrices(tokenArray){

    MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
        const db = client.db('pivotTables');
        // console.log('~~~~~tokenArray: ', tokenArray.length);
        
        let count = 0;
        let uniqueAddresses = [...new Set(tokenArray)];
        for (const address of uniqueAddresses) {
            count++;
            // console.log(chalk.rgb(0,255,0)('address: ',address))
            let tokenAddress = address;

            //check if usdValue already exists in tokenUsdValues where address == tokenAddress
            const regex = new RegExp(tokenAddress, 'i');
            let usdValue = await db.collection("tokenUsdValues").findOne({address : regex});
            // console.log('dataRequested: ', usdValue.dataRequested)
            if (usdValue) {
                if (usdValue.dataRequested == false){
                    // console.log('usdValue already exists: ', usdValue)
                    continue;
                }
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log('['+count+' / '+uniqueAddresses.length+']\taddress: ', tokenAddress)
            let usdPriceObj = await getUsdPrice(tokenAddress);

            // console.log(chalk.cyan('__usdPriceObj: ', usdPriceObj));
            // console.log(usdPriceObj);
            if (usdPriceObj == 0) { 
                usdPriceObj = {
                    nativePrice: {
                      value: '0',
                      decimals: 18,
                      name: 'Ether',
                      symbol: 'ETH'
                    },
                    usdPrice: 0,
                    exchangeAddress: '',
                    exchangeName: ''
                  }

                // console.log(chalk.cyan('usdPriceObj: '), usdPriceObj)
            }
            // console.log('usdPriceObj: ', usdPriceObj)
            // console.log('---------------------------------')
            let update = await db.collection("tokenUsdValues").updateOne({address: tokenAddress}, {$set: {usdValue: usdPriceObj, dataRequested:false}}, {upsert: true} );
        }     
    })
}
