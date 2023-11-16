console.clear();

const { initProducer, produceTokenTransferEvent, produceTokenTransferStreamEvent, produceErrorEvent } = require('./kafka/producer.js');



require('dotenv').config({ path: './.env' });
const { Web3 } = require('web3');
const { MongoClient } = require('mongodb');
const axios = require('axios');
const chalk = require('chalk');
const WebSocket = require('ws');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
const INFURA_ENDPOINT = process.env.INFURA_ENDPOINT_URL;
const INFURA_WS_ENDPOINT = process.env.INFURA_WS_ENDPOINT_URL;
const ERC20_CONTRACT_ADDRESS = process.env.ERC20_CONTRACT_ADDRESS;
const web3 = new Web3(INFURA_ENDPOINT);

const SKIP_RESET_COUNTER = 20;
const THROTTLE_MS = 300;
const BASE_CHUNK_SIZE = 50;
const MAX_CHUNK_SIZE = 100000;

let START_BLOCK = 1;
let CHUNK_SIZE = BASE_CHUNK_SIZE;
let currentBlock = START_BLOCK;

const client = new MongoClient(MONGODB_URI);

// Check if ERC20_CONTRACT_ADDRESS is defined
if (!ERC20_CONTRACT_ADDRESS) {
    console.error("Error: ERC20_CONTRACT_ADDRESS is not defined!");
    process.exit(1);
}



async function checkAndCreateCollection(contractAddress) {
    const collectionName = `a_${contractAddress}`;
    const db = client.db(DB_NAME);

    const collectionExists = await db.listCollections({ name: collectionName }, { limit: 1 }).hasNext();

    if (!collectionExists) {
        console.log(`Collection ${collectionName} does not exist. Creating...`);
        await db.createCollection(collectionName);
        // Removed the line that inserted the initial document
    } else {
        console.log(`Collection ${collectionName} already exists.`);
    }
}




async function getLatestBlockFromMongo(contractAddress) {
    const collectionName = `a_${contractAddress}`;
    const collection = client.db(DB_NAME).collection(collectionName);

    const latestEntry = await collection.findOne({}, { sort: { block_number: -1 } });

    if (latestEntry && latestEntry.block_number) {
        return parseInt(latestEntry.block_number);
    } else {
        console.warn('No entries found in MongoDB. Starting at block #1.');
        return 1;
    }
}

function minBigInt(a, b) {
    return a < b ? a : b;
}

// Sleep function to introduce delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function getBlockTimestamp(hexBlockNumber) {
    const blockNumber = parseInt(hexBlockNumber, 16);

    try {
        const block = await web3.eth.getBlock(blockNumber);
        if (!block) {
            console.warn(`No block data found for block number: ${blockNumber}`);
            return null;
        }
        return block.timestamp;
    } catch (error) {
        console.error('Error fetching block details:', error);
        return null;
    }
}




async function getERC20Transfers(contractAddress, fromBlock, toBlock) {
    const topicTransfer = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

    const params = [{
        fromBlock: web3.utils.toHex(fromBlock),
        toBlock: web3.utils.toHex(toBlock),
        address: contractAddress,
        topics: [topicTransfer]
    }];

    const data = {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getLogs",
        params: params
    };

    try {
        // console.log('Fetching transfers...');
        const response = await axios.post(INFURA_ENDPOINT, data);

        // Introduce sleep after the API call returns
        // console.log('\n\tSleeping for 1000ms for self-throttling...\n');
        await sleep(THROTTLE_MS);

        const logs = response.data.result;

        if (!logs || !Array.isArray(logs)) {
            console.error('Error: Invalid logs data received:', response.data.error);

            // Check if the error message contains the "Try with this block range" suggestion
            if (response.data.error && response.data.error.message && response.data.error.message.includes('Try with this block range')) {
                const suggestedRange = response.data.error.message.match(/\[(0x[a-fA-F0-9]+), (0x[a-fA-F0-9]+)\]/);
                console.log(chalk.cyan.underline('match: ',suggestedRange))
                if (suggestedRange && suggestedRange[1]) {
                    const suggestedStartBlock = parseInt(suggestedRange[1], 16);
                    console.log(chalk.cyan.underline('\t\tsuggested starting block: ',suggestedStartBlock))
                    return { error: 'suggestedRange', suggestedStartBlock };
                }
            }else{
                console.log('\n\nTHAT DOESNT LOOK LIKE ANYTHING TO ME TED\n\n')
            }
            return [];
        }
        
        const transfersPromises = logs.map(async log => {
            // console.log(chalk.yellow('checking block #')+log.blockNumber)
            const timestamp = await getBlockTimestamp(log.blockNumber);
            return {
                raw: log,
                address: log.address,
                from: '0x' + log.topics[1].slice(26),
                to: '0x' + log.topics[2].slice(26),
                value: web3.utils.fromWei(web3.utils.hexToNumberString(log.data), 'ether'),
                blockNumber: web3.utils.hexToNumber(log.blockNumber),
                timestamp: new Date(Number(timestamp) * 1000).toISOString()
            };
        });


        return await Promise.all(transfersPromises);
    } catch (error) {
        console.error('Error fetching transfers:', error);
        
        

        return [];
    }
}


async function getFormattedDateForBlock(blockNumber) {
    // console.log(chalk.magenta('checking block #')+blockNumber)
    const timestamp = await getBlockTimestamp(web3.utils.toHex(blockNumber));
    const date = new Date(Number(timestamp) * 1000);
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    return formattedDate;
}






async function processBlocks(contractAddress) {
    currentBlock = START_BLOCK;

    const decimals = await getDecimals(contractAddress);
    const latestBlock = await web3.eth.getBlockNumber();

    let previousTransfersCount = 0;  //keep track of the previous chunk's transfers count

    console.log('\t\t---Initial CHUNK_SIZE:', CHUNK_SIZE);

    let zeroTransfersCount = 0;

    while (currentBlock <= latestBlock) {
        const endBlock = minBigInt(BigInt(currentBlock) + BigInt(CHUNK_SIZE) - BigInt(1), BigInt(latestBlock));

        // Fetch formatted dates for the from and to blocks
        const fromDate = await getFormattedDateForBlock(currentBlock);
        const toDate = await getFormattedDateForBlock(endBlock);

        console.log(`Fetching transfers from ${chalk.green(fromDate)} (${currentBlock}) to ${chalk.red(toDate)} (${endBlock})...`);
        
        const transfersOrError = await getERC20Transfers(contractAddress, currentBlock, endBlock);

        // Check if a suggested range was returned
        if (transfersOrError.error === 'suggestedRange') {
            currentBlock = transfersOrError.suggestedStartBlock;
            CHUNK_SIZE = BASE_CHUNK_SIZE;
            console.log(`Adjusting to suggested block range. New starting block: ${currentBlock}`);
            continue; // Skip the rest of the loop and start with the new block range
        }

        const transfers = transfersOrError;
        console.log(transfers.length, " transfers during this time period");
        for (const transfer of transfers) {
            await insertTransferToMongo(transfer, decimals);
        }
        // console.log('______________________')
        // console.log(transfers[0]);
        // console.log('______________________')

        if (transfers.length == 0) {
            // console.log("that's another zero: ",zeroTransfersCount);
            zeroTransfersCount++;
        }

        // If the last 3 chunks had 0 transfers and the current chunk has more than 0, reset the CHUNK_SIZE
        if (zeroTransfersCount > SKIP_RESET_COUNTER && transfers.length > 0) {
            CHUNK_SIZE = BASE_CHUNK_SIZE;
            zeroTransfersCount = 0;
            console.log('Resetting CHUNK_SIZE to BASE_CHUNK_SIZE due to data found after 3 consecutive empty chunks.');
        } else {
            const difference = Math.abs(BASE_CHUNK_SIZE - transfers.length);
            const adjustmentFactor = difference / BASE_CHUNK_SIZE;

        
            if (transfers.length > BASE_CHUNK_SIZE) {
                const reduction = Math.floor(CHUNK_SIZE * adjustmentFactor);
                console.log(`${chalk.red([ 'reduce  ' ])}` + '\told chunk size: ', CHUNK_SIZE, '\t reduction: -'+reduction);
                CHUNK_SIZE -= reduction;
            } else if (transfers.length > 0 && transfers.length <= BASE_CHUNK_SIZE) {
                const increase = Math.floor(CHUNK_SIZE * adjustmentFactor);
                console.log(`${chalk.green([ 'increase' ])}` + '\told chunk size: ', CHUNK_SIZE, '\t increase: +'+increase);
                CHUNK_SIZE += increase;
            } else {
                console.log(`${chalk.blue([ 'magnify ' ])}` + '\told chunk size: ', CHUNK_SIZE, '\t new chunk size: ', CHUNK_SIZE * 2);
                CHUNK_SIZE *= 2; // Double chunk size if no transfers
            }
        }
        
        // Ensure the CHUNK_SIZE is within bounds
        if (CHUNK_SIZE > MAX_CHUNK_SIZE) {
            console.log('\t\tMAX chunk size reached!');
            CHUNK_SIZE = MAX_CHUNK_SIZE;
        } else if (CHUNK_SIZE < 1) {
            CHUNK_SIZE = 1; // Ensure CHUNK_SIZE doesn't go below 1
        }
        
        currentBlock = endBlock + BigInt(1);
    }


    console.log('All blocks processed!');
}

async function getDecimals(contractAddress) {
    console.log('GETTING DECIMALS')
    // The function signature for "decimals()"
    const functionSignature = '0x313ce567';

    try {
        const result = await web3.eth.call({
            to: contractAddress,
            data: functionSignature
        });

        // Convert the result from hex to a decimal number
        const decimals = web3.utils.hexToNumber(result);
        console.log(contractAddress,' has ',result,' decimal places')
        return decimals;
    } catch (error) {
        console.error('Error fetching decimals:', error);
        return null;
    }
}

async function insertTransferToMongo(transfer, decimals) {
    const collectionName = `a_${ERC20_CONTRACT_ADDRESS}`;
    const collection = client.db(DB_NAME).collection(collectionName);

    const valueInWei = Web3.utils.toWei(transfer.value, 'ether');

    const structuredData = {
        address: transfer.address,
        block_number: transfer.blockNumber.toString(),
        block_timestamp: transfer.timestamp,
        from_address: transfer.from,
        to_address: transfer.to,
        value: valueInWei,
        transaction_hash: transfer.raw.transactionHash,
    };
    
    await produceTokenTransferEvent({
        //should we flag the token_address here? If only LE picks this up probably not
        type: 'NEW_TX_CACHED',
        data: structuredData
    });
    
    await collection.insertOne(structuredData);
}


async function connectToMongo() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

client.on("close", () => {
    console.warn("MongoDB connection closed. Reconnecting...");
    setTimeout(connectToMongo, 5000);
});

async function listenToNewBlocks(contractAddress) {
    const ws = new WebSocket(INFURA_WS_ENDPOINT);

    const cleanupListeners = () => {
        ws.removeAllListeners('open');
        ws.removeAllListeners('message');
        ws.removeAllListeners('error');
        ws.removeAllListeners('close');
    };


    ws.on('open', () => {
        console.log('WebSocket connection opened. Subscribing to newHeads.');
        ws.send(JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_subscribe",
            params: ["newHeads"]
        }));
    });

    ws.on('message', async (data) => {
        const response = JSON.parse(data);
        if (response.method === 'eth_subscription' && response.params.subscription && response.params.result) {
            const newBlockNumberHex = response.params.result.number;
            const newBlockNumberDecimal = web3.utils.hexToNumber(newBlockNumberHex);
            process.stdout.write(`\rNew block detected: ${chalk.underline(newBlockNumberDecimal)} `);
            const transfers = await getERC20Transfers(contractAddress, newBlockNumberDecimal, newBlockNumberDecimal);
            for (const transfer of transfers) {
                console.log(chalk.underline('INSERTING TX INTO MONGO: '),transfer)
                await insertTransferToMongo(transfer);
            }
        }
    });
    
    

    ws.on('error', async (err) => {
        console.error('WebSocket encountered an error:', err);
        produceErrorEvent(
            {
                errorType: 'tx-ingestion-engine-websocket',
                errorMsg: err,
                txieContract: ERC20_CONTRACT_ADDRESS,
            }
        )
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed.');

        cleanupListeners(); // Remove all listeners.
        setTimeout(listenToNewBlocks(ERC20_CONTRACT_ADDRESS), 5000);
    });





}












function initKafkaProducer(){
        // Init the Kafka producer
    initProducer().then(() => {
        console.log('Kafka producer initialized successfully.');
    }).catch((error) => {
        console.error(`Failed to initialize Kafka producer: ${error.message}`);
    });

}







(async () => {
    await connectToMongo();
    await initKafkaProducer();
    await checkAndCreateCollection(ERC20_CONTRACT_ADDRESS);

    //test error message generation to kafka
    // setInterval(()=>{
    //     produceErrorEvent(
    //         {
    //             errorType: 'tx-ingestion-engine-TEST-MESSAGE-TYPE',
    //             errorMsg: 'test error message:',
    //             txieContract: ERC20_CONTRACT_ADDRESS,
    //         }
    //     )
    // },5000)

    const decimals = await getDecimals(ERC20_CONTRACT_ADDRESS);
    console.log(`Token has ${decimals} decimals.`);
    console.log('Reading last cached block from Mongo for contract [' + chalk.cyan(ERC20_CONTRACT_ADDRESS) + ']');
    START_BLOCK = (await getLatestBlockFromMongo(ERC20_CONTRACT_ADDRESS)) + 1;
    console.log('Last calculated block:', START_BLOCK);
    await processBlocks(ERC20_CONTRACT_ADDRESS);
    await listenToNewBlocks(ERC20_CONTRACT_ADDRESS);
})();