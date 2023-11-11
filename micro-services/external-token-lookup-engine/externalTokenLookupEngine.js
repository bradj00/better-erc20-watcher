console.clear();


const axios = require('axios');
const { MongoClient } = require('mongodb');
const express = require('express')
const dotenv = require('dotenv')
dotenv.config();

const { initConsumer } = require('./kafka/consumer');
const { initProducer, produceFinishedLookupRequest } = require('./kafka/producer');
let db;
const app = express();
const PORT = 4000;

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.COLLECTION_NAME;

const PENDING_JOBS = [];
const RATE_LIMITED_JOBS = []; // New array for rate-limited jobs
const PROCESS_INTERVAL = 1000; // 10 seconds, adjust as needed
const RATE_LIMIT_DELAY = 1000; // 1 second, adjust based on Coingecko's rate limits
const RETRY_INTERVAL = 1000; // 1 minute, adjust as needed for retrying rate-limited jobs

// initConsumer(PENDING_JOBS).catch(error => {
//     console.error("Error initializing Kafka consumer:", error);
// });

console.log("MONGO_URI: ",MONGO_URI)

const client = new MongoClient(MONGO_URI);

async function initialize() {
    try {
        await client.connect();
        db = client.db(DB_NAME);
        console.log("Connected to MongoDB");
        
        await initConsumer(PENDING_JOBS)
        console.log("Consumer Initialized.");
        
        await initProducer()
        console.log("Producer Initialized.");
        

    } catch (error){
        console.error("Error initializing Lookup Engine:", error);
        process.exit(1);  
    }
}

initialize();



async function reconnectToMongo() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

client.on("close", () => {
    console.warn("MongoDB connection closed. Reconnecting...");
    setTimeout(reconnectToMongo, 5000);
});



app.get('/token/:contractAddress', async (req, res) => {
    const contractAddress = req.params.contractAddress;
    // Check if data exists in the database
    let tokenData = await db.collection(COLLECTION_NAME).findOne({ contractAddress });

    if (tokenData) {
        console.log('we have that cached!')
        res.json(tokenData.data);
    } else {
        const jobID = {
            id: Date.now().toString(),
            contractAddress: contractAddress,
            status: 'Pending'
        };

        console.log('requesting lookup for: ', jobID);
        PENDING_JOBS.push(jobID);
        res.json(jobID);
    }
});

app.get('/status/:jobID', (req, res) => {
    const requestedJobID = req.params.jobID;
    const job = PENDING_JOBS.find(job => job.id === requestedJobID) || RATE_LIMITED_JOBS.find(job => job.id === requestedJobID);

    if (job) {
        res.json({ jobID: requestedJobID, status: job.status });
    } else {
        res.json({ jobID: requestedJobID, status: 'Invalid JobID' });
    }
});


// to do: change from interval based to directly invoked from kafka message consumption..
setInterval(()=>{
    processLookupRequests();
}, 1000)

async function processLookupRequests() {
    // console.log('\tchecking for lookup jobs...')
    if (PENDING_JOBS.length === 0) return;

    const job = PENDING_JOBS.shift();

    try {
        const rateLimiterResponse = await axios.get(`http://master-rate-limiter:4000/request/coingecko`);

        if (rateLimiterResponse.data.status === 'GRANTED') {
            const coingeckoURL = `https://api.coingecko.com/api/v3/coins/1/contract/${job.contractAddress}`;
            const response = await axios.get(coingeckoURL, {
                headers: {
                    'Accept-Encoding': 'gzip'
                }
            });

            console.log('\n\n___________________________\n\n')
            console.log( Object.keys(response.data))
            console.log('\n\n___________________________\n\n')

            response.data.currentTimestamp = new Date().toISOString();
            
            await db.collection(COLLECTION_NAME).updateOne(
                { contractAddress: job.contractAddress },  // Filter/Query
                { $set: {
                    contractAddress: job.contractAddress,
                    data: response.data
                }},  // Update or insert data
                { upsert: true }  // Options
            );
            

            job.status = 'Success';
            console.log(`Processed jobID ${job.id} for contract ${job.contractAddress}`);

            produceFinishedLookupRequest({
                status: job.status,
                contractAddress: job.contractAddress,
                data: response.data
            })
            // produce success with this info back to kafka for API-GW consumption

        } else {
            job.status = 'Rate Limit Exceeded';
            RATE_LIMITED_JOBS.push(job); // Add the job to the rate-limited jobs array
            process.stdout.write(`\rRate limit exceeded`);
        }
    } catch (error) {
        job.status = 'API or Cache Error';
        console.error('Error processing job for token [ '+job.contractAddress+' ] :', error.response.status, error.response.data);
    }

    setTimeout(processLookupRequests, RATE_LIMIT_DELAY);
}
