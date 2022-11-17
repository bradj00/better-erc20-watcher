console.clear(); 

import * as MongoClientQ from 'mongodb';
import express from 'express';


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
    

        app.get('/', (req, res) => {
            res.send('root')
            console.log('got something..')
        }) 
        app.get('/txs/:collectionName', async (req, res) => {
            const db = client.db(dbName);
            const collection = db.collection(("a_"+req.params.collectionName));
            collection.find().sort({block_timestamp: -1}).limit(50).toArray(function(err, result) {

                res.send(result)
            });
            
        
    }); 

    })
}) 