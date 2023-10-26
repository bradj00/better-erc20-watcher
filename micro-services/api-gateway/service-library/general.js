const db = require('./db')

module.exports = {
    
    WatchNewToken: async function(payload, callback) {
        // .. 
        // validate that we are not already watching this token
        // produce to kafka an external-token-lookup request, consumed by the etle. Distinguish this request from a standard token lookup.
        // produce to kafka a txie-wrangler-control request, consumed by txie-wrangler. will start up a new txie instance and 
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