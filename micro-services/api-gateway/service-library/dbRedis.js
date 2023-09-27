// dbRedis.js

require('dotenv').config({ path: '../.env' });
const { createClient } = require('@redis/client');

const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';

let _client;

module.exports = {
    connectToRedisServer: async function(callback) {
        if (_client && _client.isConnected()) {
            console.log("Already connected to Redis!");
            return callback(null);
        }

        console.log('\tTRYING TO CONNECT TO REDIS.');
        _client = createClient({
            port: REDIS_PORT,
            host: REDIS_HOST
        });

        try {
            await _client.connect();
            console.log("Connected to Redis successfully!");
            callback(null);
        } catch (err) {
            console.error("Error connecting to Redis:", err);
            callback(err);
        }
    },

    getClient: function() {
        return _client;
    },

    disconnectFromRedis: async function() {
        if (_client) {
            await _client.disconnect();
            console.log("Disconnected from Redis.");
        }
    }
};
