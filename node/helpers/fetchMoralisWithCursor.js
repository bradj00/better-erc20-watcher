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

          //take allResults and add in their friendlyNames 
          for (let i = 0; i < allResults.length; i++) {
            const from = await lookupSingleAddress(allResults[i].from_address);
            const to = await lookupSingleAddress(allResults[i].to_address);
            allResults[i].from_address_friendlyName = from;
            allResults[i].to_address_friendlyName = to;
            if (i == allResults.length-1){
              console.log('done')
              resolve(allResults)
            }
          }

          break;
        }


        await new Promise(r => setTimeout(r, 1000));
    }
    if (r.data.total <= 100){ // if there's only one page of results
      console.log('-------done')
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






export default getAllPaginatedData;