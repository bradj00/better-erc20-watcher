//sources to pull friendly names from:
// open sea
// mcp api (in-game name)
// ens


import axios from 'axios';
import chalk from 'chalk';
import * as MongoClientQ from 'mongodb';
import { getSystemErrorMap } from 'util';
const MongoClient = MongoClientQ.MongoClient;
const mongoUrl = 'mongodb://localhost:27017';
const dbNameQueryAddys = 'watchedTokens';
const dbNameFriendlyNames = 'friendlyNames';
var uniqueAddys = [];


//connect to mongodb, use db named "watchedTokens". Query each collection for the following columns: "to_address", "from_address", "address" and add all the addresses to the "coolAddresses" array. make coolAddresses unique.
async function getAddresses() {
    const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
    const db = client.db(dbNameQueryAddys);
    const collections = await db.listCollections().toArray();
    const coolAddresses = [];
    for (const collection of collections) {
        const addresses = await db.collection(collection.name).find({}, { projection: { to_address: 1, from_address: 1, address: 1 } }).toArray();
        for (const address of addresses) {
            if (address.to_address) {
                coolAddresses.push(address.to_address);
            }
            if (address.from_address) {
                coolAddresses.push(address.from_address);
            }
            if (address.address) {
                coolAddresses.push(address.address);
            }
        }
    }
    client.close();
    // console.log ([...new Set(coolAddresses)]);
    uniqueAddys = [...new Set(coolAddresses)];
}

//uncomment when running script directly. comment when running chainData.js since it imports and I cant stop this from auto calling. research?
getAddresses()
.then(() => {
    
    checkAddresses();
})



//then for each address, check if mongodb database "friendlyNames" has a collection with the same name as the address. if it does, check if the "username" column has a value. if it does, do nothing. if it doesn't, query opensea for the username and add it to the collection.
async function checkAddresses() {
    const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
    const dbFN = client.db(dbNameFriendlyNames);
    var count = 0;
    var countTrue = 0;
    
    for (const address of uniqueAddys) {

        count++;
        countTrue++;

        // console without line breaks
        // process.stdout.write('\r                    \r'+count+'\r');
        // setTimeout(async ()=>{
        const collection = await dbFN.collection('lookup').find({address: address}).toArray();
        
        
        if (collection.length > 0){
            console.log('COLLECTION IS: ');
            console.log(collection);
        }

        if (collection.length === 0) {
            setTimeout( async ()=>{
                console.log(count+' / '+uniqueAddys.length+'\tOpenSea lookup: ' + address);
                const data  = await checkAddress(address);
                if (data && (data != "0x000")) {
                    console.log(chalk.green(`Found username ${data}`));
                    // await db.collection(address).insertOne({ username: username });
                    await dbFN.collection("lookup").insertOne( { address: address, friendlyName: data} );
                    
                    // also list all transactions from all collections in the watchedTokens database that have the address as the from_address or to_address and add the username to the collection
                    const dbWT = client.db(dbNameQueryAddys);
                    const collections = await dbWT.listCollections().toArray();
                    for (const collection of collections) {
                        const addresses = await dbWT.collection(collection.name).find({ $or: [ { to_address: address }, { from_address: address } ] }, { projection: { to_address: 1, from_address: 1, address: 1 } }).toArray();
                        for (const address2 of addresses) {
                            if (address2 && address2.to_address === address) {

                                await dbWT.collection(collection.name).updateOne
                                (
                                    { to_address: address2.to_address },
                                    { $set: { to_address_friendlyName: data } }
                                );
                                console.log('[ '+chalk.cyan(data)+' ] updated TO in collection: '+collection.name);
                            }
                            if (address2 && address2.from_address === address) {
                                await dbWT.collection(collection.name).updateOne
                                (
                                    { from_address: address2.to_address },
                                    { $set: { from_address_friendlyName: data } }
                                );
                                console.log('[ '+chalk.cyan(data)+' ] updated FROM in collection: '+collection.name);
                            }
                        }
                    }
                } 
                else {
                    console.log(chalk.red(`No username found for ${address}`));
                    // await dbFN.collection("lookup").insertOne( { address: address, friendlyName: '0x000'} );
                    await dbFN.collection("lookup").updateOne( { address: address },{$setOnInsert: { address: address, friendlyName: address}},{upsert: false})
                    
                }
                console.log('tagged '+count+' of '+uniqueAddys.length+' addresses');
            },1000*count);
        } else {
            count--;

            //we found a friendlyName for this address existing in the database

            // list all transactions from all collections in the watchedTokens database that have the address as the from_address or to_address and add the username to the collection
            const dbWT = client.db(dbNameQueryAddys);
            const collections = await dbWT.listCollections().toArray();

            console.log(chalk.cyan('---------------'))
            console.log(collection[0]);
            console.log(chalk.cyan('---------------'))
            //for each collection in the watchedTokens database
            for (const collection5 of collections) {
                const addresses = await dbWT.collection(collection5.name).find({ $or: [ { to_address: address }, { from_address: address } ] }, { projection: { to_address: 1, from_address: 1, address: 1 } }).toArray();
                
                // find all transactions with this address as the to_address or from_address in the collection
                for (const address2 of addresses) {
                    if (address2 && address2.to_address === address) {
                        await dbWT.collection(collection5.name).updateOne
                        (
                            { to_address: address2.to_address },
                            { $set: { to_address_friendlyName: collection[0].friendlyName } }
                        );
                        console.log('updated to in collection: '+collection5.name+' with '+collection[0].friendlyName);
                    }
                    if (address2 && address2.from_address === address) {
                        await dbWT.collection(collection5.name).updateOne
                        (
                            { from_address: address2.to_address },
                            { $set: { from_address_friendlyName: collection[0].friendlyName } }
                        );
                        console.log('updated from in collection: '+collection5.name+' with '+collection[0].friendlyName);
                    }
                }
            }



        }
        // }, 10*count);
    }
    
    
    // client.close();
}

export default function lookupSingleAddress(address, delay5){
    return new Promise(async (resolve, reject) => {
    const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
    const dbFN = client.db(dbNameFriendlyNames);
    const collection = await dbFN.collection('lookup').find({address: address}).toArray();

    if (collection.length === 0) {
        setTimeout( async ()=>{
            // console.log(count+' / '+uniqueAddys.length+'\tOpenSea lookup: ' + address);
            const data  = await checkAddress(address);
            if (data ) {
                // console.log(chalk.green(`Found username ${data}`));
                resolve(data);
                client.close();
            } 
            else {
                // console.log(chalk.red(`No username found for ${address}`));
                resolve(data);
                client.close();
            }
        }, 500 * delay5);
    } else {
        resolve(collection[0].friendlyName);
    }
    
    
    });
}

async function checkAddress(address, resolve) {
    const url = 'https://api.opensea.io/user/' + address + '?format=json';
    try {
        const { data } = await axios.get(url, {})
        console.log(data);
        if (data.username == "0x000"){ return(address)}
        return data.username;
    }
    catch(error){
        // console.log('------------------------------------');
        // console.log(error);
        // console.log('------------------------------------');
        return(address)
    }
    

}

