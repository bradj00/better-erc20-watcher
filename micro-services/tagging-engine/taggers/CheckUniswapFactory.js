const { request, gql } = require('graphql-request');
const { Web3 } = require('web3');
const dotenv = require('dotenv').config('../.env');
const { MongoClient } = require('mongodb');
const MONGODB_URI = process.env.MONGODB_URI; // Make sure to set your MongoDB URI in the environment variables
const INFURA_ENDPOINT = process.env.INFURA_ENDPOINT;

const web3 = new Web3(INFURA_ENDPOINT);

// Uniswap V2 Pair ABI
const uniswapV2PairABI = [
  // The 'getReserves' function exists in Uniswap V2 pairs
  { "constant": true, "inputs": [], "name": "getReserves", "outputs": [{ "internalType": "uint112", "name": "_reserve0", "type": "uint112" }, { "internalType": "uint112", "name": "_reserve1", "type": "uint112" }, { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }], "payable": false, "stateMutability": "view", "type": "function" },
  { "constant": true, "inputs": [], "name": "token0", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" },
  { "constant": true, "inputs": [], "name": "token1", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }


];
  

// MongoDB Client
const client = new MongoClient(MONGODB_URI);

// Connect to MongoDB
async function connectToMongo() {
    try {
        await client.connect();
        // console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

// Extract unique addresses from decoded transfers
const getUniqueAddresses = (decodedTransfers) => {
    const addresses = decodedTransfers.flatMap(transfer => [transfer.from, transfer.to]);
    return [...new Set(addresses)];
};

// Check if the address is a Uniswap V2 Pool
const isUniswapV2Pool = async (address) => {
    try {
        const contract = new web3.eth.Contract(uniswapV2PairABI, address);
        await contract.methods.getReserves().call(); // Check if the pool exists

        // Retrieve token addresses
        const token0 = await contract.methods.token0().call();
        const token1 = await contract.methods.token1().call();
        return { isPool: true, token0, token1 };
    } catch (error) {
        return { isPool: false };
    }
};

// GraphQL Query for Uniswap Pools
const queryUniswapPools = gql`
    query ($poolId: ID!) {
        pools(first: 1, where: { id: $poolId }) {
            id
            token0 {
                id
            }
            token1 {
                id
            }
        }
    }
`;

// Check if the address is a Uniswap V3 Pool
const isUniswapV3Pool = async (address) => {
    try {

        // this needs to go through the MASTER-RATE-LIMITER once we figure out the rate limits
        const data = await request('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3', queryUniswapPools, { poolId: address });
        if (data.pools.length > 0) {
            const { token0, token1 } = data.pools[0];
            return { isPool: true, token0: token0.id, token1: token1.id };
        }
        return { isPool: false };
    } catch (error) {
        console.error(`Error querying Uniswap V3 Subgraph for address ${address}:`, error);
        return { isPool: false };
    }
};

// Check Uniswap Pools
const checkUniswapPools = async (addresses) => {
    // console.log(`Checking a total of ${addresses.length} addresses for Uniswap pool status.`);
    
    await connectToMongo();
    const db = client.db("address-tags");
    const collection = db.collection('addresses');

    for (const address of addresses) {
        // console.log(`Checking address: ${address}`);
        const isV2Pool = await isUniswapV2Pool(address);
        const isV3Pool = await isUniswapV3Pool(address);

        // Determine update object based on pool type
        let updateObject = {
            $set: {
                isUniswapV2Pool: isV2Pool.isPool,
                isUniswapV3Pool: isV3Pool.isPool
            }
        };
        if (isV2Pool.isPool) {
            updateObject.$set.token0_v2 = isV2Pool.token0;
            updateObject.$set.token1_v2 = isV2Pool.token1;
        } 
        if (isV3Pool.isPool) {
            updateObject.$set.token0_v3 = isV3Pool.token0;
            updateObject.$set.token1_v3 = isV3Pool.token1;
        }

        // Update MongoDB with the new information
        await collection.updateOne(
            { address: address },
            updateObject,
            { upsert: true }
        );

        if (isV2Pool.isPool || isV3Pool.isPool) {
            console.log(`\n✅ [${address}] Detected NEW Uniswap [${isV2Pool.isPool ? 'V2' : 'V3'}] Pool with tokens ${isV2Pool.isPool ? `${isV2Pool.token0}, ${isV2Pool.token1}` : `${isV3Pool.token0}, ${isV3Pool.token1}`}.\n`);
        } else {
            // console.log(`\n❌ ${address} NOT pool.`);
        }
    }
};


// Export functions
module.exports = { getUniqueAddresses, checkUniswapPools };
