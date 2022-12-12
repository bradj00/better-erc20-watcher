
import * as MongoClientQ from 'mongodb';
import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import axios from 'axios';
import dotenv from 'dotenv';
import * as h from './helpers/h.cjs'; 
dotenv.config();
// console.log('API_KEY: ', process.env.API_KEY);

const MongoClient = MongoClientQ.MongoClient;
// const mongoUrl = 'mongodb://localhost:27017';
const mongoUrl = process.env.MONGO_CONNECT_STRING;
const dbName = process.env.DB_NAME;  
const dbNameFN = process.env.DB_NAME_FN;
const listenPort = process.env.API_LISTEN_PORT; 


const IgnoredAddresses = ["0x333e3763085fc14854978f89261890339cb2f6a9", "0x1892f6ff5fbe11c31158f8c6f6f6e33106c5b10e"]
// const IgnoredAddresses = []


const moralisApiKey = process.env.API_KEY;

const app = express();



console.clear(); 
console.log(chalk.cyan.underline.inverse('apiListen.js')+'\n');



app.use(express.json());

app.listen(listenPort, () => { 
    console.log(`Server Started at ${listenPort}`)

    // console.log('q\t');MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
    //     if (err) { console.log('error connecting to mongo: ', err); }
    //     console.log('MongoDB Connected');
    

        app.get('/latestBlock', cors(),(req, res) => {
            
            const url = "https://deep-index.moralis.io/api/v2/dateToBlock?chain=eth&date="+(new Date().getTime() );
            // console.log('>>>>>> url: ', url);
            axios.get(url ,{
                headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
                "X-API-Key" : moralisApiKey
                },
            })
            .then(({data}) => {
                res.send(data);
            })
            .catch((err) => {
                console.log('error: ', err);
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
                const collection = db.collection('systemStatuses');
                
                // find all documents in the collection and return them as an an object together
                const systemStatus = await collection.find({}).toArray();
                //convert the array of objects into a single object.
                // const systemStatusObj = systemStatus.reduce((acc, cur) => {
                //     return {...acc, ...cur};
                // }, {});




                // const systemStatus = await collection.find({}).toArray();
                // console.log('systemStatus: ', systemStatus);
                //send the array to the frontend.
                client.close();
                res.send(systemStatus);
                // res.send(systemStatus);
            });
        });

        //request to set up new watched token
        app.get('/system/watchNewToken/:tokenAddress', cors(), async (req, res) => {
            const tokenAddress = req.params.tokenAddress;
            // console.log('4\t');
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
                    collection.find({ $and: [ { from_address: { $nin: IgnoredAddresses } }, { to_address: { $nin: IgnoredAddresses } } ] }).sort({block_timestamp: -1}).limit(1000).toArray(function(err, result) {  
                        client.close();
                        res.send({totalPages: 1, result: result})
                    });
                }
                else if (pageNumber == 'chart') {
                    collection.find({ $and: [ { from_address: { $nin: IgnoredAddresses } }, { to_address: { $nin: IgnoredAddresses } } ] }).sort({block_timestamp: -1}).limit(1000).toArray(function(err, result) {    
                        client.close();
                        res.send({totalPages: 1, result: condenseArray(result, filterMin, filterMax)})                    
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
        app.get('/tokenInfo/:tokenAddress', cors(), async (req, res) => {
            
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
                res.send(data);
            })
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

        app.get('/friendlyName/:theAddress', cors(), async (req, res) => {
            // console.log('q\t');
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
                const db = client.db(dbNameFN);

                console.log('looking up: ', req.params.theAddress);
                const collection = db.collection('lookup'); 
        
                //we have to use a more expensive regex here because sometimes the address comes in not checksummed from Moralis. I could cast them all to lowercase but this seems better.
                const regex = new RegExp(`^${req.params.theAddress}$`, `i`);
                collection.find({address: regex }).toArray(function(err, result) {
                    if (err) {
                        console.log('error: ', err);
                    }
                    // console.log('result: ', result);
                    client.close();
                    res.send(result)
                });
            });
        });




        app.get('/updateFN/:address/:friendlyName',  cors(), async (req, res) => {
            console.log('got FN update request: ',);


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
                    db2.collection("lookup").updateOne({address: address}, {$set: {friendlyName: friendlyName}}, {upsert: true}, function(err, result) {
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

                //     const url = 'http://10.0.3.2:4000/tokenInfo/'+tokenAddress;
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

                    const url = 'http://10.0.3.2:4000/tokenInfo/'+tokenAddress;
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