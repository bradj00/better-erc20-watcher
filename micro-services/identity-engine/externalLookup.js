const fetchFromOpenSea = require('./external-lookup-methods/opensea');

const axios = require('axios');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './.env' });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
const RATE_LIMITER_URL = 'http://localhost:4020/request'; // Assuming the rate limiter is running locally on port 4020

const client = new MongoClient(MONGODB_URI);
const addressesToLookup = [];

async function checkWithRateLimiter(serviceName) {
    try {
        const response = await axios.get(`${RATE_LIMITER_URL}/${serviceName}`);
        return response.data.status === 'GRANTED';
    } catch (error) {
        console.error(`Error checking with rate limiter for ${serviceName}:`, error.message);
        return false;
    }
}

async function cacheToMongo(address, data) {
    const collection = client.db(DB_NAME).collection('lookup');
    await collection.insertOne({ address, ...data });
}

async function performExternalLookup(address) {
    const apiEndpoints = [
        { serviceName: 'coingecko' },
        { serviceName: 'megaworld' },
        { serviceName: 'etherscan' },
        { serviceName: 'opensea', fetchFunction: fetchFromOpenSea } 
    ];

    let aggregatedData = {};

    for (const endpoint of apiEndpoints) {
        const isGranted = await checkWithRateLimiter(endpoint.serviceName);
        if (isGranted) {
            if (endpoint.fetchFunction) {
                // Use custom fetch function if provided
                const data = await endpoint.fetchFunction(address);
                aggregatedData = { ...aggregatedData, ...data };
            } else {
                // ... rest of the code for other endpoints ...
                console.log('SKIPPING. There were no endpoint instructions for: ',endpoint.serviceName)
            }
        } else {
            console.warn(`Rate limit exceeded for ${endpoint.serviceName}. Retrying later. (Make this actually retry...)`);
        }
    }

    return aggregatedData;
}

async function processAddresses() {
    for (const address of addressesToLookup) {
        const data = await performExternalLookup(address);
        console.log('\t final object to sling into Mongo: ',data)
        // await cacheToMongo(address, data); // take the final object and sling it into mongo
    }

    addressesToLookup.length = 0;
}

setInterval(processAddresses, 10000);

module.exports = {
    addAddressForLookup: (address) => addressesToLookup.push(address)
};
