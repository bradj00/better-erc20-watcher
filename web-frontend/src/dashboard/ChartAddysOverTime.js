import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { commaNumber, getEllipsisTxt } from './helpers/h';



function determineWhichFNtoShow(tokenObj){
  if (!tokenObj){
    return (<td style={{color:'#aaa'}}>...</td>);
  }
  // console.log('determineWhichFNtoShow: ', tokenObj)
  if (typeof tokenObj != 'object'){
    return (<td style={{color:'#aaa'}}>{getEllipsisTxt(tokenObj, 6)}</td>);
  }
  for (var key in tokenObj) {
    if (key !== 'ENS' && key !== '_id' && !tokenObj[key].startsWith("0x")) {
        return (<td style={{color:'#fff'}}>{tokenObj[key]}</td>);
    }
  }


  return (<td style={{color:'#aaa'}}>{getEllipsisTxt(tokenObj["address"], 6)}</td>);
}


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // console.log('payload: ',payload)
    return (
      <div  style={{border:'1px solid rgba(255,255,255,0.2)', textAlign:'center', color:'#fff', backgroundColor:'#000',  borderRadius:'0.5vh', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'0.75vw',  position:'relative',zIndex:'3', width:'8vw', height:'6vh'}}>
        <div style={{width:'100%',position:'absolute'}}>
          <div>{payload[0].payload.date} </div>
          <div>{payload[0].payload.uniqueAddresses} holders</div>
        </div>
      </div>
    );
  }

  return null;
};




export default function ChartAddysOverTime(props) {
  return (
    <React.Fragment>
      <ResponsiveContainer>
      <LineChart
        width={120}
        height={40}
        data={props.data}
        margin={{
          top: 10,
          right: 10,
          bottom: 0,
          left: 10,
        }}
      >
        {/* <CartesianGrid strokeDasharray="3 3" /> */}
        {/* <XAxis dataKey="name" /> */}
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        {/* <Tooltip /> */}
        {/* <Legend /> */}
        <Tooltip content={<CustomTooltip />} />
        <Line yAxisId="right" type="monotone" dot={{r:1}}  dataKey="uniqueAddresses" stroke="#82ca9d" />
      </LineChart>
      </ResponsiveContainer>
    </React.Fragment>
  );
}
