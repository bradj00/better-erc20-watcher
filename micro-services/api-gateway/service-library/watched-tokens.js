//contains all data calls the Watched Tokens page could request and how to handle them
//////////////////////////////////////////////////////////////////////////////////////

const db = require('./db')

module.exports = {
    GetWatchedTokens: async function(payload, callback) {
        try {
            console.log('trying to get watched tokens..')
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
    
            console.log('success: ', tokens);
            callback({ status: 'success', data: tokens });
    
        } catch (error) {
            console.error("Error fetching watched tokens:", error);
            callback({ status: 'error', message: 'Internal Server Error' });
        }
    },
    GetTransactions: function(payload, callback) {
        // make a database call directly to MongoDB here and pass the result back through the callback
        callback(responseData);
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
                console.log('trying to get cached token info for: ',tokenAddress)
                const database = db.getDb('tokensMetadataCache');
                const collection = database.collection('erc20');
    
                const result = await collection.find({"address": tokenAddress}).toArray();
                if (result.length > 0) {
                    console.log('found token metadata in mongo cache');
                    resolve({ status: 'success', data: [result[0]] });
                } else {
                    console.log('have to look up token metadata from external api..');
                    // If you need to fetch from an external API, you can do so here
                    // and then resolve or reject based on the result.
                    // For now, I'll reject to indicate the data wasn't found.
                    reject({ status: 'error', message: 'Data not found' });
                }
            } catch (error) {
                console.error("Error:", error);
                reject({ status: 'error', message: 'Internal Server Error' });
            }
        });
    }

};