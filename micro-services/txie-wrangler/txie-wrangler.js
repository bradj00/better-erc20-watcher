console.clear();

const { initConsumer} = require('./kafka/consumer.js');



require('dotenv').config({ path: './.env' });

const { MongoClient } = require('mongodb');

const WebSocket = require('ws');

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
    await initKafkaProducer();

    const decimals = await getDecimals(ERC20_CONTRACT_ADDRESS);
    console.log(`Token has ${decimals} decimals.`);
    console.log('Reading last cached block from Mongo for contract [' + chalk.cyan(ERC20_CONTRACT_ADDRESS) + ']');
    START_BLOCK = (await getLatestBlockFromMongo(ERC20_CONTRACT_ADDRESS)) + 1;
    console.log('Last calculated block:', START_BLOCK);
    await processBlocks(ERC20_CONTRACT_ADDRESS);
    await listenToNewBlocks(ERC20_CONTRACT_ADDRESS);
})();