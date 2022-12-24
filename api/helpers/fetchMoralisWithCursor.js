import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();


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
          for (let i = 0; i < final.data.data.result.length; i++) {
            allResults.push(final.data.data.result[i]);
          }
          resolve(allResults)
          break;
        }


        await new Promise(r => setTimeout(r, 1000));
    }
  });
};

export default getAllPaginatedData;