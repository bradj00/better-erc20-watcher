const { Kafka } = require('kafkajs');
const config = require('../config/kafkaConfig');
const { exec } = require('child_process');

const kafka = new Kafka({
  clientId: config.clientId,
  brokers: config.brokers
});

const consumer = kafka.consumer({ groupId: config.consumerGroup });

const initConsumer = async (client) => {
    // Ensure Redis is connected before initializing the Kafka consumer

    await consumer.connect();
    await consumer.subscribe({ topic: config.txieWranglerControl, fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            switch (topic) {
                case config.txieWranglerControl:
                    await consumetxieWranglerControl(message, client);
                    break;
                case config.errorTopic:
                    consumeErrorEvent(message);
                    break;
                default:
                    console.warn(`Received message from unknown topic: ${topic}`);
            }
        }
    });


    //on cold start, check desired:actual state of ingestion engines running
    startDockerContainersFromDB(client);

};

const consumetxieWranglerControl = async (message, client) => {
  try {
    const eventData = JSON.parse(message.value.toString());
    console.log('___________________________________________')
    console.log(`Received request to manage TXIE instance:`);
    console.log(eventData);
    console.log('___________________________________________')
    
    // based on  {eventData} command, control the docker subsystem. 
    // validate that we are not already watching this token
    // 
    if (eventData.action == 'add'){
      // upsert eventData.address to mongo db txie-configurations->instances

      try {
        const db = client.db('txie-configurations'); // Database name
        const collection = db.collection('instances'); // Collection name

        const query = { "address": eventData.address.toLowerCase() };
        const update = {
            $set: {
                "address": eventData.address.toLowerCase(),
                "state": "active"
            }
        };
        const options = { upsert: true };

        const result = await collection.updateOne(query, update, options);
        console.log(result.upsertedCount > 0 ? 'mongodb watched token config inserted' : 'mongodb watched token config document updated');
      }catch (err){
        console.log('error upserting: ',err)
      }

      // trigger txie-wrangler to scan txie-configurations->instances and rectify desired:actual ingestion engine instances
      // Start the containers based on active addresses in the database
      startDockerContainersFromDB(client);
    }

    return eventData;
  } catch (error) {
    console.error(`Error consuming txie-wrangler event: ${error.message}`);
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







async function isContainerRunning(address) {
  return new Promise((resolve, reject) => {
      const labelFilter = `erc20_contract_address=${address}`;
      const command = `docker ps --format "{{.ID}} {{.Labels}}" --filter "label=${labelFilter}"`;

      exec(command, (error, stdout, stderr) => {
          if (error) {
              reject(error);
              return;
          }
          resolve(stdout.includes(address));
      });
  });
}

async function startDockerContainer(address) {
  const isRunning = await isContainerRunning(address);

  if (isRunning) {
      console.log(`TXIE instance already running for token ${address}`);
      return;
  }

  const image = 'better-erc20-watcher/tx-ingestion-engine';
  const network = ' better-erc20-watcher_better-erc20-watcher-network';
  const envVar = `ERC20_CONTRACT_ADDRESS=${address}`;
  const label = `erc20_contract_address=${address}`;

  const command = `docker run -d --network ${network} -e "${envVar}" --label "${label}" ${image}`;

  exec(command, (error, stdout, stderr) => {
      if (error) {
          console.error(`exec error: ${error}`);
          return;
      }
      console.log(`TXIE instance spawned to watch token ${address} with docker ID: ${stdout.trim()}`);
  });
}

async function startDockerContainersFromDB(client) {
  try {

      const db = client.db('txie-configurations');
      const collection = db.collection('instances');

      const activeDocuments = await collection.find({ state: 'active' }).toArray();
      const addresses = activeDocuments.map(doc => doc.address);

      for (const address of addresses) {
          await startDockerContainer(address);
      }
  } catch (error) {
      console.error(`MongoDB error: ${error}`);
  } finally {
      await client.close();
  }
}








module.exports = {
  initConsumer
};
