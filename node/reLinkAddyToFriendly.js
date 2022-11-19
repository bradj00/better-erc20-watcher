

import chalk from 'chalk';
import * as MongoClientQ from 'mongodb';
const MongoClient = MongoClientQ.MongoClient;
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'watchedTokens';
const db2Name = 'friendlyNames';


function reIndexAddressesToFriendlyNames(collectionAddress){
    // collectionAddress is a single string
    MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
        if (err) throw err;
        const db = client.db(dbName);
        const collectionAddy = "0x_"+collectionAddress;
        // for each document in collection named collectionAddy, update the to_address_friendlyName and from_address_friendlyName fields with the value returned by matching the address in db2Name.lookup collection
        lookupSingleAddress(tx.from_address, delay5).then((q) => {
            lookupSingleAddress(tx.to_address, delay5).then((x) => {
                
                
            });
        });

    });
}