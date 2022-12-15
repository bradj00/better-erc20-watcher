import React, {useState, useContext, useEffect} from 'react'
import { GeneralContext } from '../App';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PersonIcon from '@mui/icons-material/Person';
import ConstructionIcon from '@mui/icons-material/Construction';

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
                    <div className="leftBarGridTopItem" onClick={()=>{setdisplayPanel('watchingTokens')}} > <MonetizationOnIcon style={{fontSize:'2vw'}}/> </div> 
                    <div className="leftBarGridTopItem" onClick={()=>{setdisplayPanel('addressSummary')}}> <PersonIcon style={{fontSize:'2vw'}}/> </div> 
                    <div className="leftBarGridTopItem" > <ConstructionIcon style={{fontSize:'2vw'}}/> </div> 
                </div>

            </div>
        </div>
    )
}

export default ConnectionStatusBanner