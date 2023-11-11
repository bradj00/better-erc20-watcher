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
            <div style={{ backgroundColor: 'rgba(150,150,150,0.2)', borderRadius:'5px', padding: '0.5vw', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {/* Column 1 - From Addresses */}
                <div>
                    {decodedERC20Transfers.map((transfer, idx) => (
                        <div key={idx}>
                            {idx === 0 && (
                                <div style={{ position:'relative', height: '1.5em', width:'100%', display:'flex', justifyContent:'center', fontSize:'0.7vw' }}>
                                    <div style={{ color: '#f55', position:'absolute', left:'5%', fontSize:'0.5vw' }}>Contract Caller:</div>
                                    <div>{CacheFriendlyLabels[initiatorAddress]?.manuallyDefined || getEllipsisTxt(initiatorAddress, 6)}</div>
                                </div>
                            )}
                            <div>
                                <span style={{ color:'rgba(150,150,250,0.8)', marginLeft:'2vw' }}>{idx+1}.&nbsp;</span>
                                <span style={{ color: '#999', display: 'inline-block' }}>From:&nbsp;</span>
                                {CacheFriendlyLabels[transfer.from]?.manuallyDefined || getEllipsisTxt(transfer.from, 6)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Column 2 - To Addresses */}
                <div>
                    {decodedERC20Transfers.map((transfer, idx) => (
                        <div key={idx} >
                            {idx === 0 && <div style={{ height: '1.5em' }}></div>} {/* Spacer for alignment */}
                            <div>
                                <span style={{ color: '#999' }}>To:</span>
                                {CacheFriendlyLabels[transfer.to]?.manuallyDefined || getEllipsisTxt(transfer.to, 6)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Column 3 - Transfer Details */}
                <div>
                    {decodedERC20Transfers.map((transfer, idx) => {
                        const decimals = cachedErc20TokenMetadata[transfer.contractAddress]?.data.detail_platforms.ethereum.decimal_place || 18;
                        const adjustedAmount = transfer.amount / Math.pow(10, decimals);
                        const usdPrice = cachedErc20TokenMetadata[transfer.contractAddress]?.data.market_data.current_price.usd || 0;
                        const estimatedValue = (adjustedAmount * usdPrice).toFixed(2);

                        return (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center' }}>
                                {idx === 0 && <div style={{ gridColumn: '1 / -1', height: '1.5em' }}></div>} {/* Spacer */}
                                <div style={{ textAlign: 'right' }}>{adjustedAmount.toLocaleString()}</div>
                                <div style={{ textAlign: 'right', color: '#0f0' }}>${commaNumber(estimatedValue)}</div>
                                <div style={{ textAlign: 'right' }}>
                                    {cachedErc20TokenMetadata[transfer.contractAddress]
                                        ? cachedErc20TokenMetadata[transfer.contractAddress].data.symbol.toUpperCase()
                                        : getEllipsisTxt(transfer.contractAddress, 6)}
                                    {cachedErc20TokenMetadata[transfer.contractAddress]?.data.image.thumb &&
                                        <img style={{ marginLeft: '1vw' }} src={cachedErc20TokenMetadata[transfer.contractAddress].data.image.thumb} alt="Token" />
                                    }
                                </div>
                            </div>
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