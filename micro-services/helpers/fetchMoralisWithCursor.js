import axios from 'axios';
import dotenv from 'dotenv';
import * as MongoClientQ from 'mongodb';
import chalk from 'chalk';
const MongoClient = MongoClientQ.MongoClient;
// const mongoUrl = 'mongodb://localhost:27017';

dotenv.config();

const mongoUrl = process.env.MONGO_CONNECT_STRING;
const dbName = process.env.DB_NAME;  
const dbNameFN = process.env.DB_NAME_FN;
const listenPort = process.env.API_LISTEN_PORT; 
const moralisApiKey = process.env.API_KEY;


 const setLimit = 1000;

const getPaginatedData = async (url, nextCursor) => {
  try {
    url = url+'&cursor='+nextCursor;
    // console.log('Fetching data from: ', url+'\n\n', 'Next cursor: ', nextCursor.slice(0,4))
    const data  = await axios.get(url, {
      headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
      "X-API-Key" : moralisApiKey
      },
    });

    if (data.data.cursor){
      // console.log('next page to lookup:\t'+data.data.cursor.substr(-5))
    }
    return {data};
  } catch (err) {
    console.error(err);
    return {megaError: 'yooooo err dawg'}
  }
};

const getAllPaginatedData = async (url) => { 
  return new Promise(async (resolve, reject) => { 
    
    let results = [];
    let allResults = [];


    const r = await axios.get(url,{
      headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
      "X-API-Key" : moralisApiKey
      },
    })
    let nextCursor = r.data.cursor;
    console.log('total TXs to look up: ', r.data.total)
    
    for (let i = 0; i < r.data.result.length; i++) {
      allResults.push(r.data.result[i]);
    }


    while (allResults.length < r.data.total) {
        if (nextCursor){
          // console.log('looking up page: '+nextCursor.substr(-5));
          console.log(nextCursor.substr(-5)+'\tgetting page: '+(allResults.length+100)/100 + ' of ' + Math.ceil(r.data.total/100))
        
          MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
            if (err) {
                h.fancylog(err, 'error');
            }
            const dbStatus = client.db('systemStats');
            const collectionStatus = dbStatus.collection('messages');
            collectionStatus.updateOne( { name: 'erc20TransfersForSelectedAddy' }, { $set: { statusMsg: 'gathering TXs from Moralis', page: ((allResults.length+100)/100), maxPage: Math.ceil(r.data.total/100), timestamp: new Date().getTime() } }, { upsert: true } , function(err, result) {
                client.close();
            });
          });
        
        }
        const q = await getPaginatedData(url, nextCursor);
        if (q && q.data && q.data.data && q.data.data.cursor){         
          for (let i = 0; i < q.data.data.result.length; i++) {
            allResults.push(q.data.data.result[i]);
          }
          nextCursor = q.data.data.cursor;
        }else {
          const final = await getPaginatedData(url, nextCursor);
          
          if (final.data && final.data.data && final.data.data.result){
            for (let i = 0; i < final.data.data.result.length; i++) {
              allResults.push(final.data.data.result[i]);
            }
          }

          let tokenLookupAddys=[];
          //take allResults and add in their friendlyNames and token symbol metadata to txs
          for (let i = 0; i < allResults.length; i++) {
            const from = await lookupSingleAddress(allResults[i].from_address);
            const to = await lookupSingleAddress(allResults[i].to_address);
            const tokeninfo = await lookupDbTokenInfo(allResults[i].address);
            allResults[i].from_address_friendlyName = from;
            allResults[i].to_address_friendlyName = to;
            if (tokeninfo == 'lookup'){
              //cant put it in this time, but next time the token will be cached in our db 
              tokenLookupAddys.push(allResults[i].address) 
            }
            else {allResults[i].token_metadata = tokeninfo;}

            if (i == allResults.length-1){
              const uniqueTokenLookupAddys = [...new Set(tokenLookupAddys)];
              MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
                if (err) {
                    h.fancylog(err, 'error');
                }
                const db = client.db('externalLookupRequests');
                const collection = db.collection('rBucket');
                collection.insertMany(uniqueTokenLookupAddys.map((addy) => { return {requestUrl: '', requestPostData: addy, instructionMap: 101}}), function(err, result) {
                    client.close();
                });
              });
              // c2.insertOne({requestUrl: requestUrl, requestPostData: null, instructionMap: 1});

              console.log('done')
              resolve(allResults)
            }
          }

          break;
        }


        await new Promise(r => setTimeout(r, 1000));
    }
    if (r.data.total <= 100){ // if there's only one page of results
      MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
        if (err) {
            h.fancylog(err, 'error');
        }
        const dbStatus = client.db('systemStats');
        const collectionStatus = dbStatus.collection('messages');
        collectionStatus.updateOne( { name: 'erc20TransfersForSelectedAddy' }, { $set: { statusMsg: 'gathering TXs from Moralis', page: 1, maxPage: 1, timestamp: new Date().getTime() } }, { upsert: true } , function(err, result) {
            client.close();
        });
      });
      

      await new Promise(r => setTimeout(r, 1000));
      resolve(allResults)
    }
  });
};



function lookupSingleAddress(address){
  return new Promise(async (resolve, reject) => {
  try {
      // console.log('--------------ADDRESS IS: ', address)
      // const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
      MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err1, client) {
      if (err1) console.log(chalk.magenta('error: ', err1));
      const dbFN = client.db('friendlyNames');
      const collection = await dbFN.collection('lookup').find({address: address}).toArray();
  

      if (collection.length === 0) { 
          // even if it's blank lets move the task of looking up new addresses to translator.js and only use this function for mongo lookups
          
          client.close();
          resolve(address);
      } else {
          client.close();
          resolve(collection[0]);
      }
    });
  } catch (error) {
      console.error(error);
      resolve(error);
  }
  });
}
function lookupDbTokenInfo(address){
  return new Promise(async (resolve, reject) => {
  try {
    MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err1, client) {
      if (err1) console.log(chalk.magenta('error: ', err1));
      const db = client.db('tokensMetadataCache');
      const collection = await db.collection('erc20').find({address: address}).toArray();
      

      if (collection.length === 0) { 
          // console.log('token not found in cache: ', address)
          client.close();
          resolve('lookup'); //havent looked this token up before. return blank so it can be fetched and cached 
      } else {
          // console.log('token FOUND in cache: ', address)
          client.close();
          resolve(collection[0]);
      }
    });
  } catch (error) {
      console.error(error);
      resolve(error);
  }
  });
}






export default getAllPaginatedData;