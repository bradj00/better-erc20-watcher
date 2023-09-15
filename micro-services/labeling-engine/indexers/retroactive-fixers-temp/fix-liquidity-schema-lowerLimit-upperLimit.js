import axios from 'axios';
import dotenv from 'dotenv';
import * as MongoClientQ from 'mongodb';
import chalk from 'chalk';
const MongoClient = MongoClientQ.MongoClient;

dotenv.config();

const mongoUrl = process.env.MONGO_CONNECT_STRING;
const dbName = process.env.DB_NAME;  
const dbNameFN = process.env.DB_NAME_FN;


main();
async function main(){
    MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
        if (err) {
            console.log('fat mongo error: '+err);
        }
        //get all collection names
        const db = client.db('uniswap-v3-position-managers');
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map((collection) => collection.name);
        // console.log(collectionNames);
        //get all collection names that start with "a_"
        const collectionNamesFiltered = collectionNames.filter((collectionName) => collectionName.startsWith("a_"));
        console.log(collectionNamesFiltered);

        // const dbStatus = client.db('uniswap-v3-position-managers');
        // const collection = dbStatus.collection("a_"+contractAddress);
        // for each collection, then for each document in the collection, (write this skeleton and prepare to do something)
        for (let i = 0; i < collectionNamesFiltered.length; i++){
            const collectionName = collectionNamesFiltered[i];
            const collection = db.collection(collectionName);

            console.log(collectionName);
            const documents = await collection.find({}).toArray();
            
            console.log(documents.length);
            for (let j = 0; j < documents.length; j++){
                const document = documents[j];
                const name = document.name;

                // console.log(doc.name);
                let regex = /(\d+\.*\d+)\<\>(\d+\.*\d+)$/i; 
                let matches = regex.exec(name);
                if (matches && matches.length == 3){ 
                    let lowerLimit = matches[1]; 
                    let upperLimit = matches[2];
                    // console.log('\nlowerLimit: ',lowerLimit); 
                    // console.log('upperLimit: ',upperLimit,'\n\n');

                    // add two new fields to the document called lowerLimit and upperLimit and set them to the values of the regex matches
                    // then update the document in the database
                    document.lowerLimit = lowerLimit;
                    document.upperLimit = upperLimit;
                    await collection.updateOne({_id: document._id}, {$set: {lowerLimit: document.lowerLimit, upperLimit: document.upperLimit}});
                    process.stdout.write('\r'+'                                                 '+'\r');
                    process.stdout.write((j+1)+' of '+documents.length+' updated');
                    
                }


            }
        }
        // collection.find({}).toArray(function(err, docs) {
                                
        // });
    });
}