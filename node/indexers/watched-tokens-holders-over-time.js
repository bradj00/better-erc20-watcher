// generate and maintain the pivot table for the number of cumulative holders of each watched token over time

import * as MongoClientQ from 'mongodb';
import * as dotenv from 'dotenv';
import chalk from 'chalk';


dotenv.config();


const mongoUrl = process.env.MONGO_CONNECT_STRING;
const MongoClient = MongoClientQ.MongoClient;


// console.clear();
while (1==1){
    
    await main()
    await new Promise(resolve => setTimeout(resolve, 1000 * 60 * 60)); // 1 hour
    

}


function getWatchedTokenList(){
    return new Promise(async (resolve, reject) => {
        MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
            if (err) {
                console.log('error connecting to mongo...\n\n'+err);
            }
            const dbStatus = client.db('watchedTokens');
            //get list of collections to array
            dbStatus.listCollections().toArray(function(err, collections) {
                if (err) {
                    console.log('error getting list of collections...\n\n'+err);
                }
                let collectionNames = [];
                for (let i = 0; i < collections.length; i++){
                    collectionNames.push(collections[i].name);
                }
                //remove the isSyncing collection
                collectionNames.splice(collectionNames.indexOf('isSyncing'), 1);




                resolve(collectionNames);
            });
            
        });

    });
}


function main(){
    return new Promise(async (resolve, reject) => {
        getWatchedTokenList()
        .then(async (result) => {
            let totalUniques = [];
            for (let i = 0; i < result.length; i++){
                console.log('processing '+chalk.cyan(result[i]));
                //look at every tx in the collection, keeping a running total of the number of unique addresses in the from and to fields

                MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
                    if (err) {
                        console.log('error connecting to mongo...\n\n'+err);
                    }
                    const dbStatus = client.db('watchedTokens');
                    const collection = dbStatus.collection(result[i]);
                    collection.find({}).sort({block_number:1}).toArray(function(err, txs) {
                        if (err) {
                            console.log('error getting list of collections...\n\n'+err);
                        }
                        let uniqueAddresses = [];
                        for (let q = 0; q < txs.length; q++){
                            if (uniqueAddresses.indexOf(txs[q].from_address) == -1){
                                uniqueAddresses.push(txs[q].from_address);
                                totalUniques.push(txs[q].from_address);
                            }
                            if (uniqueAddresses.indexOf(txs[q].to_address) == -1){
                                uniqueAddresses.push(txs[q].to_address);
                                totalUniques.push(txs[q].to_address);
                            }
                            // console.log(txs[q].block_timestamp);
                            //block_timestamp looks like this: 2023-01-05T05:02:23.000Z
                            // if the block_timestamp is a different day than the previous one, console log the running tally of unique addresses
                            if (txs[q-1] && txs[q].block_timestamp.split('T')[0] != txs[q-1].block_timestamp.split('T')[0]){
                                // console.log(txs[q].block_timestamp.split('T')[0],'unique addresses: '+uniqueAddresses.length);
                                //put this data into the pivot table
                                if (result[i]){
                                    const dbOverTime = client.db('watchedTokens-addresses-over-time');
                                    const collection2 = dbOverTime.collection(result[i]);
                                    // console.log('result[i]: ',result[i])
                                    collection2.insertOne({ date: txs[q].block_timestamp.split('T')[0], uniqueAddresses: uniqueAddresses.length }, function(err, res) {
                                        // if (err) throw err;
                                        // console.log("1 document inserted");
                                        // client.close();
                                    },);
                                }else {
                                    console.log('nahhh')
                                }



                            }

                        }
                        console.log(result[i],'unique addresses: '+uniqueAddresses.length);
                        
                        if (i == result.length-1){
                            // make totalUniques unique
                            totalUniques = [...new Set(totalUniques)];
                            // console log the total number of unique addresses for all watched tokens
                            console.log('total uniques: ',totalUniques.length);
                            resolve();
                        }

                    });

                });

                await new Promise(resolve => setTimeout(resolve, 100));
            }

        }) 
        .catch((err) => {

        });
    });
}