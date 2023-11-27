const db = require('./db')
const { produceWatchNewTokenRequest, produceLookupTokenRequest, produceTxArraySummary  } = require('../kafka/producer');
module.exports = {
    
    LookupTokenRequest: async function(payload, callback) {
        try {
            // Connect to MongoDB collection
            const database = db.getDb('coingecko_tokens'); // Assuming the database name is 'coingecko_tokens'
            const collection = database.collection('tokens'); // Assuming the collection name is 'tokens'
            
            // Look for the token in the collection
            const tokenDocument = await collection.findOne({ contractAddress: payload.token });
            
            // If the token exists in the collection, return the document
            if (tokenDocument) {
                console.log(`Token ${payload.token} found in the database.`);
                callback({ status: 'success', data: tokenDocument });
            } else {
                // If token doesn't exist, produce a lookup request to Kafka
                console.log(`Token ${payload.token} not found in the database. Producing lookup request to Kafka...`);
                
                produceLookupTokenRequest({
                    token: payload.token
                });
    
                callback({ status: 'pending', message: 'Token lookup request produced to Kafka' });
            }
        } catch (error) {
            console.error("Error in LookupTokenRequest:", error);
            callback({ status: 'error', message: 'Internal Server Error' });
        }
    },
    GetBulkTagsRequest : async function(payload, callback) {
        try {
            // Connect to MongoDB collections
            const database = db.getDb('watchedTokens-addressStats');
            const statsDatabase = db.getDb('address-tags');
    
            if (!payload.collection) { 
                console.log('ERROR: Collection not specified in payload\n-----\n', payload);  
                callback({ status: 'error', message: 'Collection not specified in payload' });
                return;
            }
    
            const collection = database.collection(payload.collection);
            const statsCollection = statsDatabase.collection('addresses');
    
            // Query for the tokens in the collection that match the addresses in payload.addresses
            const query = { address: { $in: payload.addresses } };
            const addressesTagsArr = await collection.find(query).toArray();
            const addressStatsArr = await statsCollection.find(query).toArray();
    
            // Log query results for debugging
            console.log('Addresses Tags Array:', addressesTagsArr);
            console.log('Address Stats Array:', addressStatsArr);
    
            // Merging results from both collections
            const mergedResults = payload.addresses.map(address => {
                const tagInfo = addressesTagsArr.find(doc => doc.address === address) || {};
                const statInfo = addressStatsArr.find(doc => doc.address === address) || {};
    
                // Resolve conflicts in merging (if any keys overlap, prefer data from statsCollection)
                const merged = {...tagInfo, ...statInfo};
    
                // Log individual merges for debugging
                console.log(`Merging for address ${address}:`, merged);
    
                return merged;
            });
    
            // Count total documents in the collection
            const totalElderCount = await collection.countDocuments();
    
            // Check if any documents were found and merged
            if (mergedResults.length > 0) {
                console.log(`\tFound and merged ${mergedResults.length} documents for addresses in the database.`);
                callback({ 
                    status: 'success', 
                    data: {
                        addressesTags: mergedResults, 
                        totalElderCount: totalElderCount
                    }
                });
            } else {
                console.log('\tNo matching documents found for given addresses');
                callback({ 
                    status: 'success', 
                    message: 'No matching documents found for the provided addresses',
                    data: {
                        addressesTags: [], 
                        totalElderCount: totalElderCount
                    }
                });
            }
        } catch (error) {
            console.error("\tError in GetBulkTagsRequest:", error);
            callback({ 
                status: 'error', 
                message: 'Internal Server Error - Unable to process the request for TAG LOOKUP' 
            });
        }
    },
    
    
    
    
    
    

    TxArraySummary: async function(payload, callback) {
        produceTxArraySummary({
            action: payload.action,
            txHashes: payload.txHashes
        })
    },

    WatchNewToken: async function(payload, callback) {
        // produce to kafka a txie-wrangler-control request, consumed by txie-wrangler. will start up a new txie instance and 
        // console.log('____________________')
        // console.log(payload);
        // console.log('____________________')
        produceWatchNewTokenRequest({
            action: payload.action,
            address: payload.address.contractAddress
        })

        // write new config state to db
    },

    RequestErc20BulkCacheInfo: async function(payload, callback) {
        try {
            console.log('bulk ERC20 token info request: ', payload);
            const database = db.getDb('coingecko_tokens');
            const collection = database.collection('tokens');
    
            // Prepare a query for the array of contract addresses
            const query = { contractAddress: { $in: payload } };
    
            const results = await collection.find(query).toArray();
    
            const foundAddresses = results.map(item => item.contractAddress);
            const notFoundAddresses = payload.filter(address => !foundAddresses.includes(address));
            
            notFoundAddresses.forEach(address => {
                produceLookupTokenRequest({
                    token: address
                });
            });

            const foundAddressesLog = results.map(item => item.contractAddress).join(', ');

            if (results.length > 0) {
                console.log('found token info for the following addresses:', foundAddressesLog);
                
                if (notFoundAddresses.length > 0) {
                    console.log('missing cached info for these addresses:\n\t', notFoundAddresses.join(',\n\t'));
                }

                
                
                callback({ 
                    status: 'success', 
                    data: results, 
                    toFetch: notFoundAddresses // List of addresses to be fetched
                });
            } else {
                console.log('no token info found for:', payload);
                callback({ status: 'error', message: 'No matches found', toFetch: payload });
            }
        } catch (error) {
            console.error("Error fetching token info:", error);
            callback({ status: 'error', message: 'Internal Server Error' });
        }
    },

    FetchHoldersOverTimeData: async function(payload, callback) {
        try {
            console.log('Fetching HoT data for token: ', payload.watchedToken);
            const database = db.getDb('watchedTokens-HoT');
            const collectionName = "a_" + payload.watchedToken;
            const collection = database.collection(collectionName);
    
            const results = await collection.find({}).toArray();
    
            if (results.length > 0) {
                console.log(`Found ${results.length} documents in collection: ${collectionName}`);
                callback({
                    status: 'success',
                    data: results // Array of documents
                });
            } else {
                console.log(`No data found in collection: ${collectionName}`);
                callback({ status: 'error', message: 'No data found' });
            }
        } catch (error) {
            console.error("Error fetching HoT data:", error);
            callback({ status: 'error', message: 'Internal Server Error' });
        }
    },
    
    
    GetFriendlyName: async function(payload, callback) {
        try {
            console.log('trying to get friendly names for:', payload.friendlyName);
            const database = db.getDb('friendlyNames');
            const collection = database.collection('lookup');
    
            // Use regex to find matches in any field
            const regex = new RegExp(payload.friendlyName, 'i');
            const query = {
                $or: [
                    { address: regex },
                    { MegaWorld: regex },
                    { OpenSea: regex },
                    { manuallyDefined: regex },
                    { ENS: regex }
                ]
            };
    
            const results = await collection.find(query).toArray();
    
            if (results.length > 0) {
                console.log('found friendly names:', results);
                callback({ status: 'success', data: results });
            } else {
                console.log('no friendly names found for:', payload.text);
                callback({ status: 'error', message: 'No matches found' });
            }
        } catch (error) {
            console.error("Error fetching friendly names:", error);
            callback({ status: 'error', message: 'Internal Server Error' });
        }
    },
    SetManualLabel: async function(payload, callback) {
        try {
            console.log('Setting manual label for:', payload.address);
            const database = db.getDb('friendlyNames');
            const collection = database.collection('lookup');
    
            // Define the query for the address
            const query = { address: payload.address };
    
            // Define the update
            const update = {
                $set: { manuallyDefined: payload.friendlyName }
            };
    
            // Define the options to upsert
            const options = { upsert: true };
    
            // Perform the update or insert
            const result = await collection.updateOne(query, update, options);
    
            if (result.matchedCount > 0) {
                console.log('Updated existing document with manual label');
            } else if (result.upsertedCount > 0) {
                console.log('Inserted new document with manual label');
            }
    
            callback({ status: 'success', data: { matchedCount: result.matchedCount, upsertedCount: result.upsertedCount } });
        } catch (error) {
            console.error("Error setting manual label:", error);
            callback({ status: 'error', message: 'Internal Server Error' });
        }
    }
    

}