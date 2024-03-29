import React, {useContext, useEffect,useState} from 'react';
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
  const {txDataChart, settxDataChart} = useContext(GeneralContext);
  const [timeFilter,settimeFilter] = useState(0);
  const [timeFilterDisplay,settimeFilterDisplay] = useState(0);

  const {logScaleTickBox, setLogScaleTickBox} = useContext(GeneralContext)
  const [filteredtxDataChart, setfilteredtxDataChart] = useState();
  
  
  const [filteredtxDataDual, setfilteredtxDataDual] = React.useState([]);


  const [formattedTxDataChart, setformattedTxDataChart] = React.useState([]);
  const [formattedTxData, setformattedTxData] = React.useState([]);
  const [filteredTxDataInflow,   setfilteredTxDataInflow] = React.useState([]);
  const [filteredTxDataOutflow, setfilteredTxDataOutflow] = React.useState([]);

    useEffect(()=>{
      // console.log('txDataChart: ', txDataChart);
      formatTheTxDataChart(txDataChart);
    },[txDataChart])

  function formatTheTxDataChart(txData){
    if (txData == undefined || txData.length == 0) {return}
    else {
      // console.log('formatting txData: ', txData.length)
      // console.log(txData);
      // console.log(typeof txData)
      let formattedTxData = [];
      let totalVolume  = 0;
      txData.forEach((tx) => {
        totalVolume += (tx.value / (10**18));
        let formattedTx = createData(tx.block_timestamp.substr(5,5), (tx.value / (10**18)) );
        formattedTxData.push(formattedTx);
      });
      if (timeFilter != 0){
        setformattedTxDataChart(filterFromIndex(formattedTxData, timeFilter) )
      }else {
        setformattedTxDataChart(filterFromIndex(formattedTxData.reverse(), timeFilter) )
      }
    }
  }
  function formatTheTxData(txData){
    if (txData == undefined || txData.length == 0) {return}
    else {
      // console.log('formatting txData: ', txData.length)
      // console.log(txData);
      // console.log(typeof txData)
      let formattedTxData = [];
      let totalVolume  = 0;
      txData.forEach((tx) => {
        totalVolume += (tx.value / (10**18));
        let formattedTx = createData(tx.block_timestamp.substr(5,5), (tx.value / (10**18)) );
        formattedTxData.push(formattedTx);
      });
      if (timeFilter != 0){
        setformattedTxData(filterFromIndex(formattedTxData, timeFilter) )
      }else {
        setformattedTxData(filterFromIndex(formattedTxData.reverse(), timeFilter) )
      }
      setTotalVolume(totalVolume);
    }
  }



  useEffect(()=>{
    // console.log('filteredtxDataDual:' ,filteredtxDataDual);
  },[filteredtxDataDual])
  
  useEffect(()=>{
    if (filteredtxData){ //if we have clicked an address and therefore filtering in-flow out-flow...
      console.log('qqq filteredtxData:' ,filteredtxData);

      let  filteredTxDataTemp = [];

      // if (filteredtxDataDual.length > 0){
        filteredtxData.forEach((tx, index) => {
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
          if (index == filteredtxData.length - 1){
            
            //summarize filteredtxDataDual entries, combine all inflow and outflow of matching block_timestamp_cut into one entry, and add to temp array. Only carry over the block_timestamp_cut and the inflow and outflow values to the new array.
            let temp = [];
            let temp2 = [];
            filteredtxDataDual.forEach((tx) => {
                if (temp2[tx.block_timestamp_cut]){
                temp2[tx.block_timestamp_cut].inflow += tx.inflow;
                temp2[tx.block_timestamp_cut].outflow += tx.outflow;
                }else {
                temp2[tx.block_timestamp_cut] = {block_timestamp_cut: tx.block_timestamp_cut, inflow: tx.inflow, outflow: tx.outflow};
                }
            }
            );
            for (let key in temp2){
                temp.push(temp2[key]);
            }
            console.log('AAA temp: ', temp);
            setfilteredtxDataChart(temp);


          }
        });
      // }

        console.log('filteredTxDataTemp: ', filteredTxDataTemp);
        if (timeFilter != 0){
          setfilteredtxDataDual( filterFromIndex(filteredTxDataTemp, timeFilter) );
        }else {
          setfilteredtxDataDual( filterFromIndex(filteredTxDataTemp.reverse(), timeFilter) );
        }
      
        
    }
  },[formattedTxData]);


useEffect(()=>{
  // console.log('------------------');
  // console.log('filteredtxDataDual:' ,filteredtxDataDual.length);
  // console.log('formattedTxData:' ,formattedTxData.length);
  // console.log('timeFilter:' ,timeFilter);
  // console.log('------------------');
},[filteredtxDataDual, timeFilter, formattedTxData])  

  function filterFromIndex(array,index) {
    let filteredArray = [];
    for (let i = index; i < array.length; i++) {
      filteredArray.push(array[i]);
    }
    // console.log('filtered array: ', filteredArray);
    return filteredArray;
  }


  // useEffect(()=>{

    
  // },[filteredtxDataDual, formattedTxData]);

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


  function returnSliderIndexToDate (indexNum){
    if(clickedDetailsAddress){
      return (filteredtxDataDual[indexNum-1]?filteredtxDataDual[indexNum-1].block_timestamp_cut? filteredtxDataDual[indexNum-1].block_timestamp_cut : filteredtxDataDual[indexNum-1].time:'00:00');
    }else{
      return (formattedTxData[indexNum-1]? formattedTxData[indexNum-1].time : '00:00');
    } 
  }



  return (
    <React.Fragment>
      {/* <Title>Displayed Txs</Title> */}
      <div style={{fontSize:'1.25vw', color:'rgba(150,220,255,0.9)', position:'absolute', top:'-5.5vh',left:'1vw',}}>Volume and Unique Accounts</div> 
      
      <ResponsiveContainer>
        <BarChart 
          
          width={120} 
          height={40} 
          data={clickedDetailsAddress? filteredtxDataDual : formattedTxDataChart}
          // data={filteredtxDataChart? filteredtxDataChart : <></>}
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
            scale={logScaleTickBox? "log" : "linear"} 
            domain={logScaleTickBox? ['auto', 'auto'] : []}
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
        
      </ResponsiveContainer>
      <div style={{position:'relative', border:'0px solid #0f0',color:'#222'}}>

        {/* <div className="hoverResetTimeFilter" style={{color:'#000', fontSize:'1vh', position:'absolute', left:'0',borderRadius:'0.5vh', height:'2.5vh',width:'3vw', zIndex:'9999', display:'flex', justifyContent:'center', alignItems:'center', cursor:'pointer'}}>
          Reset
        </div> */}
        {/* <ReactSlider
            className="timeFilter-slider"
            thumbClassName="timeFilter-thumb"
            trackClassName="timeFilter-track"
            // max value of slider is the length of formattedTxData
            max={clickedDetailsAddress? filteredtxDataDual.length : formattedTxData.length}
            min={0}
            renderThumb={(props, state) => <div {...props}>{returnSliderIndexToDate(timeFilterDisplay)}</div>}
            // renderThumb={(props, state) => <div {...props}>{timeFilter}</div>}
            onChange={(value) => { console.log('value:' ,timeFilterDisplay); settimeFilterDisplay(value); }}
            // onAfterChange={(value) => { console.log('value:' ,value); settimeFilter(value); }}
            onAfterChange={(value) => { 
              console.log('final:' ,value);
              if (clickedDetailsAddress){
                if (timeFilter != 0){
                  setfilteredtxDataDual( filterFromIndex(formattedTxData, value)) //if we're filtering dont reverse it. we already have it reversed
                }else {
                  setfilteredtxDataDual( filterFromIndex(formattedTxData.reverse(), value))
                }
              }else {
                if (timeFilter != 0){
                  setformattedTxData( filterFromIndex(formattedTxData, value)) //if we're filtering dont reverse it. we already have it reversed
                }else {
                  setformattedTxData( filterFromIndex(formattedTxData.reverse(), value))
                }
              }
                
              // settimeFilter( filterFromIndex(formattedTxData.reverse(), value) ); 
            }}
        /> */}

      </div>
    </React.Fragment>
  );
}
