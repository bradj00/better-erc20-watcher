const { Kafka } = require('kafkajs');
const config = require('../config/kafkaConfig');
const { MongoClient } = require('mongodb');

require('dotenv').config({ path: '../.env' });
const MONGODB_URI = process.env.MONGODB_URI;

const kafka = new Kafka({
  clientId: config.clientId,
  brokers: config.brokers
});

const {getUniqueAddresses, checkUniswapPools} = require('../taggers/CheckUniswapFactory.js')



const consumer = kafka.consumer({ groupId: config.consumerGroup });

const initConsumer = async (client) => {
    await consumer.connect();
    // await consumer.subscribe({ topic: config.lookupExternalToken });
    // await consumer.subscribe({ topic: config.errorTopic });
    await consumer.subscribe({ topic: config.fullTxDetailsArrived,      fromBeginning: true });

    console.log('SUBSCRIBED TO TOPICS',config,'\n\n')

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            switch (topic) {
                // case config.lookupExternalToken:
                //     await consumeLookupTokenEvent(message, PENDING_JOBS);
                //     break;
                case config.fullTxDetailsArrived:
                    await consumeFullTxDetailsEvent(message, client);
                    break;
                case config.errorTopic:
                    consumeErrorEvent(message);
                    break;
                default:
                    console.warn(`Received message from unknown topic: ${topic}`);
            }
        }
    });
};


// Function to filter out cached addresses
const filterCachedAddresses = async (addresses, client) => {
  const uncachedAddresses = [];
  for (const address of addresses) {
    const lowerCaseAddress = address.toLowerCase();
    const isCached = await isAddressCached(lowerCaseAddress, client);
    if (isCached) {
      // console.log(`Skipping ${address} found in MongoDB cache`);
    } else {
      uncachedAddresses.push(address);
    }
  }
  return uncachedAddresses;
};



const isAddressCached = async (address, client) => {
  try {


    const db = client.db("address-tags"); 
    const collection = db.collection('addresses');

    // Search for the address
    const result = await collection.findOne({ 
      address: address,
      $or: [
          { 'isUniswapV2Pool': { $exists: true } },
          { 'isUniswapV3Pool': { $exists: true } }
      ]
    });
  
    return result !== null;
  } catch (error) {
    console.error('Error accessing MongoDB:', error);
    return false;
  } 
};

const consumeFullTxDetailsEvent = async (message, client) => {
  try {
    const eventData = JSON.parse(message.value.toString());
    // console.log(`Consumed Full TX Details Event from Kafka:`, eventData);


    //decode erc20 transfers from the tx logs
    const decodedTransfers = await processFullTxDetails(eventData);
    
    
    
    // create an object summarizing the aggregate token transfers: token contract / to / from / amount
    // write that object back to the full tx hash document in db 'tx-hash-details' collection 'details' 
    
    const uniqueAddresses = getUniqueAddresses(decodedTransfers);

    // Filter out cached addresses
    const addressesToCheck = await filterCachedAddresses(uniqueAddresses, client);

    // Proceed with addresses not found in cache
    await checkUniswapPools(addressesToCheck, client);

    return eventData;
  } catch (error) {
    console.error(`Error consuming Full TX Details Event: ${error.message}`);
    return null;
  }
};




// const consumeLookupTokenEvent = async (message, PENDING_JOBS) => {
//   try {
//     const eventData = JSON.parse(message.value.toString());
//     console.log(`Consumed Lookup Token Event from Kafka:`);
//     console.log(message);
//     console.log('value (decoded): ',eventData)
//     console.log('\n\n')

//     const jobID = {
//       id: Date.now().toString(),
//       contractAddress: eventData.token,
//       status: 'Pending'
//     };

//     console.log('requesting lookup for: ', jobID);
//     PENDING_JOBS.push(jobID);

//     return eventData;
//   } catch (error) {
//     console.error(`Error consuming token transfer event: ${error.message}`);
//     return null;
//   }
// };

const consumeErrorEvent = (message) => {
  try {
    const errorData = JSON.parse(message.value.toString());
    console.log(`Received error event from Kafka: ${JSON.stringify(errorData)}`);
    // TODO: Handle the error data as needed
  } catch (error) {
    console.error(`Error consuming error event: ${error.message}`);
  }
};








const processFullTxDetails = async (fullTxDetail) => {
  try {
    console.log(`Processing Full Transaction Details for hash: ${fullTxDetail.transaction.transactionHash}`);
    
    // Decode ERC20 Transfers from logs
    const decodedTransfers = fullTxDetail.transaction.logs.map(decodeERC20Transfer).filter(transfer => transfer !== null);

    // Additional processing like tagging jobs or checking against Uniswap factory
    // (Your custom logic here)

    return decodedTransfers;
  } catch (error) {
    console.error(`Error processing Full Transaction Details: ${error.message}`);
    return null;
  }
};

// Decoding ERC20 Transfer from log
const decodeERC20Transfer = (log) => {
  const transferEventSignature = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  if (log.topics[0] === transferEventSignature) {
    return {
      from: '0x' + log.topics[1].slice(26),
      to: '0x' + log.topics[2].slice(26),
      amount: parseInt(log.data, 16),
      contractAddress: log.address
    };
  }
  return null;
};








module.exports = {
  initConsumer
}