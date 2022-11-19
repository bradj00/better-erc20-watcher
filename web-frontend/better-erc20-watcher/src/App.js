import Dashboard from './dashboard/Dashboard.js';
import DatabaseInfoGrabber from './dashboard/DatabaseInfoGrabber.js';
import React, {useContext, useEffect, useState} from 'react';


export const GeneralContext   = React.createContext({});


function App() {
//create context for the app
const [txData, settxData] = useState(null);
const [getnewTxData, setgetnewTxData] = useState(null);
const [audioEnabled, setAudioEnabled] = useState(true)
const contextObj = {
  txData, settxData,
  getnewTxData, setgetnewTxData,
  audioEnabled, setAudioEnabled

}

return (
  <>
    <GeneralContext.Provider value={contextObj} >
    <div style={{overflow:'hidden', border:'0px solid #0f0'}}><Dashboard /></div>
    <DatabaseInfoGrabber />
    </GeneralContext.Provider>
  </>
);
}

export default App;
