// const tokenAddresses = [111, 222, 333, 444, 555, 666];
// updateSingleTokenList(tokenAddresses).then((q) =>
//     console.log(`all resolved!`)
// );
// function updateSingleTokenList(tokenAddresses) {
//     return tokenAddresses.reduce(
//         (acc, tokenAddress) =>
//         acc.then((res) =>
//             new Promise((resolve) =>{
//             var delay = Math.floor(Math.random() * 3000);
//             console.log(delay);
//             setTimeout(() => {
//                 console.log(`${tokenAddress} resolved!`)
//                 resolve(tokenAddress);
//             }, delay)
//             }
//             )
//         ),
//         Promise.resolve()
//     )
// }

// Loading the dependencies. We don't need pretty
// because we shall not log html to the terminal
import axios from 'axios';

// URL of the page we want to scrape
// const url = "https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3";
const url = "https://opensea.io/0x451E9948f930C33Bcda8d97F99fc1df4737921Db";


// Async function which scrapes the data
async function scrapeData() {
  try {
    // Fetch HTML of the page we want to scrape
    const { data } = await axios.get(url, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
            "User-Agent" : "Mozilla/5.0"
            },
    });
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log(data);
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
    console.log('---------------------------------');
  } catch (err) {
    console.error(err);
  }
}
// Invoke the above function
scrapeData();




