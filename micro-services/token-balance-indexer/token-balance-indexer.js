const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function ProcessTokenTransactionsAndAddressTally() {
    const client = new MongoClient(MONGODB_URI);
    let progressInterval;

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
            const collection = db.collection(collectionName);
            const totalDocsInCollection = await collection.countDocuments();
            console.log(`Processing collection: ${collectionName}`);

            let currentNumber = 0;
            let masterUniqueAddresses = new Set();

            progressInterval = setInterval(() => {
                console.log(`Progress in ${collectionName}: ${currentNumber}/${totalDocsInCollection} processed, Collection Uniques: ${masterUniqueAddresses.size}`);
            }, 5000);

            const watchedTokensCollection = db.collection(collectionName);
            const addressStatsCollection = dbStats.collection(collectionName);
            const hotCollection = dbHoT.collection(collectionName);

            const transactions = await watchedTokensCollection.find().sort({ block_number: 1 }).toArray();
            let dailyUniqueAddressCount = {};

            for (let transaction of transactions) {
                currentNumber++;
                const { from_address, to_address, value, block_timestamp } = transaction;

                if (typeof value !== 'string') continue;

                const valueBigInt = BigInt(value);

                let fromBalanceBigInt = BigInt(0);
                let toBalanceBigInt = BigInt(0);

                const fromAddressStats = await addressStatsCollection.findOne({ address: from_address });
                const toAddressStats = await addressStatsCollection.findOne({ address: to_address });

                if (fromAddressStats && fromAddressStats.currentTokens !== undefined) {
                    fromBalanceBigInt = BigInt(fromAddressStats.currentTokens);
                }
                if (toAddressStats && toAddressStats.currentTokens !== undefined) {
                    toBalanceBigInt = BigInt(toAddressStats.currentTokens);
                }

                transaction.from_address_oldBalance = fromAddressStats ? fromAddressStats.currentTokens : "0";
                transaction.to_address_oldBalance = toAddressStats ? toAddressStats.currentTokens : "0";

                const newFromBalance = fromBalanceBigInt - valueBigInt;
                const newToBalance = toBalanceBigInt + valueBigInt;

                await addressStatsCollection.updateOne({ address: from_address }, { $set: { currentTokens: newFromBalance.toString() } }, { upsert: true });
                await addressStatsCollection.updateOne({ address: to_address }, { $set: { currentTokens: newToBalance.toString() } }, { upsert: true });

                await watchedTokensCollection.updateOne({ _id: transaction._id }, { $set: transaction });

                try {
                    const transactionDate = new Date(block_timestamp).toISOString().split('T')[0];

                    if (!dailyUniqueAddressCount[transactionDate]) {
                        dailyUniqueAddressCount[transactionDate] = new Set();
                    }

                    if (!masterUniqueAddresses.has(from_address)) {
                        masterUniqueAddresses.add(from_address);
                        dailyUniqueAddressCount[transactionDate].add(from_address);
                    }

                    if (!masterUniqueAddresses.has(to_address)) {
                        masterUniqueAddresses.add(to_address);
                        dailyUniqueAddressCount[transactionDate].add(to_address);
                    }
                } catch (e) {
                    console.error(`Error processing transaction with ID ${transaction._id}:`, e);
                    continue;
                }
            }

            // Insert each day's unique address count as a separate document
            for (const [day, addresses] of Object.entries(dailyUniqueAddressCount)) {
                await hotCollection.insertOne({
                    date: day,
                    uniqueCount: addresses.size
                });
            }

            clearInterval(progressInterval);
            console.log(`Final Progress in ${collectionName}: ${currentNumber}/${totalDocsInCollection} processed, Collection Uniques: ${masterUniqueAddresses.size}`);
        }
    } catch (error) {
        console.error("An error occurred:", error);
        clearInterval(progressInterval);
    } finally {
        console.log("Closing MongoDB connection.");
        await client.close();
    }
}

(async () => {
   await ProcessTokenTransactionsAndAddressTally();
})();
