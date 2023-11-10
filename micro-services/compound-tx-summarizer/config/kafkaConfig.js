module.exports = {
    // List of broker addresses (usually the address of your Kafka server(s))
    brokers: ['kafka:9092'],
  
    // Client ID to identify the instance when connecting to the Kafka cluster
    clientId: 'compound-tx-summarizer',
  
    // Topic names that the service will be producing to or consuming from
    errorTopic: 'txie-errors',
    txArraySummarizeReq: 'txArraySummarizeReq',
    TxHashDetailsLookupFinished: 'TxHashDetailsLookupFinished',


    // Consumer group for your microservice
    consumerGroup: 'compound-tx-summarizer'
  };
  