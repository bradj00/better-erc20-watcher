import React, { useState, useContext, useEffect } from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import ethLogo from '../../images/eth-logo.png';
import { getEllipsisTxt, commaNumber } from '../../helpers/h.js';
import { GeneralContext } from '../../../App.js';
import ToFromCell from '../../subcomponents/ToFromCell';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import "../../../App.css"
import TagIcon from '@mui/icons-material/Tag';

const MultiTxCell = (props) => {
    const { uniqueContractAddresses, setUniqueContractAddresses } = useContext(GeneralContext);
    const { areAllMultiTxCellsLoaded, setareAllMultiTxCellsLoaded } = useContext(GeneralContext);
    const { cachedErc20TokenMetadata } = useContext(GeneralContext);

  // Contexts
  const { clickedToken } = useContext(GeneralContext);
  const { rowClickMode, setrowClickMode } = useContext(GeneralContext);
  const { RequestFriendlyLookup, setRequestFriendlyLookup } = useContext(GeneralContext);
  const { TxHashDetailsObj } = useContext(GeneralContext);
  const { CacheFriendlyLabels } = useContext(GeneralContext);

  const transactionLogs = TxHashDetailsObj[props.row.transaction_hash]?.transactionData?.logs || [];
  const initiatorAddress = TxHashDetailsObj[props.row.transaction_hash]?.transactionData?.from || [];
  const interactingWithContractAddress = TxHashDetailsObj[props.row.transaction_hash]?.transactionData?.to || [];

  useEffect(() => {
    // Set the loading status of this cell to true when it mounts
    setareAllMultiTxCellsLoaded(prev => ({ ...prev, [props.row.transaction_hash]: true }));
  
    return () => {
      // Set the loading status of this cell to false when it unmounts
      setareAllMultiTxCellsLoaded(prev => ({ ...prev, [props.row.transaction_hash]: false }));
    };
  }, [setareAllMultiTxCellsLoaded, props.row.transaction_hash]);


//   useEffect(()=>{
//     if(uniqueContractAddresses){
//         console.log('uniqueContractAddresses: ',uniqueContractAddresses)
//     }
//   },[uniqueContractAddresses])

  // Process table click
  function processTableClicked(row, fromOrTo) {
    console.log('ROW: ', row, 'fromOrTo: ', fromOrTo);
    
    if (rowClickMode === 'edit') {
      if (fromOrTo === 'from') {
        setRequestFriendlyLookup(row.from_address);
      } else if (fromOrTo === 'to') {
        setRequestFriendlyLookup(row.to_address);
      }
    }
  }

  // Decode ERC20 Transfer
  const decodeERC20Transfer = (log) => {
    const transferEventSignature = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    if (log.topics[0] === transferEventSignature) {
      return {
        from: '0x' + log.topics[1].slice(26),
        to: '0x' + log.topics[2].slice(26),
        amount: parseInt(log.data, 16),
        contractAddress: log.address
      };
    }
    return null;
  };

  useEffect(() => {
    // Update unique contract addresses
    const newAddresses = transactionLogs.map(decodeERC20Transfer)
                                        .filter(transfer => transfer && transfer.contractAddress)
                                        .map(transfer => transfer.contractAddress);

    setUniqueContractAddresses(prevAddresses => {
        const allAddresses = new Set([...prevAddresses, ...newAddresses]);
        return Array.from(allAddresses);
    });
}, [transactionLogs, setUniqueContractAddresses]);


  const decodedERC20Transfers = transactionLogs
    .map(decodeERC20Transfer)
    .filter(transfer => transfer !== null); // Filter out non-transfer logs or undecodable logs

  return (
      

      
            <div style={{ position: 'relative',  backgroundColor: 'rgba(50,50,65,0.5)', borderRadius: '5px', padding: '0.5vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'right', width: '100%', border: '1px solid #660', height: '100%', marginBottom:'0.2vw', }}>

                <div style={{color:'#fff', backgroundColor:'rgba(100,255,100,0.3)',borderRadius:'0.25vw', position:'absolute', top:'3%', padding:'0.25vw 0.6vw 0.25vw 0.6vw', textAlign:'left',}}>
                    BUY    
                </div>
                {/* <div style={{color:'#fff', backgroundColor:'rgba(100,100,255,0.2)',borderRadius:'0.25vw', position:'absolute', top:'3%', padding:'0.25vw 0.6vw 0.25vw 0.6vw', textAlign:'left',}}>
                    GAME DEPOSIT    
                </div> */}
                {/* <div style={{color:'#fff', backgroundColor:'rgba(100,255,100,0.3)',borderRadius:'0.25vw', position:'absolute', top:'3%', padding:'0.25vw 0.6vw 0.25vw 0.6vw', textAlign:'left',}}>
                    STAKE  
                </div> */}


                <div style={{display:'flex', textAlign:'center', position:'absolute',top:'0',left:'0',width:'5%',height:'2.5vh',backgroundColor:'rgba(255,255,0,0.3)',color:'#fff', padding:'0.15vw', borderRadius:'0 0 0.15vw 0'}}>
                    &nbsp;CONTRACT
                </div>

                <div title="transaction hash" style={{ position:'absolute', right:'0.25vw', top:'0.25vw',backgroundColor:'rgba(255,255,255,0.1)', padding:'0vw 0.25vw 0vw 0.25vw',borderRadius:'0.15vw' }}>
                    <span style={{ color: '#f55', fontSize: '0.8vw', display:'flex', alignItems:'center' }}>
                        <TagIcon /> 
                        <a href={`https://etherscan.io/tx/${props.row.transaction_hash}`} target="_blank"> {getEllipsisTxt(props.row.transaction_hash, 6)} </a> 
                    </span>
                </div>

                <div style={{backgroundColor:'rgba(255,255,255,0.1)',borderRadius:'0.25vw', position:'absolute', left:'0.25%', top:'15%', padding:'0.15vw', textAlign:'left',}}>
                    <div style={{}}>
                        <span style={{ color: '#f55', fontSize: '0.8vw' }}>Caller: &nbsp;</span>
                        <span style={{ float:'right', fontSize: '0.65vw' }}> <a target="_blank" href={"https://etherscan.io/address/"+initiatorAddress}>{CacheFriendlyLabels[initiatorAddress]?.manuallyDefined || getEllipsisTxt(initiatorAddress, 6)}</a></span>
                    </div>

                    <div style={{}}>
                        <span style={{ color: '#f55', fontSize: '0.8vw' }}>Contract: &nbsp;&nbsp;</span>
                        <span style={{float:'right',  fontSize: '0.65vw' }}> <a target="_blank" href={"https://etherscan.io/address/"+interactingWithContractAddress}>{CacheFriendlyLabels[interactingWithContractAddress]?.manuallyDefined || getEllipsisTxt(interactingWithContractAddress, 6)}</a></span>
                    </div>
                </div>

                <div title="1m ago. Block: 1234556"  style={{ display:'flex',alignItems:'center', position:'absolute', top:'1%', left:'5.5%', backgroundColor:'rgba(255,255,255,0.1)', padding:'0vw 0.25vw 0vw 0.25vw',borderRadius:'0.15vw' }}>
                    <div style={{ color: 'rgba(250,250,0,0.8)', fontSize: '0.1vw' }}> <HistoryToggleOffIcon/> </div>
                    <div style={{ color: 'rgba(250,250,0,0.8)', fontSize: '0.4vw' }}>&nbsp;1m </div>
                </div>
                <div title="Ethereum TX"  style={{ display:'flex',alignItems:'center', position:'absolute', top:'1%', left:'9%', backgroundColor:'rgba(255,255,255,0.1)', padding:'0vw 0.25vw 0vw 0.25vw',borderRadius:'0.15vw' }}>
                    <div style={{ color: 'rgba(250,250,0,0.8)', fontSize: '0.1vw' }}> <img src={ethLogo} style={{display:'flex', justifyContent:'center',alignItems:'center',width:'1vw'}} alt="Ethereum Logo" /> </div>
                </div>



                <div style={{ display: 'grid', marginTop:'5.5vh', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0vw', width: '90%', fontSize:'0.7vw', color:'rgba(250,250,0,0.8)', letterSpacing:'0.05vw', alignSelf:'end', paddingBottom:'0.25vw'}}>
                    <div style={{ textAlign:'center', fontWeight: 'bold',textDecoration:'underline' }}>Order</div>
                    <div style={{ fontWeight: 'bold',textDecoration:'underline' }}>From</div>
                    <div style={{ fontWeight: 'bold',textDecoration:'underline' }}>To</div>
                    <div style={{ fontWeight: 'bold',textDecoration:'underline' }}>Amount</div>
                    <div style={{ fontWeight: 'bold',textDecoration:'underline' }}>Token</div>
                    <div style={{ fontWeight: 'bold',textDecoration:'underline' }}>USD</div>
                </div>

                <div style={{ border: '0px solid #0ff', width: '90%', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0vw', alignSelf:'end', }}>
                    {decodedERC20Transfers.map((transfer, idx) => {
                        const decimals = cachedErc20TokenMetadata[transfer.contractAddress]?.data.detail_platforms.ethereum.decimal_place || 18;
                        const adjustedAmount = transfer.amount / Math.pow(10, decimals);
                        const usdPrice = cachedErc20TokenMetadata[transfer.contractAddress]?.data.market_data.current_price.usd || 0;
                        const estimatedValue = (adjustedAmount * usdPrice).toFixed(2);

                        return (
                            <React.Fragment key={idx}>
                                <div style={{textAlign:'center'}}>
                                    {idx+1}
                                </div>
                                
                                {/* From Address */}
                                <div style={{ border: '0px solid #0f0' }}>{CacheFriendlyLabels[transfer.from]?.manuallyDefined || getEllipsisTxt(transfer.from, 6)}</div>

                                {/* To Address */}
                                <div>{CacheFriendlyLabels[transfer.to]?.manuallyDefined || getEllipsisTxt(transfer.to, 6)}</div>

                                

                                {/* Amount */}
                                <div>{adjustedAmount.toLocaleString()}</div>

                                {/* Token Symbol */}
                                <div style={{display:'flex', alignItems:'center', padding:'0 0 0.25vw 0'}}>
                                    {cachedErc20TokenMetadata[transfer.contractAddress]?.data.image.thumb &&
                                        <img src={cachedErc20TokenMetadata[transfer.contractAddress].data.image.thumb} alt="Token" />
                                    }&nbsp;
                                    {cachedErc20TokenMetadata[transfer.contractAddress]?.data.symbol.toUpperCase() || getEllipsisTxt(transfer.contractAddress, 6)}
                                </div>

                                {/* USD Value */}
                                <div style={{ color: '#0f0' }}>${commaNumber(estimatedValue)}</div>

                                
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
     


  )
}

export default MultiTxCell