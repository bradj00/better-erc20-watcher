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
  const timeAgo = new TimeAgo('en-US'); 

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
            
            <div style={{position:'absolute', width:'80%', top:'10vh', border:'0px solid #ff0'}}>
              
              <div style={{position:'absolute', width:'100%', display:'flex',}}>
                <div style={{position:'absolute', left:'0', width:'75%', height:'25vh',padding:'1.5vw', border:'0px solid #f0f'}}>
                  <Chart />
                </div>

                <div style={{backgroundColor:'rgba(0,0,0,0.2)',display:'flex', justifyContent:'center', borderRadius:'0.5vw', position:'absolute', right:'0', width:'25%', height:'25vh',padding:'1.5vw', border:'0px solid #f0f'}}>
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
