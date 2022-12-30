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
  const {getnewTxData, setgetnewTxData} = useContext(GeneralContext); //this is the trigger to get new data from the api. value is the address of the token
  const {viewingTokenAddress, setviewingTokenAddress} = useContext(GeneralContext); //this is the address of the token we are viewing
  const {clickedDetailsAddress, setclickedDetailsAddress} = useContext(GeneralContext); //this is the address of the token we are viewing
  const {clickedDetailsAddressFN, setclickedDetailsAddressFN} = useContext(GeneralContext); //this is the address of the token we are viewing
  const {clickedTokenSymbol, setclickedTokenSymbol} = useContext(GeneralContext);
  
  const {chainDataHeartbeat, setchainDataHeartbeat} = useContext(GeneralContext);
  const [chainDataHeartbeatDiff, setchainDataHeartbeatDiff] = React.useState(0);
  
  const {MinAmountFilterValue, setMinAmountFilterValue} = useContext(GeneralContext);
  const {MaxAmountFilterValue, setMaxAmountFilterValue} = useContext(GeneralContext);
  const {systemStatuses, setSystemStatuses} = useContext(GeneralContext);
  const {filteredtxDataInflow,   setfilteredtxDataInflow} = useContext(GeneralContext);
  const {filteredtxDataOutflow,  setfilteredtxDataOutflow} = useContext(GeneralContext);
  const [clickedSearchBar, setclickedSearchBar] = React.useState(false);
  const [searchInput, setsearchInput] = useState("")
  const {DisplayMinAmountFilterValue, setDisplayMinAmountFilterValue} = useContext(GeneralContext);
  const {DisplayMaxAmountFilterValue, setDisplayMaxAmountFilterValue} = useContext(GeneralContext);
  const {latestEthBlock, setlatestEthBlock} = useContext(GeneralContext); 
  const timeAgo = new TimeAgo('en-US'); 

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







  function updateSelectedToken (){
    // setviewingTokenAddress(); 
    setclickedDetailsAddress(null);
    setclickedDetailsAddressFN(null);
  
    setfilteredtxDataInflow(); 
    setfilteredtxDataOutflow();
  }
  
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

        {/* <AppBar position="absolute" open={open}> */}
          {/* <Toolbar
            sx={{
              pr: '24px', // keep right padding when drawer closed
            }}
          > */}
          <div style={{fontSize:'1.5vh', position:'absolute', right:'15vw', top:'0.5vh', display:'flex', justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.4)',width:'13vw', height:'6.5vh'}}>
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
          </div>


              <div style={{position:'absolute', height:'7vh', width:'83.5vw',paddingLeft:'0.5vw', paddingRigth:'0.5vw', right:'0', border:'1px solid #f0f', display:'flex', justifyContent:'left', alignItems:'center', top:'0',}}>
              <div style={{zIndex:'9999', }} onClick={()=>{ console.log('clicked to clear filter') }}>
                {
                  viewingTokenAddress? 
                    <div style={{zIndex:'10000'}} onClick={() => { console.log('asldfkjdsflkdsfj'); CopyToClipboard(viewingTokenAddress) }}>
                      <div style={{zIndex:'1',paddingRight:'2vw',marginTop:'-3vh'}} onClick={() => {updateSelectedToken();setclickedSearchBar(false) }}>
                      {    clickedTokenSymbol? <>${clickedTokenSymbol}</> : '...'}
                      </div>
                      <div style={{color:'#999',fontSize:'2vh', bottom:'0.1vh', position:'absolute',}}  >
                      {getEllipsisTxt(viewingTokenAddress, 6)}
                      </div>
                    </div>
                  : 
                    <></>
                }
              </div>
                
                <div style={{color:'#999', width:'30%',display:'flex', border:'1px solid #ff0', position:'absolute', top:'25%', left:'13%'}} onClick={() => {setclickedSearchBar(!clickedSearchBar) }}>
                {viewingTokenAddress? <SearchIcon />:<></>}
                
                {
                  (clickedDetailsAddressFN || clickedSearchBar)?
                    clickedSearchBar?
                  
                    <div style={{zIndex:'9999', }} id="searchBox" >
                      <form onSubmit={(e)=>{console.log('searching watchedToken TXs for address: ', searchInput); e.preventDefault(); setclickedDetailsAddress(searchInput); setclickedSearchBar(false); !clickedDetailsAddressFN? setclickedDetailsAddressFN(searchInput): <></> }}>
                        <input style={{backgroundColor:'rgba(0,0,0,0.2)',height:'5vh', width:'20vw', display:'flex',textAlign:'center', border:'1px solid #fff', color:'#fff'}} autoFocus placeholder='search for a holder address' type="text" value={searchInput? searchInput: ''} onChange={(e) => {setsearchInput(e.target.value); }}  />
                      </form>
                    </div>
                  
                    :
                    <div style={{zIndex:'9999', }} onClick={()=>{setclickedSearchBar(!clickedSearchBar)}}>
                    {displayAddressFN(clickedDetailsAddressFN)}
                    </div>
                  :
                  <div style={{zIndex:'9999', color:'#999', position:'absolute', left:'15%', }} id="searchBox" onClick={()=>{setclickedSearchBar(!clickedSearchBar)}}>
                    {viewingTokenAddress? <>(click to search)</>:<></>}
                  </div>
          
                } 
                </div>
              </div>
            {/* </Typography> */}

              <div style={{position:'absolute', right: '1vw', top:'1vh',zIndex:'9999',}}>
                <AudioToggle />
              </div>

          {/* </Toolbar> */}
        {/* </AppBar> */}
                
        {/* <Drawer variant="permanent" open={open}> */}
          <div style={{width:'16.5vw'}}>
          <Toolbar sx={{display: 'flex',alignItems: 'center',justifyContent: 'flex-end',px: [1],}} />
          <Divider />
          


          <List style={{overflow:'hidden'}} component="nav">
            <MainList />
            <SecondaryList />
          </List>
          
          <div style={{border:'0px solid #0aa', color:'#999', position:'absolute',bottom:'0%', width:'16.5vw', height:'20vh', display:'flex', justifyContent:'center', alignItems:'center'}}>
                  
                  <div className={chainDataHeartbeatDiff? chainDataHeartbeatDiff > 5000? "deadHeartbeat":"goodHeartbeat":""} style={{position:'absolute', width:'100%',height:'100%', fontSize:'3vh', zIndex:'9999',  display:'flex', justifyContent:'center', alignItems:'center',  backgroundColor:chainDataHeartbeatDiff? chainDataHeartbeatDiff > 1000?'rgba(150,30,30,1)': 'rgba(0,150,0,0.4)':'rgba(150,150,0,0.8)',}}>
                      {chainDataHeartbeatDiff? chainDataHeartbeatDiff > 5000?  <>stale data</>: <>up to date</>: <>fetching data</>}
                      {/* {chainDataHeartbeatDiff? chainDataHeartbeatDiff:<></>} */}

                  </div>
                  
                  <div style={{position:'absolute', top:'2%',  }}>
                    Services Health:
                  </div>
                  <div style={{width:'95%', textAlign:'left', }}>
                    <div style={{position:'relative', left:'2%'}}>
                      Latest Block: 
                      <div style={{float:'right', position:'absolute', top:'0', right:'5%'}}> 
                        {latestEthBlock? <a target="blank_" href={("https://etherscan.io/block/"+latestEthBlock.block)}> {commaNumber(latestEthBlock.block)} </a>:<>...</>}
                      </div>
                    </div>

                    <div style={{position:'relative', left:'2%'}}>
                      TX Ingestion: 
                      <div style={{float:'right', position:'absolute', top:'0', right:'5%'}}>
                         <CheckCircleOutlineIcon style={{color:'#0a0'}}/> 
                      </div>
                    </div>

                    <div style={{position:'relative', left:'2%'}}>
                      Address Translator: 
                        <div style={{float:'right', position:'absolute', top:'0', right:'5%', color:'#aa0'}}> 
                          
                          
                          { // find the 'translator' service in the array of services
                            // systemStatuses? 
                            // commaNumber(systemStatuses.find((service) => service.name === 'translator').lookupIndexMax) > 0? 
                            // // if it's found, display "lookupIndex" / "lookupIndexMax"
                            // <> {commaNumber(systemStatuses.find((service) => service.name === 'translator').lookupIndex)} / {commaNumber(systemStatuses.find((service) => service.name === 'translator').lookupIndexMax)} </>
                          
                            // :<CheckCircleOutlineIcon style={{color:'#0a0'}}/> 
                            // :<CheckCircleOutlineIcon style={{color:'#0a0'}}/> 
                          }
                        </div>
                    </div>

                    <div style={{position:'relative', left:'2%'}}>
                      API: 
                      <div style={{float:'right', position:'absolute', top:'0', right:'5%'}}> 
                        <CheckCircleOutlineIcon style={{color:'#0a0'}}/> 
                      </div>
                    </div>
                  </div>
          </div>
          {/* </Drawer> */}
          </div>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Container maxWidth="xl" sx={{ mt: 4, mb: 1 }}>
            
            <div style={{position:'absolute', width:'80vw', left:'18vw', top:'10vh', border:'0px solid #ff0'}}>
              
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
            
           
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
      </div>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
