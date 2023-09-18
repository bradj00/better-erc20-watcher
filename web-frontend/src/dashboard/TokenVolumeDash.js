import React, {useContext, useEffect, useState} from 'react';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Title from './Title';
import {GeneralContext} from '../App.js'
import {commaNumber} from './helpers/h.js';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
// TimeAgo.addDefaultLocale(en)

function preventDefault(event) {
  event.preventDefault();
}

export default function TokenVolumeDash() {
  const {totalVolume, setTotalVolume} = useContext(GeneralContext);
  const timeAgo = new TimeAgo('en-US'); 

  const {txData, settxData} = useContext(GeneralContext);
  const {filteredtxData, setfilteredtxData} = useContext(GeneralContext);
  const {filteredtxDataInflow,   setfilteredtxDataInflow} = useContext(GeneralContext);
  const {filteredtxDataOutflow,  setfilteredtxDataOutflow} = useContext(GeneralContext);
  const {clickedDetailsAddressFN, setclickedDetailsAddressFN} = useContext(GeneralContext);
  
  return (
    <div style={{position:'absolute',textAlign:'center', height:'100%', border:'0px solid #ff0', width:'100%',  }}>
    <React.Fragment>
      <Title><span style={{ fontSize:'3vh'}}>{clickedDetailsAddressFN? clickedDetailsAddressFN == 'Uniswap v3 Pool'? <>DEX Volume</> : <>Token Volume</>: <>Token Volume</>}</span></Title>
      
      {/* <Typography component="p" variant="h4" > */}
        <div style={{fontSize:'2vw'}}>
        {totalVolume?  commaNumber(parseInt(totalVolume)) : '...'}
        </div>
      {/* </Typography> */}
{/*       
      <br></br>
      <br></br> */}
      {/* 2 divs here that span 50% each side by side */}
      <div style={{border:'0px solid #0f0',  width:'100%',bottom:'3.5vh', height:'50%', position:'absolute', display:'flex', justifyContent:'center',alignItems:'center'}}>
        
        {clickedDetailsAddressFN? clickedDetailsAddressFN == 'Uniswap v3 Pool'?
        <>
          <div style={{width:'70%', marginTop:'0vh',}}>
            <div style={{border:'0px solid #0f0', width:'40%',color:'#0f0',fontSize:'1.5vh'}}>
              Buys
              <div style={{fontSize:'2vh'}}>
                {filteredtxDataOutflow? commaNumber(parseInt(filteredtxDataOutflow)) : '...'}
              </div>
            </div>
            <div style={{border:'0px solid #f00', width:'40%',color:'#f00',fontSize:'1.5vh'}}>
              Sells
              <div style={{fontSize:'2vh'}}>
                {filteredtxDataInflow? commaNumber(parseInt(filteredtxDataInflow)) : '...'}
              </div>
            </div>
          </div>
          <div style={{marginTop:'0vh',}}>
            <div style={{border:'0px solid #ff0', color:'#0ff',fontSize:'1.5vh'}}>
              +Liquidity
              <div style={{fontSize:'2vh'}}>
                {filteredtxDataOutflow? commaNumber(parseInt(filteredtxDataOutflow)) : '...'}
              </div>
            </div>
            <div style={{border:'0px solid #f00', color:'#f80',fontSize:'1.5vh'}}>
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



      <div style={{border:'0px solid #0f0',position:'absolute', width:'100%',top:'75%'}}>
        <div onClick={()=>{console.log(txData)}}>
          past {txData?txData[0]? txData[0].block_timestamp? (timeAgo.format(  new Date(txData[txData.length-1].block_timestamp), 'mini'  )) : <></>: <></>: <></>}
        </div>
      </div>

    </React.Fragment>
    </div>
  );
}
