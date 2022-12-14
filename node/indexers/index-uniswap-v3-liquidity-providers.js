// this builds and maintains an index of all liquidity providers that are stored in the 
// tokenUri of each token in the Uniswap Positions Manager contract
// Moralis doesn't index it so we have to do it manually for our purpose
import ethers from 'ethers';

import axios from 'axios';
import dotenv from 'dotenv';
import * as MongoClientQ from 'mongodb';
import chalk from 'chalk';
const MongoClient = MongoClientQ.MongoClient;
// const mongoUrl = 'mongodb://localhost:27017';

dotenv.config();

// this is the contract address of the Uniswap V3 Positions Manager
const contractAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";


const mongoUrl = process.env.MONGO_CONNECT_STRING;
const dbName = process.env.DB_NAME;  
const dbNameFN = process.env.DB_NAME_FN;
const listenPort = process.env.API_LISTEN_PORT; 
const moralisApiKey = process.env.API_KEY;


console.clear();

//connect to mongodb and check database "uniswap-v3-position-managers" and collection "a_"+contractAddress
// if it doesn't exist, create it
checkLatestCachedToken()
    .then(async (result) => {
        console.log('all done!!!!')
    })
    .catch((err) => {
        console.log('there was error: ' + err);
    });

async function checkLatestCachedToken(){
    return new Promise(async (resolve, reject) => {
        
     
        
        MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
        
            if (err) {
                console.log('big old fat error: '+err);
            }
            const dbStatus = client.db('uniswap-v3-position-managers');
            const collection = dbStatus.collection("a_"+contractAddress);
            

            collection.find({}).sort({timeStamp:-1}).limit(1).toArray(function(err, result) {
                if (err) {
                    console.log('ayyy err: '+err);
                    
                }
                if (result.length == 0){
                    
                    console.log("collection is empty, start from tokenId 1");
                    //keep going up until we hit a token that doesn't exist
                    checkContractForTokenId(1)
                }
                else {
                    console.log("last token in collection is "+result[0].tokenId);
                    //keep going up until we hit a token that doesn't exist
                    checkContractForTokenId(result[0].tokenId+1)
                }

                client.close();
                resolve();
            });
        });
    });
} 


async function checkContractForTokenId(tokenId){
    return new Promise(async (resolve, reject) => {
        console.log('checking tokenId: '+tokenId);
        const options = {
            method: 'POST',
            url: 'https://deep-index.moralis.io/api/v2/0xC36442b4a4522E871399CD717aBDD847Ab11FE88/function',
            params: {chain: 'eth', function_name: 'tokenURI'},
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              'X-API-Key': moralisApiKey
            },
            data: {abi: theAbi, params: {tokenId: tokenId}}
          };
          
          axios
            .request(options)
            .then(function (response) {
                let temp = response.data.slice(29);
                // console.log(temp);
                // console.log('----------------- ')
                let utf8data = Buffer.from(temp, 'base64').toString('utf8');
                utf8data = JSON.parse(utf8data);
                // console.log( utf8data )
                // console.log('----------------- ')

                let newObj = {};
                let description = utf8data.description;
                let descriptionLines = description.split('\n');
                
                descriptionLines.forEach((line, index) => {
                    let lineParts = line.split(':');
                    if (lineParts.length != 2) return;
                    let key = lineParts[0].trim();
                    let val = lineParts[1].trim();
                    newObj[key] = val;
                    // console.log(index, line);
                });
                newObj["name"] = utf8data.name;
                // console.log(newObj);
                // console.log('----------------- ')
                //put it into mongodb, then check the next tokenId
                MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async function(err, client) {
                    if (err) {
                        console.log('fat mongo error: '+err);
                    }
                    const dbStatus = client.db('uniswap-v3-position-managers');
                    const collection = dbStatus.collection("a_"+contractAddress);
                    newObj["tokenId"] = tokenId;
                    newObj["timeStamp"] = Date.now();
                    collection.insertOne(newObj, async function(err, res) {
                        if (err) {
                            console.log('ERROR inserting document to mongo: '+err);
                        }
                        // console.log("1 document inserted");
                        client.close();
                        //wait 150 ms before checking the next tokenId
                        await new Promise(r => setTimeout(r, 100));
                        checkContractForTokenId(tokenId+1);
                        resolve();
                    });
                });
                


            })
            .catch(function (error) {
              if (error && error.response && error.response.data) {
                console.error(error.response.data); // { message: 'Returned error: execution reverted' }
              }
              if (tokenId < 500000){checkContractForTokenId(tokenId+1);}
            });
    });
}






const theAbi= [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},



	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "tokenURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]
