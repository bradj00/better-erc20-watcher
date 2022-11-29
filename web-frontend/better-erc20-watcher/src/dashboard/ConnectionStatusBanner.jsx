import React, {useState, useContext, useEffect} from 'react'
import { GeneralContext } from '../App';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en';
TimeAgo.addDefaultLocale(en);

const ConnectionStatusBanner = (props) => {
    const timeAgo = new TimeAgo('en-US'); 
    const {chainDataHeartbeat, setchainDataHeartbeat} = useContext(GeneralContext);
    const {latestEthBlock, setlatestEthBlock} = useContext(GeneralContext); 


    useEffect(() => {
        // console.log('latestEthBlock: ', latestEthBlock);
    },[latestEthBlock]);

    useEffect(() => {
        // console.log('chainDataHeartbeatDiff: ',props.diff);
    },[props.diff]);
  
    return (
        <>
        <div className={props.diff? props.diff > 1000? "deadHeartbeat":"goodHeartbeat":""} style={{fontSize:'3vh', zIndex:'9999',width:'12.1vw', height:'6.25vh', left:'0.15vw', top:'0.25vh', display:'flex', justifyContent:'center', alignItems:'center',  backgroundColor:props.diff? props.diff > 1000?'rgba(150,30,30,1)': 'rgba(0,150,0,0.4)':'rgba(150,150,0,0.8)',position:'fixed'}}>
            {props.diff? props.diff > 1000?  <>stale data</>: <>up to date</>: <>fetching data</>}
            {/* {props.diff? props.diff:<></>} */}

        </div>
        <div className={props.diff? props.diff < 1000? "showLatestBlock":"hideLatestBlock":""} style={{textAlign:'center', fontSize:'1.8vh', zIndex:'9999',width:'13vw', height:'6.25vh',  top:'0.5vh', display:'flex', justifyContent:'center', alignItems:'center',  color:'#888', position:'fixed'}}>
            {/* {latestEthBlock? <>latest block: {JSON.stringify(latestEthBlock.block)}</>:<></>} */}
            {latestEthBlock? <>latest block:<br></br> {timeAgo.format(new Date(latestEthBlock.block_timestamp).getTime(),'mini')} ago</>:<></>}
        </div>
        </>
    )
}

export default ConnectionStatusBanner