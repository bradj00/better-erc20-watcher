import React, { PureComponent, useContext } from 'react';
import { useEffect } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { GeneralContext } from '../../App';
import { commaNumber } from '../helpers/h';
import { getEllipsisTxt } from '../helpers/h';

const LiquidityChart = () => {
    const {LpChartData, setLpChartData} = useContext(GeneralContext); 

    useEffect(()=>{
      if (LpChartData){
        console.log('LpChartData: ',LpChartData)
      }
    },[LpChartData])

    const getIntroOfPage = (label) => {
      if (label === 'Page A') {
        return "Page A is about men's clothing";
      }
      if (label === 'Page B') {
        return "Page B is about women's dress";
      }
      else {
        return label
      }
    };


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
          <div  style={{ backgroundColor:'#000',  borderRadius:'0.5vh', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'0.75vw',  position:'relative',bottom:'-10vh',zIndex:'3', width:'8vw', height:'15vh'}}>
            
            <div style={{padding:'0.45vw',position:'absolute', width:'100%', height:'100%'}}>
              <div style={{position:'relative'}}>lower: <div style={{textAlign:'right', position:'absolute', top:'0', width:'100%',}}> {commaNumber(payload[0].value) }     </div></div>
              <div style={{position:'relative'}}>upper: <div style={{textAlign:'right', position:'absolute', top:'0', width:'100%',}}> {commaNumber(payload[1].value)}      </div></div>
            </div>

            <div style={{position:'absolute', textAlign:'center', bottom:'20%', fontSize:'0.9vw' }}>
              {determineWhichFNtoShow(payload[0].payload.name)}
              {payload[0].payload.index}
            </div>

          </div>
        );
      }
    
      return null;
    };

    function removeElementFromDataset(index){
      console.log('index: ',index)

      setLpChartData (LpChartData.filter((item, i) => i !== (index-1)))

    }


    return (
      <div style={{ width:'100%',  position:'absolute', left:'0', height:'100%'}}>
        <ResponsiveContainer>
        <BarChart 
              onClick={(e)=>{console.log('clicked: ',e); removeElementFromDataset(e.activePayload[0].payload.index)}}
              data={LpChartData}
              layout="vertical" barCategoryGap={1}
              margin={{ top: 5, right: 15, left: 15, bottom: 0 }}
          >

        <XAxis type="number"  fontSize='0.75vw' domain={[0, 'dataMax']}/>
        <YAxis type="category" hide width={150} padding={{ left: 0,  }} dataKey="name"/>
        <Bar dataKey="lowerLimit" stackId="a" fill="rgba(0,0,0,0)" />
        <Bar dataKey="upperLimit" stackId="a" fill="#82ca9d" />     
        {/* <ReferenceLine x={990} stroke={"#f0f"} strokeWidth={1} /> */}
        <Tooltip content={<CustomTooltip />} />

        </BarChart>
        </ResponsiveContainer>
      </div>
      
    );
}

export default LiquidityChart