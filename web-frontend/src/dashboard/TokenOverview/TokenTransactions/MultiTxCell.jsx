import React, { useState, useContext, useEffect } from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import ethLogo from '../../images/eth-logo.png';
import { getEllipsisTxt, commaNumber } from '../../helpers/h.js';
import { GeneralContext } from '../../../App.js';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import "../../../App.css"
import TagIcon from '@mui/icons-material/Tag';

const MultiTxCell = (props) => {
    const { uniqueContractAddresses, setUniqueContractAddresses } = useContext(GeneralContext);
    const { areAllMultiTxCellsLoaded, setareAllMultiTxCellsLoaded } = useContext(GeneralContext);
    const { cachedErc20TokenMetadata } = useContext(GeneralContext);
    const { addressTags } = useContext(GeneralContext);

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
    // console.log('TxHashDetailsObj: ',TxHashDetailsObj)
  },[TxHashDetailsObj]);

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

  const decodeUniswapLiquidityEvent = (log, logs) => {
    // Event Signatures
    const v2MintSignature = "<V2_Mint_Event_Signature>";
    const v2BurnSignature = "<V2_Burn_Event_Signature>";
    const v3IncreaseLiquiditySignature = "0x3067048beee31b25b2f1681f88dac838c8bba36af25bfb2b7cf7473a5847e35f";
    const v3DecreaseLiquiditySignature = "<V3_DecreaseLiquidity_Event_Signature>";
  
    switch (log.topics[0]) {
      case v2MintSignature:
        return {
          action: 'add',
          version: 'V2',
          sender: '0x' + log.topics[1].slice(26),
          amount0: parseInt(log.data.slice(0, 66), 16),
          amount1: parseInt('0x' + log.data.slice(66, 130), 16),
          pairAddress: log.address
        };
  
      case v2BurnSignature:
        return {
          action: 'remove',
          version: 'V2',
          sender: '0x' + log.topics[1].slice(26),
          amount0: parseInt(log.data.slice(0, 66), 16),
          amount1: parseInt('0x' + log.data.slice(66, 130), 16),
          pairAddress: log.address
        };
  
      case v3IncreaseLiquiditySignature:
        // console.log('ALL LOGS (v3 add): ',logs)
        const {token0Address, token1Address} = determineTokenAddresses(logs);

        return {
          action: 'add',
          version: 'V3',
          tokenId: parseInt(log.topics[1], 16),
          liquidity: parseInt(log.data.slice(0, 66), 16),
          amount0: parseInt(log.data.slice(66, 130), 16),
          amount1: parseInt('0x' + log.data.slice(130, 194), 16),
          token0Address,
          token1Address
        };
  
      case v3DecreaseLiquiditySignature:
        return {
          action: 'remove',
          version: 'V3',
          tokenId: parseInt(log.topics[1], 16),
          liquidity: parseInt(log.data.slice(0, 66), 16),
          amount0: parseInt(log.data.slice(66, 130), 16),
          amount1: parseInt('0x' + log.data.slice(130, 194), 16),
          poolAddress: log.address
        };
  
      default:
        return null;
    }
  };
  

  const determineTokenAddresses = (allLogs) => {
    let token0Address = null;
    let token1Address = null;
  
    // Event Signatures for token Transfer or other relevant events
    const transferEventSignature = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  
    for (const log of allLogs) {
      // Check if the log is a token Transfer event
      if (log.topics[0] === transferEventSignature) {
        // Assuming the token address is the log's address field
        const tokenAddress = log.address;
  
        // Assign token0Address and token1Address based on the order they appear
        if (!token0Address) {
          token0Address = tokenAddress;
        } else if (!token1Address && tokenAddress !== token0Address) {
          token1Address = tokenAddress;
          break; // Exit the loop once both addresses are found
        }
      }
    }
  
    // console.log('0: ', token0Address, '1: ',token1Address)
    return { token0Address, token1Address };
  };
  
  const formatAmount = (amount, tokenAddress) => {
    const decimals = cachedErc20TokenMetadata[tokenAddress]?.data.detail_platforms.ethereum.decimal_place || 18; // Default to 18 decimals if not specified
    return parseFloat(amount / Math.pow(10, decimals)).toFixed(3);
  };
  
  const getTokenSymbol = (tokenAddress) => {
    return cachedErc20TokenMetadata[tokenAddress]?.data.symbol || getEllipsisTxt(tokenAddress, 6);
  };





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


  const decodedUniswapEvents = transactionLogs
  .map(log => decodeUniswapLiquidityEvent(log, transactionLogs)) // Assuming you've implemented this function
  .filter(event => event !== null);
  
  // const uniswapLiquidityTable = decodedUniswapEvents.length > 0 ? (
  //   <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(100,100,255,0.3)', borderRadius: '5px', textAlign: 'center' }}>
  //     <table style={{ width: '100%' }}>
  //       <thead>
  //         <tr>
  //           <th>Liquidity Action</th>
  //           <th>{getTokenSymbol(decodedUniswapEvents[0].token0Address)}</th>
  //           <th>{getTokenSymbol(decodedUniswapEvents[0].token1Address)}</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         <tr>
  //           <td>{decodedUniswapEvents[0].action}</td>
  //           <td>{formatAmount(decodedUniswapEvents[0].amount0, decodedUniswapEvents[0].token0Address)}</td>
  //           <td>{formatAmount(decodedUniswapEvents[0].amount1, decodedUniswapEvents[0].token1Address)}</td>
  //         </tr>
  //       </tbody>
  //     </table>
  //   </div>
  // ) : <></>;
  
  
  









  return (
      

      
            <div className={decodedUniswapEvents.length > 0 ? "LiqAddCell" : "GenericContractCell"} style={{ position: 'relative',  backgroundColor: 'rgba(50,50,65,0.5)', borderRadius: '5px', padding: '0.5vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'right', width: '100%', height: '100%', marginBottom:'0.2vw', }}>


                <div className={decodedUniswapEvents.length > 0 ? "LiqAddTab" : "GenericContractTab"} style={{display:'flex', textAlign:'center', position:'absolute',top:'0',left:'0',width:'5vw',height:'2.7vh',color:'#fff', padding:'0.15vw', borderRadius:'0 0 0.15vw 0'}}>
                    &nbsp;{decodedUniswapEvents.length > 0 ? " +Liquidity" : "CONTRACT"}
                </div>

                <div title="transaction hash" style={{ position:'absolute', right:'0.25vw', top:'0.25vw',backgroundColor:'rgba(255,255,255,0.1)', padding:'0vw 0.25vw 0vw 0.25vw',borderRadius:'0.15vw' }}>
                    <span style={{ color: '#f55', fontSize: '0.8vw', display:'flex', alignItems:'center' }}>
                        <TagIcon /> 
                        <a href={`https://etherscan.io/tx/${props.row.transaction_hash}`} target="_blank"> {getEllipsisTxt(props.row.transaction_hash, 6)} </a> 
                    </span>
                </div>

                <div style={{backgroundColor:'rgba(255,255,255,0.1)',borderRadius:'0.25vw', position:'absolute', left:'0.25vw', top:'1.5vw', padding:'0.15vw', textAlign:'left',}}>
                    <div style={{}}>
                        <span style={{ color: '#f55', fontSize: '0.8vw' }}>Caller: &nbsp;</span>
                        <span style={{ float:'right', fontSize: '0.65vw' }}> <a target="_blank" href={"https://etherscan.io/address/"+initiatorAddress}>{CacheFriendlyLabels[initiatorAddress]?.manuallyDefined || getEllipsisTxt(initiatorAddress, 6)}</a></span>
                    </div>

                    <div style={{}}>
                        <span style={{ color: '#f55', fontSize: '0.8vw' }}>Contract: &nbsp;&nbsp;</span>
                        <span style={{float:'right',  fontSize: '0.65vw' }}> <a target="_blank" href={"https://etherscan.io/address/"+interactingWithContractAddress}>{CacheFriendlyLabels[interactingWithContractAddress]?.manuallyDefined || getEllipsisTxt(interactingWithContractAddress, 6)}</a></span>
                    </div>
                </div>

                <div title="1m ago. Block: 1234556"  style={{ display:'flex',alignItems:'center', position:'absolute', top:'1%', left:'5.5vw', backgroundColor:'rgba(255,255,255,0.1)', padding:'0vw 0.25vw 0vw 0.25vw',borderRadius:'0.15vw' }}>
                    <div style={{ color: 'rgba(250,250,0,0.8)', fontSize: '0.1vw' }}> <HistoryToggleOffIcon/> </div>
                    <div style={{ color: 'rgba(250,250,0,0.8)', fontSize: '0.4vw' }}>&nbsp;1m </div>
                </div>
                <div title="Ethereum TX"  style={{ display:'flex',alignItems:'center', position:'absolute', top:'1%', left:'8.5vw', backgroundColor:'rgba(255,255,255,0.1)', padding:'0vw 0.25vw 0vw 0.25vw',borderRadius:'0.15vw' }}>
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

                        const isInitiator = (address) => address.toLowerCase() === initiatorAddress.toLowerCase();


                        return (
                            <React.Fragment key={idx}>
                                <div style={{textAlign:'center'}}>
                                    {idx+1}
                                </div>
                                
                                {/* From Address */}
                                <div style={{ border: '0px solid #0f0' }}>
                                    {isInitiator(transfer.from) ? (
                                        <span style={{ color: 'cyan', fontWeight: 'bold' }}>
                                            {CacheFriendlyLabels[transfer.from]?.manuallyDefined || getEllipsisTxt(transfer.from, 6)}
                                        </span>
                                    ) : (
                                        <span style={{ color: addressTags[transfer.from]?.isUniswapV2Pool || addressTags[transfer.from]?.isUniswapV3Pool ? 'magenta' : 'inherit', textDecoration: addressTags[transfer.from]?.isUniswapV2Pool || addressTags[transfer.from]?.isUniswapV3Pool ? 'underline' : 'none' }}>
                                            {CacheFriendlyLabels[transfer.from]?.manuallyDefined || getEllipsisTxt(transfer.from, 6)}
                                        </span>
                                    )}
                                </div>

                                {/* To Address */}
                                <div>
                                    {isInitiator(transfer.to) ? (
                                        <span style={{ color: 'cyan', fontWeight: 'bold' }}>
                                            {CacheFriendlyLabels[transfer.to]?.manuallyDefined || getEllipsisTxt(transfer.to, 6)}
                                        </span>
                                    ) : (
                                        <span style={{ color: addressTags[transfer.to]?.isUniswapV2Pool || addressTags[transfer.to]?.isUniswapV3Pool ? 'magenta' : 'inherit', textDecoration: addressTags[transfer.to]?.isUniswapV2Pool || addressTags[transfer.to]?.isUniswapV3Pool ? 'underline' : 'none' }}>
                                            {CacheFriendlyLabels[transfer.to]?.manuallyDefined || getEllipsisTxt(transfer.to, 6)}
                                        </span>
                                    )}
                                </div>

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