const db = require('./db')
const { produceWatchNewTokenRequest, produceLookupTokenRequest  } = require('../kafka/producer');
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
    

    WatchNewToken: async function(payload, callback) {
        // produce to kafka a txie-wrangler-control request, consumed by txie-wrangler. will start up a new txie instance and 
        
        produceWatchNewTokenRequest({
            // action: 'add',
            // chain: 'ethereum',
            // token: '0x0000000'
            action: payload.action,
            chain: payload.chain,
            token: payload.token
        })

        // write new config state to db
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
    }
    

}