import Dashboard from './dashboard/Dashboard.js';
import DatabaseInfoGrabber from './dashboard/DatabaseInfoGrabber.js';
import React, {useContext, useEffect, useState} from 'react';


export const GeneralContext   = React.createContext({});


function App() {
//create context for the app
const [txData, settxData] = useState(null);

const contextObj = {
  txData, settxData,

}

return (
  <>
    <GeneralContext.Provider value={contextObj} >
    <Dashboard />
    <DatabaseInfoGrabber />
    </GeneralContext.Provider>
  </>
);
}

export default App;
