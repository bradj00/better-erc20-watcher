import lookupSingleAddress from '../translator.js'
import chalk from 'chalk';

import * as MongoClientQ from 'mongodb';
const MongoClient = MongoClientQ.MongoClient;
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'friendlyNames';




console.clear();
var isUpdating = false;


// updateAddressName()
getLookup();
function getLookup(){
    process.stdout.write(chalk.green('(s) ')+chalk.cyan.bold('to set or enter address')+chalk.cyan(':')+' ') 
    

    process.stdin.on('data', data => {
        // console.log('----')
        //remove any new lines or carriage returns from data
        data = data.toString().replace(/(\r\n|\n|\r)/gm, "");

        lookupSingleAddress(data.toString()).then((result) => {
            console.log('result: ', result);
            // getLookup();
            console.log(chalk.green('(s) ')+chalk.cyan.bold('to set or enter address')+chalk.cyan(':')+' ')
            return;
        });

    });
}


function updateAddressName(){
    const friendlyName = "";
    const address = "";

    MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
        if (err) throw err;
        const db = client.db(dbName);
        db.lookup.updateOne ( {_id: "6375b1cbd8eaeaf8a3aac0a9"}, {$set: {address: address, friendlyName: friendlyName }} )
        console.log('updated address: '+address+' to friendlyName: '+friendlyName);
    });
}