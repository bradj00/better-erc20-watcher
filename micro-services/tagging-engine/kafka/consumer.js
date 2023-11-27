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


    //decode erc20 transfers from the tx logs and return in an array of objects [{from, to, amount, contractAddress}, ...]
    const decodedTransfers = await processFullTxDetails(eventData);
    
    // console.log('EVENT DATA: ',eventData.transaction.transactionHash)
    
    // // create an object summarizing the aggregate token transfers: contractAddress / to / from / amount
    const transferSummary = summarizeTokenTransfers(decodedTransfers);


    // // add that new object back into to the full tx hash document object in db 'tx-hash-details' collection 'details'

    // console.log('\n\nupdating ',eventData.transaction.transactionHash,'\n\t with summary: ',transferSummary)
    await client.db('tx-hash-details').collection('details').updateOne(
      { transactionHash: eventData.transaction.transactionHash }, // Query to find the right document
      { $set: { tokenTransferSummary: transferSummary } } // Update operation
    );
    
    
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


function summarizeTokenTransfers(decodedTransfers) {
  const summary = {};

  decodedTransfers.forEach(({ from, to, amount, contractAddress }) => {
      if (!from || !to) {
          return;
      }

      summary[contractAddress] = summary[contractAddress] || {};
      summary[contractAddress][from] = summary[contractAddress][from] || { outgoing: BigInt(0) };
      summary[contractAddress][to] = summary[contractAddress][to] || { incoming: BigInt(0) };

      summary[contractAddress][from].outgoing += amount; // Already a BigInt
      summary[contractAddress][to].incoming += amount; // Already a BigInt
  });

  // // Convert BigInt to String for database compatibility
  // Object.keys(summary).forEach(contract => {
  //   Object.keys(summary[contract]).forEach(address => {
  //     summary[contract][address].outgoing = summary[contract][address].outgoing?.toString();
  //     summary[contract][address].incoming = summary[contract][address].incoming?.toString();
  //   });
  // });

  return summary;
}



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



// const decodeERC20Transfer = (log) => {
//   const transferEventSignature = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
//   if (log.topics[0] === transferEventSignature) {
//     return {
//       from: '0x' + log.topics[1].slice(26),
//       to: '0x' + log.topics[2].slice(26),
//       amount: BigInt(log.data), // Safely convert string to BigInt
//       contractAddress: log.address
//     };
//   }
//   return null;
// };

const decodeERC20Transfer = (log) => {
  const transferEventSignature = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  if (log.topics[0] !== transferEventSignature || log.topics.length < 3 || !log.data) {
    return null; // Not a valid ERC20 transfer or missing data
  }

  try {
    const from = '0x' + log.topics[1].slice(26);
    const to = '0x' + log.topics[2].slice(26);
    const amount = BigInt(log.data); // Convert to BigInt

    return { from, to, amount, contractAddress: log.address };
  } catch (error) {
    console.error('Error parsing ERC20 transfer:', error);
    return null; // Return null if parsing fails
  }
};








module.exports = {
  initConsumer
}