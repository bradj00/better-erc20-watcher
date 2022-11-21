import TokenOverviewDashboard from './dashboard/TokenOverviewDashboard.js';
import DatabaseInfoGrabber from './dashboard/DatabaseInfoGrabber.js';
import React, {useContext, useEffect, useState} from 'react';




export const GeneralContext   = React.createContext({});


function App() {
//create context for the app
const [txData, settxData] = useState(null);
const [getnewTxData, setgetnewTxData] = useState(null);
const [audioEnabled, setAudioEnabled] = useState(true)
const [clickedDetailsAddress, setclickedDetailsAddress] = useState();
const [viewingTokenAddress, setviewingTokenAddress] = useState();
const [watchedTokenList, setWatchedTokenList] = useState();
const [filteredtxData, setfilteredtxData] = useState();
const [totalVolume, setTotalVolume] = useState();

const [filteredtxDataInflow,   setfilteredtxDataInflow] = useState();
const [filteredtxDataOutflow,   setfilteredtxDataOutflow] = useState();


const contextObj = {
  txData, settxData,
  getnewTxData, setgetnewTxData,
  audioEnabled, setAudioEnabled,
  clickedDetailsAddress, setclickedDetailsAddress,
  viewingTokenAddress, setviewingTokenAddress,
  watchedTokenList, setWatchedTokenList,
  filteredtxData, setfilteredtxData,
  totalVolume, setTotalVolume,
  filteredtxDataInflow,   setfilteredtxDataInflow,
  filteredtxDataOutflow,  setfilteredtxDataOutflow,

}

return (
  <>
    <GeneralContext.Provider value={contextObj} >
      <div style={{overflow:'hidden', border:'0px solid #0f0'}}>
          <TokenOverviewDashboard />
      </div>
    <DatabaseInfoGrabber />
    </GeneralContext.Provider>
  </>
);
}

export default App;
