import TokenOverviewDashboard from './dashboard/TokenOverviewDashboard.js';
import DatabaseInfoGrabber from './dashboard/DatabaseInfoGrabber.js';
import React, {useContext, useEffect, useState} from 'react';
import ConnectionStatusBanner from './dashboard/ConnectionStatusBanner.jsx';



export const GeneralContext   = React.createContext({});


function App() {
//create context for the app
const [txData, settxData] = useState(null);
const [getnewTxData, setgetnewTxData] = useState(null);
const [audioEnabled, setAudioEnabled] = useState(true)
const [clickedDetailsAddress, setclickedDetailsAddress] = useState();
const [clickedDetailsAddressFN, setclickedDetailsAddressFN] = useState();
const [viewingTokenAddress, setviewingTokenAddress] = useState();
const [watchedTokenList, setWatchedTokenList] = useState();
const [filteredtxData, setfilteredtxData] = useState();
const [totalVolume, setTotalVolume] = useState();
const [clickedTokenSymbol, setclickedTokenSymbol] = useState();

const [filteredtxDataInflow,   setfilteredtxDataInflow] = useState();
const [filteredtxDataOutflow,   setfilteredtxDataOutflow] = useState();
const [chainDataHeartbeat, setchainDataHeartbeat] = useState();
const [chainDataHeartbeatDiff, setchainDataHeartbeatDiff] = useState();
const [latestEthBlock, setlatestEthBlock] = useState();


const [MinAmountFilterValue, setMinAmountFilterValue] = useState();
const [MaxAmountFilterValue, setMaxAmountFilterValue] = useState();
const [DisplayMinAmountFilterValue, setDisplayMinAmountFilterValue] = useState();
const [DisplayMaxAmountFilterValue, setDisplayMaxAmountFilterValue] = useState();

const contextObj = {
  txData, settxData,
  getnewTxData, setgetnewTxData,
  audioEnabled, setAudioEnabled,
  clickedDetailsAddress, setclickedDetailsAddress,
  clickedDetailsAddressFN, setclickedDetailsAddressFN,
  viewingTokenAddress, setviewingTokenAddress,
  watchedTokenList, setWatchedTokenList,
  filteredtxData, setfilteredtxData,
  totalVolume, setTotalVolume,
  filteredtxDataInflow,   setfilteredtxDataInflow,
  filteredtxDataOutflow,  setfilteredtxDataOutflow,
  clickedTokenSymbol, setclickedTokenSymbol,
  chainDataHeartbeat, setchainDataHeartbeat,
  chainDataHeartbeatDiff, setchainDataHeartbeatDiff,
  latestEthBlock, setlatestEthBlock,

  MinAmountFilterValue, setMinAmountFilterValue,
  MaxAmountFilterValue, setMaxAmountFilterValue,
  DisplayMinAmountFilterValue, setDisplayMinAmountFilterValue,
  DisplayMaxAmountFilterValue, setDisplayMaxAmountFilterValue,
}


useEffect(() => {
  // console.log("CATCH- chainData heartbeat diff from db: ", chainDataHeartbeatDiff);
},[chainDataHeartbeatDiff]);

return (
  <>
    <GeneralContext.Provider value={contextObj} >
      <div style={{overflow:'hidden', border:'0px solid #0f0'}}>
          <ConnectionStatusBanner diff={chainDataHeartbeatDiff}/>
          <TokenOverviewDashboard />
      </div>
    <DatabaseInfoGrabber />
    </GeneralContext.Provider>
  </>
);
}

export default App;
