console.clear();

const { initConsumer } = require('./kafka/consumer.js');

require('dotenv').config({ path: './.env' });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
const client = new MongoClient(MONGODB_URI);



async function connectToMongo() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

client.on("close", () => {
    console.warn("MongoDB connection closed. Reconnecting...");
    setTimeout(connectToMongo, 5000);
});

function initKafkaConsumer(){
        // Init the Kafka consumer
    initConsumer().then(() => {
        console.log('Kafka consumer initialized successfully.');
    }).catch((error) => {
        console.error(`Failed to initialize Kafka consumer: ${error.message}`);
    });
}


(async () => {
    await connectToMongo();
    await initKafkaConsumer();

    // ...
})();