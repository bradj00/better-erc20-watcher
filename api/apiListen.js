console.clear(); 

import * as MongoClientQ from 'mongodb';
import express from 'express';
import cors from 'cors';
import chalk from 'chalk';



const MongoClient = MongoClientQ.MongoClient;
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'watchedTokens';

const listenPort = 4000;



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

    })
}) 