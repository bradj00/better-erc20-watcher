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
import Deposits from './Deposits';
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
  const {selectedAddressListOfTokens, setselectedAddressListOfTokens} = useContext(GeneralContext);
  const {heldTokensSelectedAddress, setheldTokensSelectedAddress} = useContext(GeneralContext);
  const {heldTokensSelectedAddressFN, setheldTokensSelectedAddressFN} = useContext(GeneralContext);

  useEffect(() => {
    // if (selectedAddressListOfTokens){
      console.log("-----selectedAddressListOfTokens: ", selectedAddressListOfTokens);
    // }
  },[selectedAddressListOfTokens]);
  
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
      console.log('latestEthBlock: ', latestEthBlock)
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




  return (
    <div style={{overflow:'hidden'}}>
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />

        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: '24px', 
            }}
          >
            <IconButton color="inherit">
                <div style={{position:'fixed', right: '4vw', top:'2vh',zIndex:'9999',}}>
                  <AudioToggle />
                </div>
            </IconButton>
          </Toolbar>
        </AppBar>
        
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}
          >
            {/* <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton> */}
          </Toolbar>


          <Divider />
          <List style={{overflow:'hidden'}} component="nav">
         

          </List>
          <div style={{border:'0px solid #0aa', color:'#999', position:'absolute',bottom:'0%', width:'100%', height:'20vh', display:'flex', justifyContent:'center', alignItems:'center'}}>
                  
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
                            systemStatuses? 
                            commaNumber(systemStatuses.find((service) => service.name === 'translator').lookupIndexMax) > 0? 
                            // if it's found, display "lookupIndex" / "lookupIndexMax"
                            <> {commaNumber(systemStatuses.find((service) => service.name === 'translator').lookupIndex)} / {commaNumber(systemStatuses.find((service) => service.name === 'translator').lookupIndexMax)} </>
                          
                            :<CheckCircleOutlineIcon style={{color:'#0a0'}}/> 
                            :<CheckCircleOutlineIcon style={{color:'#0a0'}}/> 
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

        </Drawer>
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
            <div style={{border:'0px solid #0f0', width:'82.5%', left:'17vw',top:'7.5vh', zIndex:'9999', height:'92%', position:'absolute',}}>
              
              {/* address header  */}
              <div style={{border:'1px solid rgba(100,100,120,1)', backgroundColor:'rgba(100,100,120,0.4)', width:'20%', textAlign:'center', borderRadius:'10px', height:'10%', position:'absolute',display:'flex', justifyContent:'center',alignItems:'center'}}>
                <div style={{position:'absolute', top:'5%'}}>
                  <div style={{fontSize:'1.5vw'}}>{heldTokensSelectedAddress? getEllipsisTxt(heldTokensSelectedAddress,7): <>...</>}</div>
                  <div style={{fontSize:'1vw'}}>{heldTokensSelectedAddressFN? heldTokensSelectedAddressFN: <>...</>}</div>
                </div>
              </div>

              {/* aliases */}
              <div style={{border:'1px solid rgba(100,100,120,1)', backgroundColor:'rgba(100,100,120,0.4)', width:'20%', textAlign:'left', borderRadius:'10px', height:'20%', position:'absolute',top:'12%',display:'flex', justifyContent:'center',alignItems:'center'}}>
                <div style={{position:'absolute', top:'2%', paddingLeft:'1vw',width:'100%', border:'0px solid #ff0'}}>
                  <div style={{fontSize:'1vw',paddingBottom:'2vh',}}>Known Aliases:</div>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)',width:'100%',border:'0px solid #f0f',fontSize:'0.75vw', textAlign:'center',left:'0',position:'absolute'}}>
                    <div > ayyyy.eth</div>
                    <div > ENS </div>
                    <div > ThisGuyOnOS</div>
                    <div > OpenSea </div>
                    <div > Builder9227</div>
                    <div > In-Game </div>
                  </div>
                </div>
              </div>

              {/* misc stats */}
              <div style={{border:'1px solid rgba(100,100,120,1)', backgroundColor:'rgba(100,100,120,0.4)', width:'29.5%', textAlign:'center', borderRadius:'10px', height:'32%', position:'absolute',top:'0%',left:'16.9vw', display:'flex', justifyContent:'center',alignItems:'center'}}>
                <div>
                  <div>Misc Stats</div>
                  <div>wallet age:</div>
                  <div>...</div>
                </div>
              </div>

              {/* Token Heuristic Inflow/Outflow */}
              <div style={{border:'1px solid rgba(100,100,120,1)', backgroundColor:'rgba(100,100,120,0.4)', width:'50%', textAlign:'left', borderRadius:'10px', height:'33%', position:'absolute',top:'33.5%',left:'0vw', display:'flex', justifyContent:'center',alignItems:'center', paddingLeft:'1vw'}}>
                <div>
                  <div>Heuristic Inflow/Outflow</div>
                  <div>Common Senders To this Address:</div>
                  <div>Common Receivers from this Address:</div>
                  <div>Initially funded from: (Binance, clickable address, etc)</div>
                </div>
              </div>

              {/* User-defined notes */}
              <div style={{border:'1px solid rgba(100,100,120,1)', backgroundColor:'rgba(100,100,120,0.4)', width:'50%', textAlign:'left', borderRadius:'10px', height:'33%', position:'absolute',bottom:'0%',left:'0vw', display:'flex', justifyContent:'center',alignItems:'center', paddingLeft:'1vw'}}>
                <div>
                  <div>Notes</div>
                  <div>Enter manual notes here about address:</div>
                  <div>...</div>
                </div>
              </div>

              {/* Community Held Tokens */}
              <div style={{border:'1px solid rgba(100,100,120,1)', backgroundColor:'rgba(100,100,120,0.4)', width:'49%', textAlign:'left', borderRadius:'5px', height:'66%', position:'absolute',top:'0vh',right:'0vw', display:'flex', justifyContent:'center',alignItems:'center', paddingLeft:'1vw'}}>
                <div style={{display:'flex', justifyContent:'center'}}>
                  <div style={{borderRadius:'10px',overflowY:'scroll',display:'flex', justifyContent:'center',alignItems:'center', height:'100%', border:'0px solid #0f0',position:'absolute',top:'0',left:'0',width:'49.5%',}}>
                    
                    
                    <table style={{ width:'100%',  textAlign:'center', position:'absolute', top:'0'}}>
                      <thead style={{position:'sticky', top:'0'}}>
                        <th>Token</th>
                        <th>Balance</th>
                        <th>USD</th>
                      </thead>

                      {selectedAddressListOfTokens? selectedAddressListOfTokens.length > 0? Object.keys(selectedAddressListOfTokens[0]).map((token, index) => {
                          return (
                            selectedAddressListOfTokens[0][token].metadata?
                            <tr>
                              <td>{selectedAddressListOfTokens[0][token].metadata.symbol}</td>
                              <td>{parseFloat((selectedAddressListOfTokens[0][token].metadata.balance)/ (10 **18)).toFixed(4)}</td>
                              
                              <td>$5.00</td>
                            </tr>
                            : <> </>
                          )
                        })
                        : <> </>
                        : <> </>
                      }
                      
                      
                    </table>
                      
                    
                  </div>
                  <div style={{display:'flex', overflowY:'scroll',justifyContent:'center',alignItems:'center', height:'100%', borderRadius:'10px',position:'absolute',top:'0',right:'0',width:'49.5%',}}>
                  <table style={{ width:'100%',  textAlign:'center', position:'absolute', top:'0'}}>
                        <thead style={{position:'sticky', top:'0'}}>
                          <th>Address</th>
                          <th>Balance</th>
                          <th>USD</th>
                        </thead>
                        <tr>
                          <td>Token1</td>
                          <td>100</td>
                          <td>100</td>
                        </tr>
                      </table>
                  </div>
                  
                  


                  {/* Token Balances For this Address */}
                  {/* <div>When clicking a balance, show on right: Other holders of this token from your watchedToken collections</div>
                  <div>Show Staked Token locations (locked in contract somewhere)</div> */}
                </div>
              </div>

            

              {/* Address TX activity */}
              <div style={{border:'1px solid rgba(100,100,120,1)', backgroundColor:'rgba(100,100,120,0.4)', width:'49%', textAlign:'center', borderRadius:'10px', height:'33%', position:'absolute',bottom:'0vh',right:'0vw', display:'flex', justifyContent:'center',alignItems:'center', paddingLeft:'1vw'}}>
                <div>
                  <div>Address TX activity</div>
                </div>
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
