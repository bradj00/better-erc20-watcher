// duties:
///////////
// tag transactions AND involved addresses with useful information
// probably save to a pivot table db in mongo

// to do: remove logic for elder rank calculation - we moved this straight to the tx-ingestion-engine

// consume a kafka message produced by the tx-ingestion-engine when the full tx is ingested
// off this message, process the full tx details and come up with tags for the transaction hash
// append these tags back to the full tx hash document in db 'tx-hash-details' collection 'details'

// for one, webui will no longer have to process this on the frontend
    

console.clear();

const { initProducer,  produceErrorEvent } = require('./kafka/producer.js');
const { initConsumer } = require('./kafka/consumer.js');


require('dotenv').config({ path: './.env' });
const { Web3 } = require('web3');
const { MongoClient } = require('mongodb');
const axios = require('axios');
const chalk = require('chalk');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
const ADDRESS_QUEUE_INTERVAL = 60000; // 60 seconds
const INFURA_ENDPOINT = process.env.INFURA_ENDPOINT;

// const ERC20_CONTRACT_ADDRESS = process.env.ERC20_CONTRACT_ADDRESS;
const web3 = new Web3(INFURA_ENDPOINT);


///////////
const client = new MongoClient(MONGODB_URI);
client.on("close", () => {
    console.warn("MongoDB connection closed. Reconnecting...");
    setTimeout(connectToMongo, 5000);
});
//////////


(async () => {
    await connectToMongo();
    await initKafkaConsumer(client);
    
    //currently blocking anything below this line...fix
    await processERC20Transactions(); // New function call to process transactions




})();

async function assignQueueNumbers() {
    const db = client.db(DB_NAME);
    const addressesCollection = db.collection('address-tags');

    // Find the highest existing queue number
    const highestQueueNumberDoc = await addressesCollection.find().sort({ queueNumber: -1 }).limit(1).next();
    let currentQueueNumber = highestQueueNumberDoc ? highestQueueNumberDoc.queueNumber : 0;

    // Find addresses without a lastProcessed date and without a queueNumber
    const addressesToQueue = await addressesCollection.find({ 
        lastProcessed: { $exists: false },
        queueNumber: { $exists: false }
    }).toArray();

    // Assign a queue number to each address starting from the next available number
    for (let address of addressesToQueue) {
        currentQueueNumber++;
        await addressesCollection.updateOne({ _id: address._id }, { $set: { queueNumber: currentQueueNumber } });
    }

    console.log(`Assigned queue numbers to ${addressesToQueue.length} addresses.`);
}


async function processAddresses() {
    const db = client.db(DB_NAME);
    const addressesCollection = db.collection('address-tags');

    // Fetch addresses sorted by queue number
    const queuedAddresses = await addressesCollection.find().sort({ queueNumber: 1 }).toArray();

    for (let address of queuedAddresses) {
        // TODO: Process the address (e.g., fetch data, run calculations, etc.)

        // Update the lastProcessed date
        await addressesCollection.updateOne({ _id: address._id }, { $set: { lastProcessed: new Date() } });
    }
}

async function checkForUnprocessedAddresses() {
    const db = client.db(DB_NAME);
    const addressesCollection = db.collection('address-tags');

    const unprocessedAddresses = await addressesCollection.find({ lastProcessed: { $exists: false } }).toArray();

    if (unprocessedAddresses.length) {
        console.warn(`Found ${unprocessedAddresses.length} unprocessed addresses. Re-queuing them.`);
        await assignQueueNumbers();
        await processAddresses();
    }
}

async function connectToMongo() {
    try {
        await client.connect();
        // console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

async function initKafkaProducer(){
    // Init the Kafka producer
    return initProducer().then(() => {
        console.log('Kafka producer initialized successfully.');
    }).catch((error) => {
        console.error(`Failed to initialize Kafka producer: ${error.message}`);
    });
}

async function initKafkaConsumer(){
    // Init the Kafka consumer
    return initConsumer(client).then(() => {
        console.log('Kafka consumer initialized successfully.');
    }).catch((error) => {
        console.error(`Failed to initialize Kafka consumer: ${error.message}`);
    });
}







async function processERC20Transactions() {
    const tokenCollections = await fetchTokenCollections();
    for (const collectionName of tokenCollections) {
        const uniqueAddresses = await analyzeTransactions(collectionName);
        await updateAddressStats(uniqueAddresses, collectionName);
        await assignAndUpdateElderRank(collectionName); // New function to assign ranks
    }
}


async function fetchTokenCollections() {
    const db = client.db(DB_NAME);
    const collections = await db.listCollections().toArray();
    return collections
        .filter(col => col.name.startsWith('a_'))
        .map(col => col.name);
}

async function analyzeTransactions(collectionName) {
    const db = client.db(DB_NAME);
    const collection = db.collection(collectionName);
    const transactions = await collection.find({}).toArray();
    
    const addressStats = {};
    transactions.forEach(tx => {
        ['from_address', 'to_address'].forEach(key => {
            if (!addressStats[tx[key]]) {
                addressStats[tx[key]] = {
                    firstBlockNumberSeen: parseInt(tx['block_number'], 10),
                    txFrequencyCount: 1
                };
            } else {
                addressStats[tx[key]].txFrequencyCount++;
            }
        });
    });

    console.log(`Finished analyzing transactions in collection [${collectionName}]`);
    return Object.entries(addressStats).map(([address, data]) => ({
        address,
        ...data
    }));
}



async function updateAddressStats(addresses, collectionName) {
    const db = client.db('watchedTokens-addressStats');
    const statsCollection = db.collection(collectionName);

    let currentIndex = 0;
    const totalAddresses = addresses.length;

    // Set up periodic logging
    const logInterval = setInterval(() => {
        console.log(`Processing: ${currentIndex}/${totalAddresses}`);
    }, 3000); // Log progress every 3 seconds

    const bulkOps = [];

    for (const { address, firstBlockNumberSeen, txFrequencyCount } of addresses) {
        bulkOps.push({
            updateOne: {
                filter: { address },
                update: { $set: { firstBlockNumberSeen, txFrequencyCount } },
                upsert: true
            }
        });

        currentIndex++;

        // Periodically execute bulk operations
        if (bulkOps.length >= 1000) { // Adjust the batch size as needed
            await statsCollection.bulkWrite(bulkOps);
            bulkOps.length = 0; // Clear the array for the next batch
        }
    }

    // Process any remaining operations in the last batch
    if (bulkOps.length > 0) {
        await statsCollection.bulkWrite(bulkOps);
    }

    // Clear the interval after loop completion
    clearInterval(logInterval);

    // Final log to indicate completion
    console.log(`Processing completed: ${totalAddresses}/${totalAddresses}`);
}



async function assignAndUpdateElderRank(collectionName) {
    const db = client.db('watchedTokens-addressStats');
    const statsCollection = db.collection(collectionName);

    // Fetch and sort the documents by firstBlockNumberSeen (ascending)
    const sortedDocs = await statsCollection.find({}).sort({ firstBlockNumberSeen: 1 }).toArray();

    let currentRank = 1;
    let currentIndex = 0;
    const totalDocs = sortedDocs.length;

    // Set up periodic logging
    const logInterval = setInterval(() => {
        console.log(`Processing: ${currentIndex}/${totalDocs} (Current Rank: ${currentRank})`);
    }, 3000); // Log progress every 3 seconds

    for (const doc of sortedDocs) {
        await statsCollection.updateOne(
            { _id: doc._id },
            { $set: { ElderRank: currentRank } }
        );

        currentRank++;
        currentIndex++;

        // Optional: If you want to slow down the loop to see the logging, you can use the following line
        // await new Promise(resolve => setTimeout(resolve, 10)); // Wait for 10 milliseconds
    }

    // Clear the interval after loop completion
    clearInterval(logInterval);

    // Final log to indicate completion
    console.log(`Processing completed: ${totalDocs}/${totalDocs}`);
}














