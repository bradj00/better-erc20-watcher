import React, {useContext, useEffect} from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer } from 'recharts';
import Title from './Title';
import {GeneralContext} from '../App.js'

// Generate Sales Data
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
  const [formattedTxData, setformattedTxData] = React.useState([]);


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
// 2022-11-20T19:31

  useEffect(()=>{
    if (txData) {
      if (filteredtxData){
        // console.log('filteredtxData: ', txData);
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
        <LineChart
          data={formattedTxData? formattedTxData : data}
          margin={{
            top: 16,
            right: 16,
            bottom: 0,
            left: 24,
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
            dataKey="amount"
            stroke={theme.palette.primary.main}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </React.Fragment>
  );
}
