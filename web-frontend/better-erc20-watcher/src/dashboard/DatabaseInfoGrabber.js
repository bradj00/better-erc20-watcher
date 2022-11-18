import React, {useState, useContext, useEffect} from 'react'
import {GeneralContext} from '../App.js'



const DatabaseInfoGrabber = () => {
    // fetch data from api and store it in state
    const [data, setData] = useState(null)
    const {txData, settxData} = useContext(GeneralContext);
    
    //fetch result from the following URL http://10.0.3.2:4000/txs/0x1892f6ff5fbe11c31158f8c6f6f6e33106c5b10e
    function fetchTransactions(){
        fetch('http://10.0.3.2:4000/txs/0x1892f6ff5fbe11c31158f8c6f6f6e33106c5b10e')
        .then(response => response.json())
        .then(data => setData(data))

    }
    useEffect(() => {
        fetchTransactions()
    },[])

    useEffect(() => {
        console.log('data: ', data);
        settxData(data)
    },[data])
    
    return (
        <>
        </>
    )
}

export default DatabaseInfoGrabber