import React, { useState, useContext, useEffect } from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import ethLogo from '../../images/eth-logo.png';
import { getEllipsisTxt, commaNumber } from '../../helpers/h.js';
import { GeneralContext } from '../../../App.js';
import ToFromCell from '../../subcomponents/ToFromCell';

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
    <TableRow className={props.rowAge > 100 ? "rowHover" : "transactionRow"} style={{ fontSize: '3vw', backgroundColor:'rgba(0,0,0,0)', }}>
      <TableCell align="right" style={{ fontSize:'1vw' }}>
        <img src={ethLogo} style={{display:'flex', justifyContent:'center',alignItems:'center',width:'1vw'}} alt="Ethereum Logo" />
      </TableCell>
      <TableCell align="right" style={{fontSize:'1vw'}}>
        {commaNumber(props.row['block_number'])}
      </TableCell> 
      <TableCell align="right" title={props.row.block_timestamp} style={{fontSize:'1vw'}}>
        {props.timeAgo.format(new Date(props.row.block_timestamp),'mini')}
      </TableCell>

      
      <TableCell colSpan={3} style={{ padding: '0.25vw' }}>
            <div style={{ position: 'relative', zIndex: '-1', backgroundColor: 'rgba(50,50,60,0.7)', borderRadius: '5px', padding: '0.5vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', border: '1px solid #660', height: '100%' }}>

                {/* Contract Caller at Top-Left */}
                <div style={{ alignSelf: 'flex-start', marginBottom: '1vw' }}>
                    <span style={{ color: '#f55', fontSize: '0.7vw' }}>Contract Caller: &nbsp;</span>
                    <span>{CacheFriendlyLabels[initiatorAddress]?.manuallyDefined || getEllipsisTxt(initiatorAddress, 6)}</span>
                </div>

                {/* Grid Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0vw', width: '100%', fontSize:'0.7vw', color:'rgba(200,50,50,0.8)', letterSpacing:'0.05vw'  }}>
                    <div style={{ textAlign:'center', fontWeight: 'bold',textDecoration:'underline' }}>Order</div>
                    <div style={{ fontWeight: 'bold',textDecoration:'underline' }}>From</div>
                    <div style={{ fontWeight: 'bold',textDecoration:'underline' }}>To</div>
                    <div style={{ fontWeight: 'bold',textDecoration:'underline' }}>USD</div>
                    <div style={{ fontWeight: 'bold',textDecoration:'underline' }}>Amount</div>
                    <div style={{ fontWeight: 'bold',textDecoration:'underline' }}>Token</div>
                    {/* <div style={{ fontWeight: 'bold',textDecoration:'underline' }}>Logo</div> */}
                </div>

                {/* 6-Column Grid Layout */}
                <div style={{ border: '0px solid #0ff', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0vw' }}>
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
        </TableCell>




      <TableCell align="right" style={{fontSize:'1vw'}}>
        <a href={`https://etherscan.io/tx/${props.row.transaction_hash}`} target="_blank" rel="noopener noreferrer">
            {getEllipsisTxt(props.row.transaction_hash, 6)}
        </a> 
      </TableCell>
      <TableCell align="right">
      1
      </TableCell>
      <TableCell align="right">
      1
      </TableCell>


      <TableCell align="right">
      1
      </TableCell>

    </TableRow>
  )
}

export default MultiTxCell