import { useContext } from 'react';
import { GeneralContext } from '../../App.js';

export const handleGetWatchedTokens = (data, dataSetterObj) => {
    console.log('setting data to watchedTokenList: ',data.data)
    
    dataSetterObj.setWatchedTokenList(data.data.data);
};

export const handleGetFriendlyName = (data, dataSetterObj) => {
    console.log('FriendlyNameLookupResponse: ',data.data.data)
    
    dataSetterObj.setFriendlyLookupResponse(data.data.data);
};

export const handleCacheFriendlyLabelsRequest = (data, dataSetterObj) => {
    console.log('CacheFriendlyLabelsRequest: ',data)
    dataSetterObj.setCacheFriendlyLabels(data.data.data);
};

export const handleGetTransactions = (data, dataSetterObj) => {
    console.log('GetTransactions: ', data.data.data);
    
    // Extract unique addresses from the array of transactions.
    const uniqueAddresses = Array.from(
        new Set(
            data.data.data.flatMap(transaction => [transaction.from_address, transaction.to_address])
        )
    );

    dataSetterObj.setCacheFriendlyLabelsRequest(uniqueAddresses);
    dataSetterObj.settxData(data.data.data);
    dataSetterObj.settxVisualData(data.data.data);
};

// TEST FUNCTION
export const handleAppendTransaction = (data) => {
    //if    data.data.address == watchedToken, proceed with processing, otherwise drop it as irrelevant
    
    console.log("Received APPEND tx:", data.data);


}

// so far this is used both when looking up a new token to watch, and in the future looking up bulk token info to cache.
export const handleLookupTokenRequest = (data, cachedErc20TokenMetadata, setcachedErc20TokenMetadata) => {
    
    // console.log("Received Lookup Token Info:", data.data.data);
    
    // Extracting the contract address and converting it to lowercase
    const contractAddress = data.data.data.contractAddress.toLowerCase();
    

    // Updating the cachedErc20TokenMetadata object
    const updatedMetadata = {
        ...cachedErc20TokenMetadata, 
        [contractAddress]: data.data.data  // add/update the token data using the contract address as the key
    };
    
    // Updating the context with the new token data
    setcachedErc20TokenMetadata(updatedMetadata);
}

//when a new TX comes in, or we need to feed the TX to the client 
export const handleAppendTransactions = (data, dataSetterObj, txData) => {
    console.log('AppendTransactions: ', data);
    console.log('AppendTransactions2: ', txData);

    const newTransaction = data.data.data;

    // Check if the transaction already exists in txData based on transaction_hash.
    const transactionExists = txData.some(
        existingTransaction => existingTransaction.transaction_hash === newTransaction.transaction_hash
    );

    // If the transaction already exists, no further processing is needed.
    if (transactionExists) return;

    // Extract unique addresses from the new transaction.
    // const uniqueAddresses = [newTransaction.from_address, newTransaction.to_address];

    // Update address cache request with new unique addresses.
    // dataSetterObj.setCacheFriendlyLabelsRequest(uniqueAddresses);
    
    // Append the new transaction to the existing txData and update state.
    const updatedTxData = [newTransaction, ...txData];
    dataSetterObj.settxData(updatedTxData); 
    dataSetterObj.settxVisualData(updatedTxData);
};
