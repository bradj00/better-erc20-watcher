// db.js

require('dotenv').config('../.env');

const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGO_CONNECT_STRING;

let _client;

module.exports = {
    connectToServer: function(callback) {
        console.log('\tTRYING TO CONNECT TO MONGO. uri: ',uri)
        MongoClient.connect(uri, (err, client) => {
            if (err) {
                console.error("\tError connecting to MongoDB:", err);
                return callback(err);
            }
            _client = client;  // Store the client instance
            console.log("\tConnected to MongoDB successfully!");
        });
    },

    getClient: function() {
        return _client;
    },

    getDb: function(dbName) {
        if (!_client) {
            console.error("\tYou must connect to the server before calling getDb.");
            return null;
        }
        return _client.db(dbName);
    }
};
