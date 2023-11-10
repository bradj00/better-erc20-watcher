const { Kafka } = require('kafkajs');
const config = require('../config/kafkaConfig');
const { MongoClient } = require('mongodb');
require('dotenv').config('../.env');

const kafka = new Kafka({
  clientId: config.clientId,
  brokers: config.brokers
});

const consumer = kafka.consumer({ groupId: config.consumerGroup });

const initConsumer = async (broadcastToTopic) => {
    await consumer.connect();

    //permanently subscribe to rawTransactions kafka topic.
    await consumer.subscribe({ topic: config.rawTransactions,                  fromBeginning: true });
    await consumer.subscribe({ topic: config.txieErrors,                       fromBeginning: true });
    await consumer.subscribe({ topic: config.finishedTokenLookupReq,           fromBeginning: true });
    await consumer.subscribe({ topic: config.TxHashDetailsLookupFinished,      fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            switch (topic) {
                case config.rawTransactions:
                    await consumeTokenTransferEvent(message, broadcastToTopic);
                    break;
                case config.rawStreamedTransactions:
                    await consumeTokenTransferStreamEvent(message);
                    break;
                case config.errorTopic:
                    consumeErrorEvent(message);
                    break;
                case config.txieErrors:
                    consumeTxieError(message, broadcastToTopic);
                    break;
                case config.finishedTokenLookupReq:
                    consumeFinishedTokenLookupReq(message, broadcastToTopic);
                    break;
                case config.TxHashDetailsLookupFinished:
                    consumeTxHashDetailsLookupFinished(message, broadcastToTopic);
                    break;
                default:
                    console.warn(`Received message from unknown topic: ${topic}`);
            }
        }
    });
};



const consumeTokenTransferEvent = async (message, broadcastToTopic) => {
  try {
    const eventData = JSON.parse(message.value.toString());
    console.log(`Received ( consumeTokenTransferEvent ) token transfer event from Kafka:`);
    console.log(eventData);
    console.log('\n\n')
    console.log(eventData.data.address)
    console.log('\n\n')

    broadcastToTopic(eventData.data && eventData.data.address ? eventData.data.address : 'error-getting-tx-address', {
      service: 'watchedTokenTX',
      method: 'AppendTransactions',
      data: eventData
    })


    // console.log('____________ our job is now to ensure these are looked up and cached from all external identity APIs ________________');

    // Ensure the addresses are cached
    const { from_address, to_address } = eventData.data;

    return eventData;
  } catch (error) {
    console.error(`Error consuming token transfer event: ${error.message}`);
    return null;
  }
};

const consumeErrorEvent = (message) => {
  try {
    const errorData = JSON.parse(message.value.toString());
    console.log(`Received error event from Kafka: ${JSON.stringify(errorData)}`);
    
  } catch (error) {
    console.error(`Error consuming error event: ${error.message}`);
  }
};
const consumeTxieError = (message, broadcastToTopic) => {
  try {
    const errorData = JSON.parse(message.value.toString());
    console.log(`Received TXIE error event from Kafka: ${JSON.stringify(errorData)}`);

    broadcastToTopic(
      'errors', //topic the web ui websocket is subscribed to
      {
      service: 'txie-error', 
      method: 'ErrorMessages',
      data: errorData
    })

    // {"txieContract":"0x1892f6ff5fbe11c31158f8c6f6f6e33106c5b10e","errorType":"tx-ingestion-engine-websocket","errorMsg":"test error message"}
  } catch (error) {
    console.error(`Error consuming error event: ${error.message}`);
  }
};

const consumeFinishedTokenLookupReq = (message, broadcastToTopic) => {
  try {
    const eventData = JSON.parse(message.value.toString());
    // console.log(`Received FINISHED JOB for lookup from ETLE: ${JSON.stringify(eventData)}`);
    console.log(`Received FINISHED JOB for lookup from ETLE.`);

    broadcastToTopic(
      'tokenLookupRequest', //topic the web ui websocket is subscribed to
      {
      service: 'external-token-lookup-engine', 
      method: 'TokenLookupRequestResponse',
      data: eventData
    })

  } catch (error) {
    console.error(`Error consuming error event: ${error.message}`);
  }
};

const consumeTxHashDetailsLookupFinished = async (message, broadcastToTopic) => {
  let client;
  try {
    const txHashes = JSON.parse(message.value.toString());
    console.log(`Received TX HASH LOOKUP job complete signal from CTXS service...`);

    // Create a new MongoDB client and connect
    client = new MongoClient(process.env.MONGO_CONNECT_STRING);
    await client.connect();

    // Fetch the documents
    const collection = client.db('tx-hash-details').collection('details');
    const documents = await collection.find({ transactionHash: { $in: txHashes } }).toArray();

    console.log(`Pulling TxHash info from db and pushing to frontend websocket`);

    broadcastToTopic(
      'TxHashDetailsLookupFinished', // Topic the web UI websocket is subscribed to
      {
        service: 'compound-tx-summarizer',
        method: 'TxHashDetailsArray',
        data: documents // Sending the fetched documents
      }
    );

  } catch (error) {
    console.error(`Error in consumeTxHashDetailsLookupFinished: ${error.message}`);
  } finally {
    // Close the MongoDB connection
    if (client) {
      await client.close();
    }
  }
};


module.exports = {
  initConsumer, consumeTokenTransferEvent
};
