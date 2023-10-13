console.clear();

const { initProducer, produceTokenTransferEvent, produceTokenTransferStreamEvent, produceErrorEvent } = require('./kafka/producer.js');


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
const ERC20_CONTRACT_ADDRESS = process.env.ERC20_CONTRACT_ADDRESS;
const web3 = new Web3(INFURA_ENDPOINT);

const SKIP_RESET_COUNTER = 20;
const THROTTLE_MS = 300;
const BASE_CHUNK_SIZE = 50;
const MAX_CHUNK_SIZE = 100000;

let START_BLOCK = 1;
let CHUNK_SIZE = BASE_CHUNK_SIZE;
let currentBlock = START_BLOCK;

///////////
const client = new MongoClient(MONGODB_URI);
client.on("close", () => {
    console.warn("MongoDB connection closed. Reconnecting...");
    setTimeout(connectToMongo, 5000);
});
//////////

(async () => {
    await connectToMongo();
    await initKafkaProducer();
})();

async function connectToMongo() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

function initKafkaProducer(){
        // Init the Kafka producer
    initProducer().then(() => {
        console.log('Kafka producer initialized successfully.');
    }).catch((error) => {
        console.error(`Failed to initialize Kafka producer: ${error.message}`);
    });

}


