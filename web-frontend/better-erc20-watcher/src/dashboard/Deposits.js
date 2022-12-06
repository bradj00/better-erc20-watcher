import React, {useContext, useEffect, useState} from 'react';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Title from './Title';
import {GeneralContext} from '../App.js'
import {commaNumber} from './helpers/h.js';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
TimeAgo.addDefaultLocale(en)

function preventDefault(event) {
  event.preventDefault();
}

export default function Deposits() {
  const {totalVolume, setTotalVolume} = useContext(GeneralContext);
  const timeAgo = new TimeAgo('en-US'); 

  const {txData, settxData} = useContext(GeneralContext);
  const {filteredtxData, setfilteredtxData} = useContext(GeneralContext);
  const {filteredtxDataInflow,   setfilteredtxDataInflow} = useContext(GeneralContext);
  const {filteredtxDataOutflow,  setfilteredtxDataOutflow} = useContext(GeneralContext);
  const {clickedDetailsAddressFN, setclickedDetailsAddressFN} = useContext(GeneralContext);
  
  return (
    <div style={{position:'absolute',textAlign:'center', height:'100%', border:'0px solid #ff0', width:'100%', userSelect:'none' }}>
    <React.Fragment>
      <Title><span style={{ fontSize:'3vh'}}>{clickedDetailsAddressFN? clickedDetailsAddressFN == 'Uniswap v3 Pool'? <>DEX Volume</> : <>Token Volume</>: <>Token Volume</>}</span></Title>
      
      <Typography component="p" variant="h4" >
        {totalVolume?  commaNumber(parseInt(totalVolume)) : '...'}
      </Typography>
{/*       
      <br></br>
      <br></br> */}
      {/* 2 divs here that span 50% each side by side */}
      <div style={{border:'0px solid #0f0', width:'100%',bottom:'3.5vh', height:'50%', position:'absolute', display:'flex', justifyContent:'center',alignItems:'center'}}>
        
      {clickedDetailsAddressFN? clickedDetailsAddressFN == 'Uniswap v3 Pool'?
      <>
        <div style={{width:'100%', marginTop:'6vh',}}>
          <div style={{border:'0px solid #0f0', width:'50%',color:'#0f0',fontSize:'1.5vh'}}>
            Buys
            <div style={{fontSize:'2vh'}}>
              {filteredtxDataOutflow? commaNumber(parseInt(filteredtxDataOutflow)) : '...'}
            </div>
          </div>
          <div style={{border:'0px solid #f00', width:'50%',color:'#f00',fontSize:'1.5vh'}}>
            Sells
            <div style={{fontSize:'2vh'}}>
              {filteredtxDataInflow? commaNumber(parseInt(filteredtxDataInflow)) : '...'}
            </div>
          </div>
        </div>
        <div style={{marginTop:'6vh',}}>
          <div style={{border:'0px solid #0f0', width:'100%',color:'#0ff',fontSize:'1.5vh'}}>
            +Liquidity
            <div style={{fontSize:'2vh'}}>
              {filteredtxDataOutflow? commaNumber(parseInt(filteredtxDataOutflow)) : '...'}
            </div>
          </div>
          <div style={{border:'0px solid #f00', width:'100%',color:'#f80',fontSize:'1.5vh'}}>
            -Liquidity
            <div style={{fontSize:'2vh'}}>
              {filteredtxDataInflow? commaNumber(parseInt(filteredtxDataInflow)) : '...'}
            </div>
          </div>
        </div>
      </>
      :
      <>
      <div style={{border:'0px solid #f00', width:'50%',color:'#0f0',fontSize:'2.5vh'}}>
        In-Flow
        <div style={{fontSize:'2vh'}}>
          {filteredtxDataInflow? commaNumber(parseInt(filteredtxDataInflow)) : '...'}
        </div>
      </div>

      <div style={{border:'0px solid #0f0', width:'50%',color:'#f00',fontSize:'2.5vh'}}>
        Out-Flow
        <div style={{fontSize:'2vh'}}>
          {filteredtxDataOutflow? commaNumber(parseInt(filteredtxDataOutflow)) : '...'}
        </div>
      </div>
      </>
      :
      <>
      <div style={{border:'0px solid #f00', width:'50%',color:'#0f0',fontSize:'2.5vh'}}>
        In-Flow
        <div style={{fontSize:'2vh'}}>
          {filteredtxDataInflow? commaNumber(parseInt(filteredtxDataInflow)) : '...'}
        </div>
      </div>

      <div style={{border:'0px solid #0f0', width:'50%',color:'#f00',fontSize:'2.5vh'}}>
        Out-Flow
        <div style={{fontSize:'2vh'}}>
          {filteredtxDataOutflow? commaNumber(parseInt(filteredtxDataOutflow)) : '...'}
        </div>
      </div>
      </>
      }

      </div>
      <div style={{border:'0px solid #0f0',position:'absolute', width:'100%',bottom:'-6%'}}>
        <Typography color="text.secondary" sx={{ flex: 1 }}  onClick={()=>{console.log(txData)}}>
          past {txData?txData[0]? txData[0].block_timestamp? (timeAgo.format(  new Date(txData[txData.length-1].block_timestamp), 'mini'  )) : <></>: <></>: <></>}
        </Typography>
      </div>
      <div>
        
        {/* <Link color="primary" href="#" variant="body2" onClick={preventDefault}>
          View balance
        </Link> */}
      </div>
    </React.Fragment>
    </div>
  );
}
