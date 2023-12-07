//contains all data calls the Watched Tokens page could request and how to handle them
//////////////////////////////////////////////////////////////////////////////////////

const db = require('./db')
const dbRedis = require('./dbRedis')

module.exports = {
    CacheFriendlyLabelsRequest: async function(addresses, callback) {
        try {
            console.log('--------------------');
            const mongoDatabase = db.getDb('friendlyNames'); 
            const mongoCollection = mongoDatabase.collection('lookup'); // replace with your actual collection name
    
            const fetchFromMongo = async (address) => {
                const result = await mongoCollection.findOne({ address: address });
                if (result) {
                    // console.log('match for: ',address, result,'\n')
                    return result;
                }
                else {
                    // console.log('\tno MONGO match for: ', address);
                    return { [address]: {} }; // empty value with the Ethereum address as the key
                }
            };
    
            console.log('*********');
            const promises = addresses.map(fetchFromMongo);
            console.log('**_____**');
    
            const results = await Promise.all(promises);
    
            const finalObject = {};
            addresses.forEach((address, index) => {
                if (results[index]) {
                    finalObject[address] = results[index];
                } else {
                    finalObject[address] = {};  // empty value for non-existent addresses in the DB
                }
            });
    
            callback({ status: 'success', data: finalObject });
    
        } catch (error) {
            console.error("Error fetching data:", error);
            callback({ status: 'error', message: 'Internal Server Error' });
        }
    },
    
    


    GetWatchedTokens: async function(payload, callback) {
        try {
            console.log('trying to get watched tokens:')
            const database = db.getDb('watchedTokens');
            const collectionlist = await database.listCollections().toArray();
    
            // Remove 'isSyncing' from list
            const filteredList = collectionlist.filter(item => item.name !== 'isSyncing');
    
            // Remove 'a_' from list
            const tokenAddresses = filteredList.map(item => item.name.replace('a_', ''));
    
            const promises = tokenAddresses.map(async tokenAddress => {
                try { 
                    const tokenInfo = await this.GetCachedTokenInfo(tokenAddress);
                    return tokenInfo.data[0];
                } catch (error) {
                    console.error(`Error fetching token info for ${tokenAddress}:`, error);
                    // Handle the error as you see fit. For now, I'll return null.
                    return null;
                }
            });
    
            const results = await Promise.all(promises);
            const tokens = results.filter(result => result !== null) // Filter out null results
                                  .map((result, index) => ({
                                      tokenAddress: tokenAddresses[index],
                                      data: result
                                  }));
    
            // console.log('success: ', tokens);
            callback({ status: 'success', data: tokens });
    
        } catch (error) {
            console.error("Error fetching watched tokens:", error);
            callback({ status: 'error', message: 'Internal Server Error' });
        }
    },
    GetTransactions: async function(parameters, callback) {
        try {
            console.log('Starting ERC20 transaction lookup:', parameters);
            
            // Access 'watchedTokens' database
            const watchedTokensDb = db.getDb('watchedTokens');
            const collectionName = 'a_' + parameters.tokenAddress;
            const watchedTokensCollection = watchedTokensDb.collection(collectionName);
    
            let query = {};
            if (parameters.dateFrom && parameters.dateTo) {
                query.block_timestamp = {
                    $gte: new Date(parameters.dateFrom),
                    $lte: new Date(parameters.dateTo)
                };
            }
    
            // Fetch stub transactions
            console.log('Fetching stub transactions from collection:', collectionName);
            const stubTransactions = await watchedTokensCollection
                    .aggregate([
                        { $match: query },
                        { $addFields: { int_block_number: { $toInt: "$block_number" } } },
                        { $sort: { int_block_number: -1 } },
                        { $limit: 600 },
                        { $skip: parameters.offset }
                    ])
                    .toArray();
            console.log('Retrieved stub transactions count:', stubTransactions.length);
    
            // Extract transaction hashes from stub transactions
            const stubTxHashes = stubTransactions.map(tx => tx.transaction_hash);
            console.log('Extracted transaction hashes for cross lookup:', stubTxHashes.length);
    
            // Access 'tx-hash-details' database
            const txHashDetailsDb = db.getDb('tx-hash-details');
            const detailsCollection = txHashDetailsDb.collection('details');
    
            // Fetch full transactions using stub transaction hashes
            console.log('Performing cross lookup for full transaction details');
            let fullTransactions = [];
            if (stubTxHashes.length > 0) {
                fullTransactions = await detailsCollection
                        .find({ transactionHash: { $in: stubTxHashes } })
                        .toArray();
                console.log('Retrieved full transactions count:', fullTransactions.length);
            } else {
                console.log('No transaction hashes available for cross lookup');
            }
    
            // Prepare and send the response
            let response = {
                status: 'success',
                data: stubTransactions,
                fullTxData: fullTransactions
            };
            if (stubTransactions.length === 0) {
                response.message = 'No transactions found';
            }
            callback(response);
        
        } catch (error) {
            console.error("Error fetching transactions:", error);
            callback({ status: 'error', message: 'Internal Server Error' });
        }
    },
    
    

    // get full transactions (from Etherscan scrape) (infura gives initial erc20 txs. etherscan gives tx_hash detailed lookups)
    GetFullTransactions: async function(parameters, callback) {
        try {
            console.log('Fetching full transaction details for specified hashes:', parameters.txHashes);
    
            // Access the 'details' collection in the 'tx-hash-details' database
            const database = db.getDb('tx-hash-details');
            const collection = database.collection('details');
    
            // Build the query to fetch transactions for the specified hashes
            let query = {};
            if (parameters.txHashes && parameters.txHashes.length) {
                query.transactionHash = { $in: parameters.txHashes };
            } else {
                return callback({ status: 'error', message: 'No transaction hashes provided' });
            }
    
            // Fetch full transaction details based on the query
            const fullTransactions = await collection
                    .find(query)
                    .sort({ 'transactionData.blockNumber': -1 }) // Sorting by block number
                    .toArray();
    
            // Determine which hashes were not found in the database
            const foundTxHashes = fullTransactions.map(tx => tx.transactionHash);
            const missingTxHashes = parameters.txHashes.filter(hash => !foundTxHashes.includes(hash));
    
            // Prepare the callback response
            let response = {
                status: 'success',
                data: fullTransactions,
                missingHashes: missingTxHashes
            };
    
            if (fullTransactions.length === 0) {
                response.message = 'No full transactions found for provided hashes';
            }
    
            callback(response);
    
        } catch (error) {
            console.error("Error fetching full transactions:", error);
            callback({ status: 'error', message: 'Internal Server Error' });
        }
    },
    
    
    

    //Pass a token address and get any cached metadata on the token. If it does not exist, kick off
    //a job to the ERC Lookup Engine Micro Service
    //to go get that data and cache it. 
    // (Micro Service will notify API-Gateway that job is complete via API-Gateway's exposed RESTful API. 
    //   API GW then tells webui via WSS)
    //////////////////////////////////////////////////////////////////////////////////////
    GetCachedTokenInfo: function(tokenAddress) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('\ttrying to get cached token info for: ',tokenAddress)
                const database = db.getDb('coingecko_tokens');
                const collection = database.collection('tokens');
    
                const result = await collection.find({"contractAddress": tokenAddress}).toArray();
                if (result.length > 0) {
                    console.log('\tfound token metadata in mongo cache');
                    resolve({ status: 'success', data: [result[0]] });
                } else {
                    console.log('\thave to look up token metadata from external api..');
                    // For now, reject to indicate the data wasn't found and must be looked up
                    reject({ status: 'error', message: 'Building Token Cache' });

                    // produce to Kafka to lookup token contract. to be consumed and processed by token-external-lookup
                }
            } catch (error) {
                console.error("\tError:", error);
                reject({ status: 'error', message: 'Internal Server Error' });
            }
        });
    }

    };