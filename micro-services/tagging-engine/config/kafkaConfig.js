module.exports = {
    // List of broker addresses (usually the address of your Kafka server(s))
    brokers: ['kafka:9092'],
  
    // Client ID to identify the instance when connecting to the Kafka cluster
    clientId: 'txie',
  
    // Topic names that the service will be producing to or consuming from
    // tokenTransferTopic: 'token-transfer-events',
    // errorTopic: 'txie-errors',
    rawTransactions: 'raw-transactions',
    rawStreamedTransactions: 'raw-streamed-transactions',
    // errorTopic: 'txie-errors',

    // produced from tx-ingestion-engine when full transaction details have been pulled and cached from Etherscan API
    fullTxDetailsArrived: 'full-tx-details-arrived',
  
    // If you require any additional configurations such as SSL, authentication, etc., you can add them here.
    // ssl: {},
    // sasl: { mechanism: 'plain', username: 'your-username', password: 'your-password' },
    
    // Consumer group for your microservice
    consumerGroup: 'tagging-engine'
  };
  