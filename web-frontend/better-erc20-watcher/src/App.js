import TokenOverviewDashboard from './dashboard/TokenOverviewDashboard.js';
import DatabaseInfoGrabber from './dashboard/DatabaseInfoGrabber.js';
import React, {useContext, useEffect, useState} from 'react';
import ConnectionStatusBanner from './dashboard/ConnectionStatusBanner.jsx';



export const GeneralContext   = React.createContext({});


function App() {
//create context for the app
const [txData, settxData] = useState(null);
const [txDataChart, settxDataChart] = useState(null);
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


const [MinAmountFilterValue, setMinAmountFilterValue] = useState(1);
const [MaxAmountFilterValue, setMaxAmountFilterValue] = useState(999999999999999999);
const [DisplayMinAmountFilterValue, setDisplayMinAmountFilterValue] = useState();
const [DisplayMaxAmountFilterValue, setDisplayMaxAmountFilterValue] = useState();

const [systemStatuses, setSystemStatuses] = useState();

const [RequestFriendlyLookup, setRequestFriendlyLookup] = useState();
const [friendlyLookupResponse, setFriendlyLookupResponse] = useState();
const [updateFriendlyName, setupdateFriendlyName] = useState();
const [pageNumber, setpageNumber] = useState(1);

const [rowClickMode, setrowClickMode] = useState('filter'); //default mode when clicking on an address in TX list (filter, edit, walletSummary)

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
  rowClickMode, setrowClickMode,
  
  RequestFriendlyLookup, setRequestFriendlyLookup,
  friendlyLookupResponse, setFriendlyLookupResponse,
  updateFriendlyName, setupdateFriendlyName,
  pageNumber, setpageNumber,
  txDataChart, settxDataChart,
  systemStatuses, setSystemStatuses,
  

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
