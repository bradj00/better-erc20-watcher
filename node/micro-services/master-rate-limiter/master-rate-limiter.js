console.clear(); 

import express from 'express';

const app = express();
const PORT = 4020;
const RATE_LIMIT = 3; // Define your acceptable rate limit per minute here

// In-memory storage for service call counts
const serviceCallCounts = {};

// Middleware to reset counts every minute
setInterval(() => {
    for (const service in serviceCallCounts) {
        serviceCallCounts[service] = 0;
    }
}, 10000); 

app.get('/request/:externalService', (req, res) => {
    const serviceName = req.params.externalService;

    // Initialize count for the service if it doesn't exist
    if (!serviceCallCounts[serviceName]) {
        serviceCallCounts[serviceName] = 0;
    }

    // Check the current rate
    if (serviceCallCounts[serviceName] < RATE_LIMIT) {
        serviceCallCounts[serviceName]++;
        res.json({ status: 'GRANTED' });
    } else {
        res.json({ status: 'RATE_EXCEEDED' });
    }
});

app.listen(PORT, () => {
    console.log(`Rate Limiter Service is running on http://localhost:${PORT}`);
});
