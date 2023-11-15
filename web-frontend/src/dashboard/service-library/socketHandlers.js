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

export const handleRequestErc20BulkCacheInfo = (data, dataSetterObj) => {
    if (data.data.data === null || data.data.data === undefined ) return;
    console.log('~~RequestErc20BulkCacheInfo: ', data.data.data);

    const newCachedData = data.data.data.reduce((acc, current) => {
        if (current.contractAddress) {
            acc[current.contractAddress] = current; // Map each item to its contract address
        }
        return acc;
    }, {});

    dataSetterObj.setcachedErc20TokenMetadata(prevData => ({
        ...prevData,  // Spread the existing data
        ...newCachedData // Add new data, updating existing entries if they exist
    }));
};

export const handleCacheFriendlyLabelsRequest = (data, dataSetterObj) => {
    console.log('CacheFriendlyLabelsRequest: ',data)
    dataSetterObj.setCacheFriendlyLabels(data.data.data);
};

export const handleTxHashDetailsArray = (data, dataSetterObj) => {
    console.log('TxHashDetailsArray: ', data);

    //transform the array into an object where the key names are the transaction hash IDs
    const transformedData = data.data.reduce((acc, item) => {
        acc[item.transactionHash] = item;
        return acc;
    }, {});

    console.log('TRANSFORMED DATA: ',transformedData)
    dataSetterObj.setTxHashDetailsObj(transformedData);
};


export const handleTokenLookupRequestResponse = (data, dataSetterObj) => {
    console.log('TOKEN LOOKUP RESPONSE FROM KAFKA:', data);

    // Extract the contract address and token metadata from the response data
    const contractAddress = data.data.contractAddress;
    const tokenMetadata = data.data.data;

    // Use the state setter function to update the state
    dataSetterObj.setcachedErc20TokenMetadata(existing => {
        // Check if 'existing' is an object
        if (typeof existing === 'object' && existing !== null) {
            // Return a new object with the new key-value pair added
            return {
                ...existing,
                [contractAddress]: {
                    contractAddress: contractAddress,
                    data: tokenMetadata
                },
            };
        }
        // If 'existing' is not an object, log an error or handle as appropriate
        console.error('Expected an object for existing cached ERC20 token metadata');
        // Initialize as an object with the new key-value pair if 'existing' was not an object
        return { [contractAddress]: tokenMetadata };
    });
}


export const handleErrorMessages = (data, dataSetterObj) => {
    console.log('ERROR FROM KAFKA:', data)
    dataSetterObj.setServicesErrorMessages(prevMessages => {
        // Create a new object with the current data and a timestamp
        const newData = {
          ...data,
          timestamp: new Date().toISOString() // This will add an ISO formatted timestamp
        };
      
        // Prepend the new data to the array to display it at the top
        return [newData, ...prevMessages];
      });
      
    // dataSetterObj.setServicesErrorMessages();
    // {
    //     "service": "txie-error",
    //     "method": "ErrorMessages",
    //     "data": {
    //         "txieContract": "0x1892f6ff5fbe11c31158f8c6f6f6e33106c5b10e",
    //         "errorType": "tx-ingestion-engine-websocket",
    //         "errorMsg": "test error message"
    //     }
    // }


    // [{message:'something here'},{message:'something here'},{message:'something here'},{message:'something here'},]
}

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
// export const handleSetAddressTags = (data, dataSetterObj) => {
//     console.log('SetAddressTags: ', data.data.data);
    
//     //LOGIC GOES HERE...

//     dataSetterObj.setAddressTags();
    
// };

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

 
export const handletxieErrorMessage = (data, dataSetterObj) => {
    console.log('txieErrorMessage: ', data);

}
export const handleGetBulkTagsRequest = (data, dataSetterObj) => {
    if (data?.data?.data?.addressesTags) {
        console.log('HANDLING GET BULK TAGS RESPONSE: ', data.data.data);

        dataSetterObj.setElderCount(data.data.data.totalElderCount)
        
        // Transform the array of tag objects into an object keyed by address
        const newAddressesTags = data.data.data.addressesTags.reduce((acc, tagObj) => {
            acc[tagObj.address] = tagObj;
            return acc;
        }, {});

        // Update the existing addressTags with the new data
        dataSetterObj.setAddressTags(prevAddressesTags => ({
            ...prevAddressesTags,
            ...newAddressesTags
        }));
    } else {
        console.log('Malformed bulk tags response from the apigw: ', data);
    }
};


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
