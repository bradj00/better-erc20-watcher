const { MongoClient } = require('mongodb');
const { exec } = require('child_process');
require('dotenv').config({ path: './.env' });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = 'instances';


const client = new MongoClient(MONGODB_URI);

// Function to check if a Docker container with the given label is already running
function isContainerRunning(address) {
    return new Promise((resolve, reject) => {
        const labelFilter = `erc20_contract_address=${address}`;
        const command = `docker ps --format "{{.ID}} {{.Labels}}" --filter "label=${labelFilter}"`;

        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }

            // console.log("---- COMMAND OUTPUT START ----");
            // console.log(stdout);
            // console.log("---- COMMAND OUTPUT END ----");

            // console.log(`Expected label filter in output: ${labelFilter}`);

            if (stdout.includes(address)) {
                console.log(`\tFound running container for address ${address}`);
                resolve(true);
            } else {
                console.log(`\tNo running container found for address ${address}`);
                resolve(false);
            }
        });
    });
}



// Function to start a Docker container with given parameters
async function startDockerContainer(address) {
    const isRunning = await isContainerRunning(address);

    if (isRunning) {
        console.log(`TXIE instance already running for token ${address}`);
        return;
    }

    const image = 'better-erc20-watcher/tx-ingestion-engine';
    const network = 'better-erc20-watcher-network';
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

// Connect to MongoDB and read from the specified collection
async function startDockerContainersFromDB() {
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

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

// Start the containers based on active addresses in the database
startDockerContainersFromDB();
