var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;

app.get('/', function (req, res) {
  res.send('Hello World!');
});



app.get('/kittens', function (req, res) {
    MongoClient.connect('mongodb://localhost:27017/animals', function (err, db) {
      if (err) {
        console.log('Error connecting to Mongo.');
      } else {
        var collection = db.collection('kittens');
        collection.find().toArray(function (err, docs) {
          if (err) {
            console.log('Error finding kittens.');
          } else {
            console.log(docs);
          }
        });
      }
    });
  });



app.listen(4000, function () {
  console.log('Example app listening on port 4000!');
});