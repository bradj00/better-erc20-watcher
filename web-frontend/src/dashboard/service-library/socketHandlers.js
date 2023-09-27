
export const handleGetWatchedTokens = (data, dataSetterObj) => {
    console.log('setting data to watchedTokenList: ',data.data)
    
    dataSetterObj.setWatchedTokenList(data.data.data);
};

export const handleGetFriendlyName = (data, dataSetterObj) => {
    console.log('FriendlyNameLookupResponse: ',data.data.data)
    
    dataSetterObj.setFriendlyLookupResponse(data.data.data);
};
export const handleGetTransactions = (data, dataSetterObj) => {
    console.log('GetTransactions: ',data.data.data)
    
    dataSetterObj.settxData(data.data.data);
};

