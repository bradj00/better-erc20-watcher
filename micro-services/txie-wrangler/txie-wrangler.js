console.clear();

const { initConsumer } = require('./kafka/consumer.js');
require('dotenv').config({ path: './.env' });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.TXIE_WRANGLER_DB_NAME;

const client = new MongoClient(MONGODB_URI);

async function connectToMongo() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        return client.db(DB_NAME); // Get the database and return it to be used elsewhere
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process with an error code
    }
}

async function initKafkaConsumer(db, client) {
    try {
        await initConsumer(db, client); 
        console.log('Kafka consumer initialized successfully.');
    } catch (error) {
        console.error(`Failed to initialize Kafka consumer: ${error.message}`);
    }
}

(async () => {
    const db = await connectToMongo();
    if (db) {
        await initKafkaConsumer(db);
    }
    // ... rest of your application logic
})();
