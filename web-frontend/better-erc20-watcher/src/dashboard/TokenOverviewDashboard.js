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
import { mainListItems, secondaryListItems } from './listItems';
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


const drawerWidth = 240;

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

  const {filteredtxDataInflow,   setfilteredtxDataInflow} = useContext(GeneralContext);
  const {filteredtxDataOutflow,  setfilteredtxDataOutflow} = useContext(GeneralContext);
  const [clickedSearchBar, setclickedSearchBar] = React.useState(false);
  const [searchInput, setsearchInput] = useState("")
  
  const timeAgo = new TimeAgo('en-US'); 



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



  return (
      <div style={{overflow:'hidden'}}>
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />

        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: '24px', // keep right padding when drawer closed
            }}
          >
            
            {/* <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(open && { display: 'none' }),
              }}
            >    
              <MenuIcon />
            </IconButton> */}
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
              // onClick={() => {updateSelectedToken(); }}
              style={{cursor:'pointer'}}
            >
              <div style={{position:'absolute', height:'100%', width:'50%', display:'flex', justifyContent:'left', alignItems:'center', top:'0',  border:'0px solid #0f0'}}>
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
                
                <div style={{color:'#999', width:'60%',display:'flex', border:'0px solid #ff0', position:'absolute', right:'0'}} onClick={() => {setclickedSearchBar(!clickedSearchBar) }}>
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
                    {clickedDetailsAddressFN}
                    </div>
                  :
                  <div style={{zIndex:'9999', color:'#999' }} id="searchBox" onClick={()=>{setclickedSearchBar(!clickedSearchBar)}}>
                    {viewingTokenAddress? <>(click to search)</>:<></>}
                  </div>
          
                } 
                </div>
              </div>
            </Typography>
            <IconButton color="inherit">
                <div style={{position:'absolute', left: '-4vw', top:'0vh',zIndex:'9999',}}>
                  <AudioToggle />
                </div>
              {/* <Badge badgeContent={4} color="secondary"> */}
                {/* <NotificationsIcon /> */}
              {/* </Badge> */}
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
          <List component="nav">
            {/* {mainListItems} */}
            <MainList />
            <Divider sx={{ my: 1 }} />
            {/* {secondaryListItems} */}
            <SecondaryList />
          </List>
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
            <Grid container spacing={3}>
              {/* Chart */}
              <Grid item xs={12} md={8} lg={9}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 240,
                  }}
                >
                  <Chart />
                  {/* <div style={{border:'1px solid #0f0', height:'100%',width:'100%', display:'flex', justifyContent:'center', alignItems:'center'}}>
                    Chart goes here
                    
                    

                  </div> */}
                </Paper>
              </Grid>
              {/* Recent Deposits */}
              <Grid item xs={12} md={4} lg={3}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 240,
                  }}
                >
                  <div style={{border:'0px solid #0f0',position:'relative', display:'flex',justifyContent:'center',height:'200%', }}><Deposits /></div>
                </Paper>
              </Grid>

              {/* Recent TXs */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <Orders />
                </Paper>
              </Grid>

              {/* <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom component="div">
                    Orders
                  </Typography>
                  
                  <Box sx={{ pt: 3 }}>
                    
                  </Box>
                </Paper>
              </Grid> */}









            </Grid>
            <Copyright sx={{ pt: 4 }} />
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
