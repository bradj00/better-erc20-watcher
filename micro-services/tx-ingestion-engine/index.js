const express = require('express');
const { KafkaConsumer } = require('./src/kafka/consumer');
const { KafkaProducer } = require('./src/kafka/producer');
const apiRoutes = require('./src/api/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware & Configurations
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Start the API server
app.listen(PORT, () => {
    console.log(`TXIE service running on port ${PORT}`);
});

// Initialize Kafka Consumer
const kafkaConsumer = new KafkaConsumer();
kafkaConsumer.initialize();

// Initialize Kafka Producer
const kafkaProducer = new KafkaProducer();
kafkaProducer.initialize();

// Handle exit gracefully
process.on('SIGINT', () => {
    kafkaConsumer.close();
    kafkaProducer.close();
    process.exit();
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    // Close resources and exit
    kafkaConsumer.close();
    kafkaProducer.close();
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Close resources and exit
    kafkaConsumer.close();
    kafkaProducer.close();
    process.exit(1);
});
