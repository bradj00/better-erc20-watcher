import React, { useContext, useEffect, useState } from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
// import TimeAgo from 'react-timeago'

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


// Generate Order Data
function createData(id, date, name, shipTo, paymentMethod, amount) {
  return { id, date, name, shipTo, paymentMethod, amount };
}

const rows = [
  createData(
    0,
    '16 Mar, 2019',
    'Elvis Presley',
    'Tupelo, MS',
    'VISA ⠀•••• 3719',
    312.44,
  ),
  createData(
    1,
    '16 Mar, 2019',
    'Paul McCartney',
    'London, UK',
    'VISA ⠀•••• 2574',
    866.99,
  ),
  createData(2, '16 Mar, 2019', 'Tom Scholz', 'Boston, MA', 'MC ⠀•••• 1253', 100.81),
  createData(
    3,
    '16 Mar, 2019',
    'Michael Jackson',
    'Gary, IN',
    'AMEX ⠀•••• 2000',
    654.39,
  ),
  createData(
    4,
    '15 Mar, 2019',
    'Bruce Springsteen',
    'Long Branch, NJ',
    'VISA ⠀•••• 5919',
    212.79,
  ),
];

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

  const {filteredtxDataInflow,   setfilteredtxDataInflow} = useContext(GeneralContext);
  const {filteredtxDataOutflow, setfilteredtxDataOutflow} = useContext(GeneralContext);

  useEffect(() => {
    setTimeout(()=>{console.log('update');setCurrentTime(new Date().toLocaleString());}, 1000);
  },[currentTime])

  useEffect(() => {
    console.log('filteredtxData: ',filteredtxData)
    
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


  return (
    <React.Fragment>
      <Title>Transactions</Title>
      <div  style={{overflowY:'scroll', height:expandTxView? 'auto':'44vh', cursor:'pointer'}}>
        <Table size="small" >
          <TableHead style={{position:'sticky',top:'0',backgroundColor:'rgba(50,50,60,1)'}}>
            <TableRow>
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
              
              return(
                
                <TableRow className={rowAge > 100? "rowHover": "transactionRow"} style={{fontSize:'3vw', backgroundColor: row.transaction_hash? 'rgba('+(parseInt(row.transaction_hash.substr(0,4), 16) %  30)+', '+(parseInt(row.transaction_hash.substr(5,10), 16) %  30)+', '+(parseInt(row.transaction_hash.substr(12,19), 16) %  30)+', 1)' :'rgba(0,0,0,0)'}} key={index}>
                  <TableCell align="left" style={{fontSize:'1vw', }}>{commaNumber(parseFloat(row.value / (10**18)).toFixed(4))}</TableCell> 
                  {/* <TableCell style={{fontSize:'1vw', }}><TimeAgo date={row.block_timestamp} formatter={formatter} /></TableCell> */}
                  <TableCell style={{fontSize:'1vw', }}> {timeAgo.format(new Date(row.block_timestamp),'mini') } </TableCell>
                  <TableCell style={{fontSize:'1vw',color: row.from_address_friendlyName? !row.from_address_friendlyName.match(/0x000/)?"#0a0":"white":"white"}}  onClick={ ()=>{console.log('clicked:',row.from_address); setclickedDetailsAddress(row.from_address); setclickedDetailsAddressFN(row.from_address_friendlyName) } }   >{((row.from_address_friendlyName == undefined) || (row.from_address_friendlyName == "0x000"))? getEllipsisTxt(row.from_address, 6): row.from_address_friendlyName}</TableCell>
                  <TableCell style={{fontSize:'1vw',color: row.to_address_friendlyName? !row.to_address_friendlyName.match(/0x000/)?"#0a0":"white":"white"}}      onClick={ ()=>{console.log('clicked:',row.to_address);   setclickedDetailsAddress(row.to_address);   setclickedDetailsAddressFN(row.to_address_friendlyName) } }   >{((row.to_address_friendlyName== undefined) || (row.to_address_friendlyName == "0x000"))? getEllipsisTxt(row.to_address, 6): row.to_address_friendlyName}</TableCell>
                  <TableCell style={{fontSize:'1vw',}}><a href={"https://etherscan.io/tx/"+row.transaction_hash} target="blank"> {getEllipsisTxt(row.transaction_hash, 6)} </a></TableCell>
                </TableRow>
                
              )})
            : <></>
          :
          filteredtxData.map((row, index) => {
            const rowAge = ((new Date().getTime() - new Date(row.block_timestamp).getTime()) / 1000 );
            // console.log(parseInt(rowAge)+' seconds old');
              const timeAgo = new TimeAgo('en-US')
              
            
            return(

              <TableRow className={rowAge > 100? "": "transactionRow"} style={{fontSize:'3vw', backgroundColor: row.transaction_hash? 'rgba('+(parseInt(row.transaction_hash.substr(0,4), 16) %  30)+', '+(parseInt(row.transaction_hash.substr(5,10), 16) %  30)+', '+(parseInt(row.transaction_hash.substr(12,19), 16) %  30)+', 1)' :'rgba(0,0,0,0)'}} key={index}>
                <TableCell align="left" style={{fontSize:'1vw', }}>{commaNumber(parseFloat(row.value / (10**18)).toFixed(4))}</TableCell> 
                <TableCell style={{fontSize:'1vw', }}> {timeAgo.format(new Date(row.block_timestamp),'mini') } </TableCell>
                <TableCell style={{fontSize:'1vw',color: row.from_address_friendlyName? !row.from_address_friendlyName.match(/0x000/)?"#0a0":"white":"white"}}  onClick={ ()=>{console.log('clicked:',row.from_address); setclickedDetailsAddress(row.from_address); setclickedDetailsAddressFN(row.from_address_friendlyName) } }   >{((row.from_address_friendlyName == undefined) || (row.from_address_friendlyName == "0x000"))? getEllipsisTxt(row.from_address, 6): row.from_address_friendlyName}</TableCell>
                <TableCell style={{fontSize:'1vw',color: row.to_address_friendlyName? !row.to_address_friendlyName.match(/0x000/)?"#0a0":"white":"white"}}      onClick={ ()=>{console.log('clicked:',row.to_address);   setclickedDetailsAddress(row.to_address);   setclickedDetailsAddressFN(row.to_address_friendlyName) } }   >{((row.to_address_friendlyName== undefined) || (row.to_address_friendlyName == "0x000"))? getEllipsisTxt(row.to_address, 6): row.to_address_friendlyName}</TableCell>
                <TableCell style={{fontSize:'1vw',}}><a href={"https://etherscan.io/tx/"+row.transaction_hash} target="blank"> {getEllipsisTxt(row.transaction_hash, 6)} </a></TableCell>
              </TableRow>
            )})
          }
          </TableBody>
        </Table>
      </div>


      <Link color="primary" href="#" onClick={ ()=>{ setexpandTxView(!expandTxView) } } sx={{ mt: 3 }}>
        {!expandTxView? "See more":"See less"}
      </Link>
    </React.Fragment>
  );
}
