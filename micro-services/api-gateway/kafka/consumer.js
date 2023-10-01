const { Kafka } = require('kafkajs');
const config = require('../config/kafkaConfig');

const kafka = new Kafka({
  clientId: config.clientId,
  brokers: config.brokers
});

const consumer = kafka.consumer({ groupId: config.consumerGroup });

const initConsumer = async (broadcastToTopic) => {
    await consumer.connect();

    //permanently subscribe to rawTransactions kafka topic.
    await consumer.subscribe({ topic: config.rawTransactions, fromBeginning: true });

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
    // TODO: Handle the error data as needed
  } catch (error) {
    console.error(`Error consuming error event: ${error.message}`);
  }
};

module.exports = {
  initConsumer, consumeTokenTransferEvent
};
