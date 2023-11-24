// duties:
//      this service will create and maintain various indexes for each Watched Token collection
//      Currently the first index is to keep track of the running token balances for all addresses over time
//      per watched token




console.clear();

const { initConsumer } = require('./kafka/consumer.js');
require('dotenv').config({ path: './.env' });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.WATCHED_TOKENS_DB_NAME;

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



//////////////////////////////////
//////////////////////////////////
// To expand the token-balance-indexer.js microservice, we need to incorporate functionality for initializing, maintaining, and updating token balance indexes based on ERC20 transfer data. Here's an outline of the steps and functions to implement:

// 1. Initialization and Database Setup
// Check for Existing Indexes: Upon startup, the service should check for existing indexes in the watchedTokens-addressStats database. This involves iterating through each collection (named like a_0x0001234) and checking for existing data.
// Create Collections if Necessary: If a collection for a watched token does not exist, it should be created.
// 2. Fetching Latest Scanned Block
// Retrieve Latest Scanned Block: Each collection should have a meta document with the key latestBlockScanned. The service needs to fetch this value to determine from which block to start processing new transactions.
// 3. Processing New Transactions
// Fetching Transactions: Using the latestBlockScanned value, fetch new transactions from the watchedTokens database from the corresponding collection.
// Update Token Balances: For each transaction, update the currentTokenHoldings and currentTokenHoldingsLatestBlockNumber for the involved addresses.

//

async function checkForExistingIndexes(db) {
    const collections = await db.listCollections().toArray();
    return collections.map(collection => collection.name);
}



async function getLatestBlockScanned(db, collectionName) {
    const collection = db.collection(collectionName);
    const metaDocument = await collection.findOne({ metaKey: 'latestBlockScanned' });
    return metaDocument ? metaDocument.metaValue : null;
}

async function fetchNewTransactions(db, collectionName, startBlock) {
    // Replace with your logic to fetch transactions from the blockchain or another source
    // For example:
    // return await fetchTransactionsFromBlockchain(collectionName, startBlock);
}

async function updateTokenBalances(db, transactions) {
    // Iterate over transactions and update balances
    // Example:
    // for (const transaction of transactions) {
    //     const fromAddress = transaction.from;
    //     const toAddress = transaction.to;
    //     const value = transaction.value; // Ensure this is in the correct format/unit
    //     // Update the balances for fromAddress and toAddress
    // }
}









//////////////////////////////////
//////////////////////////////////









(async () => {
    const db = await connectToMongo();
    if (db) {
        const collections = await checkForExistingIndexes(db);
        for (const collectionName of collections) {
            await createCollectionIfNotExists(db, collectionName);
            const latestBlockScanned = await getLatestBlockScanned(db, collectionName);
            const newTransactions = await fetchNewTransactions(db, collectionName, latestBlockScanned);
            await updateTokenBalances(db, newTransactions);
        }
        await initKafkaConsumer(db);
    }

    // ... rest of your application logic
})();
