console.clear();

const { initConsumer, consumeTokenTransferEvent } = require('./kafka/consumer');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './.env' });


const MONGODB_URI = process.env.MONGODB_URI;
const client = new MongoClient(MONGODB_URI);

let addressesToCheck = [];

const startLabelingEngine = async () => {
  console.log('Starting Labeling Engine...');

  //Mongo connection
  await connectToMongo();

  // Initialize and start the Kafka consumer
  await initConsumer();

  console.log('Labeling Engine is now listening for events...');
};


const processTokenTransferEvent = async (eventData) => {
    console.log('Processing token transfer event...');
    console.log(eventData);

    const { from_address, to_address } = eventData.data;

    // Check if from_address exists in the database
    if (!await addressExistsInDatabase(from_address)) {
        addressesToCheck.push(from_address);
    }

    // Check if to_address exists in the database
    if (!await addressExistsInDatabase(to_address)) {
        addressesToCheck.push(to_address);
    }
};

const processErrorEvent = (errorData) => {
  console.log('Processing error event...');
  console.log(errorData);
  // TODO: Add any additional error handling logic here
};










async function connectToMongo() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

async function addressExistsInDatabase(address) {
    const collectionName = `addresses`; // Assuming you have a collection named 'addresses' to store unique Ethereum addresses
    const collection = client.db(DB_NAME).collection(collectionName);
    const addressEntry = await collection.findOne({ address: address });
    return !!addressEntry;
}


setInterval(() => {
    if (addressesToCheck.length > 0) {
        console.log("\tAddresses to be checked with external APIs:", addressesToCheck);
        addressesToCheck = []; // Clear the array after logging
    }
}, 60000); // Log every 60 seconds


client.on("close", () => {
    console.warn("MongoDB connection closed. Reconnecting...");
    setTimeout(connectToMongo, 5000);
});

startLabelingEngine().catch(error => {
  console.error('Error starting Labeling Engine:', error.message);
  process.exit(1);
});
