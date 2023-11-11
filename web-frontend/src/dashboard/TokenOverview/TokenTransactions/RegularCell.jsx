import React, {useContext} from 'react'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ethLogo from '../../images/eth-logo.png';

import {getEllipsisTxt, commaNumber} from '../../helpers/h.js';
import {GeneralContext} from '../../../App.js';

import ToFromCell from '../../subcomponents/ToFromCell';

const RegularCell = (props) => {
  
  const {clickedToken, setclickedToken} = useContext(GeneralContext);
  const {rowClickMode, setrowClickMode} = useContext(GeneralContext);
  const {RequestFriendlyLookup, setRequestFriendlyLookup} = useContext(GeneralContext);


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
    
  }




  return (
    <TableRow className={props.rowAge > 100 ? "rowHover" : "transactionRow"} style={{fontSize:'3vw', backgroundColor:'rgba(0,0,0,0)', width:'100%'}} key={props.index}>
                    <TableCell align="right" style={{ fontSize:'1vw' }}>
                        <img src={ethLogo} style={{display:'flex', justifyContent:'center',alignItems:'center',width:'1vw'}} alt="Ethereum Logo" />
                    </TableCell> 
                    <TableCell align="right" style={{fontSize:'1vw'}}>
                       {commaNumber(props.row['block_number'])}
                    </TableCell> 
                    <TableCell align="right" title={props.row.block_timestamp} style={{fontSize:'1vw'}}>
                        {props.timeAgo.format(new Date(props.row.block_timestamp),'mini')}
                    </TableCell>
                    <TableCell align="right" style={{fontSize:'1vw',color: "#aaa"}} onClick={() => processTableClicked(props.row, 'from')}>
                        <ToFromCell row={props.row} toFrom={'from'}  clickMode={rowClickMode} />   
                    </TableCell>
                    <TableCell align="right" style={{fontSize:'1vw',color: "#aaa"}} onClick={() => processTableClicked(props.row, 'to')}>
                        <ToFromCell row={props.row} toFrom={'to'} clickMode={rowClickMode} />   
                    </TableCell>
                    <TableCell align="right" style={{fontSize:'1vw'}}>
                        {commaNumber(parseFloat(props.row.value / (clickedToken && clickedToken.data? (10 ** clickedToken.data.data["detail_platforms"].ethereum["decimal_place"])  :(10**25) )).toFixed(4))}
                    </TableCell> 
                    <TableCell align="right" style={{fontSize:'1vw'}}>
                        <a href={`https://etherscan.io/tx/${props.row.transaction_hash}`} target="_blank" rel="noopener noreferrer">
                            {getEllipsisTxt(props.row.transaction_hash, 6)}
                        </a> 
                       
                    </TableCell>
                    <TableCell align="right" style={{fontSize:'1vw'}}>
                        {props.row.action || '-'}
                    </TableCell>
                    <TableCell align="right" style={{fontSize:'1vw'}}>
                        {clickedToken?.data.data? "$"+ commaNumber(parseFloat((props.row.value / (clickedToken && clickedToken.data? (10 ** clickedToken.data.data["detail_platforms"].ethereum["decimal_place"])  :(10**25) )) * clickedToken.data.data["market_data"]["current_price"].usd).toFixed(2)) : '--' }
                    </TableCell>
                    <TableCell align="right" style={{fontSize:'1vw'}}>
                        {props.row.action || '-'}
                    </TableCell>
                  </TableRow>
  )
}

export default RegularCell