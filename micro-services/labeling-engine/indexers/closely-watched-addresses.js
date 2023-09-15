
//here a job will run periodically that checks for any new transactions of a list of closely watched addresses. 
    // this list is stored in the db

    function checkForNewTxsFromListOfAllWatched(){
        MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
            const db = client.db('closelyWatchedAddresses');
            //get all collections from the db
            db.listCollections().toArray(function(err, collections) {
                //for each collection
                collections.forEach(function(collection) {
                    //get the collection name
                    var collectionName = collection.name;
                    
                    //remove the "a_" from the prefix of the collection name
                    let watchedAddy = collectionName.replace("a_", "");

                    //get the collection
                    var collection = db.collection(collectionName);
                    //get all documents from the collection
                    collection.find({}).toArray(function(err, docs) {
                        //for each document
                        docs.forEach(function(doc) {
                            //find highest block_number in the collection
                            collection.find({}).sort({block_number: -1}).limit(1).toArray(function(err, docs) {
                                var highestBlockNumber = docs[0].block_number;
                                //get all transactions from the address from the highest block number forward
                                //do something with it..
                            });
    
                        });
                    });
                });
            });
           
    
        });
    }
    
    function getMoralisTxsForAddress(address, from_block){
        // ...
    }