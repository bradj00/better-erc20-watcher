// note: if you use a self-signed cert your browser will require that you visit https://<api-gateway-ip>:4050 and manually 
// accept the certificate. This is only necessary the first time you run the tool. Without it, the browser's connection
// to the api-gateway service will fail (bad).

// the API gateway will also expose a RESTful API with two methods:
// #1 expose a GET method, relaying all existing registered Micro Service URLs
// #2 expose a POST method, updating the URL for a single Micro Service URL

let subscriptions = {}; //socket clients subscribed to topics the api-gateway might receive from kafka



const { initConsumer, consumeTokenTransferEvent } = require('./kafka/consumer');
const { initProducer } = require('./kafka/producer');



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


initConsumer(broadcastToTopic).catch(error => {
    console.error("Error initializing Kafka consumer:", error);
});
initProducer().catch(error => {
    console.error("Error initializing Kafka producer:", error);
});

db.connectToServer((err) => {
    if (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
    else {
        console.log('\tconnected to MongoDB')
    }
});



//called when we consume a kafka message and determine to send it to our wss subscribers
function broadcastToSubscribers(topic, data) {
    const subscribers = subscriptions[topic];
    if (subscribers) {
        subscribers.forEach(ws => {
            ws.send(JSON.stringify(data));
        });
    }
}

function broadcastToTopic(topic, data) {
    const subscribers = subscriptions[topic];
    if (subscribers) {
        subscribers.forEach(subscriber => {
            subscriber.ws.send(JSON.stringify(data));
        });
    }
}



//test function
function logSubscriptions() {
    console.log("---- Subscriptions ----");
    for (let topic in subscriptions) {
        const clientIds = subscriptions[topic].map(sub => sub.clientId);
        console.log(`Topic: ${topic} -> Client IDs: ${clientIds.join(', ')}`);
    }
    console.log("-----------------------");

    // Broadcast a test message to all clients subscribed to 'testTopic'
    // broadcastToTopic('watchedTokenTX', {
    //     service: 'TestService',
    //     method: 'AppendTransaction',
    //     data: 'This is a test broadcast message!'
    // });
}

// setInterval(logSubscriptions, 2000);



wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;  // Get client's IP
    const clientId = clientIdCounter++;  // Assign and increment the unique client ID

    ws.clientId = clientId;  // Store the client ID on the WebSocket object for later reference

    const timestamp = new Date().toISOString();  // Generate a timestamp
    console.log(`[WSS][${timestamp}] Client connected. ID: ${clientId}, IP: ${clientIp}`);


    


    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        // console.log(`Received message from client ID: ${clientId}: ${message}`);
    

        if (parsedMessage.type === 'subscribe') {
            console.log('\n\n','CLIENT WANTS TO SUBSCRIBE: ',parsedMessage,'\n\n')
            const topic = parsedMessage.topic;
            if (!subscriptions[topic]) {
                subscriptions[topic] = [];
            }
            subscriptions[topic].push({ ws: ws, clientId: ws.clientId });
            ws.send(JSON.stringify({ status: "Subscribed", topic: topic }));
        }

        if (parsedMessage.type === 'unsubscribe') {
            console.log('CLIENT WANTS TO UNSUBSCRIBE:', parsedMessage);
            const topic = parsedMessage.topic;
            if (subscriptions[topic]) {
                subscriptions[topic] = subscriptions[topic].filter(subscriber => subscriber.ws !== ws);
                ws.send(JSON.stringify({ status: "Unsubscribed", topic: topic }));
            } else {
                ws.send(JSON.stringify({ status: "Error", message: `Not subscribed to topic: ${topic}` }));
            }
        }


        // Acknowledge receipt and notify processing
        ws.send(JSON.stringify({
            status: "Received",
            message: `Processing your request for service: ${parsedMessage.service}, method: ${parsedMessage.method}`
        }));

        // Process the request
        console.log('processing request: ', parsedMessage.service, parsedMessage.method)
        handleRequest(ws, parsedMessage.service, parsedMessage.method, parsedMessage.data);
    });

    ws.on('close', () => {
        console.log(`Client with ID: ${clientId} disconnected`);
    
        // Remove the client from all subscription lists
        for (let topic in subscriptions) {
            subscriptions[topic] = subscriptions[topic].filter(subscriber => subscriber.ws !== ws);
        }
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

        // consumer.disconnect().then(() => {
        //     console.log("Kafka consumer disconnected.");
        // });
        process.exit(0);
    });
    
}


