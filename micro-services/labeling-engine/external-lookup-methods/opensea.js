const axios = require('axios');
const { MongoClient } = require('mongodb');
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

const client = new MongoClient(MONGODB_URI);

async function fetchFromOpenSea(address) {
    const url = `https://api.opensea.io/user/${address}?format=json`;

    try {
        const { data } = await axios.get(url);
        const username = data.username || address; // Use the address as a fallback if username is null

        // Cache the result to MongoDB
        await cacheToMongo(address, { OpenSea: username });

        return { OpenSea: username };
    } catch (error) {
        console.error(`Error fetching OpenSea username for address ${address}:`, error.message);
        // Cache the address itself as the username if there's an error
        await cacheToMongo(address, { OpenSea: address });

        return { OpenSea: address };
    }
}

async function cacheToMongo(address, data) {
    if (!client.isConnected()) {
        await client.connect();
    }
    const db = client.db(DB_NAME);
    await db.collection("lookup").updateOne({ address }, { $set: data }, { upsert: true });
}

module.exports = fetchFromOpenSea;
