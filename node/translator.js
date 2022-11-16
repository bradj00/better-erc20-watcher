import axios from 'axios';
import chalk from 'chalk';
import * as MongoClientQ from 'mongodb';
const MongoClient = MongoClientQ.MongoClient;
const mongoUrl = 'mongodb://localhost:27017';
const dbNameQueryAddys = 'watchedTokens';
const dbNameFriendlyNames = 'friendlyNames';
var uniqueAddys = [];

//connect to mongodb, use db named "watchedTokens". Query each collection for the following columns: "to_address", "from_address", "address" and add all the addresses to the "coolAddresses" array. make coolAddresses unique.
async function getAddresses() {
    const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
    const db = client.db(dbNameQueryAddys);
    const collections = await db.listCollections().toArray();
    const coolAddresses = [];
    for (const collection of collections) {
        const addresses = await db.collection(collection.name).find({}, { projection: { to_address: 1, from_address: 1, address: 1 } }).toArray();
        for (const address of addresses) {
            if (address.to_address) {
                coolAddresses.push(address.to_address);
            }
            if (address.from_address) {
                coolAddresses.push(address.from_address);
            }
            if (address.address) {
                coolAddresses.push(address.address);
            }
        }
    }
    client.close();
    // console.log ([...new Set(coolAddresses)]);
    uniqueAddys = [...new Set(coolAddresses)];
}
getAddresses()

getAddresses().then((q) => 
{
    updateSingleTokenList(uniqueAddys).then((q) =>
       console.log(`all resolved!`)
    );
    function updateSingleTokenList(uniqueAddys) {
       return uniqueAddys.reduce(
           (acc, uniqueAddy) =>
           acc.then((res) =>
               new Promise((resolve) =>{
                setTimeout(() => {
                    checkAddress(uniqueAddy, resolve)
                    .then((q) => {
                        console.log('looking up [ '+uniqueAddy+' ]', q=='0x000'?chalk.red(q) : chalk.rgb(0,255,0)(q));

                        //store the address and the username in the db "friendlyNames" collection "friendlyNames" with columns of "address" and "friendlyName"
                        MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
                        if (err) {
                            console.log(err);
                        }
                        const db = client.db(dbNameFriendlyNames);

                        try {
                            db.collection("lookup").insertOne( { address: uniqueAddy, friendlyName: q} );
                            console.log('wrote to db'+uniqueAddy+' '+q);
                            resolve(uniqueAddy);
                        } catch (e) {
                            print (e);
                            resolve(uniqueAddy);
                            };

                    });

                        // resolve(uniqueAddy);
                    });

                }, 500)
               })
           ),
           Promise.resolve()
       )
    }
    var delay = Math.floor(Math.random() * 1000);
});

async function checkAddress(address, resolve) {
    const url = 'https://api.opensea.io/user/' + address + '?format=json';
    try {
        const { data } = await axios.get(url, {})
        // console.log(data);
        return data.username;
    }
    catch(error){
        return '0x000'
    }
    

}

