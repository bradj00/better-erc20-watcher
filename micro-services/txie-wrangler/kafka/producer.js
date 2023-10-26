const { Kafka } = require('kafkajs');
const config = require('../config/kafkaConfig.js');

const kafka = new Kafka({
  clientId: 'txie-wrangler',
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

// // raw-transactions Kafka event
// const produceTokenTransferStreamEvent = async (eventData) => {
//   try {
//     await producer.send({
//       topic: config.rawStreamedTransactions,
//       messages: [
//         { value: JSON.stringify(eventData) }
//       ]
//     });
//     // console.log(`Sent token transfer event to Kafka: ${JSON.stringify(eventData)}`);
//   } catch (error) {
//     console.error(`Error producing STREAM token transfer event: ${error.message}`);
//   }
// };

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
  produceErrorEvent
};
