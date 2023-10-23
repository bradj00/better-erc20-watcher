import React, {useState, useContext, useEffect} from 'react'
import {GeneralContext} from '../App.js'



const DatabaseInfoGrabber = () => {
    // fetch data from api and store it in state
    const [data, setData] = useState(null)
    const [dataChart, setDataChart] = useState(null)
    const [filteredAddyData, setFilteredAddyData] = useState(null)
    const [intervalQ, setintervalQ] = useState(null)
    const {txData, settxData} = useContext(GeneralContext);
    const {setTxSummaryData} = useContext(GeneralContext); 
    const {settxDataChart} = useContext(GeneralContext); 
    const {settxDataChartOverTime} = useContext(GeneralContext); 
    const {setfilteredtxData} = useContext(GeneralContext);
    const {setlatestEthBlock} = useContext(GeneralContext); 
    const {getUpdatedAddressTokenTxList, setgetUpdatedAddressTokenTxList} = useContext(GeneralContext); 
    const {detectedLPs, setdetectedLPs} = useContext(GeneralContext); 
    
    const {viewingTokenAddress} = useContext(GeneralContext); //this is the address of the token we are viewing
    const {clickedDetailsAddress} = useContext(GeneralContext); //this is the address of the token we are viewing
    const {watchedTokenList, setWatchedTokenList} = useContext(GeneralContext); 
    const {setchainDataHeartbeat} = useContext(GeneralContext);
    const {setchainDataHeartbeatDiff} = useContext(GeneralContext);
    const {searchInputLookup} = useContext(GeneralContext);
    const {setselectedAddyInGameBalance} = useContext(GeneralContext);
    
    // explicit context variables needed because we are watching staking and deposit behavior for these addresses
    const {setMegaPriceUsd} = useContext(GeneralContext);
    /////////////////////////////////////////////
    
    const {setwatchedTokenPriceUsd} = useContext(GeneralContext);
    const {MinAmountFilterValue} = useContext(GeneralContext);
    const {MaxAmountFilterValue} = useContext(GeneralContext);
    
    const {RequestFriendlyLookup} = useContext(GeneralContext);
    const {setFriendlyLookupResponse} = useContext(GeneralContext);
    const {updateFriendlyName} = useContext(GeneralContext);
    const {systemStatuses, setSystemStatuses} = useContext(GeneralContext);
    const {heldTokensSelectedAddress} = useContext(GeneralContext);
    const {setheldTokensSelectedAddressFN} = useContext(GeneralContext);
    const {setselectedAddressListOfTokens} = useContext(GeneralContext);
    const {getUpdatedTokenBalance, setgetUpdatedTokenBalance} = useContext(GeneralContext);
    
    const {setcommunityHeldListFromSelected} = useContext(GeneralContext);
    const {communityHeldListFromSelectedAddy} = useContext(GeneralContext);
    const {updateCommitFriendlyNameRequest} = useContext(GeneralContext);
    const {selectedAddressTxList, setselectedAddressTxList} = useContext(GeneralContext);
    const {setclockCountsArrayForSelectedAddressTxList} = useContext(GeneralContext);
    const {fetchFreshStashedTokenBalance, setfetchFreshStashedTokenBalance} = useContext(GeneralContext);
    const {txVisualData, settxVisualData} = useContext(GeneralContext);
    const {RequestLiquidityPoolPrice, setRequestLiquidityPoolPrice} = useContext(GeneralContext); 
    const {setShownLiqPoolPriceData} = useContext(GeneralContext); 


    useEffect(() => {
        if (searchInputLookup){
            console.log('~~~~ searchInputLookup: ', searchInputLookup);
            fetchFriendlyNameLookup(searchInputLookup)
        }
    },[searchInputLookup]);

    useEffect(() => {
        if (updateCommitFriendlyNameRequest){
            // console.log('~~~~ updateCommitFriendlyNameRequest: ', updateCommitFriendlyNameRequest);
            updateAFriendlyName(updateCommitFriendlyNameRequest.address, updateCommitFriendlyNameRequest.friendlyName)
        }
    },[updateCommitFriendlyNameRequest]);

    useEffect(() => {
        // console.log('MinAmountFilterValue,MaxAmountFilterValue: ', MinAmountFilterValue,MaxAmountFilterValue)
        if (MinAmountFilterValue !== 1 && MaxAmountFilterValue !== 1){
            fetchTransactions( viewingTokenAddress , MinAmountFilterValue, MaxAmountFilterValue)
        }
    },[MinAmountFilterValue,MaxAmountFilterValue]);
    
    useEffect(() => {
        if (communityHeldListFromSelectedAddy){
            // console.log('~~~~ communityHeldListFromSelectedAddy: ', communityHeldListFromSelectedAddy);
            fetchCommonlyHeldToken(communityHeldListFromSelectedAddy)
        }
    },[communityHeldListFromSelectedAddy]);

    useEffect(() => {
        if (RequestLiquidityPoolPrice && RequestLiquidityPoolPrice.token0 && RequestLiquidityPoolPrice.token1 && RequestLiquidityPoolPrice.feeAmount){
            setRequestLiquidityPoolPrice();
            fetchLiquidityPoolPrice(RequestLiquidityPoolPrice.token0, RequestLiquidityPoolPrice.token1, RequestLiquidityPoolPrice.feeAmount)
        }
    },[RequestLiquidityPoolPrice]);
    

    useEffect(() => {
        if (heldTokensSelectedAddress){
            fetchSelectedAddressHeldTokens( heldTokensSelectedAddress )
            fetchFNforAddress( heldTokensSelectedAddress )
            fetchInGameMegaBalance( heldTokensSelectedAddress, 0 )
            fetchAddressTokenTxList(heldTokensSelectedAddress, 0);
        }
    },[heldTokensSelectedAddress]);

    useEffect(() => {
        if (selectedAddressTxList){
            console.log('selectedAddressTxList: ',selectedAddressTxList)
        }
    },[selectedAddressTxList]);

    useEffect(() => {
        if (getUpdatedTokenBalance && getUpdatedTokenBalance != undefined){
            fetchUpdatedTokenBalance(getUpdatedTokenBalance);
            setgetUpdatedTokenBalance();
        }
    },[getUpdatedTokenBalance]);

    useEffect(() => {
        if (fetchFreshStashedTokenBalance && heldTokensSelectedAddress){
            fetchInGameMegaBalance( heldTokensSelectedAddress, 1 );
            setfetchFreshStashedTokenBalance(false);
        }
    },[fetchFreshStashedTokenBalance]);

    useEffect(() => {
        if (getUpdatedAddressTokenTxList && heldTokensSelectedAddress){
            console.log('getting fresh TX records for address: ', heldTokensSelectedAddress, )
            fetchAddressTokenTxList(heldTokensSelectedAddress, 1);
            setselectedAddressTxList('loading'); //set the dataset to loading so the UI knows to show the spinner
            setgetUpdatedAddressTokenTxList(); //clear the request flag
        }
    },[getUpdatedAddressTokenTxList]);

    //pulls specifically fresh data from the Moralis API
    function fetchUpdatedTokenBalance(address) {
        console.log('fetching updated token balance for address: ', address)
        fetch('http://10.0.3.240:4000/updateTokenBalances/' + address)
        .then(response => response.json())
        .then(data => {
            console.log('['+address+'] token balances: ', data);
            // setselectedAddressListOfTokens(data);
            fetchSelectedAddressHeldTokens(address);

        })
    }

    function fetchLiquidityPoolPrice(token0, token1, feeAmount) {
        console.log('fetching : ', )
        fetch('http://10.0.3.240:4000/getLiquidityPoolPrice?token0='+token0+'&token1='+token1+'&feeAmount='+feeAmount)
        .then(response => response.json())
        .then(data => {
            console.log('POOL PRICE: ', data);
            setShownLiqPoolPriceData(data);
        })
    }
    function fetchInGameMegaBalance(token, getFreshData) {
        console.log('fetching in-game mega balance for address: ', token)
        fetch('http://10.0.3.240:4000/getStakedMegaBalances/'+token+'?getFreshData='+getFreshData)
        .then(response => response.json())
        .then(data => {
            console.log('['+token+'] in-game mega balance: ', data);
            setselectedAddyInGameBalance(data);
        })
    }
    function fetchCommonlyHeldToken(token) {
        console.log('fetching community held list for token filter: ', token)
        fetch('http://10.0.3.240:4000/findCommonHeld/' + token)
        .then(response => response.json())
        .then(data => {
            console.log('['+token+'] common held list: ', data);
            setcommunityHeldListFromSelected(data);
        })
    }
    function fetchFNforAddress(address) {
        console.log('fetching friendly name for address: ', address)
        fetch('http://10.0.3.240:4000/friendlyName/' + address)
        .then(response => response.json())
        .then(data => {
            console.log('FN Lookup:\t['+address+'] friendly name: ', data[0]);
            data[0]?  setheldTokensSelectedAddressFN(data[0]) : setheldTokensSelectedAddressFN('') 
        })
    }

    //pulls only cached data from mongoDB
    function fetchSelectedAddressHeldTokens(address) {
        console.log('fetching held tokens for address: ', address)
        fetch('http://10.0.3.240:4000/tokenBalances/' + address)
        .then(response => response.json())
        .then(data => {
            console.log('['+address+'] token balances: ', data);
            setselectedAddressListOfTokens(data);
        })
    }

    //explicit fetch calls for special tokens we are watching for staking / deposit contracts over.
    function fetchMegaPriceUsd(address) {
        console.log('fetching mega price for address: ', address)
        fetch('http://10.0.3.240:4000/fetchTokenUsdPrice/' + address)
        .then(response => response.json())
        .then(data => {
            console.log('['+address+'] mega price: ', data);
            setMegaPriceUsd(data);
        })
    }

    function fetchWatchedTokenPriceUsd(address) {
        console.log('fetching watched token price for address: ', address)
        fetch('http://10.0.3.240:4000/fetchTokenUsdPrice/' + address)
        .then(response => response.json())
        .then(data => {
            console.log('['+address+'] usd price: ', data);
            setwatchedTokenPriceUsd(data.usdPrice);
        })
    }

    function fetchAllSystemStatuses() {
        fetch('http://10.0.3.240:4000/system/systemStatus')
        .then(response => response.json())
        .then(data => {
            // console.log('system status: ', data);
            setSystemStatuses(data);

        })
    }

    useEffect(()=>{
        if (systemStatuses && heldTokensSelectedAddress){

            //if back end is done fetching new data, reload it to the UI
            if (systemStatuses && systemStatuses.erc20TransfersForSelectedAddy && systemStatuses.erc20TransfersForSelectedAddy.statusMsg == 'complete'){
                console.log('OH BOY IT IS COMPLETE! ',systemStatuses.erc20TransfersForSelectedAddy.statusMsg)
                fetchAddressTokenTxList(heldTokensSelectedAddress, 0);
            }

        }
    },[systemStatuses])

    

    function fetchAddressTokenTxList(address, getFreshData) {
        // setclockCountsArrayForSelectedAddressTxList(); //clear it out
        console.log('fetching address token tx list for address: ', address)
        fetch('http://10.0.3.240:4000/TokenTXsByAddress/'+address+'?getFreshData='+getFreshData)
        .then(response => response.json())
        .then(data => {
            console.log('address token tx list: ', data);
            let temp = [];
            //map each item.block_timestamp in data to a 24 hour time window and push to temp array
            data.map((item) => {
                temp.push(parseInt(item.block_timestamp.slice(11,13)) )
                // console.log('_______________________________________________________')
                // console.log(item.block_timestamp.slice(11,13) )
                // console.log('_______________________________________________________')
            });
            console.log('temp: ', temp);
            //count the number of times each number appears in the  temp array and push to a new array
            let counts = {};
            temp.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });
            console.log('counts: ', counts);
            
            //convert the counts object to an array of values
            let countsArray = Object.values(counts);

            //timezone shift the array to the left by 6 hours ...should put this in a global variable so others can set their own timezones
            let tempArr = countsArray.splice(0, 6)
            for (let i = 0; i < tempArr.length; i++) {
                countsArray.push(tempArr[i]);
            }

            setclockCountsArrayForSelectedAddressTxList(countsArray);
            setselectedAddressTxList(data);
            // setselectedAddressTxList('loading');
            // setWatchedTokenList(data);
        })
    }
    function fetchWatchedTokenList() {
        fetch('http://10.0.3.240:4000/watchedTokenList')
        .then(response => response.json())
        .then(data => {
            console.log('watched token list: ', data);

            
            setWatchedTokenList(data);
            // setWatchedTokenList(data);
        })
    }
    function fetchDetectedLiquidityPools(watchedToken) {
        console.log('fetching detected liquidity pools for token: ', watchedToken)
        fetch('http://10.0.3.240:4000/detectedLiquidityPools/'+watchedToken)
        .then(response => response.json())
        .then(data => {
            let temp = {uniswap_v3_pools:{}};
            console.log('detected pools (and position NFTs) : ', data);

            if (data && data.uniswap_v3_pools.length > 0) {
                data.uniswap_v3_pools.map((pool) => {
                if (!temp.uniswap_v3_pools[pool["Pool Address"]]) {
                  temp.uniswap_v3_pools[pool["Pool Address"]] = [];
                }
                temp.uniswap_v3_pools[pool["Pool Address"]].push(pool)
              })
            //   console.log('~~~temp: ', temp)
              setdetectedLPs(temp);
            }

            
            // setWatchedTokenList(data);
        })
    }

   
    function updateAFriendlyName(address, friendlyName){
        
        console.log('updating address '+address+' with manually defined Friendly Name: ', friendlyName)
        

        fetch('http://10.0.3.240:4000/updateFN/'+address+'/'+friendlyName) //hacky way to do this. should be a post request but I ran into CORS issues and this was the quickest way to get it working
        .then(response => response.json())
        .then(data => {
            console.log('ok: ', data);
        })
        .catch(err => {
            console.log('--error updating friendly name: ', err);
        });


    }



    function fetchAddressFilteredTransactions( viewingTokenAddress, clickedDetailsAddress ){
        fetch('http://10.0.3.240:4000/txs/' + viewingTokenAddress+'/'+clickedDetailsAddress)
        .then(response => response.json())
        .then(data => {
            console.log('filtered txs: ', data);
            setFilteredAddyData(data)
        })
    }
    
    function fetchFriendlyNameLookup( address ){
        fetch('http://10.0.3.240:4000/friendlyName/' + address)
        .then(response => response.json())
        .then(data => {
            console.log('looked up friendly name for address: ', address, 'result: ', data)
            if (data && data[0] && data[0]){
                setFriendlyLookupResponse(data)
            }else {
                setFriendlyLookupResponse('no friendly name found')
            }
        })
    }



    function fetchChainDataHeartbeat(){
        fetch('http://10.0.3.240:4000/')
        .then(response => response.json())
        .then(data => {
            setchainDataHeartbeat(data[0].heartbeat);
            const temp = new Date().getTime()
            const q = (temp - data[0].heartbeat);
            // console.log('ingestion engine heartbeat: ', data[0].heartbeat, 'diff: ', q);
            setchainDataHeartbeatDiff(q);
        });
    }

    function fetchLatestBlockFromChain(){
        const url = "http://10.0.3.240:4000/latestBlock/";
        fetch(url)
        .then(response => response.json())
        .then(data => {setlatestEthBlock(data)} )
    }


    function fetchTransactions( viewingTokenAddress , MinAmountFilterValue, MaxAmountFilterValue){ 
        if (!viewingTokenAddress){
            return;
        }
        // console.log('viewingTokenAddress: ', viewingTokenAddress)
        // http://10.0.3.240:4000/txs/summary/0x1892f6ff5fbe11c31158f8c6f6f6e33106c5b10e?pageNumber=allData
        let url            = 'http://10.0.3.240:4000/txs/' + viewingTokenAddress + '?pageNumber=allData&filterMin='+MinAmountFilterValue+'&filterMax='+MaxAmountFilterValue;
        let summaryDataUrl = 'http://10.0.3.240:4000/txs/summary/' + viewingTokenAddress + '?pageNumber=allData'
        fetch(summaryDataUrl)
        .then(response => response.json())
        .then(data => setTxSummaryData(data))


        fetch(url)
        .then(response => response.json())
        .then(data => setData(data))
        
        let url2 = 'http://10.0.3.240:4000/txs/' + viewingTokenAddress + '?pageNumber=chart&filterMin='+MinAmountFilterValue+'&filterMax='+MaxAmountFilterValue;
        fetch(url2)
        .then(response => response.json())
        .then(data => setDataChart(data))
    }
    
    // function updateHeartBeatDifferenceMarkers(){
    //     // console.log('chainDataHeartbeat: ',chainDataHeartbeat);
    //     if (chainDataHeartbeat){
    //         // console.log('checking..')
    //         const temp = new Date().getTime()
    //         setchainDataHeartbeatDiff(temp - chainDataHeartbeat);
    //     }
    // }

    useEffect(() => {
        if (watchedTokenList){
            console.log('watched token list: ', watchedTokenList);
            fetchTransactions(watchedTokenList[1].address, MinAmountFilterValue, MaxAmountFilterValue);
        }
    },[watchedTokenList]);
    
    useEffect(() => {
        if (detectedLPs){
            console.log('detected liquidity providers: ', detectedLPs);
        }
    },[detectedLPs]);


    useEffect(() => {
        if (updateFriendlyName){
            console.log('updating address '+RequestFriendlyLookup+' with manually defined Friendly Name: ', updateFriendlyName);
            updateAFriendlyName(updateFriendlyName.address,updateFriendlyName.friendlyName);
        }
    },[updateFriendlyName]);

    useEffect(() => {
        if (clickedDetailsAddress){
            console.log('clickedDetailsAddress: ', clickedDetailsAddress);
            fetchAddressFilteredTransactions(viewingTokenAddress, clickedDetailsAddress);
            
        }else {
            console.log('clearing filtered txs')
            setFilteredAddyData();
        }
    },[clickedDetailsAddress]);
    
    useEffect(()=>{
        if (RequestFriendlyLookup){
            console.log('RequestFriendlyLookup: ', RequestFriendlyLookup);
            fetchFriendlyNameLookup(RequestFriendlyLookup);
        }
    },[RequestFriendlyLookup])



    useEffect(() => {
        fetchWatchedTokenList();
        fetchAllSystemStatuses();
        fetchLatestBlockFromChain();
        fetchChainDataHeartbeat();

        //explicit call because we are watching this token for wallet and staking behavior too
        fetchMegaPriceUsd('0x1892f6ff5fbe11c31158f8c6f6f6e33106c5b10e');

        setInterval(()=>{
            // fetchAllSystemStatuses();
        }, 1000);

        setInterval(()=>{
            // fetchChainDataHeartbeat();
            // fetchLatestBlockFromChain();
        }, 10000);
    },[])


    useEffect(() => {
        if (viewingTokenAddress){
            console.log('watching new token: ', viewingTokenAddress);
            setdetectedLPs();
            fetchDetectedLiquidityPools(viewingTokenAddress);
            fetchWatchedTokenPriceUsd(viewingTokenAddress);
            //clear thisInterval
            clearInterval(intervalQ);

            fetchTransactions( viewingTokenAddress , MinAmountFilterValue, MaxAmountFilterValue);
            //create a setInterval that we can clear later
            setintervalQ( setInterval(() => {
                fetchTransactions( viewingTokenAddress , MinAmountFilterValue, MaxAmountFilterValue);
            }, 10000));

        }
    },[viewingTokenAddress])

    // useEffect(() => {
    //     setMinAmountFilterValue(DisplayMinAmountFilterValue)
    //   }, [DisplayMinAmountFilterValue ]);

    // useEffect(() => {
    //     setMaxAmountFilterValue(DisplayMaxAmountFilterValue)
    //     // return () => clearTimeout(timeOutId);
    //   }, [DisplayMaxAmountFilterValue ]);

    // useEffect(() => {
    //     if (JSON.stringify(txVisualData) !== JSON.stringify(txDataChart) ){
    //         console.log('CHANGING VISUAL DATA', txVisualData, txDataChart)
    //         settxVisualData(dataChart.result);
    //     }
    // },[txVisualData, txDataChart]);


    useEffect(() => {
        if (dataChart && dataChart.result){
            settxDataChart(dataChart.result);
           
            
            
            settxDataChartOverTime(dataChart.resultOT);
            // console.log('~~~~~ dataChart: ', dataChart);
        }
    },[dataChart])


    useEffect(() => {
        // console.log('data.result: ', data.result);
        // if (MinAmountFilterValue || MaxAmountFilterValue) is defined then filter data only showing transactions that are between the two values
        let checkedMinValue = 0;
        let checkedMaxValue = 0;
        if (data && data.result){
            if (MinAmountFilterValue || MaxAmountFilterValue){
                // console.log('MinAmountFilterValue: ', MinAmountFilterValue, ' MaxAmountFilterValue: ', MaxAmountFilterValue);
                if (!MinAmountFilterValue){ checkedMinValue = 0 } else { checkedMinValue = MinAmountFilterValue } 
                if (!MaxAmountFilterValue){ checkedMaxValue = 999999999 } else { checkedMaxValue = MaxAmountFilterValue } 
                const temp = data.result.filter((item) => {
                    if ((parseInt(item.value) / 10 ** 18) >= checkedMinValue && (parseInt(item.value) / 10 ** 18) <= checkedMaxValue){
                        return item;
                    }
                })
                // console.log('SETTING FINAL TEMP: ', temp)
                settxData(temp);
                if (JSON.stringify(txVisualData) !== JSON.stringify(txData) ){
                    console.log('CHANGING VISUAL DATA', txVisualData, txData)
                    settxVisualData(txData);
                }
            }else {
                // console.log('SETTING FINAL UNFILTERED TEMP: ', data.result)
                settxData(data.result)
            }
        }
    },[data])

    useEffect(() => {
        console.log('filteredAddyData: ',filteredAddyData);
        setfilteredtxData(filteredAddyData)
    },[filteredAddyData])
    
    return (
        <>
        </>
    )
}

export default DatabaseInfoGrabber