
import React, { useContext, useEffect, useState } from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from '../Title';
import ethLogo from '../images/eth-logo.png';
import PoolIcon from '@mui/icons-material/Pool';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import ToFromCell from '../subcomponents/ToFromCell';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

import '../../App.css';



import useSound from 'use-sound';
import boopSfx from '../sounds/ping.mp3';


import {GeneralContext} from '../../App.js';
import {getEllipsisTxt, commaNumber} from '../helpers/h.js';

import engStrings from 'react-timeago/lib/language-strings/en'
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'
import RegularCell from './TokenTransactions/RegularCell';
import MultiTxCell from './TokenTransactions/MultiTxCell';

import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const formatter = buildFormatter(engStrings)


TimeAgo.addLocale(en);
const timeAgo = new TimeAgo('en-US');



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


export default function TokenTransactions() {
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


  const {clickedToken, setclickedToken} = useContext(GeneralContext);

  const {rowClickMode, setrowClickMode} = useContext(GeneralContext);

  const {filteredtxDataInflow,   setfilteredtxDataInflow} = useContext(GeneralContext);
  const {filteredtxDataOutflow, setfilteredtxDataOutflow} = useContext(GeneralContext);
  const {displayPanel, setdisplayPanel} = useContext(GeneralContext); 
  const {RequestLiquidityPoolPrice, setRequestLiquidityPoolPrice} = useContext(GeneralContext); 
  const {CacheFriendlyLabels} = useContext(GeneralContext);

  
  const {TxHashDetailsObj} = useContext(GeneralContext);

  const getTimeAgoText = (timestamp) => {
    if (!timestamp || isNaN(new Date(timestamp).getTime())) {
      // Handle invalid or undefined timestamp
      console.error("Invalid timestamp:", timestamp);
      return "Invalid date";
    }
    const date = new Date(timestamp);
    return timeAgo.format(date);
  };
  

  useEffect(() => {
    setTimeout(()=>{
      // console.log('update');
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
  },[currentTime])


  useEffect(() => {
    if (CacheFriendlyLabels){
      console.log('~CacheFriendlyLabels: ',CacheFriendlyLabels)
    }
  },[CacheFriendlyLabels])




  useEffect(() => {
    console.log('TXDATA: ',txData)
    if (txData !== null){

      if (oldtxData && oldtxData[0] && oldtxData.length>0 && txData[0] && (txData[0].transaction_hash != oldtxData[0].transaction_hash) ){
        console.log('new data: ', txData, oldtxData);
        updatesMadeOnNewTxData();
        if (audioEnabled){play();}

      }else {
        // console.log('no new data');
        console.log('txData: ', txData);
      }
      setOldtxData(txData);
    }
  },[txData])


  function updatesMadeOnNewTxData(){
    console.log('requesting update on liquidity pool price')
    let temp = RequestLiquidityPoolPrice;
    setTimeout(()=>{
      setRequestLiquidityPoolPrice(temp);
    }, 500);
  }

  

  // function determineRowColor(row){
  //   if (row == null || row == undefined){return 'rgba(0, 0, 0, 1)'}
  //   // if ( typeof row.to_address_FriendlyName === 'object' && row.to_address_FriendlyName == null ) { return 'rgba(0, 0, 0, 1)'}
  //   // if ( typeof row.from_address_FriendlyName === 'object' && row.from_address_FriendlyName == null ) { return 'rgba(0, 0, 0, 1)'}
  //   if (  row.from_address_friendlyName && ((row.from_address_friendlyName.manuallyDefined === "Uniswap v3 Pool") || (row.from_address_friendlyName.manuallyDefined === "Uniswap v2 Pool") )) {
  //     return 'rgba(0, 70, 0, 0.6)'
  //   } 
  //   else if (  row.to_address_friendlyName && ((row.to_address_friendlyName.manuallyDefined === "Uniswap v3 Pool") || (row.to_address_friendlyName.manuallyDefined === "Uniswap v2 Pool") )) {
  //     return 'rgba(70, 0, 0, 0.6)'
  //   } 
  //   else return 'rgba(0, 0, 0, 0.1)'
  // }

  // function determineShowPoolLink(row){
  //   if (row == null || row == undefined){return false}
  //   if (  row.from_address_friendlyName && row.from_address_friendlyName.manuallyDefined == "Uniswap v3 Pool") {
  //     return true
  //   } 
  //   else if (  row.to_address_friendlyName && row.to_address_friendlyName.manuallyDefined == "Uniswap v3 Pool") {
  //     return true
  //   } 
  //   else return false
  
   
  // }




  function getUniSwapPoolAddy(row){
    if (row == null || row == undefined){return false}
    if (  row.from_address_friendlyName && row.from_address_friendlyName.manuallyDefined == "Uniswap v3 Pool") {
      return row.from_address
    } 
    else if ( row.to_address_friendlyName && row.to_address_friendlyName.manuallyDefined == "Uniswap v3 Pool") {
      return row.to_address
    } 
    else return false
  }
const customFormatter = (value, unit, suffix) => {
  if (unit === 'second') {
    return '<1 m';
  } else if (unit === 'minute') {
    return `${value} m`;
  } else if (unit === 'hour') {
    return `${value} hr`;
  } else if (unit === 'day') {
    return `${value} d`;
  } else {
    return timeAgo.format(value);
  }
};
  
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

  const renderedHashes = new Set();

  
  return (
    <>
      {/* <Title>Transactions</Title> */}
      <div className={expandTxView? "expandedOrders":"normalOrders"} style={{padding:'0.25vw',}}>
        
        <div className={!expandTxView? 'normalSeeMore':'expandedSeeMore'}>
          <Link color="primary" href="#" onClick={() => { setexpandTxView(!expandTxView); }}>
            {!expandTxView? <AddCircleOutlineIcon />:<RemoveCircleIcon />}
          </Link>
        </div>



        <div style={{border:'0px solid #ff0', width:'99.5%', float:'right', margin:'0.25vw'}}>
        {txData ? txData.map((row, index) => {
          // Check if this transaction hash has already been rendered
          if (!renderedHashes.has(row.transaction_hash)) {
            renderedHashes.add(row.transaction_hash);

            const timeAgoText = getTimeAgoText(row.block_timestamp);
            const isMultiTx = TxHashDetailsObj[row.transaction_hash] && TxHashDetailsObj[row.transaction_hash].transactionData.logs?.length > 1;

            return isMultiTx ?
              // <MultiTxCell index={index} row={row} timeAgo={timeAgoText} />
              <RegularCell index={index} row={row} timeAgo={timeAgoText} />
              :
              <RegularCell index={index} row={row} timeAgo={timeAgoText} />;
          }
          return null;
        }) : <></>}
        </div>
       
      </div> 

    </>
);
}