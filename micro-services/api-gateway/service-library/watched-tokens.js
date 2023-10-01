//contains all data calls the Watched Tokens page could request and how to handle them
//////////////////////////////////////////////////////////////////////////////////////

const db = require('./db')
const dbRedis = require('./dbRedis')

module.exports = {
    CacheFriendlyLabelsRequest: async function(addresses, callback) {
        try {
            console.log('--------------------');
            const mongoDatabase = db.getDb('friendlyNames'); // replace with your actual MongoDB name
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
            console.log('trying to get transactions:', parameters);
            
            // Prefix 'a_' to the token address to get the collection name
            const collectionName = 'a_' + parameters.tokenAddress;
        
            // Access the collection within the 'watchedTokens' database
            const database = db.getDb('watchedTokens');
            const collection = database.collection(collectionName);
        
            // Build the base query
            let query = {};
    
            // If both dateFrom and dateTo are provided, add the date constraints to the query
            if (parameters.dateFrom && parameters.dateTo) {
                query.block_timestamp = {
                    $gte: new Date(parameters.dateFrom),
                    $lte: new Date(parameters.dateTo)
                };
            }
    
            // Fetch transactions based on the query, sort by block_number in descending order, limit to 100, and offset as provided
            const transactions = await collection
                    .aggregate([
                        { $match: query },
                        {
                            $addFields: {
                                int_block_number: { $toInt: "$block_number" }
                            }
                        },
                        { $sort: { int_block_number: -1 } },
                        { $limit: 100 },
                        { $skip: parameters.offset }
                    ])
                    .toArray();
        
            if (transactions && transactions.length) {
                callback({ status: 'success', data: transactions });
            } else {
                callback({ status: 'success', data: [], message: 'No transactions found' });
            }
        
        } catch (error) {
            console.error("Error fetching transactions:", error);
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
                const database = db.getDb('tokensMetadataCache');
                const collection = database.collection('erc20');
    
                const result = await collection.find({"address": tokenAddress}).toArray();
                if (result.length > 0) {
                    console.log('\tfound token metadata in mongo cache');
                    resolve({ status: 'success', data: [result[0]] });
                } else {
                    console.log('\thave to look up token metadata from external api..');
                    // If you need to fetch from an external API, you can do so here
                    // and then resolve or reject based on the result.
                    // For now, I'll reject to indicate the data wasn't found.
                    reject({ status: 'error', message: 'Data not found' });
                }
            } catch (error) {
                console.error("\tError:", error);
                reject({ status: 'error', message: 'Internal Server Error' });
            }
        });
    }

    };