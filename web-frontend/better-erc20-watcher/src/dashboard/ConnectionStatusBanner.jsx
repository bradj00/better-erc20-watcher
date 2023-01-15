import React, {useState, useContext, useEffect} from 'react'
import { GeneralContext } from '../App';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PersonIcon from '@mui/icons-material/Person';
import ConstructionIcon from '@mui/icons-material/Construction';
import SummarizeIcon from '@mui/icons-material/Summarize';


import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en';
TimeAgo.addDefaultLocale(en);

const ConnectionStatusBanner = (props) => {
    const timeAgo = new TimeAgo('en-US'); 
    const {chainDataHeartbeat, setchainDataHeartbeat} = useContext(GeneralContext);
    const {latestEthBlock, setlatestEthBlock} = useContext(GeneralContext); 
    const {displayPanel, setdisplayPanel} = useContext(GeneralContext); 


    useEffect(() => {
        // console.log('latestEthBlock: ', latestEthBlock);
    },[latestEthBlock]);

    useEffect(() => {
        // console.log('chainDataHeartbeatDiff: ',props.diff);
    },[props.diff]);
  
    return (
        <div style={{position:'relative', bottom:'0', left:'0', border:'0px solid #ff0',display:'flex', justifyContent:'center',zIndex:'9999', width:'16.5vw'}}>
            <div className={props.diff? props.diff < 5000? "showLatestBlock":"hideLatestBlock":""} style={{textAlign:'center', fontSize:'1.5vh', zIndex:'9999',width:'13vw', height:'6.25vh',   display:'flex', justifyContent:'center', alignItems:'center',  color:'#888', position:'absolute'}}>
                <div className="leftBarGridTop"> 
                    <div title="Watch Tokens" className="leftBarGridTopItem" onClick={()=>{setdisplayPanel('watchingTokens')}} > <MonetizationOnIcon style={{color:displayPanel=='watchingTokens'?'#fff':'rgba(255,255,255,0.4)', fontSize:'2vw'}}/> </div> 
                    <div title="Address Summaries" className="leftBarGridTopItem" onClick={()=>{setdisplayPanel('addressSummary')}}> <PersonIcon     style={{color:displayPanel=='addressSummary'?'#fff':'rgba(255,255,255,0.4)', fontSize:'2vw'}}/> </div> 
                    <div title="Manage Action Rules" className="leftBarGridTopItem" onClick={()=>{setdisplayPanel('tokenSummary')}}> <SummarizeIcon          style={{color:displayPanel=='tokenSummary'?'#fff':'rgba(255,255,255,0.4)', fontSize:'2vw'}}/> </div> 
                    <div title="Settings"    className="leftBarGridTopItem" onClick={()=>{setdisplayPanel('settingsDashboard')}}> <ConstructionIcon  style={{color:displayPanel=='settingsDashboard'?'#fff':'rgba(255,255,255,0.4)', fontSize:'2vw'}}/> </div> 
                </div>

            </div>
        </div>
    )
}

export default ConnectionStatusBanner