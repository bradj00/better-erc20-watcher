import React, {useState, useContext, useEffect} from 'react'
import {GeneralContext} from '../App.js'



const DatabaseInfoGrabber = () => {
    // fetch data from api and store it in state
    const [data, setData] = useState(null)
    const {txData, settxData} = useContext(GeneralContext);
    const {getnewTxData, setgetnewTxData} = useContext(GeneralContext); //this is the trigger to get new data from the api. value is the address of the token
    

    //fetch result from the following URL http://10.0.3.2:4000/txs/0x1892f6ff5fbe11c31158f8c6f6f6e33106c5b10e
    function fetchTransactions(  ){
        fetch('http://10.0.3.2:4000/txs/0x1892f6ff5fbe11c31158f8c6f6f6e33106c5b10e')
        // fetch('http://10.0.3.2:4000/txs/0x0f5d2fb29fb7d3cfee444a200298f468908cc942')
        .then(response => response.json())
        .then(data => setData(data))

    }
    useEffect(() => {
        fetchTransactions()
        setInterval(()=>{
            fetchTransactions()
        }, 5000);
    },[])

    useEffect(() => {
        settxData(data)
    },[data])
    
    return (
        <>
        </>
    )
}

export default DatabaseInfoGrabber