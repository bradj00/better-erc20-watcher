
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
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'watchedTokens'; 
const dbNameFN = 'friendlyNames';
const listenPort = 4000;


const IgnoredAddresses = ["0x333e3763085fc14854978f89261890339cb2f6a9", "0x1892f6ff5fbe11c31158f8c6f6f6e33106c5b10e"]


const moralisApiKey = process.env.API_KEY;

const app = express();



console.clear(); 
console.log(chalk.cyan.underline.inverse('apiListen.js')+'\n');



app.use(express.json());

app.listen(listenPort, () => {
    console.log(`Server Started at ${listenPort}`)

    MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
        console.log('MongoDB Connected');
    

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
        // app.get('/txs/:collectionName', cors(), async (req, res) => {
        //     const db = client.db(dbName);
        //     const collection = db.collection(("a_"+req.params.collectionName));


               
        //         res.send(result)
        //     });
        // });

        // app.get('/txs/:collectionName/:pageNumber', cors(), async (req, res) => {
        app.get('/txs/:collectionName', cors(), async (req, res) => {
            console.log('query: ', req.params.collectionName, req.query);
            const pageNumber = req.query.pageNumber;
            const db = client.db(dbName);
            const collection = db.collection(("a_"+req.params.collectionName));
            
            
            if (pageNumber == 'chart') {
                collection.find({ $and: [ { from_address: { $nin: IgnoredAddresses } }, { to_address: { $nin: IgnoredAddresses } } ] }).sort({block_timestamp: -1}).limit(1000).toArray(function(err, result) {  
                    res.send({totalPages: 1, result: result}) // still 1000 limit. Used for chart and we should normalize our charts to only load 100 elements or less with pivot tables
                });
            } else {
                const pageLimit = 10;
                collection.find({ $and: [ { from_address: { $nin: IgnoredAddresses } }, { to_address: { $nin: IgnoredAddresses } } ] }).sort({block_timestamp: -1}).skip(pageNumber * pageLimit).limit(pageLimit).toArray(function(err, result) {  
                    
                    collection.count({ $and: [ { from_address: { $nin: IgnoredAddresses } }, { to_address: { $nin: IgnoredAddresses } } ] }, function(err, count) {
                    const totalPages = Math.ceil(count/pageLimit);
                    res.send({totalPages: totalPages-1, result: result});
                    });
                });
            }
        });


        app.get('/txs/:collectionName/txDetails/:txDetails', cors(), async (req, res) => {
            const pageNumber = req.query.pageNumber;
            const db = client.db(dbName);
            const collection = db.collection(("a_"+req.params.collectionName));
            console.log(req.params.txDetails) 
            collection.find({"transaction_hash": req.params.txDetails}).sort({block_timestamp: -1}).limit(50).toArray(function(err, result) {
                res.send(result)
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
            console.log('filtered by address query: ', req.query);
            const db = client.db(dbName);
            console.log('req.params.filterAddress: ', req.params.filterAddress);
            console.log('req.params.collectionName: ', req.params.collectionName);
            const collection = db.collection(("a_"+req.params.collectionName));

            collection.find({ $or: [ {to_address: {$regex: req.params.filterAddress, $options: 'i'}} ,  {from_address: {$regex: req.params.filterAddress, $options: 'i'}} ]}).sort({block_timestamp: -1}).limit(50000).toArray(function(err, result) {
                
                res.send(result)
            });
        });    

        app.get('/friendlyName/:theAddress', cors(), async (req, res) => {
            
            const db = client.db(dbNameFN);

            console.log('looking up: ', req.params.theAddress);
            const collection = db.collection('lookup'); 
     
            //we have to use a more expensive regex here because sometimes the address comes in not checksummed from Moralis. I could cast them all to lowercase but this seems better.
            const regex = new RegExp(`^${req.params.theAddress}$`, `i`);
            collection.find({address: regex }).toArray(function(err, result) {
                if (err) {
                    console.log('error: ', err);
                }
                console.log('result: ', result);
                res.send(result)
            });
        });




        app.get('/updateFN/:address/:friendlyName',  cors(), async (req, res) => {
            console.log('got FN update request: ',);

            const db = client.db(dbNameFN);
            const collection = db.collection('lookup');
            const address = req.params.address;
            const friendlyName = req.params.friendlyName;
            MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
                if (err) {
                    h.fancylog(err, 'error');
                    
                }
                const db = client.db('friendlyNames');
                //update or insert the friendlyName into the collection where address matches the address in the request
                db.collection("lookup").updateOne({address: address}, {$set: {friendlyName: friendlyName}}, {upsert: true}, function(err, result) {
                    if (err) { 
                        h.fancylog(err, 'error');
                    }
                    console.log('updated friendlyName result: ', result);
                    res.send(result);
                    client.close();
                });
            });
            
        });




        app.get('/watchedTokenList', cors(), async (req, res) => {
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
                res.send(temp);
            })
            
            


            
        });    
            
        
    }); 

});