// note: if you use a self-signed cert your browser will require that you visit https://<api-gateway-ip>:4050 and manually 
// accept the certificate. This is only necessary the first time you run the tool. Without it, the browser's connection
// to the api-gateway service will fail (bad).

// the API gateway will also expose a RESTful API with two methods:
// #1 expose a GET method, relaying all existing registered Micro Service URLs
// #2 expose a POST method, updating the URL for a single Micro Service URL


const db = require('./service-library/db');


require('dotenv').config(); // Importing dotenv to load environment variables
console.clear();

const express = require('express');
const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');
const bodyParser = require('body-parser'); // Importing body-parser to handle JSON payloads in requests

const PORT = 4050;
const API_PORT = 4051;

const app = express();
const apiApp = express();  // Create a new Express instance for the RESTful API

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);


const server = https.createServer({
    cert: fs.readFileSync('./certs/cert.pem'),
    key: fs.readFileSync('./certs/key.pem')
}, app);

const wss = new WebSocket.Server({ server });
let clientIdCounter = 1;  // Simple counter to assign unique IDs to clients



db.connectToServer((err) => {
    if (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
    else {
        console.log('connected to MongoDB')
    }

    // ... rest of your server initialization code
});



wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;  // Get client's IP
    const clientId = clientIdCounter++;  // Assign and increment the unique client ID

    ws.clientId = clientId;  // Store the client ID on the WebSocket object for later reference

    const timestamp = new Date().toISOString();  // Generate a timestamp
    console.log(`[WSS][${timestamp}] Client connected. ID: ${clientId}, IP: ${clientIp}`);

    ws.on('message', (message) => {
        console.log(`Received message from client ID: ${clientId}: ${message}`);
        
        // Parse the message
        const parsedMessage = JSON.parse(message);

        // Acknowledge receipt and notify processing
        ws.send(JSON.stringify({
            status: "Received",
            message: `Processing your request for service: ${parsedMessage.service}, method: ${parsedMessage.method}`
        }));

        // Process the request
        console.log('processing request')
        handleRequest(ws, parsedMessage.service, parsedMessage.method, parsedMessage.data);
    });

    ws.on('close', () => {
        console.log(`Client with ID: ${clientId} disconnected`);
    });
});



function handleRequest(ws, service, method, payload) {
    try {
        const serviceModule = require(`./service-library/${service}`);
        if (serviceModule && serviceModule[method]) {
            serviceModule[method](payload, (response) => {
                ws.send(JSON.stringify({
                    service: service,
                    method: method,
                    data: response
                }));
            });
        } else {
            ws.send(JSON.stringify({
                status: "Error",
                message: `Service or method not found: ${service}/${method}`
            }));
        }
    } catch (error) {
        ws.send(JSON.stringify({
            status: "Error",
            message: `Error processing request for service: ${service}, method: ${method}. Error: ${error.message}`
        }));
    }
}

server.listen(PORT, () => {
    console.log(`Server started on https://localhost:${PORT}`);
});


function cleanup() {
    db.getClient().close(() => {
        console.log("\n\nDatabase connection closed.");
        process.exit(0);
    });
}


