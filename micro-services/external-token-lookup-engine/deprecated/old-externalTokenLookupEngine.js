console.clear();

import express from 'express';
import axios from 'axios';
import * as MongoClientQ from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

let db;
const app = express();
const PORT = 4010;

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.COLLECTION_NAME;
const INFURA_ENDPOINT = process.env.INFURA_ENDPOINT;

const PENDING_JOBS = [];
const RATE_LIMITED_JOBS = []; // New array for rate-limited jobs
const PROCESS_INTERVAL = 1000; // 10 seconds, adjust as needed
const RATE_LIMIT_DELAY = 1000; // 1 second, adjust based on Coingecko's rate limits
const RETRY_INTERVAL = 1000; // 1 minute, adjust as needed for retrying rate-limited jobs

// Initialize MongoDB connection
MongoClientQ.MongoClient.connect(MONGO_URI, { useUnifiedTopology: true }, (err, client) => {
    if (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
    console.log('Connected to MongoDB');
    db = client.db(DB_NAME);
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

// Job processor function
async function processJobs() {
    if (PENDING_JOBS.length === 0) return;

    const job = PENDING_JOBS.shift();

    try {
        const rateLimiterResponse = await axios.get(`http://localhost:4020/request/coingecko`);

        if (rateLimiterResponse.data.status === 'GRANTED') {
            const coingeckoURL = `https://api.coingecko.com/api/v3/coins/1/contract/${job.contractAddress}`;
            const response = await axios.get(coingeckoURL, {
                headers: {
                    'Accept-Encoding': 'gzip'
                }
            });

            await db.collection(COLLECTION_NAME).insertOne({
                contractAddress: job.contractAddress,
                data: response.data
            });

            job.status = 'Success';
            console.log(`Processed jobID ${job.id} for contract ${job.contractAddress}`);
        } else {
            job.status = 'Rate Limit Exceeded';
            RATE_LIMITED_JOBS.push(job); // Add the job to the rate-limited jobs array
            console.warn(`Rate limit exceeded for jobID ${job.id}`);
        }
    } catch (error) {
        job.status = 'API or Cache Error';
        console.error('Error processing job:', error);
    }

    setTimeout(processJobs, RATE_LIMIT_DELAY);
}

// Retry rate-limited jobs
async function retryRateLimitedJobs() {
    if (RATE_LIMITED_JOBS.length === 0) return;

    const job = RATE_LIMITED_JOBS.shift();
    PENDING_JOBS.push(job); // Move the job back to the pending jobs array

    console.log(`Retrying jobID ${job.id} for contract ${job.contractAddress}`);
}

setInterval(retryRateLimitedJobs, RETRY_INTERVAL);

setInterval(processJobs, PROCESS_INTERVAL);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
