import React, { useContext, useEffect, useState } from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import TimeAgo from 'react-timeago'
import '../App.css';

import {GeneralContext} from '../App.js';
import {getEllipsisTxt} from './helpers/h.js';

import engStrings from 'react-timeago/lib/language-strings/en'
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'

const formatter = buildFormatter(engStrings)



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



export default function Orders() {
  
  const {txData, settxData} = useContext(GeneralContext);

  useEffect(() => {
    console.log('txData: ', txData);
  },[txData])


  return (
    <React.Fragment>
      <Title>Transactions</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>tx hash</TableCell>
            <TableCell>date</TableCell>
            <TableCell>from</TableCell>
            <TableCell>to</TableCell>
            <TableCell align="right">amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {txData? txData.map((row) => {

            return(
              <TableRow key={row.id}>
                <TableCell><a href={"https://etherscan.io/tx/"+row.transaction_hash} target="blank"> {getEllipsisTxt(row.transaction_hash, 6)} </a></TableCell>
                <TableCell><TimeAgo date={row.block_timestamp} formatter={formatter} /></TableCell>
                <TableCell>{row.from_address_friendlyName == "0x000"? getEllipsisTxt(row.from_address, 6): row.from_address_friendlyName}</TableCell>
                <TableCell>{row.to_address_friendlyName == "0x000"? getEllipsisTxt(row.to_address, 6): row.to_address_friendlyName}</TableCell>
                <TableCell align="right">{`${(row.value / (10**18))}`}</TableCell>
              </TableRow>
            )})
          : <></>}
        </TableBody>
      </Table>
      <Link color="primary" href="#" onClick={preventDefault} sx={{ mt: 3 }}>
        See more
      </Link>
    </React.Fragment>
  );
}
