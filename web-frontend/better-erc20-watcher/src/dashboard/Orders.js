import React, { useContext, useEffect, useState } from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import ethLogo from './images/eth-logo.png';
import PoolIcon from '@mui/icons-material/Pool';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import ToFromCell from './subcomponents/ToFromCell';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

import '../App.css';
import "react-toggle/style.css"


import useSound from 'use-sound';
import boopSfx from './sounds/ping.mp3';


import {GeneralContext} from '../App.js';
import {getEllipsisTxt, commaNumber} from './helpers/h.js';

import engStrings from 'react-timeago/lib/language-strings/en'
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'

const formatter = buildFormatter(engStrings)
TimeAgo.addDefaultLocale(en)


function preventDefault(event) {
  event.preventDefault();
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}


export default function Orders() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [play] = useSound(boopSfx);
  const [oldtxData, setOldtxData] = useState([]);
  const [expandTxView, setexpandTxView] = useState(false);
  const {txData, settxData} = useContext(GeneralContext);
  const {audioEnabled, setAudioEnabled} = React.useContext(GeneralContext);
  const {clickedDetailsAddress, setclickedDetailsAddress} = useContext(GeneralContext); //this is the address of the token we are viewing
  const {clickedDetailsAddressFN, setclickedDetailsAddressFN} = useContext(GeneralContext); //this is the address of the token we are viewing
  const {filteredtxData, setfilteredtxData} = useContext(GeneralContext);
  const {heldTokensSelectedAddress, setheldTokensSelectedAddress} = useContext(GeneralContext);
  const {RequestFriendlyLookup, setRequestFriendlyLookup} = useContext(GeneralContext);
  const {friendlyLookupResponse, setFriendlyLookupResponse} = useContext(GeneralContext);

  const {rowClickMode, setrowClickMode} = useContext(GeneralContext);

  const {filteredtxDataInflow,   setfilteredtxDataInflow} = useContext(GeneralContext);
  const {filteredtxDataOutflow, setfilteredtxDataOutflow} = useContext(GeneralContext);
  const {displayPanel, setdisplayPanel} = useContext(GeneralContext); 

  
  useEffect(() => {
    setTimeout(()=>{
      // console.log('update');
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
  },[currentTime])

  useEffect(() => {
    // console.log('filteredtxData: ',filteredtxData)
    
    if (filteredtxData && filteredtxData.length > 0) {
      let tempInflow = 0
      let tempOutflows = 0

      for (let i = 0; i < filteredtxData.length; i++) {
        if (filteredtxData[i].to_address === clickedDetailsAddress) {
          tempInflow += ((filteredtxData[i].value) / (10 ** 18))
        } else {
          tempOutflows += ((filteredtxData[i].value) / (10 ** 18))
        }
      }
      setfilteredtxDataInflow(tempInflow)
      setfilteredtxDataOutflow(tempOutflows)
    }
    
      

  },[filteredtxData])

  useEffect(() => {
    if (txData !== null){

      if (oldtxData && oldtxData[0] && oldtxData.length>0 && txData[0] && (txData[0].transaction_hash != oldtxData[0].transaction_hash)){
        // console.log('new data: ', txData, oldtxData);
        if (audioEnabled){play();}

      }else {
        // console.log('no new data');
        // console.log('txData: ', txData);
      }
      setOldtxData(txData);
    }
  },[txData])

  function processTableClicked(row, fromOrTo){
    console.log('ROW: ', row, 'fromOrTo: ', fromOrTo)
    
    if (rowClickMode == 'edit'){
      if (fromOrTo == 'from'){
        setRequestFriendlyLookup(row.from_address)
      }
      else if (fromOrTo == 'to'){
        setRequestFriendlyLookup(row.to_address)
      }

    }
    else if (rowClickMode == 'filter'){
      if (fromOrTo == 'from'){
        setclickedDetailsAddress(row.from_address)
        setclickedDetailsAddressFN(displayAddressFN(row.from_address_friendlyName))
      }
      else if (fromOrTo == 'to'){
        setclickedDetailsAddress(row.to_address)
        setclickedDetailsAddressFN(displayAddressFN(row.to_address_friendlyName))
      }
    }
    else if (rowClickMode == 'summary'){
      if (fromOrTo == 'from'){
        setheldTokensSelectedAddress(row.from_address)
      }
      else if (fromOrTo == 'to'){
        setheldTokensSelectedAddress(row.to_address)
      }
      
      setdisplayPanel('addressSummary');
    }

    // 
  }

  function determineRowColor(row){
    if (row == null || row == undefined){return 'rgba(0, 0, 0, 1)'}
    // if ( typeof row.to_address_FriendlyName === 'object' && row.to_address_FriendlyName == null ) { return 'rgba(0, 0, 0, 1)'}
    // if ( typeof row.from_address_FriendlyName === 'object' && row.from_address_FriendlyName == null ) { return 'rgba(0, 0, 0, 1)'}
    if (  row.from_address_friendlyName.manuallyDefined == "Uniswap v3 Pool") {
      return 'rgba(0, 70, 0, 0.6)'
    } 
    else if (  row.to_address_friendlyName.manuallyDefined == "Uniswap v3 Pool") {
      return 'rgba(70, 0, 0, 0.6)'
    } 
    else return 'rgba(0, 0, 0, 0.1)'
  }

  function determineShowPoolLink(row){
    if (row == null || row == undefined){return false}
    if (  row.from_address_friendlyName.manuallyDefined == "Uniswap v3 Pool") {
      return true
    } 
    else if (  row.to_address_friendlyName.manuallyDefined == "Uniswap v3 Pool") {
      return true
    } 
    else return false
  
   
  }
  function getUniSwapPoolAddy(row){
    if (row == null || row == undefined){return false}
    if (  row.from_address_friendlyName.manuallyDefined == "Uniswap v3 Pool") {
      return row.from_address
    } 
    else if (  row.to_address_friendlyName.manuallyDefined == "Uniswap v3 Pool") {
      return row.to_address
    } 
    else return false
  }

  
  const displayAddressFN = (clickedDetailsAddressFN) => {
    if (clickedDetailsAddressFN === null || clickedDetailsAddressFN == undefined) {return 'null'}
    let firstAddress;
    Object.keys(clickedDetailsAddressFN).map(key => {
      if (key !== '_id' && key !== 'ENS' && key !== 'address' && ( typeof clickedDetailsAddressFN[key] === 'string' && !clickedDetailsAddressFN[key].startsWith('0x') ) ) {
        firstAddress = clickedDetailsAddressFN[key];
        return;
      }
      else if (key === 'ENS' && Array.isArray(clickedDetailsAddressFN[key])) {
        firstAddress = clickedDetailsAddressFN[key][0];
        return;
      }
      else if (key === 'address') {
        firstAddress = getEllipsisTxt(clickedDetailsAddressFN[key], 6);
        return;
      }
    });
    return firstAddress;
  }


  return (
    <>
    {/* <React.Fragment> */}
      <Title>Transactions</Title>
      
     

      <div  style={{border:'1px solid rgba(255,255,255,0.2)', borderRadius:'0.5vh', padding:'0.2vw', overflowY:'scroll', width:'100%', height:expandTxView? 'auto':'44vh', cursor:'pointer'}}>
        <div style={{position:'absolute', top:'-1vh',left:'7%',width:'40%',border:'0px solid #0f0'}}>
          <div title="click an address to filter TXs" className={rowClickMode!='filter'?"txClickModeHover":""} onClick={()=>{ setrowClickMode('filter') }} style={{position:'absolute', zIndex:'9999', left:'15%',   padding:'0.5vh'}}> 
            <FilterListIcon style={{fontSize:'1.5vw',}}/>
          </div>
          <div title="click an address to edit friendly-name" className={rowClickMode!='edit'?"txClickModeHover":""} onClick={()=>{ setrowClickMode('edit') }} style={{position:'absolute',  zIndex:'9999', left:'22%', padding:'0.5vh'}}> 
            <EditIcon style={{fontSize:'1.5vw',}}/>
          </div>
          <div title="click an address to view its summary" className={rowClickMode!='summary'?"txClickModeHover":""} onClick={()=>{ setrowClickMode('summary') }} style={{position:'absolute',  zIndex:'9999', left:'29%', padding:'0.5vh'}}> 
            <PersonIcon style={{fontSize:'1.5vw',}}/>
          </div>
        </div>
        <Table size="small" >
          <TableHead style={{position:'sticky',top:'0',backgroundColor:'rgba(50,50,60,1)'}}>
            
            

            <TableRow>
              <TableCell >chain</TableCell>
              <TableCell align="left">amount</TableCell>
              <TableCell>age</TableCell>
              <TableCell>from</TableCell>
              <TableCell>to</TableCell>
              <TableCell>tx hash</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!filteredtxData? txData? txData.map((row, index) => {
              const rowAge = ((new Date().getTime() - new Date(row.block_timestamp).getTime()) / 1000 );
              // console.log(parseInt(rowAge)+' seconds old');
              const timeAgo = new TimeAgo('en-US')
              // console.log('from: ', row.from_address_friendlyName, 'to: ', row.to_address_friendlyName)
              return(
                
                // <TableRow className={rowAge > 100? "rowHover": "transactionRow"} style={{fontSize:'3vw', backgroundColor: row.transaction_hash? 'rgba('+(parseInt(row.transaction_hash.substr(0,4), 16) %  30)+', '+(parseInt(row.transaction_hash.substr(5,10), 16) %  30)+', '+(parseInt(row.transaction_hash.substr(12,19), 16) %  30)+', 1)' :'rgba(0,0,0,0)'}} key={index}>
                <TableRow className={rowAge > 100? "rowHover": "transactionRow"} style={{fontSize:'3vw', backgroundColor: row.transaction_hash? determineRowColor(row) :'rgba(0,0,0,0)'}} key={index}>
                  <TableCell align="left" style={{ fontSize:'1vw', }}> <img src={ethLogo? ethLogo : <></>} style={{display:'flex', justifyContent:'center',alignItems:'center',width:'1vw'}} ></img> </TableCell> 
                  <TableCell align="left" style={{fontSize:'1vw', }}>{commaNumber(parseFloat(row.value / (10**18)).toFixed(4))}</TableCell> 
                  {/* <TableCell style={{fontSize:'1vw', }}><TimeAgo date={row.block_timestamp} formatter={formatter} /></TableCell> */}
                  <TableCell title={row.block_timestamp} style={{fontSize:'1vw', }}> {timeAgo.format(new Date(row.block_timestamp),'mini') } </TableCell>
                  <TableCell style={{fontSize:'1vw',color: "#aaa"}}  onClick={ ()=>{processTableClicked(row, 'from')} }>   <ToFromCell row={row} toFrom={'from'}  clickMode={rowClickMode}/>   </TableCell>
                  <TableCell style={{fontSize:'1vw',color: "#aaa"}}      onClick={ ()=>{processTableClicked(row, 'to') }}> <ToFromCell row={row} toFrom={'to'}    clickMode={rowClickMode}/>   </TableCell>
                  <TableCell style={{fontSize:'1vw',}}><a href={"https://etherscan.io/tx/"+row.transaction_hash} target="blank"> {getEllipsisTxt(row.transaction_hash, 6)} </a> {determineShowPoolLink(row)? <div title="explore pool on UniSwap"  style={{float:'right', right:'0', top:'0'}}> <a target="_blank" className="PoolLinkHover" href={`https://info.uniswap.org/#/pools/`+getUniSwapPoolAddy(row)}> <PoolIcon /> </a> </div> : <></>} </TableCell>
                </TableRow>
                
              )})
            : <></>
          :
          filteredtxData && filteredtxData.length > 0? filteredtxData.map((row, index) => {
            const rowAge = ((new Date().getTime() - new Date(row.block_timestamp).getTime()) / 1000 );
            // console.log(parseInt(rowAge)+' seconds old');
              const timeAgo = new TimeAgo('en-US')
              
            
            return(

              <TableRow className={rowAge > 100? "": "transactionRow"} style={{fontSize:'3vw', backgroundColor: row.transaction_hash? determineRowColor(row) :'rgba(0,0,0,0)'}} key={index}>
                <TableCell align="left" style={{ fontSize:'1vw', }}> <img src={ethLogo? ethLogo : <></>} style={{display:'flex', justifyContent:'center',alignItems:'center',width:'1vw'}} ></img> </TableCell> 
                <TableCell align="left" style={{fontSize:'1vw', }}>{commaNumber(parseFloat(row.value / (10**18)).toFixed(4))}</TableCell> 
                <TableCell title={row.block_timestamp} style={{fontSize:'1vw', }}> {timeAgo.format(new Date(row.block_timestamp),'mini') } </TableCell>
                <TableCell style={{fontSize:'1vw',color: "white"}}  onClick={ ()=>{processTableClicked(row, 'from') } }>{((row.from_address_friendlyName == undefined) || (row.from_address_friendlyName == "0x000"))? getEllipsisTxt(row.from_address, 6): Object.entries(row.from_address_friendlyName).find(([key, value]) => key !== '_id' && key !== 'address'&& key !== 'ENS' && !value.startsWith('0x')) ? Object.entries(row.from_address_friendlyName).find(([key, value]) => key !== '_id' && typeof value === 'string' && !value.startsWith('0x'))? Object.entries(row.from_address_friendlyName).find(([key, value]) => key !== '_id' && typeof value === 'string' && !value.startsWith('0x'))[1] : getEllipsisTxt(row.from_address_friendlyName.address,6): getEllipsisTxt(row.from_address_friendlyName.address,6)}</TableCell>
                <TableCell style={{fontSize:'1vw',color: "white"}}      onClick={ ()=>{processTableClicked(row, 'to') } }   >   {((row.to_address_friendlyName== undefined) || (row.to_address_friendlyName == "0x000"))? getEllipsisTxt(row.to_address, 6):   Object.entries(row.to_address_friendlyName).find(([key, value]) => key !== '_id' && key !== 'address'&& key !== 'ENS' && !value.startsWith('0x')) ? Object.entries(row.to_address_friendlyName)  .find(([key, value]) => key !== '_id' && typeof value === 'string' && !value.startsWith('0x'))? Object.entries(row.to_address_friendlyName)  .find(([key, value]) => key !== '_id' && typeof value === 'string' && !value.startsWith('0x'))[1] : getEllipsisTxt(row.to_address_friendlyName.address,6):   getEllipsisTxt(row.to_address_friendlyName.address,6)  }</TableCell>
                <TableCell style={{fontSize:'1vw',}}><a href={"https://etherscan.io/tx/"+row.transaction_hash} target="blank"> {getEllipsisTxt(row.transaction_hash, 6)} </a>  {determineShowPoolLink(row)? <div title="explore pool on UniSwap"  style={{float:'right', right:'0', top:'0'}}> <a target="_blank" className="PoolLinkHover" href={`https://info.uniswap.org/#/pools/`+getUniSwapPoolAddy(row)}> <PoolIcon /> </a> </div> : <></>}</TableCell>
              </TableRow>
            )})
            : <></>
          }
          </TableBody>
        </Table>
      </div>


      <Link color="primary" href="#" onClick={ ()=>{ setexpandTxView(!expandTxView) } } sx={{ mt: 3 }}>
        {!expandTxView? "See more":"See less"}
      </Link>
    {/* </React.Fragment> */}
    </>
  );
}