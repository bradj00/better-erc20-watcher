import React, {useState, useContext, useEffect} from 'react'
import {GeneralContext} from '../App.js'



const DatabaseInfoGrabber = () => {
    // fetch data from api and store it in state
    const [data, setData] = useState(null)
    const [intervalQ, setintervalQ] = useState(null)
    const {txData, settxData} = useContext(GeneralContext);
    const {getnewTxData, setgetnewTxData} = useContext(GeneralContext); //this is the trigger to get new data from the api. value is the address of the token
    
    const {viewingTokenAddress, setviewingTokenAddress} = useContext(GeneralContext); //this is the address of the token we are viewing
    const {clickedDetailsAddress, setclickedDetailsAddress} = useContext(GeneralContext); //this is the address of the token we are viewing
    const {watchedTokenList, setWatchedTokenList} = useContext(GeneralContext); 

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
            fetchTransactions(watchedTokenList[1].address);
        }
    },[watchedTokenList]);


    //fetch result from the following URL http://10.0.3.2:4000/txs/0x1892f6ff5fbe11c31158f8c6f6f6e33106c5b10e
    function fetchTransactions( viewingTokenAddress ){
        fetch('http://10.0.3.2:4000/txs/' + viewingTokenAddress)
        // fetch('http://10.0.3.2:4000/txs/0x0f5d2fb29fb7d3cfee444a200298f468908cc942')
        .then(response => response.json())
        .then(data => setData(data))

    }
    useEffect(() => {
        fetchWatchedTokenList();
        // fetchTransactions();
        // setInterval(()=>{
        //     fetchTransactions()
        // }, 5000);
    },[])


    useEffect(() => {
        if (viewingTokenAddress){
            console.log('watching new token: ', viewingTokenAddress);
            //clear thisInterval
            clearInterval(intervalQ);

            fetchTransactions( viewingTokenAddress )
            //create a setInterval that we can clear later
            setintervalQ( setInterval(() => {
                fetchTransactions( viewingTokenAddress )
            }, 5000));

        }
    },[viewingTokenAddress])

    useEffect(() => {
        settxData(data)
    },[data])
    
    return (
        <>
        </>
    )
}

export default DatabaseInfoGrabber