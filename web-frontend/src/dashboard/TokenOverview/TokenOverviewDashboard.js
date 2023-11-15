/* eslint-disable no-unused-vars */
import React, {useContext, useState, useEffect} from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
// import { mainListItems, secondaryListItems } from './listItems.js.back';
import Chart from '../Chart';
import TokenVolumeDash from '../TokenVolumeDash';
import Orders from './TokenTransactions';
import { GeneralContext } from '../../App';
import AudioToggle from '../subcomponents/AudioToggle';
import SearchIcon from '@mui/icons-material/Search';
import SecondaryList from '../subcomponents/SecondaryList';
import MainList from '../subcomponents/MainList';
import {getEllipsisTxt} from '../helpers/h.js';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {commaNumber} from '../helpers/h.js';
import ConnectionStatusBanner from '../NavigatorDropdown';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import tokenImage from '../images/token_image.png';
import LinkIcon from '@mui/icons-material/Link';
import ChartAddysOverTime from '../ChartAddysOverTime';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import LiquidityChart from '../subcomponents/LiquidityChart';
import ExamplePopUpWindow from '../ExamplePopUpWindow';
import TxVisualizer from '../TxVisualizer';
import ForceGraphComponent from './StagePanel/TxVisualizer';
import TokenTransactions from './TokenTransactions';
import WidgetPanelDistribution from './WidgetPanel/WidgetPanelDistribution';
import WidgetPanelStats from './WidgetPanel/WidgetPanelStats';
import WidgetPanelSocial from './WidgetPanel/WidgetPanelSocial';
import TokenDetective from '../TokenDetective';
import VolumeGraph from './StagePanel/VolumeGraph';
import TokenTransactionsOptions from './TokenTransactionsOptions';


// TimeAgo.addDefaultLocale(en);





const mdTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function DashboardContent() {
  const [open, setOpen] = React.useState(true);
  const {audioEnabled, setAudioEnabled} = React.useContext(GeneralContext);
  const {watchedTokenList, setWatchedTokenList} = useContext(GeneralContext);
  const {getnewTxData, setgetnewTxData} = useContext(GeneralContext); //this is the trigger to get new data from the api. value is the address of the token
  const {setviewingTokenAddress} = useContext(GeneralContext); //this is the address of the token we are viewing
  const {setclickedDetailsAddress} = useContext(GeneralContext); //this is the address of the token we are viewing
  const {setclickedDetailsAddressFN} = useContext(GeneralContext); //this is the address of the token we are viewing
  const {clickedTokenSymbol} = useContext(GeneralContext);
  const {setclickedToken} = useContext(GeneralContext);
  const {LpTotalTokensHeld, setLpTotalTokensHeld} = useContext(GeneralContext);
  
  const {chainDataHeartbeat} = useContext(GeneralContext);
  const [chainDataHeartbeatDiff, setchainDataHeartbeatDiff] = React.useState(0);
  
  const {MinAmountFilterValue, setMinAmountFilterValue} = useContext(GeneralContext);
  const {MaxAmountFilterValue, setMaxAmountFilterValue} = useContext(GeneralContext);
  const {systemStatuses} = useContext(GeneralContext);
  const {setfilteredtxDataInflow} = useContext(GeneralContext);
  const {setfilteredtxDataOutflow} = useContext(GeneralContext);
  const [clickedSearchBar, setclickedSearchBar] = React.useState(false);
  const [showTokenSelector, setshowTokenSelector] = React.useState(false);
  const [searchInput, setsearchInput] = useState("")
  const {DisplayMinAmountFilterValue} = useContext(GeneralContext);
  const {DisplayMaxAmountFilterValue} = useContext(GeneralContext);
  const {latestEthBlock} = useContext(GeneralContext); 
  const {detectedLPs} = useContext(GeneralContext); 
  const {txDataChart, settxDataChart} = useContext(GeneralContext);
  const {txDataChartOverTime, settxDataChartOverTime} = useContext(GeneralContext); 
  const {setLpChartData} = useContext(GeneralContext); 
  const {LpToken0Token1HeldByProvider, setLpToken0Token1HeldByProvider} = useContext(GeneralContext); 
  const {watchedTokenPriceUsd} = useContext(GeneralContext);


  const [toggleShowLPDiv, settoggleShowLPDiv] = React.useState(false);
  const {logScaleTickBox} = useContext(GeneralContext)
  const {setRequestLiquidityPoolPrice} = useContext(GeneralContext); 
  
  
  const [fakeData, setfakeData] = React.useState([{poolName: 'UniSwap v3 Pool', heldAmount: 'held: 600,241', linkedPair:'MATIC',priceUsd:'$0.21'}, {poolName: 'XT.com', linkedPair: 'WBTC', heldAmount:'held: 26,402',priceUsd:'$0.18'}, {poolName: 'Pancake Swap', heldAmount: 'held: 147,062', linkedPair:'USDC',priceUsd:'$0.24'}]);


  function prepareLPChartData (LPs){
    //for each key in the LPs.uniswap_v3_pools object, console log the key and the value
    let temp = [];
    let temp2 = {};
    let index = 0;
    let totalToken0Held = 0;
    let totalToken1Held = 0;
    Object.keys(LPs.uniswap_v3_pools).forEach(function(key) {
      
      if (LPs.uniswap_v3_pools[key][0]){
        console.log('LPs.uniswap_v3_pools[key][0]: ',LPs.uniswap_v3_pools[key][0]); 

        const regex = new RegExp('Address', 'i');
        const regex2 = new RegExp('Pool', 'i');
        
        let PoolTokenAddys = {};

        //for each key name in the object
        Object.keys(  LPs.uniswap_v3_pools[key][0]  ).forEach(key2 => {
          const match = key2.match(regex);
          const match2 = key2.match(regex2);
          if (match && !match2) {
            PoolTokenAddys[key2] = LPs.uniswap_v3_pools[key][0][key2];
          }
        }); 
        let feeAmount = LPs.uniswap_v3_pools[key][0]["Fee Tier"];
        if (feeAmount == "1%" ) { feeAmount = 10000 }
        
        //add the others.. WALRUS 
        // if (feeAmount == "0.1%" ) { feeAmount == 10000 }
        // if (feeAmount == "0.05%" ) { feeAmount == 500 }
        
        console.log('PoolTokenAddys: ',PoolTokenAddys, 'feeAmount: ', feeAmount);
        //convert PoolTOkenAddys to an array
        const PoolTokenAddysArray = Object.keys(PoolTokenAddys).map(function(key3) {
          return PoolTokenAddys[key3];
        });
        setRequestLiquidityPoolPrice({token0: PoolTokenAddysArray[0], token1: PoolTokenAddysArray[1], feeAmount: feeAmount})


        //for each key in PoolTokenAddys, console log the key and the value
        Object.keys(PoolTokenAddys).forEach(function(key3) {
          console.log('key: ',key3, 'value: ', PoolTokenAddys[key3] );
          //request here
          
        });
      }
 

      
      LPs.uniswap_v3_pools[key].forEach(function(item) {
        if (item && item.ownerOf && item.ownerOf.friendlyName){
          index++;
          // console.log('____',displayAddressFN(item.ownerOf.friendlyName), item.lowerLimit, item.upperLimit, item.token0Held, item.token1Held, index, item);
          
          totalToken0Held += item.token0Held;
          totalToken1Held += item.token1Held;
          if ( (item.token0Held == 0 && item.token1Held == 0) ) {
            console.log('skipping ', displayAddressFN(item.ownerOf.friendlyName) )
          }
          else { 
            if (item.ownerOf){
              temp.push( {name: item.ownerOf.friendlyName, lowerLimit: item.lowerLimit, upperLimit: item.upperLimit, index: index, token0Held: item.token0Held, token1Held: item.token1Held} );
            }
          }


          if (!temp2[displayAddressFN(item.ownerOf.friendlyName)]){
            temp2[displayAddressFN(item.ownerOf.friendlyName)] = {}
            temp2[displayAddressFN(item.ownerOf.friendlyName)].token0 = 0;
            temp2[displayAddressFN(item.ownerOf.friendlyName)].token1 = 0;
            }
          
          // console.log('token0: ', item.token0Held, 'token1: ', item.token1Held); 

          temp2[displayAddressFN(item.ownerOf.friendlyName)].token0 = temp2[displayAddressFN(item.ownerOf.friendlyName)].token0 + item.token0Held;
          temp2[displayAddressFN(item.ownerOf.friendlyName)].token1 = temp2[displayAddressFN(item.ownerOf.friendlyName)].token1 + item.token1Held;
          
          setLpTotalTokensHeld({token0Held: totalToken0Held, token1Held: totalToken1Held});
          setLpToken0Token1HeldByProvider(temp2);
          setLpChartData(temp);
        }
        else return;
      });
    });
  }


  useEffect(() => {
    if (logScaleTickBox) {
      console.log('logScaleTickBox: ',logScaleTickBox);
    }
  },[logScaleTickBox]);

  useEffect(() => {
    if (LpToken0Token1HeldByProvider) {
      console.log('LpToken0Token1HeldByProvider: ',LpToken0Token1HeldByProvider);
    }
  },[LpToken0Token1HeldByProvider]);
  
  
  useEffect(() => {
    if (detectedLPs) {
      console.log('detectedLPs: ', detectedLPs)
      prepareLPChartData(detectedLPs);
    }
  },[detectedLPs]);

  


  useEffect(() => {
    // console.log('systemStatuses: ', showTokenSelector)
  },[systemStatuses]);

  useEffect(() => {
    console.log('showTokenSelector: ', showTokenSelector)
  },[showTokenSelector]);
  
  useEffect(() => {

  },[DisplayMinAmountFilterValue]);

  useEffect(() => {

  },[DisplayMaxAmountFilterValue]);


  useEffect(() => {
    const temp = new Date().getTime();
    // console.log("chainData heartbeat: ", (temp - chainDataHeartbeat))
    setchainDataHeartbeatDiff(temp - chainDataHeartbeat);
  },[chainDataHeartbeat]);


  useEffect(() => {
    // console.log("CATCH- chainData heartbeat diff from db: ", chainDataHeartbeatDiff);
  },[chainDataHeartbeatDiff]);




  
  useEffect(()=>{
    if (searchInput){
      console.log('search input: ', searchInput)
    }
  },[searchInput])

  useEffect(()=>{
    if (latestEthBlock){
      // console.log('latestEthBlock: ', latestEthBlock)
    }
  },[latestEthBlock]);

  useEffect(()=>{
    if (clickedSearchBar){
      setsearchInput("") // clear the search field when we open the search bar
    }
  },[clickedSearchBar])



const displayAddressFN = (clickedDetailsAddressFN) => {
  let firstAddress;
  Object.keys(clickedDetailsAddressFN).map(key => {
    if (key !== '_id' && key !== 'address' && typeof clickedDetailsAddressFN[key] === 'string' && !clickedDetailsAddressFN[key].startsWith('0x') ) {
      firstAddress = clickedDetailsAddressFN[key];
      return;
    } else if (key === 'address') {
      firstAddress = getEllipsisTxt(clickedDetailsAddressFN[key], 6);
      return;
    }
  });
  return firstAddress;
}

function determineExitPair(poolAddressObj, nativeSymbol){
  let exitPair;
  Object.keys(poolAddressObj).map(key => {
    if ((key.includes('Address')) && (!key.includes('Pool')) && (poolAddressObj[key] !== nativeSymbol)) 
    {
      exitPair = key;
      exitPair = exitPair.slice(0, -7);
    }
  });
  return exitPair;

}

function filterToUniqueLPProviders(LpArray) {
  // gets count of UNIQUE LP providers
  let uniqueLpProviders    = [];
  let uniqueLpProvidersFN  = [];
  let uniqueLpProvidersObj = {};
  LpArray.map((lp) => {
    if (lp && lp.ownerOf && lp.ownerOf.ownerOf &&  !uniqueLpProvidersObj[lp.ownerOf.ownerOf]) {
      uniqueLpProvidersObj[lp.ownerOf.ownerOf] = true;
      uniqueLpProviders.push(lp.ownerOf.ownerOf);
      uniqueLpProvidersFN.push(lp.ownerOf.friendlyName);
    }
  });
  
  return uniqueLpProviders.length;

}
function filterToUniqueLPProvidersFN(LpArray) {
  // gets count of UNIQUE LP providers' Friendly Names
  let uniqueLpProvidersFN  = [];
  let uniqueLpProvidersObj = {};
  LpArray.map((lp) => {
    if (lp && lp.ownerOf && lp.ownerOf.ownerOf &&  !uniqueLpProvidersObj[lp.ownerOf.ownerOf]) {
      uniqueLpProvidersObj[lp.ownerOf.ownerOf] = true;
      uniqueLpProvidersFN.push(lp.ownerOf.friendlyName);
    }
  });

  return uniqueLpProvidersFN;

}

function determineExchangeColorMockup(poolName){
  if (poolName === 'Uniswap'){
    return '1px solid #FF007A'
  } else if (poolName === 'XT.com'){
    return '1px solid #00FF7A'
  } 
  else if (poolName === 'Binance'){
    return '1px solid #00FF7A'
  }
  else if (poolName === 'Pancake Swap'){
    return '1px solid #007AFF'
  }
   else {
    return '#000000'
  }
}

function determineLpHeldCount(friendlyNameObj, LpArray) {
  // gets count of LP tokens held by address
  let lpHeldCount = 0;
  LpArray.map((lp) => {
    // console.log(lp);
    if (lp && lp.ownerOf && lp.ownerOf.ownerOf && friendlyNameObj.address){
      if (lp.ownerOf.ownerOf.toUpperCase() === friendlyNameObj.address.toUpperCase()) {
        lpHeldCount++;
      }
    }
  });
  // console.log('lpHeldCount: ', lpHeldCount, friendlyNameObj.address)
  return lpHeldCount;
}

const [activeWidgetTab, setActiveWidgetTab] = useState('Stats');
const [activeStageTab, setActiveStageTab] = useState('Visualizer');

  return (
    <div style={{width:'100%', position:'absolute', border:'0px solid #ff0'}}>
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />


        
          
       
          <Toolbar />
          <div style={{position:'absolute', width:"100%", height:'100%',display:'flex',justifyContent:'center',}}>
            {/* <div style={{position:'absolute', top:'8vh', left:'6.5%', color:'rgba(150,220,255,0.9)', fontSize:'1vw', }}>
              Token Info
            </div> */}
            {/* <ExamplePopUpWindow /> */}
            

           

            <div 
            style={{
              
              
              border: '1px solid rgba(150,220,255,0.5)',
              position: 'absolute',
              width: '16vw',
              borderRadius: '0.5vw',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh',
              backgroundColor: 'rgba(0,0,0,0.2)',
              left: '1vw',
              top: '11vh',
              zIndex: '2'
            }}
          > 
           <div className="tabs-widget-container">
                <div className={activeWidgetTab === 'Stats' ? "tab active" : "tab"} onClick={() => setActiveWidgetTab('Stats')}>Stats</div>
                <div className={activeWidgetTab === 'Distribution' ? "tab active" : "tab"} onClick={() => setActiveWidgetTab('Distribution')}>Distribution</div>
                <div className={activeWidgetTab === 'Social' ? "tab active" : "tab"} onClick={() => setActiveWidgetTab('Social')}>Social</div>
            </div>

            {activeWidgetTab === 'Stats' && <WidgetPanelStats />}
            {activeWidgetTab === 'Distribution' && <WidgetPanelDistribution />}
            {activeWidgetTab === 'Social' && <WidgetPanelSocial />}

          </div>
            

            <div style={{position:'absolute', width:'80%', right:'2vw', top:'10vh', border:'0px solid #ff0'}}>
              <div className="tabs-stage-container">
                  <div className={activeStageTab === 'Visualizer' ? "tab active" : "tab"} onClick={() => setActiveStageTab('Visualizer')}>Visualizer</div>
                  <div className={activeStageTab === 'Volume' ? "tab active" : "tab"} onClick={() => setActiveStageTab('Volume')}>Volume</div>
              </div>


              <div style={{position:'absolute', width:'100%', height:'50vh', border:'1px solid rgba(255,255,255,0.4)',  top:'1vh',borderRadius: '0.5vw',overflow:'hidden'}}>
                
                {activeStageTab === 'Visualizer' && <ForceGraphComponent />}
                {activeStageTab === 'Volume' && <VolumeGraph />}

              </div>




            </div>
              <div style={{position:'absolute', width:'80vw',right:'2vw',top:'62vh',}}>
                <TokenTransactions />
              </div>
                <TokenTransactionsOptions />
            
           
            </div>
        </Box>
      {/* </Box> */}
      

      


    </ThemeProvider>
      </div>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}