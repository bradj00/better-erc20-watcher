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
import Chart from './Chart';
import TokenVolumeDash from './TokenVolumeDash';
import Orders from './Orders';
import { GeneralContext } from '../App';
import AudioToggle from './subcomponents/AudioToggle';
import SearchIcon from '@mui/icons-material/Search';
import SecondaryList from './subcomponents/SecondaryList';
import MainList from './subcomponents/MainList';
import {getEllipsisTxt} from './helpers/h.js';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {commaNumber} from './helpers/h.js';
import ConnectionStatusBanner from './ConnectionStatusBanner';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import tokenImage from './images/token_image.png';
import LinkIcon from '@mui/icons-material/Link';
import ChartAddysOverTime from './ChartAddysOverTime';

TimeAgo.addDefaultLocale(en);



function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {/* {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'} */}
    </Typography>
  );
}


// const drawerWidth = 240;
const drawerWidth = 320;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

const mdTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function DashboardContent() {
  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };
  const {audioEnabled, setAudioEnabled} = React.useContext(GeneralContext);
  const {watchedTokenList, setWatchedTokenList} = useContext(GeneralContext);
  const {getnewTxData, setgetnewTxData} = useContext(GeneralContext); //this is the trigger to get new data from the api. value is the address of the token
  const {viewingTokenAddress, setviewingTokenAddress} = useContext(GeneralContext); //this is the address of the token we are viewing
  const {clickedDetailsAddress, setclickedDetailsAddress} = useContext(GeneralContext); //this is the address of the token we are viewing
  const {clickedDetailsAddressFN, setclickedDetailsAddressFN} = useContext(GeneralContext); //this is the address of the token we are viewing
  const {clickedTokenSymbol, setclickedTokenSymbol} = useContext(GeneralContext);
  const {clickedToken, setclickedToken} = useContext(GeneralContext);
  
  const {chainDataHeartbeat, setchainDataHeartbeat} = useContext(GeneralContext);
  const [chainDataHeartbeatDiff, setchainDataHeartbeatDiff] = React.useState(0);
  
  const {MinAmountFilterValue, setMinAmountFilterValue} = useContext(GeneralContext);
  const {MaxAmountFilterValue, setMaxAmountFilterValue} = useContext(GeneralContext);
  const {systemStatuses, setSystemStatuses} = useContext(GeneralContext);
  const {filteredtxDataInflow,   setfilteredtxDataInflow} = useContext(GeneralContext);
  const {filteredtxDataOutflow,  setfilteredtxDataOutflow} = useContext(GeneralContext);
  const [clickedSearchBar, setclickedSearchBar] = React.useState(false);
  const [showTokenSelector, setshowTokenSelector] = React.useState(false);
  const [searchInput, setsearchInput] = useState("")
  const {DisplayMinAmountFilterValue, setDisplayMinAmountFilterValue} = useContext(GeneralContext);
  const {DisplayMaxAmountFilterValue, setDisplayMaxAmountFilterValue} = useContext(GeneralContext);
  const {latestEthBlock, setlatestEthBlock} = useContext(GeneralContext); 
  const {detectedLPs, setdetectedLPs} = useContext(GeneralContext); 
  const {txDataChart, settxDataChart} = useContext(GeneralContext);
  const {txDataChartOverTime, settxDataChartOverTime} = useContext(GeneralContext); 
  
  const [toggleShowLPDiv, settoggleShowLPDiv] = React.useState(false);
  
  
  const timeAgo = new TimeAgo('en-US'); 
  
  const [fakeData, setfakeData] = React.useState([{poolName: 'UniSwap v3 Pool', heldAmount: 'held: 600,241', linkedPair:'MATIC',priceUsd:'$0.21'}, {poolName: 'XT.com', linkedPair: 'WBTC', heldAmount:'held: 26,402',priceUsd:'$0.18'}, {poolName: 'Pancake Swap', heldAmount: 'held: 147,062', linkedPair:'USDC',priceUsd:'$0.24'}]);



  useEffect(() => {
    if (detectedLPs) {
      console.log('detectedLPs: ', detectedLPs)
    }
  },[detectedLPs]);

  


  useEffect(() => {
    console.log('systemStatuses: ', showTokenSelector)
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







  // function updateSelectedToken (){
  //   // setviewingTokenAddress(); 
  //   setclickedDetailsAddress(null);
  //   setclickedDetailsAddressFN(null);
  
  //   setfilteredtxDataInflow(); 
  //   setfilteredtxDataOutflow();
  // }
  
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



  function updateSelectedToken (token){

    console.log('clicked: ',token, token); 
    setviewingTokenAddress(token.tokenAddress.address); 
    setclickedDetailsAddress(null);
    setclickedDetailsAddressFN(null);
    document.title = "👁️ "+token.tokenAddress.name;
    setclickedTokenSymbol(token.tokenAddress.symbol);
    setclickedToken(token); 
    setfilteredtxDataInflow(); 
    setfilteredtxDataOutflow(); 
}


  // clipboard copy method cannot be used without HTTPS and I haven't written my API for https yet. This hack is temp.
  /////////////////////////////////////////////////
  const CopyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy')
    } catch (err) {
        console.error('Unable to copy to clipboard', err)
    }
    document.body.removeChild(textArea)
};
  /////////////////////////////////////////////////

function function66(e){
  console.log("function66:", e)
}

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
    if (!uniqueLpProvidersObj[lp.ownerOf.ownerOf]) {
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
    if (!uniqueLpProvidersObj[lp.ownerOf.ownerOf]) {
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


  return (
    <div style={{overflow:'hidden'}}>
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />


          
          {/* <div style={{fontSize:'1.5vh', position:'absolute', right:'15vw', top:'0.5vh', display:'flex', justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.4)',width:'13vw', height:'6.5vh'}}>
            <div style={{}}>
              <div  style={{position:'absolute', left:'0', top:'0', textAlign:'center',  display:'flex', justifyContent:'center', width:'100%', }}>
                Filter Amount
              </div>

              <div style={{ bottom:'0',}}>
                <input type="number" value={DisplayMinAmountFilterValue} onChange={(e) => setMinAmountFilterValue(e.target.value)} style={{width:'5vw',marginRight:'1vw', height:'2.5vh', backgroundColor:'rgba(0,0,0,0.4)', color:'white', border:'none', textAlign:'center'}} placeholder="Min" />
                <input type="number" value={DisplayMaxAmountFilterValue} onChange={(e) => setMaxAmountFilterValue(e.target.value)} style={{width:'5vw', height:'2.5vh', backgroundColor:'rgba(0,0,0,0.4)', color:'white', border:'none', textAlign:'center'}} placeholder="Max" />
              </div>

              <div className="filterResetHover" onClick={() =>{setMaxAmountFilterValue(); setMinAmountFilterValue();setDisplayMaxAmountFilterValue(0); setDisplayMinAmountFilterValue(0) }} style={{position:'absolute', left:'0', bottom:'0', textAlign:'center',  display:'flex', justifyContent:'center', width:'100%', }}>
                Reset
              </div>
            </div>
          </div> */}


             


              {/* <div style={{position:'absolute', right: '1vw', top:'1vh',zIndex:'9999',}}>
                <AudioToggle />
              </div> */}

          
          {/* it went here WALRUS  */}
          
       
          <Toolbar />
          <div style={{position:'absolute', width:"100%", height:'100%',display:'flex',justifyContent:'center',}}>
            <div style={{position:'absolute', top:'8vh', left:' 5%', color:'rgba(150,220,255,0.9)', fontSize:'1vw', }}>
              Detected DEXs
            </div>
            
            <div style={{overflowY:'scroll', overflowX:'hidden', border:'1px solid rgba(100,100,100,0.4)',  position:'absolute', width:'16vw', borderRadius: '0.5vw', display:'flex', justifyContent:'center', alignItems:'center', height:'47vh', backgroundColor:'rgba(0,0,0,0.2)', left:'1vw', top:'11vh', }}>
              
              {/* map of fake data array that show like placeholder cards */}
              <div style={{position:'absolute',  top:'5%',  width:'90%', color:'#fff', fontSize:'1vw', }}>
                {detectedLPs? detectedLPs.uniswap_v3_pools? Object.keys(detectedLPs.uniswap_v3_pools).map((item,index) => { 
                  return (
                    <div style={{padding:'0.5vw', height:'20vh', backgroundColor:'rgba(0,0,0,0.4)', border:determineExchangeColorMockup('Uniswap'), marginBottom:'0.3vh', borderRadius: '0.5vw',position:'relative', top: index*5+'%', left:' 0%', color:'#fff', fontSize:'1vw', }}>
                      <div style={{position:'relative', top: '0%', left:' 0%', color:'#fff', fontSize:'1vw', }}>
                        Uniswap v3
                      </div>
                      <div onClick={()=>{ settoggleShowLPDiv(true) }} className="hoverOpacity" style={{ position:'absolute', bottom: '1%', left:'3%', fontSize:'0.75vw', fontStyle:'italic' }}>
                        {filterToUniqueLPProviders(detectedLPs.uniswap_v3_pools[item])} providers ({detectedLPs.uniswap_v3_pools[item].length})
                      </div>
                      <div style={{position:'absolute', top:'0vh',  right:'2%', color:'rgba(0,255,0,0.8)', fontSize:'1vw', }}>
                        $0.21
                      </div>
                      <div title="exit liquidity" style={{display:'flex', position:'absolute', top:'35%',fontSize:'0.85vw',  left:'1%', color:'#aaa', fontStyle:'italic',  }}>
                        <div>
                          4.6
                        </div>
                        <LinkIcon style={{marginLeft:'0.35vw'}}/>
                        <div>{determineExitPair(detectedLPs.uniswap_v3_pools[item][0], clickedTokenSymbol? clickedTokenSymbol : 'nullll')}</div>
                      </div>
                      <div style={{position:'absolute', left:'2%',fontStyle:'italic', fontSize:'0.75vw',bottom:'30%',color:'#666'}}>
                        {getEllipsisTxt(item,6)}
                      </div>
                      <div style={{ position:'relative', border:'0px solid #0f0', height:'78%', backgroundColor:'rgba(255,0,155,0.2)', borderRadius:'0.5vw', padding:'0.2vw', overflowY:'scroll', width:'55%',float:'right',}}>
                        {filterToUniqueLPProvidersFN(detectedLPs.uniswap_v3_pools[item]).map((friendlyNameObj,index) => {
                            return (
                              <div style={{position:'relative', bottom:'0%', textAlign:'right', lineHeight:'1.5vh', right:'3%', color:'#fff', fontSize:'0.75vw', }}>
                                {displayAddressFN(friendlyNameObj)}
                              </div>
                            )
                          })
                        }
                      </div>
                    </div>
                  )
                })
                : null : null}
              </div>
            </div>
            


            <div style={{position:'absolute', top:'62vh', left:' 5%', color:'rgba(150,220,255,0.9)', fontSize:'1vw', }}>
              Central Exchanges
            </div>
            <div style={{overflowY:'scroll', overflowX:'hidden', border:'1px solid rgba(100,100,100,0.4)',  position:'absolute', width:'16vw', borderRadius: '0.5vw', display:'flex', justifyContent:'center', alignItems:'center', height:'30vh', backgroundColor:'rgba(0,0,0,0.2)', left:'1vw', top:'65vh', }}>
              
              {/* map of fake data array that show like placeholder cards */}
              <div style={{position:'absolute', top:'5%',  width:'90%', color:'#fff', fontSize:'1vw', }}>
                {detectedLPs? detectedLPs.uniswap_v3_pools? Object.keys(detectedLPs.uniswap_v3_pools).map((item,index) => { 
                  return (
                    <>
                    <div style={{padding:'0.5vw', backgroundColor:'rgba(0,0,0,0.4)', border:determineExchangeColorMockup('XT.com'), marginBottom:'0.3vh', borderRadius: '0.5vw',position:'relative', top: index*5+'%', left:' 0%', color:'#fff', fontSize:'1vw', }}>
                      <div style={{position:'relative', top: '0%', left:' 0%', color:'#fff', fontSize:'1vw', }}>
                        {/* {item.name.slice(0,7)} */}
                        XT.com
                      </div>
                      <div style={{position:'relative', top: '0%', left:' 10%', color:'#fff', fontSize:'0.75vw', }}>
                        {/* {item.heldAmount} */}
                        600,241
                      </div>
                      <div style={{position:'absolute', top:'0vh',  right:'2%', color:'rgba(0,255,0,0.8)', fontSize:'1vw', }}>
                        {/* {item.priceUsd} */}
                        $0.19
                      </div>
                      <div title="exit liquidity" style={{display:'flex', position:'absolute', top:'2.5vh',fontSize:'0.85vw',  right:'25%', color:'#aaa', fontStyle:'italic',  }}>
                      {/* <div></div>
                      <LinkIcon />
                      <div></div> */}
                      </div>
                      <div style={{position:'absolute', right:'2%',fontStyle:'italic', fontSize:'0.75vw',bottom:'0',color:'#666'}}>
                        {getEllipsisTxt(item["Pool Address"],6)}
                      </div>
                    </div>
                    <div style={{padding:'0.5vw', backgroundColor:'rgba(0,0,0,0.4)', border:determineExchangeColorMockup('Binance'), marginBottom:'0.3vh', borderRadius: '0.5vw',position:'relative', top: index*5+'%', left:' 0%', color:'#fff', fontSize:'1vw', }}>
                      <div style={{position:'relative', top: '0%', left:' 0%', color:'#fff', fontSize:'1vw', }}>
                        {/* {item.name.slice(0,7)} */}
                        Binance
                      </div>
                      <div style={{position:'relative', top: '0%', left:' 10%', color:'#fff', fontSize:'0.75vw', }}>
                        {/* {item.heldAmount} */}
                        126,400
                      </div>
                      <div style={{position:'absolute', top:'0vh',  right:'2%', color:'rgba(0,255,0,0.8)', fontSize:'1vw', }}>
                        {/* {item.priceUsd} */}
                        $0.183
                      </div>
                      <div title="exit liquidity" style={{display:'flex', position:'absolute', top:'2.5vh',fontSize:'0.85vw',  right:'25%', color:'#aaa', fontStyle:'italic',  }}>
                      {/* <div></div>
                      <LinkIcon />
                      <div></div> */}
                      </div>
                      <div style={{position:'absolute', right:'2%',fontStyle:'italic', fontSize:'0.75vw',bottom:'0',color:'#666'}}>
                        {getEllipsisTxt(item["Pool Address"],6)}
                      </div>
                    </div>
                    </>
                  )
                })
                : null : null}
              </div>
            </div>

            <div style={{position:'absolute', width:'80%', right:'2vw', top:'10vh', border:'0px solid #ff0'}}>
              
              <div style={{position:'absolute', width:'100%', display:'flex',}}>
                <div style={{position:'absolute', left:'-1vw',top:'2.98vh', width:'59.7vw', height:'35.02vh',padding:'1.5vw', border:'0px solid #f0f'}}>
                  <Chart />
                </div>
                <div style={{position:'absolute', left:'-1vw', top:'-3vh', width:'75%', height:'30vh',padding:'1.5vw', border:'0px solid #f0f'}}>
                  <ChartAddysOverTime data={txDataChartOverTime}/> 
                </div>

                <div style={{backgroundColor:'rgba(0,0,0,0.2)',display:'flex', textAlign:'center', justifyContent:'center', borderRadius:'0.5vw', position:'absolute', right:'0', top:'0vh', width:'25%', height:'10vh',alignItems:'center', border:'1px solid rgba(100,100,100,0.4)',}}>
                  Holders: 42,069<br></br>
                  (draw line chart over bar chart for total holders)
                </div>
                <div style={{backgroundColor:'rgba(0,0,0,0.2)',display:'flex', justifyContent:'center', borderRadius:'0.5vw', position:'absolute', right:'0', top:'11vh',width:'25%', height:'25vh',padding:'1.5vw', border:'1px solid rgba(100,100,100,0.4)',}}>
                  <TokenVolumeDash />
                </div>
                
              </div>

              <div style={{position:'absolute', width:'100%', top:'35vh',}}>
                <Orders />
              </div>

            </div>
            
           
            </div>
        </Box>
      {/* </Box> */}
      

      


      {/* <List style={{overflow:'hidden'}} component="nav">
        <MainList />
        <SecondaryList />
      </List> */}
    </ThemeProvider>
      </div>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
