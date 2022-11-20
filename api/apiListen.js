console.clear(); 

import * as MongoClientQ from 'mongodb';
import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import axios from 'axios';


const MongoClient = MongoClientQ.MongoClient;
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'watchedTokens';

const listenPort = 4000;

const moralisApiKey = "T7pqHUU2RfiIe9i7Ppo0WNC3trCzDRs6bWAMhraTZSJBU1KqiJoLpHKejgUrNQJD";

const app = express();

app.use(express.json());

app.listen(listenPort, () => {
    console.log(`Server Started at ${listenPort}`)

    MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
        console.log('MongoDB Connected');
    

        app.get('/', cors(),(req, res) => {
            const timestamp = new Date().getTime();
            res.send(timestamp.toString()) // used for heartbeat
            
        }) 
        app.get('/txs/:collectionName', cors(), async (req, res) => {
            const db = client.db(dbName);
            const collection = db.collection(("a_"+req.params.collectionName));
            collection.find().sort({block_timestamp: -1}).limit(50).toArray(function(err, result) {
                
                res.send(result)
            });
        });
        app.get('/tokenInfo/:tokenAddress', cors(), async (req, res) => {
            
            const url = 'https://deep-index.moralis.io/api/v2/erc20/metadata?chain=eth&addresses='+req.params.tokenAddress;
            console.log('>>>>>> url: ', url);
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
            const db = client.db(dbName);
            console.log('req.params.filterAddress: ', req.params.filterAddress);
            const collection = db.collection(("a_"+req.params.collectionName));

            collection.find({ $or: [ {to_address: {$regex: req.params.filterAddress, $options: 'i'}} ,  {from_address: {$regex: req.params.filterAddress, $options: 'i'}} ]}).sort({block_timestamp: -1}).limit(50000).toArray(function(err, result) {
                
                res.send(result)
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