module.exports = {
    // List of broker addresses (usually the address of your Kafka server(s))
    brokers: ['kafka:9092'],
  
    // Client ID to identify the instance when connecting to the Kafka cluster
    clientId: 'api-gateway',
  
    // Topic names that the service will be producing to or consuming from
    // tokenTransferTopic: 'token-transfer-events',
    // errorTopic: 'txie-errors',
    rawTransactions: 'raw-transactions',
    rawStreamedTransactions: 'raw-streamed-transactions',
    errorTopic: 'api-gateway-errors',
  
    // If you require any additional configurations such as SSL, authentication, etc., you can add them here.
    // ssl: {},
    // sasl: { mechanism: 'plain', username: 'your-username', password: 'your-password' },
    
    // Consumer group for your microservice
    consumerGroup: 'api-gateway-consumer-group'
  };
  