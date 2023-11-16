const { Kafka } = require('kafkajs');
const config = require('../config/kafkaConfig.js');

const kafka = new Kafka({
  clientId: 'api-gateway',
  brokers: config.brokers
});

const producer = kafka.producer();

const initProducer = async () => {
  await producer.connect();
};


//to be consumed by API-GW
const produceFinishedLookupRequest = async (eventData) => {
  try {
    await producer.send({
      topic: config.finishedTokenLookupReq,
      messages: [
        { value: JSON.stringify(eventData) }
      ]
    });
    console.log(`Sent Token Lookup Request COMPLETION event to Kafka`); 
  } catch (error) {
    console.error(`Error producing STREAM token transfer event: ${error.message}`);
  }
};



const produceErrorEvent = async (errorData) => {
  try {
    await producer.send({
      topic: config.errorTopic,
      messages: [
        { value: JSON.stringify(errorData) }
      ]
    });
    console.log(`Sent error event to Kafka: ${JSON.stringify(errorData)}`);
  } catch (error) {
    console.error(`Error producing error event: ${error.message}`);
  }
};

module.exports = {
  initProducer,
  produceFinishedLookupRequest,
  produceErrorEvent
};
