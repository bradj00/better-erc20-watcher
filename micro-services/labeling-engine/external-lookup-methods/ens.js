const { MongoClient } = require('../node_modules/mongodb');
require('../node_modules/dotenv').config({ path: './.env' });
const Web3 = require('web3');

const INFURA_URL = process.env.INFURA_URL;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL));
const client = new MongoClient(MONGODB_URI);

async function resolveENS(ensName) {
    try {
        const address = await web3.eth.ens.getAddress(ensName);
        await cacheToMongo(ensName, { ENS: address });

        return { ENS: address };
    } catch (error) {
        console.error(`Error resolving ENS name ${ensName}:`, error.message);

        // Cache an error marker (or simply the ensName itself) if there's an error
        await cacheToMongo(ensName, { ENS: 'ERROR' });

        return { ENS: 'ERROR' };
    }
}

async function cacheToMongo(ensName, data) {
    const db = client.db(DB_NAME);
    await db.collection("lookup").updateOne({ ensName }, { $set: data }, { upsert: true });

    // Note: You correctly pointed out that there was no error handling here. 
    // You could consider adding try/catch here and handle DB-specific errors.
}

module.exports = resolveENS;
