console.clear();

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function ProcessTokenTransactionsAndAddressTally() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log("Connected to MongoDB.");

        const db = client.db("watchedTokens");
        const dbStats = client.db("watchedTokens-addressStats");
        const dbHoT = client.db("watchedTokens-HoT");
        console.log("Databases selected.");

        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);
        console.log("Collections fetched:", collectionNames);

        for (let collectionName of collectionNames) {
            console.log(`Starting to process collection: ${collectionName}`);

            const hotCollection = dbHoT.collection(collectionName);
            const watchedTokensCollection = db.collection(collectionName);
            let masterUniqueAddresses = new Set();
            let progressInterval;

            try {
                console.log(`Fetching the latest hourly mark from watchedTokens-HoT for collection: ${collectionName}`);
                const latestDocument = await hotCollection.find().sort({ date: -1 }).limit(1).toArray();
                let startDateTime = new Date(0); // Unix epoch start if no latestDocument found

                if (latestDocument.length > 0) {
                    const completeDateTime = latestDocument[0].date + ":00:00";
                    startDateTime = new Date(completeDateTime);
                    console.log(`Resuming from the latest hourly mark: ${startDateTime.toISOString().split(':')[0]} for collection: ${collectionName}`);
                } else {
                    console.log(`No previous hourly data found. Starting from the beginning for collection: ${collectionName}`);
                }

                console.log(`Retrieving unique addresses up to: ${startDateTime.toISOString()}`);
                const uniqueAddresses = await watchedTokensCollection.aggregate([
                    { $match: { block_timestamp: { $lt: startDateTime.toISOString() } } },
                    { $group: { _id: null, uniqueFromAddresses: { $addToSet: "$from_address" }, uniqueToAddresses: { $addToSet: "$to_address" } } }
                ]).toArray();

                if (uniqueAddresses.length > 0) {
                    uniqueAddresses[0].uniqueFromAddresses.forEach(addr => masterUniqueAddresses.add(addr));
                    uniqueAddresses[0].uniqueToAddresses.forEach(addr => masterUniqueAddresses.add(addr));
                }

                const transactions = await watchedTokensCollection.find({ block_timestamp: { $gte: startDateTime.toISOString() } }).sort({ block_number: 1 }).toArray();
                let hourlyUniqueAddressCount = {};
                let currentNumber = 0;

                progressInterval = setInterval(() => {
                    console.log(`Progress in ${collectionName}: ${currentNumber} processed, Collection Uniques: ${masterUniqueAddresses.size}`);
                }, 5000);

                for (let transaction of transactions) {
                    currentNumber++;
                    const { from_address, to_address, value, block_timestamp } = transaction;


                    const transactionHour = new Date(block_timestamp).toISOString().split(':')[0];

                    if (!hourlyUniqueAddressCount[transactionHour]) {
                        hourlyUniqueAddressCount[transactionHour] = new Set();
                    }

                    if (!masterUniqueAddresses.has(from_address)) {
                        masterUniqueAddresses.add(from_address);
                        hourlyUniqueAddressCount[transactionHour].add(from_address);
                    }

                    if (!masterUniqueAddresses.has(to_address)) {
                        masterUniqueAddresses.add(to_address);
                        hourlyUniqueAddressCount[transactionHour].add(to_address);
                    }
                }

                for (const [hour, addresses] of Object.entries(hourlyUniqueAddressCount)) {
                    await hotCollection.insertOne({
                        date: hour,
                        uniqueCount: addresses.size
                    });
                }

                clearInterval(progressInterval);
                console.log(`Final Progress in ${collectionName}: ${currentNumber} processed, Collection Uniques: ${masterUniqueAddresses.size}`);
            } catch (error) {
                console.error("An error occurred in collection:", collectionName, error);
                clearInterval(progressInterval);
            }
        }
    } catch (error) {
        console.error("An error occurred while connecting to MongoDB:", error);
    } finally {
        console.log("Closing MongoDB connection.");
        await client.close();
    }
}

(async () => {
   await ProcessTokenTransactionsAndAddressTally();
})();
