import express from 'express';

const app = express();
const PORT = 4000;

// Rate limits per service
const RATE_LIMIT = {
    'coingecko': { maxRate: 10, interval: 60000 }, // 10 per 60 seconds
    'infura':    { maxRate: 3,  interval: 1000 },  // 3 per 1 second
    'etherscan': { maxRate: 3,  interval: 1000 },  // 3 per 1 second
    'megaworld': { maxRate: 1,  interval: 1000 },  // 1 per 1 second
};

// In-memory storage for service call counts
const serviceCallCounts = {};

// Initialize serviceCallCounts based on RATE_LIMIT
Object.keys(RATE_LIMIT).forEach(serviceName => {
    serviceCallCounts[serviceName] = { count: 0, inQueue: 0 };

    // Reset the count based on each service's interval
    setInterval(() => {
        serviceCallCounts[serviceName].count = 0;
        // Handle queued requests here if needed
    }, RATE_LIMIT[serviceName].interval);
});

app.get('/request/:externalService', (req, res) => {
    const serviceName = req.params.externalService;

    if (!serviceCallCounts[serviceName]) {
        return res.status(404).json({ status: 'SERVICE_NOT_FOUND' });
    }

    if (serviceCallCounts[serviceName].count < RATE_LIMIT[serviceName].maxRate) {
        serviceCallCounts[serviceName].count++;
        res.json({ status: 'GRANTED' });
    } else {
        serviceCallCounts[serviceName].inQueue++;
        res.json({ status: 'RATE_EXCEEDED' });
    }
});

app.get('/status', (req, res) => {
    res.json(serviceCallCounts);
});

app.listen(PORT, () => {
    console.log(`Rate Limiter Service is running on http://localhost:${PORT}`);
});
