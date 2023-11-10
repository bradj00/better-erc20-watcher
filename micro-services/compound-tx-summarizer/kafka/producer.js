const { Kafka } = require('kafkajs');
const config = require('../config/kafkaConfig.js');

const kafka = new Kafka({
  clientId: 'txie-producer',
  brokers: config.brokers
});

const producer = kafka.producer();

const initProducer = async () => {
  await producer.connect();
};

//errors topic
const sendErrorToKafka = async (error) => {
  await producer.send({
    topic: 'errors',
    messages: [
      { value: JSON.stringify(error) }
    ]
  });
};

const produceTxHashDetailsLookupFinished = async (eventData) => {
  try {
    await producer.send({
      topic: config.TxHashDetailsLookupFinished,
      messages: [
        { value: JSON.stringify(eventData) }
      ]
    });
    console.log(`Sent [ produceTxHashDetailsLookupFinished ] event to Kafka`); //sends array of TxHashes as string
  } catch (error) {
    console.error(`Error producing [ produceTxHashDetailsLookupFinished ] event: ${error.message}`);
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
  produceTxHashDetailsLookupFinished,
  produceErrorEvent
};
