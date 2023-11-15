import React, { useContext } from 'react';
import ethLogo from '../../images/eth-logo.png';
import { getEllipsisTxt, commaNumber } from '../../helpers/h.js';
import { GeneralContext } from '../../../App.js';
import TagIcon from '@mui/icons-material/Tag'; // Ensure you have imported this icon
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff'; // Ensure you have imported this icon

const RegularCell = (props) => {
  const { row } = props;
  const { clickedToken } = useContext(GeneralContext);
  const { addressTags } = useContext(GeneralContext); 
  const { elderCount } = useContext(GeneralContext); 
  const { CacheFriendlyLabels } = useContext(GeneralContext);

  const tokenDecimals = clickedToken?.data?.detail_platforms?.ethereum?.decimal_place || 18;
  const tokenPriceUSD = clickedToken?.data?.data?.market_data?.current_price?.usd || 0;

  const adjustedValue = props.row.value / (10 ** clickedToken.data.data["detail_platforms"].ethereum["decimal_place"]);
  const formattedValue = commaNumber(adjustedValue.toFixed(4));
  const estimatedValueUSD = commaNumber(parseFloat(adjustedValue * tokenPriceUSD).toFixed(2));


  const getElderRank = (address) => {
    return addressTags[address]?.ElderRank || 'N/A';
  };
  
  const getElderRankPercent = (address) => {
    const elderRank = getElderRank(address);
    if (!isNaN(elderRank) && elderCount) {
      let percent = (elderRank / elderCount) * 100;
      // Clamp the percentage between 10% and 90%
      percent = Math.max(10, Math.min(percent, 90));
      return percent;
    }
    return 0;
  };
  
  const ElderRankIndicator = ({ address }) => {
    const elderRank = getElderRank(address);
    const isNA = elderRank === 'N/A';
  
    const indicatorStyle = {
      width: isNA ? '100%' : `${getElderRankPercent(address)}%`,
      backgroundColor: isNA ? 'cyan' : 'green',
      height: '5px',
      borderRadius: '2px',
    };
  
    return (
      <div style={{ width: '33%', backgroundColor: '#ddd', borderRadius: '2px', marginTop: '2px', marginBottom: '2px' }}>
        <div style={indicatorStyle}></div>
      </div>
    );
  };
  

  return (
    <div style={{ position: 'relative',  backgroundColor: 'rgba(50,50,65,0.5)', borderRadius: '5px', padding: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'right', width: '100%', border: '1px solid rgba(100,10,60,0.6)', marginBottom:'0.2vw', }}>
      <div style={{display:'flex', justifyContent:'center', textAlign:'center', position:'absolute',top:'0',left:'0',width:'5%',height:'2.7vh',backgroundColor:'rgba(100,10,60,0.3)',color:'#fff', padding:'0.15vw', borderRadius:'0 0 0.15vw 0'}}>
        P2P
      </div>

      <div style={{ position:'absolute', left:'12%', top:'2%', border:'0px solid #0f0', height:'100%', width:'2%'}}>
          <div ><img style={{width:'100%'}} src={clickedToken && clickedToken.data.data.image.small? clickedToken.data.data.image.small : tokenImage } /></div>
          <div style={{position:'absolute', bottom:'1%', fontSize:'0.5vw', textAlign:'center'}}>GROK</div>
      </div>

      <div title="transaction hash" style={{ position:'absolute', right:'0.25vw', top:'0.25vw',backgroundColor:'rgba(255,255,255,0.1)', padding:'0vw 0.25vw 0vw 0.25vw',borderRadius:'0.15vw' }}>
        <span style={{ color: '#f55', fontSize: '0.8vw', display:'flex', alignItems:'center' }}>
          <TagIcon />
          <a href={`https://etherscan.io/tx/${row.transaction_hash}`} target="_blank" rel="noopener noreferrer"> {getEllipsisTxt(row.transaction_hash, 6)} </a>
        </span>
      </div>
      <div title={`${row.timeAgo} ago. Block: ${row.block_number}`} style={{ display:'flex',alignItems:'center', position:'absolute', top:'1%', left:'5.5%', backgroundColor:'rgba(255,255,255,0.1)', padding:'0vw 0.25vw 0vw 0.25vw',borderRadius:'0.15vw' }}>
        <HistoryToggleOffIcon style={{ color: 'rgba(250,250,0,0.8)', fontSize: '0.8vw' }} />
        <span style={{ color: 'rgba(250,250,0,0.8)', fontSize: '0.8vw' }}>{row.timeAgo}</span>
      </div>
      <div title="Ethereum TX" style={{ display:'flex',alignItems:'center', position:'absolute', top:'1%', left:'9%', backgroundColor:'rgba(255,255,255,0.1)', padding:'0vw 0.25vw 0vw 0.25vw',borderRadius:'0.15vw' }}>
        <img src={ethLogo} style={{width:'1vw'}} alt="Ethereum Logo" />
      </div>

       {/* Header section with Block, From, To, etc. */}
       <div style={{ display: 'grid', marginTop: '0', marginBottom:'0.1vw', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0vw', width: '90%', fontSize: '0.7vw', color: 'rgba(250,250,0,0.8)', alignSelf: 'end', paddingBottom: '0.25vw' }}>
        <div></div>
        <div style={{ textDecoration: 'underline', fontSize:'0.5vw' }}>From</div>
        <div style={{ textDecoration: 'underline', fontSize:'0.5vw' }}>To</div>
        <div style={{ textDecoration: 'underline', fontSize:'0.5vw' }}>Amount</div>
        <div style={{ textDecoration: 'underline', fontSize:'0.5vw' }}>USD</div>
      </div>

      {/* Transaction Details */}
      <div style={{ width: '90%', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0vw', alignSelf: 'end', }}>
        {/* <div style={{ textAlign: 'center' }}>
          {commaNumber(row.block_number)}
        </div> */}
        <div></div>

        <div>
          {/* Display manuallyDefined label or truncated address */}
          {CacheFriendlyLabels[row.from_address]?.manuallyDefined || getEllipsisTxt(row.from_address, 6)}
          <ElderRankIndicator address={row.from_address} />
        </div>
        <div>
          {/* Display manuallyDefined label or truncated address */}
          {CacheFriendlyLabels[row.to_address]?.manuallyDefined || getEllipsisTxt(row.to_address, 6)}
          <ElderRankIndicator address={row.to_address} />
        </div>


        <div>{formattedValue}</div>
        <div>${estimatedValueUSD}</div>
      </div>
    </div>
      );
    };

    export default RegularCell;