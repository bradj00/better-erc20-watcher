console.clear();
import axios from 'axios'
import { MongoClient } from 'mongodb';
import chalk from 'chalk';
const mongoUrl = 'mongodb://localhost:27017';


// get a list of all addresses from pivot table 'allAddresses'

//get list of known staking addresses and types to define how to look up their balances
//will eventually live in mongo
const stakingAddysArr = [
    {
    "address": "0x0000000000000000000000000000000000000000",
    "locationType": "some-generic-staking"
    },
    {
    "address": "0x0000000000000000000000000000000000000000",
    "locationType": "MegaWorld-Wallet"
    },
];

//then for each address in "allAddresses", check each address against each staking address
//therefore, each addy will be scanned for staking/deposits and their balance updated 

// getPlayerMegaPerkStaked('')
// .then((res) => {
//     console.log('totalPerkStated: ', res)
// })
async function getPlayerMegaPerkStaked(playerAddress) {
    return new Promise(async (resolve, reject) => {
        let payload = {"address":playerAddress}
        const url = "https://ws.mcp3d.com/perks/address"

        let res = await axios.post(url, payload);

        let data = res.data;
        
        let totalPerkStated = 0;
        for (let districts in data){
            for (let perk in data[districts]){
                console.log('perk: ', data[districts][perk]);
                totalPerkStated += parseInt(data[districts][perk] / (10**18)) ;
            }
        }
        // console.log('totalPerkStated: ', totalPerkStated)
        resolve(totalPerkStated);
    });
}








// main();
async function main(){
    let allAddresses = await getAllAddresses();
    console.log('allAddresses: ', allAddresses);
    for (const address of allAddresses) {
        let temp = address.toLowerCase().replace('0x', '')
        await new Promise(r => setTimeout(r, 1000));
        // console.log('address: 0x', temp);
        getPlayerMegaBalance(temp)
        .then((data) => {
            console.log('[0x'+chalk.cyan(temp)+']\tmega balance: ' + data+'\n');
        })

    }
}


async function getAllAddresses(){
    return new Promise(async (resolve, reject) => {
        const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
        const db = client.db('pivotTables');
        const addresses = await db.collection('allAddresses').find({}, { projection: { address: 1 } }).toArray();
        client.close();
        // put addresses into an array
        let addressesArr = [];
        for (const address of addresses) {
            addressesArr.push(address.address);
        }

        //should already be de-duped if we need to remove this later
        let uniqueAddresses = [...new Set(addressesArr)];
        resolve(uniqueAddresses);
    });
}

async function getPlayerMegaBalance(playerAddress) {
    return new Promise(async (resolve, reject) => {
        let payload = {"jsonrpc":"2.0","id":17,"method":"eth_call","params":[{"data":"0xf8b2cb4f000000000000000000000000"+playerAddress,"to":"0x0d4a54716005d11f1e42c4d615ab8221f9a0d7e3"},"latest"]}
        const url = "https://misty-dawn-mountain.matic.quiknode.pro/4a6d10967c8875ef8d3488a9efc37234045b809b/"

        let res = await axios.post(url, payload);

        let data = res.data;
        let megaBalance = parseInt(data.result, 16) / (10 ** 18)
        resolve(megaBalance);
    });
}

