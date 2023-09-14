console.clear();

import express from 'express';
import axios from 'axios';
import * as MongoClientQ from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();


let db;
const app = express();
const PORT = 4010;

const MONGO_URI = process.env.MONGO_URI 
const DB_NAME = process.env.DB_NAME 
const COLLECTION_NAME = process.env.COLLECTION_NAME 
const INFURA_ENDPOINT = process.env.INFURA_ENDPOINT 

const PENDING_JOBS = [];
const PROCESS_INTERVAL = 10000; // 10 seconds, adjust as needed
const RATE_LIMIT_DELAY = 1000; // 1 second, adjust based on Coingecko's rate limits


// Initialize MongoDB connection
MongoClientQ.MongoClient.connect(MONGO_URI, { useUnifiedTopology: true }, (err, client) => {
    if (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
    console.log('Connected to MongoDB');
    db = client.db(DB_NAME);
});


///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// api methods /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

app.get('/token/:contractAddress', async (req, res) => {
    const contractAddress = req.params.contractAddress;

    // Check if data exists in the database
    let tokenData = await db.collection(COLLECTION_NAME).findOne({ contractAddress });

    if (tokenData) {
        console.log('we have that cached!')
        res.json(tokenData.data);
    } else {

        const jobID = {
            id: Date.now().toString(), // Simple jobID based on timestamp
            contractAddress: contractAddress,
            status: 'Pending'
        };

        console.log('need to lookup ERC20 token: ',jobID.contractAddress)
        PENDING_JOBS.push(jobID);
        res.json(jobID);
    }
});

app.get('/status/:jobID', (req, res) => {
    const requestedJobID = req.params.jobID;

    // Check if the jobID exists in the PENDING_JOBS array
    const job = PENDING_JOBS.find(job => job.id === requestedJobID);

    if (job) {
        res.json({ job });
    } else {
        res.json({ job });
    }
});



///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// end of api methods //////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


// Job processor function
async function processJobs() {
    if (PENDING_JOBS.length === 0) return;

    const job = PENDING_JOBS.shift();

    try {
        const coingeckoURL = `https://api.coingecko.com/api/v3/coins/1/contract/${job.contractAddress}`;
        const response = await axios.get(coingeckoURL, {
            headers: {
                'Accept-Encoding': 'gzip'
            }
        });

        // Save new data to the database
        await db.collection(COLLECTION_NAME).insertOne({
            contractAddress: job.contractAddress,
            data: response.data
        });

        job.status = 'Success';
        console.log(`Processed jobID ${job.id} for contract ${job.contractAddress}`);
    } catch (error) {
        job.status = 'API or Cache Error';
        console.error('Error processing job:', error);
    }

    // Respect rate limit by delaying the next job processing
    setTimeout(processJobs, RATE_LIMIT_DELAY);
}


















// Start the job processor
setInterval(processJobs, PROCESS_INTERVAL);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
