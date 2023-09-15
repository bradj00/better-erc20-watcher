// additional job runs that analyze ingested tx data and store in pivot tables for faster querying
//      token volume for given collection aggregated by hour / day
//      all addresses that show up in the tx data (tokens held from that collection, token volumes, all other tokens held, etc)

//various jobs defined here as functions and we'll call them in a main function periodically



import axios from 'axios';
import chalk from 'chalk';
import * as MongoClientQ from 'mongodb';
import { resolve } from 'path';
import { getSystemErrorMap } from 'util';
import * as h from './helpers/h.cjs';
import dotenv from 'dotenv';
dotenv.config();

const moralisApiKey = process.env.API_KEY;
const MongoClient = MongoClientQ.MongoClient;
const mongoUrl = 'mongodb://localhost:27017';
const dbNameQueryAddys = 'watchedTokens';
const dbNamePivots = 'pivotTables';

console.clear();

//////////////////////////////////////////////////////
// we need this script to update the community held tokens, since we need to update balances for ALL tokens held by ALL addresses in the watchedTokens database to get that data
// the question is, how often do we want to do this, or do it on demand maybe?
//////////////////////////////////////////////////////

//1 get all unique addresses from the watchedTokens database and add them to the pivot table 'allAddresses'
// main();

//2 update all held tokens for all addresses that have made TXs in the watchedTokens database
getHeldTokensForAllAddresses(true);


// currently 2800+ tokens to sift through. Maybe this should be done on demand from the community held tokens screen (refresh for just that token)
//3 update all token prices in pivot table 'allTokenPrices'
// getAllTokenBalanceUsdPrices();




function main() {
    getAllAddresses()
        .then((uniqueAddresses) => {
            h.fancylog('updated '+uniqueAddresses.length+' address records in pivot table ['+chalk.green('allAddresses')+']', 'system ');
        })
        .catch(err => console.log(chalk.red('error in pivot tables analytics job'), err));


    setInterval(() => {
    console.log(chalk.green('starting pivot tables analytics job'));
    getAllAddresses()
        .then((uniqueAddresses) => {
            h.fancylog('updated '+uniqueAddresses.length+' address records in pivot table ['+chalk.green('allAddresses')+']', 'system ');
        })
        .catch(err => console.log(chalk.red('error in pivot tables analytics job'), err));


    //next function

    }, 1000 * 60 * 60 * 24); // run every 24 hours
}


//somehow we need to call this logic dynamically when the user clicks on a token in the community held tokens screen
async function getHeldTokensForAllAddresses(freshData) {
    // get all addresses from pivot table 'allAddresses'
    const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
    const db = client.db("pivotTables");
    let allAddresses = await db.collection("allAddresses").find({}).toArray();
    let filteredAddresses;
    
    // filter out addresses that have already been processed (already have more than 2 fields in the document, indicating we pulled token balances from moralis successfully)
    if (!freshData) {
        filteredAddresses = allAddresses.filter(address => 
            Object.keys(address).length <= 2
        );
    }
    else {
        filteredAddresses = allAddresses
    }

    // filter filterdAddresses again, removing any addresses that have a field called 'probablyContract' (we set this field if we couldn't get token balances from moralis, indicating the address is probably a contract)
    filteredAddresses = filteredAddresses.filter(address =>
        !address.hasOwnProperty('probablyContract')
    )

    console.log("all addresses", allAddresses.length);
    console.log("unprocessed addresses", filteredAddresses.length);
    // for each address, get all tokens held from Moralis api and update document in collection  'allAddresses' (db 'pivotTables')  adding a new field called the token address and the value is the balance of that token held by that address
    let count = 0;
    for (const address of filteredAddresses) {
        count++;
        if (address.address == '0x0') {
        continue;
        }
        // wait for 1 second before making the next call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('['+count+' / '+filteredAddresses.length+']\taddress: ', address.address)
        let balances = await getAddressBalancesFromMoralis(address.address);
        console.log('RETURNED RAW BALANCES: ', balances)
        if (balances && balances.length > 0) {
            // console.log(balances.length)
            //for each token held, add a new field to the document where address == address.address in the collection 'filteredAddresses' with the token address as the field name and the balance as the value
            for (const token of balances) {
                // console.log('token: ', token)
                let update = await db.collection('allAddresses').updateOne({ address: address.address }, { $set: { [token.token_address]: {metadata: token} } });
                // console.log('update: ', update)
            }
        }else {
            //set an empty object for the token address if we couldn't get the token balances from moralis so we don't re-check this address again. Filters contracts.
            await db.collection('allAddresses').updateOne({ address: address.address }, { $set: { probablyContract: true} });
        }

    }
}

//get all held erc20 tokens' balances from moralis
function getAddressBalancesFromMoralis(address){
    return new Promise((resolve, reject) => {
        let url = 'https://deep-index.moralis.io/api/v2/'+address+'/erc20?chain=eth';
        console.log('getting url: ', chalk.magenta(url))
        axios.get(url ,{
            headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-API-Key" : moralisApiKey
            },
        })
        .then(({data}) => {
            // console.log('---------------------------------')
            // console.log(data)
            // console.log('---------------------------------')
            console.log('number of tokens: ', data.length)
            resolve(data);
        })
        .catch((error) => {
            console.error('error fetching from moralis: \n\n',error.code, Object.keys(error))
            resolve();
        })

    });
}



// pull every address from all collections and store in a pivot table collection called 'allAddresses' in database 'pivotTables'
async function getAllAddresses() {
    return new Promise(async (resolve, reject) => {
    const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
    const db = client.db('watchedTokens');
    const db2 = client.db('pivotTables');
    const collections = await db.listCollections().toArray();
    const coolAddresses = [];
    for (const collection of collections) {
        const addresses = await db.collection(collection.name).find({}, { projection: { to_address: 1, from_address: 1, address: 1 } }).toArray();
        // console.log('addresses.length: ', addresses.length)
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

    let uniqueAddresses = [...new Set(coolAddresses)];
    console.log('uniqueAddresses.length from all collections: ', uniqueAddresses.length);
    let temp = uniqueAddresses.map(address => ({ address }));
    // console.log('------------------')
    // console.log(temp, typeof temp);
    // console.log('------------------')
    await db2.collection('allAddresses').insertMany(temp, [{"continueOnError": true, "ignoreUndefined": true, "ignoreDuplicates": true}] );  
    client.close();
    resolve(uniqueAddresses);
    });
}


async function getAllTokenBalanceUsdPrices(){
    //get all addresses from pivot table 'allAddresses'
    //for each of them, call getUsdPriceFromMoralis(tokenAddress) and store in collection 'allTokenBalanceUsdPrices' in database 'pivotTables'
    const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
    const db = client.db("pivotTables");
    
    // list of addresses we put into table to be looked up. This started when you click an address summary in web frontend and the held tokens are added to this list.
    let allAddresses = await db.collection("tokenUsdValues").find({}).toArray();
    //for each of these addresses, getUsdPriceFromMoralis(tokenAddress) and update the usdValue field in the document
    let count = 0;
    let uniqueAddresses = [...new Set(allAddresses)];
    for (const address of uniqueAddresses) {
        count++;
        // console.log(chalk.rgb(0,255,0)('address: ',address.address))
        let tokenAddress = address.address;
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('['+count+' / '+uniqueAddresses.length+']\taddress: ', tokenAddress)
        let usdPriceObj = await getUsdPriceFromMoralis(tokenAddress);
        let update = await db.collection("tokenUsdValues").updateOne({address: tokenAddress}, {$set: {usdValue: usdPriceObj}}, );
    }
        
}

async function getUsdPriceFromMoralis(tokenAddress){
    return new Promise((resolve, reject) => {
        let url = 'https://deep-index.moralis.io/api/v2/erc20/'+tokenAddress+'/price?chain=eth';
            
        console.log('getting usd price: ', chalk.magenta(url))
        axios.get(url ,{
            headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-API-Key" : moralisApiKey
            },
        })
        .then(({data}) => {
            // console.log('---------------------------------')
            // console.log(data)
            // console.log('---------------------------------')

            resolve(data);
        })
        .catch((error) => {
            console.error('['+chalk.cyan(tokenAddress)+'] error fetching from moralis: ',error.response.data.message)
            resolve();
        })
    });
}