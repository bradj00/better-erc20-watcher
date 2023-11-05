const { Kafka } = require('kafkajs');
const config = require('../config/kafkaConfig');

const kafka = new Kafka({
  clientId: config.clientId,
  brokers: config.brokers
});

const consumer = kafka.consumer({ groupId: config.consumerGroup });

const initConsumer = async (PENDING_JOBS) => {
    await consumer.connect();
    await consumer.subscribe({ topic: config.lookupExternalToken });
    await consumer.subscribe({ topic: config.errorTopic });


    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            switch (topic) {
                case config.lookupExternalToken:
                    await consumeLookupTokenEvent(message, PENDING_JOBS);
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



const consumeLookupTokenEvent = async (message, PENDING_JOBS) => {
  try {
    const eventData = JSON.parse(message.value.toString());
    console.log(`Consumed Lookup Token Event from Kafka:`);
    console.log(message);
    console.log('value (decoded): ',eventData)
    console.log('\n\n')

    const jobID = {
      id: Date.now().toString(),
      contractAddress: eventData.token,
      status: 'Pending'
    };

    console.log('requesting lookup for: ', jobID);
    PENDING_JOBS.push(jobID);

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
}