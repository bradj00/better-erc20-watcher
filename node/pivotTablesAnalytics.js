// additional job runs that analyze ingested tx data and store in pivot tables for faster querying
//      token volume for given collection aggregated by hour / day
//      all addresses that show up in the tx data (tokens held from that collection, token volumes, all other tokens held, etc)


// database structure will be : 
//     dbName: 'addressAnalytics',
//     collectionName: a_0x.........,  //address that is being analyzed
//     columns: {
//         lastUpdated: Date,          //last time this address was analyzed
//         tokensHeld: [],             //array of token addresses that are held by this address
//         a_0xaddress000_held         //token amount held
//         a_0xaddress000_volume       //total volume of token held by address
//         a_0xaddress000_volume_24hr  //total volume of token held by address in last 24 hours
//         a_0xaddress000_volume_7d    //total volume of token held by address in last 7 days
//         a_0xaddress000_volume_30d   //total volume of token held by address in last 30 days

