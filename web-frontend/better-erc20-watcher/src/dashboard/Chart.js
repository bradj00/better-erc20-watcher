import React, {useContext, useEffect} from 'react';
import { useTheme } from '@mui/material/styles';
// import { LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label, ResponsiveContainer } from 'recharts';

import Title from './Title';
import {GeneralContext} from '../App.js'


function createData(time, amount) {
  return { time, amount };
}

const data = [
  createData('00:00', 0),
  createData('03:00', 300),
  createData('02:00', 600),
  createData('09:00', 800),
  createData('12:00', 1500),
  createData('15:00', 2000),
  createData('18:00', 2400),
  createData('21:00', 2400),
  createData('24:00', undefined),
];

export default function Chart() {
  const {txData, settxData} = useContext(GeneralContext);
  const {filteredtxData, setfilteredtxData} = useContext(GeneralContext);
  const {totalVolume, setTotalVolume} = useContext(GeneralContext);
  const {clickedDetailsAddress, setclickedDetailsAddress} = useContext(GeneralContext);
  const {clickedDetailsAddressFN, setclickedDetailsAddressFN} = useContext(GeneralContext);
  
  
  
  const [filteredtxDataDual, setfilteredtxDataDual] = React.useState([]);


  const [formattedTxData, setformattedTxData] = React.useState([]);
  const [filteredTxDataInflow,   setfilteredTxDataInflow] = React.useState([]);
  const [filteredTxDataOutflow, setfilteredTxDataOutflow] = React.useState([]);


  function formatTheTxData(txData){
    let formattedTxData = [];
    let totalVolume  = 0;
    txData.forEach((tx) => {
      totalVolume += (tx.value / (10**18));
      let formattedTx = createData(tx.block_timestamp.substr(5,5), (tx.value / (10**18)) );
      formattedTxData.push(formattedTx);
    });
    setformattedTxData(formattedTxData.reverse());
    setTotalVolume(totalVolume);
  }



  useEffect(()=>{
    // console.log('filteredtxDataDual:' ,filteredtxDataDual);
  },[filteredtxDataDual])
  
  useEffect(()=>{
    if (filteredtxData){ //if we have clicked an address and therefore filtering in-flow out-flow...
      //for each in formattedTxData we need to check if it is in-flow or out-flow and then add it to the correct array
      let  filteredTxDataTemp = [];

      filteredtxData.forEach((tx) => {
        // console.log('tx: ',tx);
        if ((tx.to_address === clickedDetailsAddress) || (tx.to_address_friendlyName === clickedDetailsAddressFN)){
          tx.inflow = (tx.value) / (10 ** 18);
          tx.block_timestamp_cut = tx.block_timestamp.substr(5,5);
          filteredTxDataTemp.push(tx);
        } 
        
        if ((tx.from_address === clickedDetailsAddress) || (tx.from_address_friendlyName === clickedDetailsAddressFN)){
          tx.outflow = (tx.value) / (10 ** 18);
          tx.block_timestamp_cut = tx.block_timestamp.substr(5,5);
          filteredTxDataTemp.push(tx);
        }
          
      });
      setfilteredtxDataDual(filteredTxDataTemp.reverse());

    }
  },[formattedTxData]);

  useEffect(()=>{
    if (txData) {
      if (filteredtxData){
        // console.log('filteredtxData: ', filteredtxData);
        formatTheTxData(filteredtxData);
      }else {
      // console.log('txData: ', txData);
      formatTheTxData(txData);
      }
    }
  },[txData,filteredtxData])

  const theme = useTheme();

  return (
    <React.Fragment>
      <Title>Displayed Txs</Title>
      <ResponsiveContainer>
        <BarChart 
          width={150} 
          height={40} 
          data={clickedDetailsAddress? filteredtxDataDual : formattedTxData}
          margin={{
            top: 10,
            right: 10,
            bottom: 0,
            left: 10,
          }}
        >
          <Bar barSize={5} dataKey={clickedDetailsAddress? "inflow": "amount"} fill={clickedDetailsAddress? clickedDetailsAddressFN == 'Uniswap v3 Pool'?"#f00":"#0f0":"#0ff"} />
          {clickedDetailsAddress?<Bar barSize={5} dataKey="outflow" fill={clickedDetailsAddressFN? clickedDetailsAddressFN == 'Uniswap v3 Pool'? "#0f0": "#f00": "#f00"} /> : <></>}


          <XAxis
            dataKey={clickedDetailsAddress?"block_timestamp_cut": "time"}
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
          >
            <Label
              angle={270}
              position="left"
              style={{
                textAnchor: 'middle',
                fill: theme.palette.text.primary,
                ...theme.typography.body1,
              }}
            >
              Amount
            </Label>
          </YAxis>
        </BarChart>
        {/* <LineChart
          data={filteredtxDataDual? filteredtxDataDual : formattedTxData}
          margin={{
            top: 10,
            right: 10,
            bottom: 10,
            left: 10,
          }}
        >
          <XAxis
            dataKey="time"
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
          >
            <Label
              angle={270}
              position="left"
              style={{
                textAnchor: 'middle',
                fill: theme.palette.text.primary,
                ...theme.typography.body1,
              }}
            >
              Amount
            </Label>
          </YAxis>
          <Line
            isAnimationActive={false}
            type="monotone"
            dataKey="inflow"
            // stroke={theme.palette.primary.main}
            stroke={"#0f0"}
            dot={false}
          />
          <Line
            isAnimationActive={false}
            type="monotone"
            dataKey="outflow"
            // stroke={theme.palette.primary.main}
            stroke={"#f00"}
            dot={false}
          /> */}
        {/* </LineChart> */}
      </ResponsiveContainer>
    </React.Fragment>
  );
}
