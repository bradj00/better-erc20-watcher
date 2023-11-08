
// // const { KafkaConsumer } = require('./kafka/consumer');
// const { KafkaProducer } = require('./kafka/producer');

// // Initialize Kafka Consumer
// // const kafkaConsumer = new KafkaConsumer();
// // kafkaConsumer.initialize();

// // Initialize Kafka Producer
// const kafkaProducer = new KafkaProducer();
// kafkaProducer.initialize();

// // Handle exit gracefully
// process.on('SIGINT', () => {
//     kafkaConsumer.close();
//     kafkaProducer.close();
//     process.exit();
// });

// // Handle unhandled rejections
// process.on('unhandledRejection', (reason, promise) => {
//     console.error('Unhandled Rejection:', reason);
//     // Close resources and exit
//     kafkaConsumer.close();
//     kafkaProducer.close();
//     process.exit(1);
// });

// // Handle uncaught exceptions
// process.on('uncaughtException', (error) => {
//     console.error('Uncaught Exception:', error);
//     // Close resources and exit
//     kafkaConsumer.close();
//     kafkaProducer.close();
//     process.exit(1);
// });
