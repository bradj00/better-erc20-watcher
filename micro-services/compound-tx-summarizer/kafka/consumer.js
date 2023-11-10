const { Kafka } = require('kafkajs');
const config = require('../config/kafkaConfig');
const { produceTxHashDetailsLookupFinished } = require('./producer.js');

const axios = require('axios');
require('dotenv').config('../.env');

const RATE_LIMIT_DELAY = 1000; // Adjust as needed
const MASTER_RATE_LIMITER_URL = 'http://master-rate-limiter:4000/request/etherscan'; // Adjust as needed
const ETHERSCAN_BASE_URL = 'https://api.etherscan.io/api'; // Adjust as needed
let PENDING_JOBS = []; // Queue for rate-limited jobs
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const DB_NAME = process.env.DB_NAME;


const kafka = new Kafka({
  clientId: config.clientId,
  brokers: config.brokers
});

const consumer = kafka.consumer({ groupId: config.consumerGroup });

const initConsumer = async (client) => {
    await consumer.connect();

    //permanently subscribe to these kafka topics..
    await consumer.subscribe({ topic: config.txArraySummarizeReq,             fromBeginning: true });
    console.log('subscribed to topic: ',config.txArraySummarizeReq)


    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            switch (topic) {
                case config.txArraySummarizeReq:
                    await consumeTxArrayLookupReq(message, client);
                    break;
                default:
                    console.warn(`Received message from unknown topic: ${topic}`);
            }
        }
    });
};



const consumeTxArrayLookupReq = async (message, client) => {
  try {
    const eventData = JSON.parse(message.value.toString());
    console.log(`Received event from Kafka:`);
    console.log(eventData);

    await processTxHashes(eventData.txHashes, client);

    return eventData;
  } catch (error) {
    console.error(`Error consuming event: ${error.message}`);
    return null;
  }
};



async function processTxHashes(txHashes, client) {
  for (const txHash of txHashes) {
    await processSingleTxHash(txHash, client);
  }

  console.log('Finished processing all transaction hashes.');
  //produce finished message to kafka for apigw consumption
  produceTxHashDetailsLookupFinished(txHashes)
}

async function processSingleTxHash(txHash, client) {
  try {
    // Check if txHash is already cached in the database
    const collection = client.db(DB_NAME).collection('details');
    const cachedTx = await collection.findOne({ transactionHash: txHash });

    if (cachedTx) {
      console.log(`Skipping cached transaction hash: ${txHash}`);
      return; // Skip the rest of the function
    }

    const rateLimiterResponse = await axios.get(MASTER_RATE_LIMITER_URL);

    if (rateLimiterResponse.data.status === 'GRANTED') {
      const etherscanURL = `${ETHERSCAN_BASE_URL}?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${ETHERSCAN_API_KEY}`;
      const response = await axios.get(etherscanURL);

      // console.log('Etherscan response:', response.data);

      if (response.data && response.data.result) {
        // Insert response into MongoDB
        const filter = { transactionHash: txHash };
        const update = {
          $set: {
            transactionHash: txHash,
            transactionData: response.data.result
          }
        };
        const options = { upsert: true };

        try {
          await collection.updateOne(filter, update, options);
          console.log(`Transaction data for hash ${txHash} has been upserted into the database`);
        } catch (dbError) {
          console.error(`Error upserting data for hash ${txHash}:`, dbError);
        }
      }
       // Delay here, after processing the txHash
       await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));

      // Produce success message to Kafka if required
    } else {
      PENDING_JOBS.push(txHash);
      console.log(`[ ${PENDING_JOBS.length} in line ] Rate limit exceeded, job queued`);
    }
  } catch (error) {
    console.error('Error processing txHash:', error);
  }

  setTimeout(() => {
    if (PENDING_JOBS.length > 0) {
      const nextTxHash = PENDING_JOBS.shift();
      processSingleTxHash(nextTxHash, client); // Remember to pass 'client' here as well
    }
  }, RATE_LIMIT_DELAY);
}






























const getEllipsisTxt = (str, n = 6) => {
  if (str && typeof str === 'string') { 
    return `${str.slice(0, n)}...${str.slice(str.length - n)}`;
  }
  return "";
};


module.exports = {
  initConsumer
};
