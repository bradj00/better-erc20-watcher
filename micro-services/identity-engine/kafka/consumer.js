const { Kafka } = require('kafkajs');
const config = require('../config/kafkaConfig');
const { ensureCache, connectToRedis } = require('../ensureCache'); // Import the ensureCache function

const kafka = new Kafka({
  clientId: config.clientId,
  brokers: config.brokers
});

const consumer = kafka.consumer({ groupId: config.consumerGroup });

const initConsumer = async () => {
    // Ensure Redis is connected before initializing the Kafka consumer
    await connectToRedis();

    await consumer.connect();
    await consumer.subscribe({ topic: config.rawTransactions, fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            switch (topic) {
                case config.rawTransactions:
                    await consumeTokenTransferEvent(message);
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

const consumeTokenTransferEvent = async (message) => {
  try {
    const eventData = JSON.parse(message.value.toString());
    console.log(`Received token transfer event from Kafka:`);
    console.log(eventData);
    // console.log('____________ our job is now to ensure these are looked up and cached from all external identity APIs ________________');

    // Ensure the addresses are cached
    const { from_address, to_address } = eventData.data;
    await ensureCache(from_address);
    await ensureCache(to_address);

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
    // TODO: Handle the error data as needed
  } catch (error) {
    console.error(`Error consuming error event: ${error.message}`);
  }
};

module.exports = {
  initConsumer
};
