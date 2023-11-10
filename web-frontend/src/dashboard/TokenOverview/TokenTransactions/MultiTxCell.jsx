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

const MultiTxCell = (props) => {
  
  const {clickedToken, setclickedToken} = useContext(GeneralContext);
  const {rowClickMode, setrowClickMode} = useContext(GeneralContext);
  const {RequestFriendlyLookup, setRequestFriendlyLookup} = useContext(GeneralContext);
  const {TxHashDetailsObj} = useContext(GeneralContext);

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


  const transactionLogs = TxHashDetailsObj[props.row.transaction_hash]?.transactionData?.logs || [];

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

  const decodedERC20Transfers = transactionLogs
  .map(decodeERC20Transfer)
  .filter(transfer => transfer !== null); // Filter out non-transfer logs or undecodable logs


  return (
    <TableRow className={props.rowAge > 100 ? "rowHover" : "transactionRow"} style={{ fontSize: '3vw', backgroundColor: 'rgba(0,50,0,1)' }}>
      <TableCell colSpan={9}>
        {decodedERC20Transfers.map((transfer, idx) => (
          <div key={idx}>
            From: {getEllipsisTxt(transfer.from, 6)}, To: {getEllipsisTxt(transfer.to, 6)}, Amount: {transfer.amount}, Contract: {getEllipsisTxt(transfer.contractAddress, 6)}
          </div>
        ))}
      </TableCell>
    </TableRow>
  )
}

export default MultiTxCell