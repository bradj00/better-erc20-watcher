//the structural question from here is whether to make this a daemon and run with cron periodically, dynamically called by chainData.js, or a setInterval and sleep like 
//how chainData.js works right now.

import axios from 'axios';
import chalk from 'chalk';
import * as MongoClientQ from 'mongodb';
import { resolve } from 'path';
import { getSystemErrorMap } from 'util';
import * as h from './helpers/h.cjs';

const MongoClient = MongoClientQ.MongoClient;
const mongoUrl = 'mongodb://localhost:27017';
const dbNameQueryAddys = 'watchedTokens';
const dbNameFriendlyNames = 'friendlyNames';
var uniqueAddys = [];
var uniqueAddysCachedPresent = [];
var uniqueAddysToLookup = [];


var sleepSeconds = 300; // 5 minutes between each run


console.clear();
console.log(chalk.cyan.underline.inverse('translator.js')+'\n');
// connect to mongo, create a list of unique addresses from all documents in each watchedTokens database collection.
// then, create a unique list of addresses from that array of addresses.
// then, for each address, check if it has a collection in the friendlyNames database.
// if it does, add it to the uniqueAddysCachedPresent array.
// if it doesn't, add it to the uniqueAddysToLookup array.
// once that is all complete, simultaneously kick off UpdateTxsFromEachCollection() and LookupAddressesFromApi()


//main function to run the whole thing, called on script startup


getAddresses()
.then((uniqueAddys) => {
    // console.log('uniqueAddys.length from getAddresses(): ', uniqueAddys.length);
    checkIfAddressesExistInFriendlyNames( uniqueAddys )
    .then((thisObj) => {
        let toLookup = thisObj.toLookup;
        let existsInCache = thisObj.existsInCache;
        console.log('addresses to lookup friendlyName:\t', toLookup.length);
        console.log('cached friendlyName addresses:\t\t', existsInCache.length);

        h.fancylog('starting jobs: '+chalk.yellow('LookupAddressesFromApi()')+' '+chalk.yellow('UpdateTxsFromEachCollection()'), 'system ');

        LookupAddressesFromApi(toLookup)
        // let existsInCacheFirstFive = existsInCache.slice(0, 5);
        // LookupAddressesFromApi(existsInCacheFirstFive)
        .then((data) => {
            if (data) {
                console.log(chalk.cyan('Updating TXs with the friendlyNames we had to fetch: '), data);
                UpdateTxsFromEachCollection(data, 'loud') // console.log any tx updates that happen
            } else {
                h.fancylog(chalk.yellow('LookupAddressesFromApi()')+'\tfinished. No new addresses to update.','system ');
            }
        });
        UpdateTxsFromEachCollection(existsInCache, 'silent'); // silence logging tx updates since there will be a lot from the cached addresses

    })
})


setInterval(() => {
    uniqueAddys = [];
    uniqueAddysToLookup = [];
    uniqueAddysCachedPresent = [];

    getAddresses()
    .then((uniqueAddys) => {
        // console.log('uniqueAddys.length from getAddresses(): ', uniqueAddys.length);
        checkIfAddressesExistInFriendlyNames( uniqueAddys )
        .then((thisObj) => {
            // console.log('thisObj: ', Object.keys(thisObj));
            let toLookup = thisObj.toLookup;
            let existsInCache = thisObj.existsInCache;
            // // console.log('addresses to lookup friendlyName:\t', toLookup.length);
            // // console.log('cached friendlyName addresses:\t\t', existsInCache.length);
            h.fancylog('addresses to lookup friendlyName:\t'+ toLookup.length,'system ');
            h.fancylog('cached friendlyName addresses:\t\t'+ existsInCache.length,'system ');

            // console.log(chalk.cyan('simultaneously kicking off jobs: ')+chalk.yellow('UpdateTxsFromEachCollection()')+' and '+chalk.yellow('LookupAddressesFromApi()'));
            
            LookupAddressesFromApi(toLookup)
            // let existsInCacheFirstFive = existsInCache.slice(0, 5);
            // LookupAddressesFromApi(existsInCacheFirstFive)
            .then((data) => {
                if (data) {
                    console.log(chalk.cyan('Updating TXs with the friendlyNames we had to fetch: '), data);
                    UpdateTxsFromEachCollection(data, 'loud') // console.log any tx updates that happen
                }
            })
            .catch((err) => {
                h.fancylog(err, 'error ');
            });
            UpdateTxsFromEachCollection(existsInCache, 'silent'); // silence logging tx updates since there will be a lot from the cached addresses

        })
    })

}, 1000 * sleepSeconds); // run every 5 minutes...super overkill but good to test running this many times before we daemonize it with cron


async function getAddresses() {
    //return new promise
    return new Promise(async (resolve, reject) => {
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
    // console.log('uniqueAddys: ', uniqueAddys);
    // console.log('uniqueAddys.length from all collections: ', uniqueAddys.length);
    resolve(uniqueAddys);
    });
}

function checkIfAddressesExistInFriendlyNames(){
    //return new promise
    return new Promise(async (resolve, reject) => {
        const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
        const dbFN = client.db(dbNameFriendlyNames);
        var count = 0;
        var countTrue = 0;
        for (const address of uniqueAddys) {
            count++;
            countTrue++;
            var collectionExists = await dbFN.collection('lookup').find({address: address}).toArray();
            if (collectionExists) {
                uniqueAddysCachedPresent.push(address);
            } else {
                uniqueAddysToLookup.push(address);
            }
        }
        // console.log('uniqueAddysCachedPresent.length: ', uniqueAddysCachedPresent.length);
        // console.log('uniqueAddysToLookup.length: ', uniqueAddysToLookup.length);
        client.close();
        resolve({toLookup: uniqueAddysToLookup, existsInCache: uniqueAddysCachedPresent});
    });
}

 
async function UpdateTxsFromEachCollection(addresses, silentSwitch){
    const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
    const dbFN = client.db(dbNameFriendlyNames);
    const db = client.db(dbNameQueryAddys);



    for (let i = 0; i < addresses.length; i++) {
        // setTimeout(() => {
            // console.log('hello ', addresses[i]);
            // find all documents in all collections that have the address in the from_address or to_address field. Update the to_address_friendlyName or from_address_friendlyName depending on which field it is.
            let friendlyName = await dbFN.collection('lookup').find({address: addresses[i]}).limit(1).toArray()
            if(friendlyName[0]){
                if (silentSwitch == 'loud'){
                    // console.log('updating all collections matching address: ', chalk.magenta(addresses[i]),' with friendlyName: ', chalk.magenta(friendlyName[0].friendlyName));
                    h.fancylog('updating all collections matching address: '+ chalk.magenta(addresses[i])+' with friendlyName: '+chalk.magenta(friendlyName[0].friendlyName), ' mongo ')
                }

                const collections = await db.listCollections().toArray();
                for (let j = 0; j < collections.length; j++) {
                    db.collection(collections[j].name).updateMany({from_address: addresses[i]}, {$set: {from_address_friendlyName: friendlyName[0].friendlyName}})
                    db.collection(collections[j].name).updateMany(  {to_address: addresses[i]}, {$set: {to_address_friendlyName: friendlyName[0].friendlyName}})
                }
            }
            else { 
                if (silentSwitch == 'loud'){
                    // console.log('\tskip because no friendlyName found for address: ', addresses[i]);
                    h.fancylog('skip because no friendlyName found for address: '+addresses[i], ' mongo ')
                }
            }
        // }, 200 * i);
        if (i == addresses.length - 1) {
            h.fancylog(chalk.yellow('UpdateTxsFromEachCollection()')+'\tfinished. Updated TXs for: '+chalk.yellow(i)+ ' addresses',' mongo ')
            // console.log('--------------------------------------------');
            h.fancylog(`all token TXs are up to date for all watched tokens. sleeping ${chalk.cyan(sleepSeconds)} seconds..`, 'system ')
            // client.close();
        }
    }

}


const LookupAddressesFromApi = (ListOfAddresses) => {
    // console.log('list of addresses: ', ListOfAddresses);
    return new Promise( (resolve, reject) => {
        if (ListOfAddresses.length == 0) {
            resolve();
        }
        let newlyFetchedAddresses = [];
        ListOfAddresses.reduce((promiseChain, item, index) => {
            console.log('index: ', index);
            return promiseChain.then(() => {
                newlyFetchedAddresses.push(item);
                if (index == ListOfAddresses.length - 1) {
                    console.log(chalk.red('done fetching all addresses, count: '), index);
                    resolve(newlyFetchedAddresses);
                }
                return LookupSingleAddress(item);
            });
        }, Promise.resolve())
    });
}

const LookupSingleAddress =  (singleAddress) => {
    return new Promise( (resolve, reject) => {
        setTimeout(async() => {
            const url = 'https://api.opensea.io/user/' + singleAddress + '?format=json';
            // console.log('OpenSea looking up: ', url);
            h.fancylog('OpenSea looking up: '+url, 'system ')
            
            try {
                const { data } = await axios.get(url, {})
                console.log('got: ', data.username);
                resolve(data.username);
            }
            catch(error){
                console.log('------------------------------------');
                console.log(error.code); // usually means the name is not found on OpenSea if 404 ERR_BAD_REQUEST
                console.log('------------------------------------');
                resolve(singleAddress);
            }
        }, 1000);
    });
  }
  