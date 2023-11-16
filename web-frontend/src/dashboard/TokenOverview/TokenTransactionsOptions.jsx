import React, {useContext} from 'react'
import AutoLookupTxLogsSlider from '../subcomponents/AutoLookupTxLogsSlider';
import {GeneralContext} from '../../App.js';


const TokenTransactionsOptions = () => {

    const {SummarizedTxsRequest, setSummarizedTxsRequest} = useContext(GeneralContext);

    function requestSummarizedTxs(TxArray) {
        if (TxArray && TxArray.length > 0) {

            // Create a Set to store unique transaction hashes
            const uniqueTransactionHashes = new Set();

            // Iterate over the array and add each transaction hash to the Set
            TxArray.forEach(tx => {
                uniqueTransactionHashes.add(tx.transaction_hash);
            });

            // Convert the Set to an array
            const uniqueTxArray = Array.from(uniqueTransactionHashes);

            console.log('UNIQUE tx_hashes from given array: ',uniqueTxArray)
            // Set the unique transaction hashes
            setSummarizedTxsRequest(uniqueTxArray);
        } else {
            console.log('malformed array provided as input');
        }
    }

    return (
        <div style={{paddingTop:'1vh', display:'flex', justifyContent:'center', alignItems:'center', position:'absolute', left:'0.95vw', top:'62vh', height:'35vh', width:'16vw', borderRadius:'0.25vw', border:'1px solid rgba(200,200,255,0.3'}}>
            <div style={{position:'absolute', top:'5%'}}>
                Options Panel
            </div>
            <div style={{display:'flex', alignItems:'center'}}>
                <div className="summarizeButton" onClick={()=>{requestSummarizedTxs(txData)}}>
                    Fetch TX events
                </div>  
                <div >
                    <AutoLookupTxLogsSlider /> 
                </div>
            </div>
        </div>
    )
}

export default TokenTransactionsOptions