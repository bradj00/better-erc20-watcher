// db.js

require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGO_CONNECT_STRING;

let _client;

module.exports = {
    connectToServer: function(callback) {
        MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
            _client = client;  // Store the client instance
            return callback(err);
        });
    },

    getClient: function() {
        return _client;
    },

    getDb: function(dbName) {
        if (!_client) {
            console.error("You must connect to the server before calling getDb.");
            return null;
        }
        return _client.db(dbName);
    }
};
