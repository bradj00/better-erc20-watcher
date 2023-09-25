const { createClient } = require('@redis/client');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './.env' });

const MONGODB_URI = process.env.MONGODB_URI;
const REDIS_URL = process.env.REDIS_URL;
const DB_NAME = process.env.DB_NAME;

const client = new MongoClient(MONGODB_URI);
const redisClient = createClient(REDIS_URL);

// async function connectToMongo() {
//     if (!client.isConnected()) {
//         await client.connect();
//     }
// }

async function addressExistsInMongo(address) {
    const collectionName = `addresses`;
    const collection = client.db(DB_NAME).collection(collectionName);
    const addressEntry = await collection.findOne({ address: address });
    return !!addressEntry;
}

async function getAddressFromRedis(address) {
    return redisClient.get(address);
}

async function setAddressInRedis(address, data) {
    return redisClient.set(address, JSON.stringify(data));
}

async function ensureCache(address) {
    let redisquerydata = await getAddressFromRedis(address);

    if (!redisquerydata) {
        // await connectToMongo();
        const existsInMongo = await addressExistsInMongo(address);

        if (existsInMongo) {
            await setAddressInRedis(address, existsInMongo);
            return existsInMongo;
        } else {
            console.log('[ ' + address + ' ]\tnot found in REDIS + MONGO. Need to perform external lookups.');
            return null;
        }
    }

    return JSON.parse(data);
}

function connectToRedis() {
    return new Promise((resolve, reject) => {
        redisClient.connect()
            .then(() => {
                console.log('Connected to Redis');
                resolve();
            })
            .catch(err => {
                console.error('Error connecting to Redis:', err);
                reject(err);
            });
    });
}

module.exports = {
    ensureCache,
    connectToRedis
};
