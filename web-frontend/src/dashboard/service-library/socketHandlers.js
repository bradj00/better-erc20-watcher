
export const handleGetWatchedTokens = (data, dataSetterObj) => {
    console.log('setting data to watchedTokenList: ',data.data)
    
    dataSetterObj.setWatchedTokenList(data.data.data);
};

