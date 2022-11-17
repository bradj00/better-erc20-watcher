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

// getAddresses()
// .then(() => {
//     checkAddresses();
// })
//then for each address, check if mongodb database "friendlyNames" has a collection with the same name as the address. if it does, check if the "username" column has a value. if it does, do nothing. if it doesn't, query opensea for the username and add it to the collection.
async function checkAddresses() {
    const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
    const dbFN = client.db(dbNameFriendlyNames);
    var count = 0;
    var countTrue = 0;
    
    for (const address of uniqueAddys) {
        count++;
        countTrue++;
        const collection = await dbFN.collection('lookup').find({address: address}).toArray();
        // console.log('COLLECTION IS: ');
        // console.log(collection);

        if (collection.length === 0) {
            
            setTimeout( async ()=>{
                console.log(count+' / '+uniqueAddys.length+'\tOpenSea lookup: ' + address);
                const data  = await checkAddress(address);
                if (data ) {
                    console.log(chalk.green(`Found username ${data}`));
                    // await db.collection(address).insertOne({ username: username });
                    await dbFN.collection("lookup").insertOne( { address: address, friendlyName: data} );
                    
                    // also list all transactions from all collections in the watchedTokens database that have the address as the from_address or to_address and add the username to the collection
                    const dbWT = client.db(dbNameQueryAddys);
                    const collections = await dbWT.listCollections().toArray();
                    for (const collection of collections) {
                        const addresses = await dbWT.collection(collection.name).find({ $or: [ { to_address: address }, { from_address: address } ] }, { projection: { to_address: 1, from_address: 1, address: 1 } }).toArray();
                        for (const address2 of addresses) {
                            if (address2 && address2.to_address === address) {
                                await dbWT.collection(collection.name).update
                                (
                                    { to_address: address2.to_address },
                                    { $set: { to_address_friendlyName: data } }
                                );
                                console.log('updated to_address_friendlyName in collection: '+collection.name);
                            }
                            if (address2 && address2.from_address === address) {
                                await dbWT.collection(collection.name).update
                                (
                                    { from_address: address2.to_address },
                                    { $set: { from_address_friendlyName: data } }
                                );
                                console.log('updated from_address_friendlyName in collection: '+collection.name);
                            }
                        }
                    }
                } 
                else {
                    console.log(chalk.red(`No username found for ${address}`));
                    await dbFN.collection("lookup").insertOne( { address: address, friendlyName: '0x000'} );
                    
                }
            },1000*count);
        } else {
            console.log(chalk.yellow(countTrue+' / '+uniqueAddys.length+`  Already have username for ${address}\t ${collection[0].friendlyName}`));
            count--;

            // also list all transactions from all collections in the watchedTokens database that have the address as the from_address or to_address and add the username to the collection
            const dbWT = client.db(dbNameQueryAddys);
            const collections = await dbWT.listCollections().toArray();
            for (const collection5 of collections) {
                const addresses = await dbWT.collection(collection5.name).find({ $or: [ { to_address: address }, { from_address: address } ] }, { projection: { to_address: 1, from_address: 1, address: 1 } }).toArray();
                for (const address2 of addresses) {
                    if (address2 && address2.to_address === address) {
                        await dbWT.collection(collection5.name).update
                        (
                            { to_address: address2.to_address },
                            { $set: { to_address_friendlyName: collection[0].friendlyName } }
                        );
                        console.log('updated to_address_friendlyName in collection: '+collection5.name);
                    }
                    if (address2 && address2.from_address === address) {
                        await dbWT.collection(collection5.name).update
                        (
                            { from_address: address2.to_address },
                            { $set: { from_address_friendlyName: collection[0].friendlyName } }
                        );
                        console.log('updated from_address_friendlyName in collection: '+collection5.name);
                    }
                }
            }



        }
    }
    
    
    // client.close();
}

export default function lookupSingleAddress(address){
    return new Promise(async (resolve, reject) => {
    const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
    const dbFN = client.db(dbNameFriendlyNames);
    const collection = await dbFN.collection('lookup').find({address: address}).toArray();

    if (collection.length === 0) {
            // console.log(count+' / '+uniqueAddys.length+'\tOpenSea lookup: ' + address);
            const data  = await checkAddress(address);
            if (data ) {
                // console.log(chalk.green(`Found username ${data}`));
                resolve(data);
                client.close();
            } 
            else {
                // console.log(chalk.red(`No username found for ${address}`));
                resolve(data);
                client.close();
            }
    } else {
        resolve(collection[0].friendlyName);
    }
    
    
    });
}





















// checkAddresses()

// var counter = 0;

// getAddresses().then((q) => 
// {
//     updateSingleTokenList(uniqueAddys).then((q) =>
//        console.log(`all resolved!`)
//     );
//     function updateSingleTokenList(uniqueAddys) {
//        return uniqueAddys.reduce(
//            (acc, uniqueAddy) =>
//            acc.then((res) =>
//                new Promise((resolve) =>{
//                 setTimeout(() => {
//                     checkAddress(uniqueAddy, resolve)
//                     .then((q) => {
                        

//                         //store the address and the username in the db "friendlyNames" collection "friendlyNames" with columns of "address" and "friendlyName"
//                         MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, client) {
//                         if (err) {
//                             console.log(err);
//                         }
//                         const db = client.db(dbNameFriendlyNames);

//                         try {
//                             counter++;
//                             db.collection("lookup").insertOne( { address: uniqueAddy, friendlyName: q} );
//                             console.log(counter+' / '+uniqueAddys.length+'  '+chalk.cyan('cached')+' [ '+uniqueAddy+' ]', q=='0x000'?chalk.red(q) : chalk.rgb(0,255,0)(q));
//                             resolve(uniqueAddy);
//                         } catch (e) {
//                             print (e);
//                             resolve(uniqueAddy);
//                             };

//                     });

//                         // resolve(uniqueAddy);
//                     });

//                 }, 500)
//                })
//            ),
//            Promise.resolve()
//        )
//     }
//     var delay = Math.floor(Math.random() * 1000);
// });

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

