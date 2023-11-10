console.clear();

import express from 'express';

const app = express();
const PORT = 4000;


//per second
const RATE_LIMIT = [
    { serviceName: 'coingecko', maxRate: 2 },
    { serviceName: 'infura',    maxRate: 3 },
    { serviceName: 'etherscan', maxRate: 3 },
    { serviceName: 'megaworld', maxRate: 3 },
];

// In-memory storage for service call counts and queue
const serviceCallCounts = {};

// Helper function to get the rate limit for a specific service
function getMaxRate(serviceName) {
    const service = RATE_LIMIT.find(s => s.serviceName === serviceName);
    return service ? service.maxRate : Infinity; // Default to no limit if service not found
}

// Middleware to reset counts every minute
setInterval(() => {
    for (const service in serviceCallCounts) {
        if (serviceCallCounts[service].count < getMaxRate(service)) {
            serviceCallCounts[service].inQueue = 0; // Reset inQueue count if service is HEALTHY
        }
        serviceCallCounts[service].count = 0;
    }
}, 1000); //reset counts every 60 seconds to base the call rates per minute

app.get('/request/:externalService', (req, res) => {
    const serviceName = req.params.externalService;

    // Initialize count and queue for the service if they don't exist
    if (!serviceCallCounts[serviceName]) {
        serviceCallCounts[serviceName] = { count: 0, inQueue: 0 };
    }

    // Check the current rate
    if (serviceCallCounts[serviceName].count < getMaxRate(serviceName)) {
        serviceCallCounts[serviceName].count++;
        res.json({ status: 'GRANTED' });
    } else {
        serviceCallCounts[serviceName].inQueue++;
        res.json({ status: 'RATE_EXCEEDED' });
    }
});

app.get('/status', (req, res) => {
    const serviceStatuses = {};

    for (const service in serviceCallCounts) {
        serviceStatuses[service] = {
            count: serviceCallCounts[service].count,
            inQueue: serviceCallCounts[service].inQueue,
            status: serviceCallCounts[service].count < getMaxRate(service) ? 'HEALTHY' : 'RATE_LIMITED'
        };
    }

    res.json(serviceStatuses);
});

app.listen(PORT, () => {
    console.log(`Rate Limiter Service is running on http://localhost:${PORT}`);
});
