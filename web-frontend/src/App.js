import TokenOverviewDashboard from './dashboard/TokenOverviewDashboard.js';
import TokenHoldersDashboard from './dashboard/TokenHoldersDashboard.js';
import SettingsDashboard from './dashboard/SettingsDashboard.js';
import AddressSummaryDashboard from './dashboard/AddressSummaryDashboard.js';
import DatabaseInfoGrabber from './dashboard/DatabaseInfoGrabber.js';
import React, {useContext, useEffect, useState} from 'react';
import ConnectionStatusBanner from './dashboard/ConnectionStatusBanner.jsx';
import Topbanner from './dashboard/Topbanner.jsx';
import TxVisualizer from './dashboard/TxVisualizer.jsx';
import TokenDetective from './dashboard/TokenDetective.jsx';
import TestWSSComponent from './dashboard/TestWSSComponent.jsx';
import WebsocketInfoGrabber from './dashboard/WebsocketInfoGrabber.jsx';
import "./styles.css";

//OLD
/////
export const GeneralContext   = React.createContext({});
/////

export const dataLookupRequestsContext           = React.createContext({});
export const apiGatewayContext                   = React.createContext({});
export const rateLimiterContext                  = React.createContext({});
export const labelingEngineContext               = React.createContext({});
export const tokenExternalLookupContext          = React.createContext({});
export const txIngestionEngineContext            = React.createContext({});



function App() {
//create context for the app
const [txData, settxData] = useState(null);
const [TxSummaryData, setTxSummaryData] = useState(null);
const [txVisualData, settxVisualData] = useState(null);
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
const [heldTokensSelectedAddress, setheldTokensSelectedAddress] = useState();
const [heldTokensSelectedAddressFN, setheldTokensSelectedAddressFN] = useState();
const [selectedAddressListOfTokens, setselectedAddressListOfTokens] = useState();
const [communityHeldListFromSelected, setcommunityHeldListFromSelected] = useState();
const [communityHeldListFromSelectedAddy, setcommunityHeldListFromSelectedAddy] = useState();
const [selectedAddyInGameBalance, setselectedAddyInGameBalance] = useState();
const [LpToken0Token1HeldByProvider, setLpToken0Token1HeldByProvider] = useState();

const [watchedTokenPriceUsd, setwatchedTokenPriceUsd] = useState();
const [heldTokensSelectedAddressFNdisplayed, setheldTokensSelectedAddressFNdisplayed] = useState();

const [filteredtxDataInflow,   setfilteredtxDataInflow] = useState();
const [filteredtxDataOutflow,   setfilteredtxDataOutflow] = useState();
const [chainDataHeartbeat, setchainDataHeartbeat] = useState();
const [chainDataHeartbeatDiff, setchainDataHeartbeatDiff] = useState();
const [latestEthBlock, setlatestEthBlock] = useState();
const [getUpdatedTokenBalance, setgetUpdatedTokenBalance] = useState();
const [selectedAddressTxList, setselectedAddressTxList] = useState();
const [clockCountsArrayForSelectedAddressTxList, setclockCountsArrayForSelectedAddressTxList] = useState();
const [getUpdatedAddressTokenTxList, setgetUpdatedAddressTokenTxList] = useState();
const [fetchFreshStashedTokenBalance, setfetchFreshStashedTokenBalance] = useState();
const [txDataChartOverTime, settxDataChartOverTime] = useState();


const [MinAmountFilterValue, setMinAmountFilterValue] = useState(1);
const [MaxAmountFilterValue, setMaxAmountFilterValue] = useState(999999999999999999);
const [DisplayMinAmountFilterValue, setDisplayMinAmountFilterValue] = useState();
const [DisplayMaxAmountFilterValue, setDisplayMaxAmountFilterValue] = useState();

const [systemStatuses, setSystemStatuses] = useState();
const [clickedToken, setclickedToken] = useState();
const [searchInputLookup, setsearchInputLookup] = useState();
const [detectedLPs, setdetectedLPs] = useState();
const [megaPriceUsd, setMegaPriceUsd] = useState();
const [LpChartData, setLpChartData] = useState([]);
const [RequestLiquidityPoolPrice, setRequestLiquidityPoolPrice] = useState({});

const [LpTotalTokensHeld, setLpTotalTokensHeld] = useState();
const [updateCommitFriendlyNameRequest, setupdateCommitFriendlyNameRequest] = useState();
const [RequestFriendlyLookup, setRequestFriendlyLookup] = useState();
const [friendlyLookupResponse, setFriendlyLookupResponse] = useState();
const [updateFriendlyName, setupdateFriendlyName] = useState();
const [pageNumber, setpageNumber] = useState(1);
// const [displayPanel, setdisplayPanel] = useState('watchingTokens');
const [displayPanel, setdisplayPanel] = useState('watchingTokens');

const [rowClickMode, setrowClickMode] = useState('filter'); //default mode when clicking on an address in TX list (filter, edit, walletSummary)
const [defaultData, setDefaultData] = useState({ nodes: [], links: [] });
const [ShownLiqPoolPriceData, setShownLiqPoolPriceData] = useState({});
const [logScaleTickBox, setLogScaleTickBox] = React.useState(false);

/////////////////////////////////
// MICRO SERVICE RE-FACTOR
/////////////////////////////////
const [dataCalls, setDataCalls] = useState({
  pending: [],
  failed: {}
});






// separate global context variables to better manage data sharing through components
/////////////////////////////////////////////////////////////////////////////////////

//  component requests for DatabaseInfoGrabber to initiate a fetch
const dataLookupRequests = {
  // getter, setGetter,
  // ...
}

//  any data returned will be populated in one of these below
////////////////////////////////////////////////
////////////////////////////////////////////////
const apiGateway = {
  // getter, setGetter,
  // ...
  watchedTokenList, setWatchedTokenList,
}
const rateLimiter = {
  // looks like: serviceStatusObj: {'infura': 'healthy', 'etherscan': 'limited', etc.}
  // serviceStatusObj, setserviceStatusObj,
}
const labelingEngine = {
  // getter, setGetter,
  // ...  
}
const tokenExternalLookup = {
  // getter, setGetter,
  // ...  
}
const txIngestionEngine = {
  // getter, setGetter,
  // ...
}
////////////////////////////////////////////////
////////////////////////////////////////////////





const contextObj = {
  txData, settxData,
  LpTotalTokensHeld, setLpTotalTokensHeld,
  defaultData, setDefaultData,
  txVisualData, settxVisualData,
  ShownLiqPoolPriceData, setShownLiqPoolPriceData, 
  RequestLiquidityPoolPrice, setRequestLiquidityPoolPrice,
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
  LpChartData, setLpChartData,

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
  displayPanel, setdisplayPanel,
  heldTokensSelectedAddress, setheldTokensSelectedAddress,
  selectedAddressListOfTokens, setselectedAddressListOfTokens,
  heldTokensSelectedAddressFN, setheldTokensSelectedAddressFN,
  communityHeldListFromSelected, setcommunityHeldListFromSelected,
  communityHeldListFromSelectedAddy, setcommunityHeldListFromSelectedAddy,
  getUpdatedTokenBalance, setgetUpdatedTokenBalance,
  selectedAddyInGameBalance, setselectedAddyInGameBalance,
  watchedTokenPriceUsd, setwatchedTokenPriceUsd,
  megaPriceUsd, setMegaPriceUsd,
  heldTokensSelectedAddressFNdisplayed, setheldTokensSelectedAddressFNdisplayed,
  updateCommitFriendlyNameRequest, setupdateCommitFriendlyNameRequest,
  selectedAddressTxList, setselectedAddressTxList,
  clockCountsArrayForSelectedAddressTxList, setclockCountsArrayForSelectedAddressTxList,
  getUpdatedAddressTokenTxList, setgetUpdatedAddressTokenTxList,
  fetchFreshStashedTokenBalance, setfetchFreshStashedTokenBalance,
  clickedToken, setclickedToken,
  searchInputLookup, setsearchInputLookup,
  detectedLPs, setdetectedLPs,
  txDataChartOverTime, settxDataChartOverTime,
  LpToken0Token1HeldByProvider, setLpToken0Token1HeldByProvider,
  logScaleTickBox, setLogScaleTickBox,
  TxSummaryData, setTxSummaryData,


///////////////////////////////////////////////
/////////MICRO SERVICE RE-FACTOR///////////////

  dataCalls, setDataCalls
}


useEffect(() => {
  // console.log("CATCH- chainData heartbeat diff from db: ", chainDataHeartbeatDiff);
},[chainDataHeartbeatDiff]);

return (
  <>
    <GeneralContext.Provider             value={contextObj} > 
    <dataLookupRequestsContext.Provider  value={dataLookupRequests} >
    <apiGatewayContext.Provider          value={apiGateway} >
    <rateLimiterContext.Provider         value={rateLimiter} >
    <labelingEngineContext.Provider      value={labelingEngine} >
    <tokenExternalLookupContext.Provider value={tokenExternalLookup} >
    <txIngestionEngineContext.Provider   value={txIngestionEngine} >

      <div style={{overflow:'hidden',display:'flex', alignItems:'center',  border:'0px solid #0f0'}}>
          {/* <ConnectionStatusBanner diff={chainDataHeartbeatDiff}/> */}
          <Topbanner />
          {displayPanel === 'watchingTokens'? <TokenOverviewDashboard />: <></>}
          {displayPanel === 'addressSummary'? <AddressSummaryDashboard />: <></>}
          {displayPanel === 'tokenSummary'? <TokenHoldersDashboard />: <></>}
          {displayPanel === 'txVisualizer'? <TxVisualizer />: <></>}
          {displayPanel === 'tokenDetective'? <TokenDetective />: <></>}
          
          
          
          
      </div>
      <WebsocketInfoGrabber />
    {/* <DatabaseInfoGrabber /> */}
    <div className="dock"></div>

    </txIngestionEngineContext.Provider>
    </tokenExternalLookupContext.Provider>
    </labelingEngineContext.Provider>
    </rateLimiterContext.Provider>
    </apiGatewayContext.Provider>
    </dataLookupRequestsContext.Provider>
    </GeneralContext.Provider>
  </>
);
}

export default App;
