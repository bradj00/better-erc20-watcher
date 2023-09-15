import axios from 'axios';

const API_ENDPOINT = 'http://localhost:4010/token/';
const STATUS_ENDPOINT = 'http://localhost:4010/status/';
const CHECK_INTERVAL = 2000; // 2 seconds

const contractAddresses = [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0x853d955acef822db058eb8505911ed77f175b99e',
    '0xfe2e637202056d30016725477c5da089ab0a043a',
    '0x853d955acef822db058eb8505911ed77f175b99e',
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'
];

const jobIDs = [];

async function requestTokenData(contractAddress) {
    try {
        const response = await axios.get(API_ENDPOINT + contractAddress);
        // console.log('response: ',response)
        if (response.data && response.data.id) {
            jobIDs.push(response.data.id);
        }
    } catch (error) {
        console.error(`Error fetching data for contract ${contractAddress}:`, error.message);
    }
}

async function checkJobStatus(jobID) {
    try {
        const response = await axios.get(STATUS_ENDPOINT + jobID);
        const status = response.data.status;
        // console.log('STATUS: ',status)
        // // If the job is no longer 'Pending', remove it from the jobIDs array
        // if (status !== 'Pending') {
        //     const index = jobIDs.indexOf(jobID);
        //     if (index > -1) {
        //         jobIDs.splice(index, 1);
        //     }
        // }

        return status;
    } catch (error) {
        console.error(`Error checking status for jobID ${jobID}:`, error.message);
        return 'Error';
    }
}

async function main() {
    // Rapidly request data for all contract addresses
    for (const address of contractAddresses) {
        await requestTokenData(address);
    }

    console.log('All requests sent!');

    // Periodically check the status of each jobID
    // setInterval(async () => {
    //     // console.log('Job IDs: ',jobIDs)
    //     for (const jobID of jobIDs) {
    //         const status = await checkJobStatus(jobID);
    //         console.log(`JobID ${jobID} status: ${status}`);
    //     }
    //     console.log('-----------\n\n')
    // }, CHECK_INTERVAL);
}

main();
