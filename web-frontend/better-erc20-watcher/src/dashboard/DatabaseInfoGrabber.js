import React, {useState, useContext, useEffect} from 'react'
import {GeneralContext} from '../App.js'



const DatabaseInfoGrabber = () => {
    // fetch data from api and store it in state
    const [data, setData] = useState(null)
    const [dataChart, setDataChart] = useState(null)
    const [filteredAddyData, setFilteredAddyData] = useState(null)
    const [intervalQ, setintervalQ] = useState(null)
    const {txData, settxData} = useContext(GeneralContext);
    const {txDataChart, settxDataChart} = useContext(GeneralContext); 
    const {filteredtxData, setfilteredtxData} = useContext(GeneralContext);
    const {getnewTxData, setgetnewTxData} = useContext(GeneralContext); //this is the trigger to get new data from the api. value is the address of the token
    const {latestEthBlock, setlatestEthBlock} = useContext(GeneralContext); 
    
    const {viewingTokenAddress, setviewingTokenAddress} = useContext(GeneralContext); //this is the address of the token we are viewing
    const {clickedDetailsAddress, setclickedDetailsAddress} = useContext(GeneralContext); //this is the address of the token we are viewing
    const {watchedTokenList, setWatchedTokenList} = useContext(GeneralContext); 
    const {chainDataHeartbeat, setchainDataHeartbeat} = useContext(GeneralContext);
    const {chainDataHeartbeatDiff, setchainDataHeartbeatDiff} = useContext(GeneralContext);
    
    const {DisplayMinAmountFilterValue, setDisplayMinAmountFilterValue} = useContext(GeneralContext);
    const {DisplayMaxAmountFilterValue, setDisplayMaxAmountFilterValue} = useContext(GeneralContext);
    const {MinAmountFilterValue, setMinAmountFilterValue} = useContext(GeneralContext);
    const {MaxAmountFilterValue, setMaxAmountFilterValue} = useContext(GeneralContext);
    
    const {RequestFriendlyLookup, setRequestFriendlyLookup} = useContext(GeneralContext);
    const {friendlyLookupResponse, setFriendlyLookupResponse} = useContext(GeneralContext);
    const {updateFriendlyName, setupdateFriendlyName} = useContext(GeneralContext);
    const {systemStatuses, setSystemStatuses} = useContext(GeneralContext);

    useEffect(() => {
        console.log('MinAmountFilterValue,MaxAmountFilterValue: ', MinAmountFilterValue,MaxAmountFilterValue)
        if (MinAmountFilterValue !=1 && MaxAmountFilterValue != 1){
            fetchTransactions( viewingTokenAddress , MinAmountFilterValue, MaxAmountFilterValue)
        }
    },[MinAmountFilterValue,MaxAmountFilterValue]);

    function fetchAllSystemStatuses() {
        fetch('http://10.0.3.2:4000/system/systemStatus')
        .then(response => response.json())
        .then(data => {
            console.log('system status: ', data);
            setSystemStatuses(data);
        })
    }

    function fetchWatchedTokenList() {
        fetch('http://10.0.3.2:4000/watchedTokenList')
        .then(response => response.json())
        .then(data => {
            console.log('watched token list: ', data);

            
            setWatchedTokenList(data);
            // setWatchedTokenList(data);
        })
    }

    useEffect(() => {
        if (watchedTokenList){
            console.log('watched token list: ', watchedTokenList);
            fetchTransactions(watchedTokenList[1].address, MinAmountFilterValue, MaxAmountFilterValue);
        }
    },[watchedTokenList]);


    useEffect(() => {
        if (updateFriendlyName){
            console.log('updating address '+RequestFriendlyLookup+' with manually defined Friendly Name: ', updateFriendlyName);
            updateAFriendlyName(RequestFriendlyLookup,updateFriendlyName);
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

    function updateAFriendlyName(address, friendlyName){
        
        console.log('updating address '+address+' with manually defined Friendly Name: ', friendlyName)
        

        fetch('http://10.0.3.2:4000/updateFN/'+address+'/'+friendlyName) //hacky way to do this. should be a post request but I ran into CORS issues and this was the quickest way to get it working
        .then(response => response.json())
        .then(data => {
            console.log('ok: ', data);
        });


    }



    function fetchAddressFilteredTransactions( viewingTokenAddress, clickedDetailsAddress ){
        fetch('http://10.0.3.2:4000/txs/' + viewingTokenAddress+'/'+clickedDetailsAddress)
        .then(response => response.json())
        .then(data => {
            console.log('filtered txs: ', data);
            setFilteredAddyData(data)
        })
    }
    
    function fetchFriendlyNameLookup( address ){
        fetch('http://10.0.3.2:4000/friendlyName/' + address)
        .then(response => response.json())
        .then(data => {
            console.log('looked up friendly name for address: ', address, 'result: ', data)
            if (data && data[0] && data[0].friendlyName){
                setFriendlyLookupResponse(data[0].friendlyName)
            }else {
                setFriendlyLookupResponse('no friendly name found')
            }
        })
    }



    function fetchChainDataHeartbeat(){
        fetch('http://10.0.3.2:4000/')
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
        const url = "http://10.0.3.2:4000/latestBlock/";
        fetch(url)
        .then(response => response.json())
        .then(data => {setlatestEthBlock(data)} )
    }


    function fetchTransactions( viewingTokenAddress , MinAmountFilterValue, MaxAmountFilterValue){ 
        if (!viewingTokenAddress){
            return;
        }
        console.log('viewingTokenAddress: ', viewingTokenAddress)
        
        let url = 'http://10.0.3.2:4000/txs/' + viewingTokenAddress + '?pageNumber=allData&filterMin='+MinAmountFilterValue+'&filterMax='+MaxAmountFilterValue;
        fetch(url)
        .then(response => response.json())
        .then(data => setData(data))
        
        let url2 = 'http://10.0.3.2:4000/txs/' + viewingTokenAddress + '?pageNumber=chart&filterMin='+MinAmountFilterValue+'&filterMax='+MaxAmountFilterValue;
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
        fetchWatchedTokenList();
        fetchAllSystemStatuses();
        fetchLatestBlockFromChain();
        fetchChainDataHeartbeat();
        

        setInterval(()=>{
            fetchAllSystemStatuses();
        }, 1000);

        setInterval(()=>{
            fetchChainDataHeartbeat();
            fetchLatestBlockFromChain();
        }, 10000);
    },[])


    useEffect(() => {
        if (viewingTokenAddress){
            console.log('watching new token: ', viewingTokenAddress);
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



    useEffect(() => {
        let checkedMinValue = 0;
        let checkedMaxValue = 0;
        if (dataChart && dataChart.result){
            settxDataChart(dataChart.result);
        }
    },[dataChart])


    useEffect(() => {
        // console.log('data.result: ', data.result);
        // if (MinAmountFilterValue || MaxAmountFilterValue) is defined then filter data only showing transactions that are between the two values
        let checkedMinValue = 0;
        let checkedMaxValue = 0;
        if (data && data.result){
            if (MinAmountFilterValue || MaxAmountFilterValue){
                console.log('MinAmountFilterValue: ', MinAmountFilterValue, ' MaxAmountFilterValue: ', MaxAmountFilterValue);
                if (!MinAmountFilterValue){ checkedMinValue = 0 } else { checkedMinValue = MinAmountFilterValue } 
                if (!MaxAmountFilterValue){ checkedMaxValue = 999999999 } else { checkedMaxValue = MaxAmountFilterValue } 
                const temp = data.result.filter((item) => {
                    if ((parseInt(item.value) / 10 ** 18) >= checkedMinValue && (parseInt(item.value) / 10 ** 18) <= checkedMaxValue){
                        return item;
                    }
                })
                console.log('SETTING FINAL TEMP: ', temp)
                settxData(temp);
            }else {
                console.log('SETTING FINAL UNFILTERED TEMP: ', data.result)
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