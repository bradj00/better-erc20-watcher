
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
};


