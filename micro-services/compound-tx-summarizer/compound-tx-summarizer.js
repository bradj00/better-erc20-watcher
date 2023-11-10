console.clear();

const { initProducer, produceTokenTransferEvent, produceTokenTransferStreamEvent, produceErrorEvent } = require('./kafka/producer.js');
const { initConsumer, consumeTxArrayLookupReq } = require('./kafka/consumer.js');



require('dotenv').config({ path: './.env' });
const { Web3 } = require('web3');
const { MongoClient } = require('mongodb');
const axios = require('axios');
const chalk = require('chalk');
const WebSocket = require('ws');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
const INFURA_ENDPOINT = process.env.INFURA_ENDPOINT_URL;
const INFURA_WS_ENDPOINT = process.env.INFURA_WS_ENDPOINT_URL;

const web3 = new Web3(INFURA_ENDPOINT);

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




function initKafkaProducer(){
     
    initProducer().then(() => {
        console.log('Kafka producer initialized successfully.');
    }).catch((error) => {
        console.error(`Failed to initialize Kafka producer: ${error.message}`);
    });

}
function initKafkaConsumer(){
       
    initConsumer(client).then(() => {
        console.log('Kafka consumer initialized successfully.');
    }).catch((error) => {
        console.error(`Failed to initialize Kafka consumer: ${error.message}`);
    });

}



(async () => {
    await connectToMongo();
    await initKafkaConsumer();
    await initKafkaProducer();



})();