
export const handleGetWatchedTokens = (data, dataSetterObj) => {
    console.log('setting data to watchedTokenList: ',data.data)
    
    dataSetterObj.setWatchedTokenList(data.data.data);
};

export const handleFriendlyNameLookupResponse = (data, dataSetterObj) => {
    console.log('FriendlyNameLookupResponse: ',data)
    
    dataSetterObj.setFriendlyLookupResponse(data);
};
export const handleGetTransactions = (data, dataSetterObj) => {
    console.log('GetTransactions: ',data.data.data)
    
    dataSetterObj.settxData(data.data.data);
};

