import * as MongoClientQ from 'mongodb';
const MongoClient = MongoClientQ.MongoClient;
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'watchedTokens';

var uniqueAddys = [];

//connect to mongodb, use db named "watchedTokens". Query each collection for the following columns: "to_address", "from_address", "address" and add all the addresses to the "coolAddresses" array. make coolAddresses unique.
async function getAddresses() {
    const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
    const db = client.db(dbName);
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
    // for (let i =0; i < uniqueAddys.length; i++){
    //     setTimeout(()=>{
    //         console.log('looking up [ '+uniqueAddys[i]+' ]');
    //     }, 20*i);
    // }

    //rewrite the above for-loop as a promise chain with a random delay up to 500ms between each lookup
    updateSingleTokenList(uniqueAddys).then((q) =>
       console.log(`all resolved!`)
    );
    function updateSingleTokenList(uniqueAddys) {
       return uniqueAddys.reduce(
           (acc, uniqueAddy) =>
           acc.then((res) =>
               new Promise((resolve) =>{
                var delay = Math.floor(Math.random() * 500);

                if (delay <= 400) {
                  delay = Math.floor(Math.random() * 50);
                }
               console.log(delay);
               setTimeout(() => {
                   console.log(`${uniqueAddy} resolved!`)
                   resolve(uniqueAddy);
               }, delay)
               }
               )
           ),
           Promise.resolve()
       )
    }


    var delay = Math.floor(Math.random() * 500);

});

