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
import Deposits from './TokenVolumeDash';
import Orders from './TokenTransactions';
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
import ConnectionStatusBanner from './NavigatorDropdown';
import '../App.css';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CommunityTokenTr from './subcomponents/CommunityTokenTr';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';
import TxTimeOfDayChart from './subcomponents/TxTimeOfDayChart.tsx';
import ethLogo from './images/eth-logo.png';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
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
  const [clickedTokenUsdQuote, setclickedTokenUsdQuote] = React.useState({});
  // const [heldValueUsd, setheldValueUsd] = React.useState(0);
  
  const {selectedAddressTxList, setselectedAddressTxList} = useContext(GeneralContext);

  const {MinAmountFilterValue, setMinAmountFilterValue} = useContext(GeneralContext);
  const {MaxAmountFilterValue, setMaxAmountFilterValue} = useContext(GeneralContext);
  const {systemStatuses, setSystemStatuses} = useContext(GeneralContext);
  const {filteredtxDataInflow,   setfilteredtxDataInflow} = useContext(GeneralContext);
  const {filteredtxDataOutflow,  setfilteredtxDataOutflow} = useContext(GeneralContext);
  const [clickedSearchBar, setclickedSearchBar] = React.useState(false);
  
  const [updateBlacklistRequest, setupdateBlacklistRequest] = React.useState();

  const [searchInput, setsearchInput] = useState("")
  const {DisplayMinAmountFilterValue, setDisplayMinAmountFilterValue} = useContext(GeneralContext);
  const {DisplayMaxAmountFilterValue, setDisplayMaxAmountFilterValue} = useContext(GeneralContext);
  const {latestEthBlock, setlatestEthBlock} = useContext(GeneralContext); 
  const timeAgo = new TimeAgo('en-US'); 
  
  const {selectedAddressListOfTokens, setselectedAddressListOfTokens} = useContext(GeneralContext);
  const [selectedAddressListOfTokensSorted, setselectedAddressListOfTokensSorted] = React.useState();
  
  
  const {clockCountsArrayForSelectedAddressTxList, setclockCountsArrayForSelectedAddressTxList} = useContext(GeneralContext);


  const {heldTokensSelectedAddress, setheldTokensSelectedAddress} = useContext(GeneralContext);
  const {heldTokensSelectedAddressFN, setheldTokensSelectedAddressFN} = useContext(GeneralContext);
  const {heldTokensSelectedAddressFNdisplayed, setheldTokensSelectedAddressFNdisplayed} = useContext(GeneralContext);
  
  const {communityHeldListFromSelectedAddy, setcommunityHeldListFromSelectedAddy} = useContext(GeneralContext);
  const {communityHeldListFromSelected, setcommunityHeldListFromSelected} = useContext(GeneralContext);
  const {getUpdatedTokenBalance, setgetUpdatedTokenBalance} = useContext(GeneralContext);
  
  const {selectedAddyInGameBalance, setselectedAddyInGameBalance} = useContext(GeneralContext);
  const {megaPriceUsd, setmegaPriceUsd} = useContext(GeneralContext);
  const {getUpdatedAddressTokenTxList, setgetUpdatedAddressTokenTxList} = useContext(GeneralContext); 
  const {fetchFreshStashedTokenBalance, setfetchFreshStashedTokenBalance} = useContext(GeneralContext); 

  
  useEffect(() => {
    console.log('megaPriceUsd: ', megaPriceUsd);
  },[megaPriceUsd]);

  useEffect(() => {
    console.log('~~heldTokensSelectedAddressFNdisplayed: ', heldTokensSelectedAddressFNdisplayed);
  },[heldTokensSelectedAddressFNdisplayed]);
  
  useEffect(() => {
    console.log('~~selectedAddressTxList: ', selectedAddressTxList);
  },[selectedAddressTxList]);

  useEffect(() => {
    console.log('heldTokensSelectedAddressFN: ', heldTokensSelectedAddressFN);
      if (heldTokensSelectedAddressFN){
        setheldTokensSelectedAddressFNdisplayed(displayAddressFN(heldTokensSelectedAddressFN));
      }
         
  },[heldTokensSelectedAddressFN]);

  useEffect(() => {
    if (updateBlacklistRequest){
      const url = "http://10.0.3.240:4000/addToBlacklist/"+updateBlacklistRequest;
      fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log("-----addToBlacklist: ", data);
        setupdateBlacklistRequest();
      } )
    }
  },[updateBlacklistRequest]);

  useEffect(() => {
    if (selectedAddressListOfTokens){
      console.log("-----selectedAddressListOfTokens: ", selectedAddressListOfTokens);
      let addressArray = Object.values(selectedAddressListOfTokens[0]);
      let sorted = addressArray.sort((a, b) => {
        if(a[0] && b[0] && a[0].usdValue && b[0].usdValue) {
            return a[0].usdValue[0].usdValue.extendedValue > b[0].usdValue[0].usdValue.extendedValue ? 1 : -1;
        }
        else return -1;
      });
      setselectedAddressListOfTokensSorted(sorted);
    }
  },[selectedAddressListOfTokens]);

  useEffect(() => {
    if (selectedAddressListOfTokensSorted){
      console.log("-----selectedAddressListOfTokensSorted: ", selectedAddressListOfTokensSorted);
    }
  },[selectedAddressListOfTokensSorted]);
  
  useEffect(() => {

  },[DisplayMinAmountFilterValue]);
  useEffect(() => {

  },[DisplayMaxAmountFilterValue]);
  
  useEffect(() => {
    if (selectedAddyInGameBalance){
      console.log("-----selectedAddyInGameBalance: ", selectedAddyInGameBalance);
    }
  },[selectedAddyInGameBalance]);


  useEffect(() => {
    const temp = new Date().getTime();
    // console.log("chainData heartbeat: ", (temp - chainDataHeartbeat))
    setchainDataHeartbeatDiff(temp - chainDataHeartbeat);
  },[chainDataHeartbeat]);


  useEffect(() => {
    // console.log("CATCH- chainData heartbeat diff from db: ", chainDataHeartbeatDiff);
  },[chainDataHeartbeatDiff]);

  useEffect(() => {
    if (communityHeldListFromSelected){
      console.log('communityHeldListFromSelected: ', communityHeldListFromSelected)
    }
  },[communityHeldListFromSelected]);







  function updateSelectedToken (){
    // setviewingTokenAddress(); 
    setclickedDetailsAddress(null);
    setclickedDetailsAddressFN(null);
  
    setfilteredtxDataInflow(); 
    setfilteredtxDataOutflow();
  }
  
  useEffect(()=>{
    if (clickedTokenUsdQuote){
      console.log('clickedTokenUsdQuote: ', clickedTokenUsdQuote)
    }
  },[clickedTokenUsdQuote]);

  // useEffect(()=>{
  //   // if (selectedAddressListOfTokens && selectedAddressListOfTokens[0] && selectedAddressListOfTokens[0][token].usdValue[0].usdValue) {
  //   if (selectedAddressListOfTokens && selectedAddressListOfTokens[0]) {
  //     // let temp addy = token_address 

  //     for (let token in selectedAddressListOfTokens[0]){
  //       if (selectedAddressListOfTokens[0][token].usdValue && selectedAddressListOfTokens[0][token].usdValue[0].usdValue){
  //         //settokenUsdQuotes with token_address as key and usdValue as value
  //         settokenUsdQuotes({...tokenUsdQuotes, [token]: selectedAddressListOfTokens[0][token].usdValue[0].usdValue});
  //       }
  //     }
  //   }
  // },[selectedAddressListOfTokens]);

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
    if (selectedAddressListOfTokens){
      console.log('-----------____ selectedAddressListOfTokens: ', selectedAddressListOfTokens)
    }
  },[selectedAddressListOfTokens]);

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

function determineWhichFNtoShow(tokenObj){
  if (!tokenObj){
    return (<td style={{color:'#aaa'}}>...</td>);
  }
  // console.log('determineWhichFNtoShow: ', tokenObj)
  if (typeof tokenObj != 'object'){
    return (<td style={{color:'#aaa'}}>{getEllipsisTxt(tokenObj, 6)}</td>);
  }
  for (var key in tokenObj) {
    if (key !== 'ENS' && key !== '_id' && !tokenObj[key].startsWith("0x")) {
        return (<td style={{color:'#fff'}}>{tokenObj[key]}</td>);
    }
  }


  return (<td style={{color:'#aaa'}}>{getEllipsisTxt(tokenObj["address"], 6)}</td>);
}


  return (
    <div style={{overflow:'hidden', position:'absolute', width:'100%', height:'95%', display:'flex', justifyContent:'center', alignItems:'center', top:'1.5vh', border:'0px solid #ff0'}}>
    <ThemeProvider theme={mdTheme}>
      {/* <Box sx={{ display: 'flex' }}> */}
        <CssBaseline />



          
            <div style={{border:'0px solid #0f0', width:'95%', top:'7.5vh', zIndex:'9999', height:'92%', position:'absolute',}}>
     

              {/* aliases dashboard*/}
              <div style={{border:'1px solid rgba(100,100,120,1)', backgroundColor:'rgba(100,100,120,0.4)', width:'20%', textAlign:'left', borderRadius:'10px', height:'20%', position:'absolute',top:'0%',display:'flex', justifyContent:'center',alignItems:'center'}}>
                <div style={{position:'absolute', top:'12%', paddingLeft:'1vw',width:'100%', border:'0px solid #ff0'}}>
                  
                  

                  <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)',width:'100%',border:'0px solid #f0f',fontSize:'0.75vw', textAlign:'center',left:'0',position:'absolute'}}>
                    
                    
                    <table style={{ width:'100%',  textAlign:'center', position:'absolute', top:'-2vh', paddingRight:'0.1vw'}}>
                      <tr style={{textAlign:'left', backgroundColor:'rgba(0,0,0,0.3)',position:'sticky', }}>
                        <td colspan="4">
                          &nbsp;IDs of <span style={{color:'rgba(255,150,18,1)',fontSize:'1.75vh'}}>{heldTokensSelectedAddressFNdisplayed? heldTokensSelectedAddressFNdisplayed.startsWith('0x') && heldTokensSelectedAddressFNdisplayed.length === 42? getEllipsisTxt(heldTokensSelectedAddressFNdisplayed,6):heldTokensSelectedAddressFNdisplayed: <>...</>}</span> (<a href={"https://etherscan.io/address/"+heldTokensSelectedAddress} target="blank_">{heldTokensSelectedAddress? getEllipsisTxt(heldTokensSelectedAddress,7): <>...</>}</a>)
                        </td>
                      </tr>
                      <tr style={{backgroundColor:'rgba(0,0,0,0.9)',position:'sticky', top:'0'}}>
                        <th>Name</th>
                        <th>Source</th>
                        <th style={{display:'flex', justifyContent:'center', alignItems:'center', }}><VisibilityIcon style={{fontSize:'2vh'}}/></th>
                      </tr>
                      {heldTokensSelectedAddressFN? Object.keys(heldTokensSelectedAddressFN).filter(key => key !== '_id' && key !== 'address' && key !== 'ENS').map(friendlyNameKey => {
                        // console.log(typeof friendlyNameKey)
                        if(!(heldTokensSelectedAddressFN[friendlyNameKey].startsWith('0x') && heldTokensSelectedAddressFN[friendlyNameKey].length === 42)){
                         return(
                         <tr key={friendlyNameKey}>
                            <td >{heldTokensSelectedAddressFN[friendlyNameKey]? heldTokensSelectedAddressFN[friendlyNameKey] : <>...</>}</td> 
                            <td style={{overflowX:'hidden',maxWidth:'0.75vw'}}>{friendlyNameKey === "manuallyDefined" ? "manual" : friendlyNameKey}</td>
                         </tr>
                        )
                      }
                      }): <></>}
                      
                      
                      {heldTokensSelectedAddressFN? Object.keys(heldTokensSelectedAddressFN).filter(key => key === 'ENS').map((friendlyNameKey, index) => {
                        if(typeof heldTokensSelectedAddressFN[friendlyNameKey] === 'string' && heldTokensSelectedAddressFN[friendlyNameKey].startsWith('0x') && heldTokensSelectedAddressFN[friendlyNameKey].length === 42){
                          return <></>
                        }
                        else {
                          return(
                            <tr key={friendlyNameKey}>
                              <td style={{overflowX:'hidden',maxWidth:'3vw'}}>{heldTokensSelectedAddressFN[friendlyNameKey]? heldTokensSelectedAddressFN[friendlyNameKey] : <></> }</td> 
                              <td style={{overflowX:'hidden',maxWidth:'1vw'}}>{friendlyNameKey}</td>
                            </tr>
                          )
                        }
                      }): <></>}
                    </table>
                    
                    
                  </div>
                </div>
              </div>


              {/* Token Heuristic Inflow/Outflow */}
              <div style={{border:'1px solid rgba(100,100,120,1)', backgroundColor:'rgba(100,100,120,0.4)', width:'20%', textAlign:'left', borderRadius:'10px', height:'38vh', position:'absolute',top:'19.8vh',left:'0vw', display:'flex', justifyContent:'center',alignItems:'center', paddingLeft:'1vw'}}>
                  <div style={{position:'absolute', left:'0', top:'0',width:'100%', height:'100%', border:'0px solid #0f0'}}>
                    <TxTimeOfDayChart selectedAddressTxList={selectedAddressTxList} clockCountsArrayForSelectedAddressTxList={clockCountsArrayForSelectedAddressTxList}/>
                  </div>

              </div>

              {/* Staked/Deposited/Stashed tokens dashboard */}
              <div style={{border:'1px solid rgba(100,100,120,1)', backgroundColor:'rgba(100,100,120,0.4)', width:'34.5%', textAlign:'center', borderRadius:'10px', height:'33%', position:'absolute',bottom:'0%',left:'0vw', display:'flex', justifyContent:'center',alignItems:'center', }}>
                {/* <div> */}
                  {/* <div style={{fontSize:'2vw'}}>Staked Balances</div>
                  <div>Display Staked/Deposited/Locked balances belonging to this address</div> */}

                    <div onClick={()=>{console.log('fetching fresh stashed tokens balances..',); setfetchFreshStashedTokenBalance(true);  }} className="hover" title="refresh token balances" style={{zIndex:'10000', position:'absolute',right:'0.5%', top:'0.3%'}}><RotateRightIcon /> </div>

                    {selectedAddyInGameBalance?
                    <table style={{ width:'100%',  textAlign:'center', position:'absolute', top:'0', paddingRight:'0.1vw'}}>
                      <tr style={{textAlign:'left', backgroundColor:'rgba(0,0,0,0.3)',position:'sticky', }}>
                        <td colspan="5">
                          &nbsp;Stashed tokens for <span style={{color:'rgba(255,150,18,1)'}}>{heldTokensSelectedAddressFNdisplayed? heldTokensSelectedAddressFNdisplayed.startsWith('0x') && heldTokensSelectedAddressFNdisplayed.length === 42? getEllipsisTxt(heldTokensSelectedAddressFNdisplayed,6):heldTokensSelectedAddressFNdisplayed: <>...</>}</span> ({ heldTokensSelectedAddress? getEllipsisTxt(heldTokensSelectedAddress,6) : <>...</>})
                        </td>
                        
                      </tr>
                      <tr style={{textAlign:'left', backgroundColor:'rgba(0,0,0,0.9)',position:'sticky', }}>
                        <td colspan="4" >
                          &nbsp;Location
                        </td>
                        <td style={{textAlign:'right',}}>Amount</td>
                        <td style={{textAlign:'right',}}>USD</td>
                      </tr>
                      {selectedAddyInGameBalance?
                      <tr style={{textAlign:'left', backgroundColor:'rgba(200,200,200,0.1)',position:'sticky', }}>
                        <td colspan="4">
                          &nbsp;Mega World Wallet
                        </td>
                        <td style={{textAlign:'right',}}>{selectedAddyInGameBalance? commaNumber(parseFloat(selectedAddyInGameBalance.megaBalance).toFixed(2)) : 0}</td>
                        <td style={{textAlign:'right',}}>${selectedAddyInGameBalance? commaNumber(parseFloat(selectedAddyInGameBalance.megaBalance * megaPriceUsd.usdPrice).toFixed(2)) : 0}</td>
                      </tr>
                      :<></>}
                      {selectedAddyInGameBalance?
                      <tr style={{textAlign:'left', backgroundColor:'rgba(200,200,200,0.1)',position:'sticky', }}>
                        <td colspan="4" style={{textAlign:'left',}}>
                          &nbsp;Mega World District Staking
                        </td>
                        <td style={{textAlign:'right',}}>{selectedAddyInGameBalance? commaNumber(parseFloat(selectedAddyInGameBalance.perkStaked).toFixed(2)) : 0}</td>
                        <td style={{textAlign:'right',}}>${selectedAddyInGameBalance && megaPriceUsd? commaNumber(parseFloat(selectedAddyInGameBalance.perkStaked * megaPriceUsd.usdPrice).toFixed(2)) : 0}</td>
                      </tr>
                      :<></>}
                      {selectedAddyInGameBalance?
                      <tr style={{textAlign:'left', backgroundColor:'rgba(200,200,200,0.1)',position:'sticky', }}>
                        <td colspan="4" style={{textAlign:'left',}}>
                          &nbsp;Mega World Offices Accruing
                        </td>
                        <td style={{textAlign:'right',}}>{selectedAddyInGameBalance? commaNumber(parseFloat(selectedAddyInGameBalance.officeAccruedMega).toFixed(2)) : 0}</td>
                        <td style={{textAlign:'right',}}>${selectedAddyInGameBalance && megaPriceUsd? commaNumber(parseFloat(selectedAddyInGameBalance.officeAccruedMega * megaPriceUsd.usdPrice).toFixed(2)) : 0}</td>
                      </tr>
                      :<></>}

                    </table>
                    :<>loading stashed tokens...</>}


                {/* </div> */}
              </div>

              {/* Community Held Tokens */}
              <div style={{border:'1px solid rgba(100,100,120,1)', backgroundColor:'rgba(100,100,120,0.4)', width:'79.5%', textAlign:'left', borderRadius:'5px', height:'66%', position:'absolute',top:'0vh',right:'0vw', display:'flex', justifyContent:'center',alignItems:'center', paddingLeft:'1vw'}}>
                <div style={{display:'flex', justifyContent:'center'}}>
                  <div style={{borderRadius:'10px',overflowY:'scroll',display:'flex', justifyContent:'center',alignItems:'center', height:'100%', border:'0px solid #0f0',position:'absolute',top:'0',left:'0',width:'49.2%',}}>
                    
                    
                    <div onClick={()=>{console.log('clicked: ',heldTokensSelectedAddress);setselectedAddyInGameBalance(false); setgetUpdatedTokenBalance(heldTokensSelectedAddress)}} className="hover" title="refresh token balances" style={{zIndex:'10000', position:'absolute',right:'0.5%', top:'0.3%'}}><RotateRightIcon /> </div>
                    <table style={{ width:'99.5%',  textAlign:'center', position:'absolute', top:'0', paddingRight:'0.1vw'}}>
                      <tr style={{textAlign:'left', backgroundColor:'rgba(0,0,0,0.3)',position:'sticky', }}>
                        <td colspan="4">
                          &nbsp;Tokens Held By <span style={{color:'rgba(255,150,18,1)'}}>{heldTokensSelectedAddressFNdisplayed? heldTokensSelectedAddressFNdisplayed.startsWith('0x') && heldTokensSelectedAddressFNdisplayed.length === 42? getEllipsisTxt(heldTokensSelectedAddressFNdisplayed,6):heldTokensSelectedAddressFNdisplayed: <>...</>}</span> ({ heldTokensSelectedAddress? getEllipsisTxt(heldTokensSelectedAddress,6) : <>...</>})
                        </td>
                      </tr>
                      
                      <tr style={{backgroundColor:'rgba(0,0,0,0.9)',position:'sticky', top:'0'}}>
                        <th>hide</th>
                        <th>Contract</th>
                        <th>Token</th>
                        <th>Balance</th>
                        <th>USD</th>
                      </tr>

                    
                     

                          
                      {selectedAddressListOfTokens? selectedAddressListOfTokens.length > 0? Object.keys(selectedAddressListOfTokens[0]).map((token, index) => {
                          // <CommunityTokenTr key={index} token={token} index={index} selectedAddressListOfTokens={selectedAddressListOfTokens} />
                          
                          
                          // filter out any tokens that have a '.' in the symbol... these are likely not real tokens                          
                          if (selectedAddressListOfTokens && selectedAddressListOfTokens[0] && selectedAddressListOfTokens[0][token]&& selectedAddressListOfTokens[0][token].metadata && selectedAddressListOfTokens[0][token].metadata.symbol && selectedAddressListOfTokens[0][token].metadata.symbol.toLowerCase().includes('.') ){
                            return (<></>)
                          }

                          //filter out tokens that have extendedValue < 1
                          // if (selectedAddressListOfTokens && selectedAddressListOfTokens[0] && selectedAddressListOfTokens[0][token]&& selectedAddressListOfTokens[0][token].usdValue && selectedAddressListOfTokens[0][token].usdValue[0] && selectedAddressListOfTokens[0][token].usdValue[0].usdValue && (selectedAddressListOfTokens[0][token].usdValue[0].usdValue.extendedValue < 0.001 || selectedAddressListOfTokens[0][token].usdValue[0].usdValue.extendedValue > 1000000000000)  ){
                          //   return (<></>)
                          // }
                          //filter out blacklisted
                          if (selectedAddressListOfTokens && selectedAddressListOfTokens[0] && selectedAddressListOfTokens[0][token]&& selectedAddressListOfTokens[0][token].usdValue && selectedAddressListOfTokens[0][token].usdValue[0] && (selectedAddressListOfTokens[0][token].usdValue[0].blacklisted ) ){
                            return (<></>)
                          }
                          
                          else {
                            return (
                              selectedAddressListOfTokens[0][token].metadata?
                              selectedAddressListOfTokens[0][token]?
                              selectedAddressListOfTokens[0][token].usdValue && selectedAddressListOfTokens[0][token].usdValue[0]?
                              selectedAddressListOfTokens[0][token].usdValue[0].usdValue?
                              
                              <tr style={{backgroundColor: token && communityHeldListFromSelectedAddy? token.toLowerCase() == communityHeldListFromSelectedAddy.toLowerCase()? "rgba(200,150,10,0.5)":"":"", cursor:'pointer'}} onClick={()=>{ setcommunityHeldListFromSelectedAddy(selectedAddressListOfTokens[0][token].metadata.token_address); setclickedTokenUsdQuote(selectedAddressListOfTokens[0][token].usdValue[0].usdValue.usdPrice) }}>
                                {/* selectedAddressListOfTokens */}
                                <td>
                                <div 
                                  style={{height:'2vh'}}
                                  onClick={() => {
                                    const confirmBox = window.confirm(
                                      "Do you really want to add this token to BLACKLIST?"
                                    )
                                    if (confirmBox === true) {
                                      setupdateBlacklistRequest(selectedAddressListOfTokens[0][token].metadata.token_address);
                                    }
                                  }}>
                                    <VisibilityOffIcon style={{color:'rgba(255,255,255,0.4)'}}/>
                                </div>

                                </td>
                                <td>
                                  { selectedAddressListOfTokens[0][token].metadata.token_address.match(/native/) ? 
                                  <>{selectedAddressListOfTokens[0][token].metadata.token_address}</>
                                  :<a href={`https://etherscan.io/token/${selectedAddressListOfTokens[0][token].metadata.token_address}?a=${heldTokensSelectedAddress}`} target="_blank" rel="noopener noreferrer">{getEllipsisTxt(selectedAddressListOfTokens[0][token].metadata.token_address, 4)}</a>
                                  }
                                  </td>
                                <td>{selectedAddressListOfTokens[0][token].metadata.symbol}</td>
                                <td style={{textAlign:'right'}}>{commaNumber(parseFloat((selectedAddressListOfTokens[0][token].metadata.balance)/ (10 **selectedAddressListOfTokens[0][token].metadata.decimals)).toFixed(4))}</td>
                                
                                <td style={{textAlign:'right'}}>${selectedAddressListOfTokens[0][token]?selectedAddressListOfTokens[0][token].usdValue? selectedAddressListOfTokens[0][token].usdValue[0].usdValue?  commaNumber( parseFloat(selectedAddressListOfTokens[0][token].usdValue[0].usdValue.extendedValue).toFixed(2))  :<>0.00</>:<>0.00</>:<>0.00</>}</td>
                              </tr>
                              : <> </>
                              : <> </>
                              : <> </>
                              : <> </>
                            )
                          }
                        })
                        : <>h </>
                        : <>i </>
                      }
                      
                      
                    </table>
                      
                    
                  </div>
                  <div style={{display:'flex', overflowY:'scroll',justifyContent:'center',alignItems:'center', height:'100%', borderRadius:'10px',position:'absolute',top:'0',right:'0',width:'49.5%',}}>
                  <table style={{ width:'100%',  textAlign:'center', position:'absolute', top:'0', paddingRight:'0.1vw'}}>
                        
                        <tr style={{textAlign:'left', backgroundColor:'rgba(0,0,0,0.3)',position:'sticky',}}>
                          <td title="Only addresses that have a recorded TX from a Watched Token show in this list." colspan="4">
                            &nbsp;Community Balances for Selected Token
                          </td>
                        </tr>
      
                        <tr style={{position:'sticky', top:'0',backgroundColor:'rgba(0,0,0,0.9)',}}>
                          <th><ModeEditOutlineIcon style={{fontSize:'0.75vw'}}/></th>
                          <th>Name</th>
                          <th>Address</th>
                          <th>Balance</th>
                          <th>USD</th>
                        </tr>
                        
                        {communityHeldListFromSelected && communityHeldListFromSelected.length > 0 && communityHeldListFromSelectedAddy? communityHeldListFromSelected.length > 0? communityHeldListFromSelected.sort(
                          (a, b) => b[communityHeldListFromSelectedAddy]? a[communityHeldListFromSelectedAddy]? b[communityHeldListFromSelectedAddy].metadata.balance - a[communityHeldListFromSelectedAddy].metadata.balance : 0: 0).map((token, index) => {
                          return(<CommunityTokenTr key={index} token={token} index={index} />)
                          
                         })
                         : <> </>
                         : <> </>
                       }




                      </table>
                  </div>
                  
                  

                </div>
              </div>

            

              {/* Address TX activity */}
              <div style={{overflowY:'scroll', border:'1px solid rgba(100,100,120,1)', backgroundColor:'rgba(100,100,120,0.4)', width:'65%', textAlign:'center', borderRadius:'10px', height:'33%', position:'absolute',bottom:'0vh',right:'0vw', display:'flex', justifyContent:'center',alignItems:'center', paddingLeft:'1vw'}}>
                <div>
                  
                  <table style={{ width:'100%',  textAlign:'center', position:'absolute',left:'0', top:'0', paddingRight:'0.1vw'}}>
                    <tr style={{textAlign:'left', backgroundColor:'rgba(0,0,0,0.3)',position:'sticky',}}>
                        <td colspan="4">
                          &nbsp;ERC-20 Transfers for <span style={{color:'rgba(255,150,18,1)'}}>{heldTokensSelectedAddressFNdisplayed? heldTokensSelectedAddressFNdisplayed.startsWith('0x') && heldTokensSelectedAddressFNdisplayed.length === 42? getEllipsisTxt(heldTokensSelectedAddressFNdisplayed,6):heldTokensSelectedAddressFNdisplayed: <>...</>}</span>
                        </td>
                        <td>                    <div onClick={()=>{  console.log('requesting updated data....',); setgetUpdatedAddressTokenTxList(true) }} className="hover" title="refresh token balances" style={{zIndex:'10000', position:'absolute',right:'0.5%', top:'0.3%'}}><RotateRightIcon /> </div></td>
                    </tr>
                    <tr style={{textAlign:'right', position:'sticky', top:'0', backgroundColor:'rgba(0,0,0,0.9)'}}>
                      <td style={{textAlign:'center'}}>chain</td>
                      <td>time</td>
                      <td>token</td>
                      <td>amount</td>
                      <td>from</td>
                      <td>to</td>
                      <td>tx hash</td>
                    </tr>
                    {
                    systemStatuses?
                    systemStatuses.erc20TransfersForSelectedAddy? 
                    systemStatuses.erc20TransfersForSelectedAddy.statusMsg != "idle" ?
                      <div style={{zIndex:'9999', backgroundColor:'rgba(0,0,0,0.6)', padding:'2vw', position:'absolute', width:'100%', height:'100%', display:'flex', justifyContent:'center', alignItems:'center'}}>
                        {/* {systemStatuses.erc20TransfersForSelectedAddy.statusMsg} : {systemStatuses.erc20TransfersForSelectedAddy.page} / {systemStatuses.erc20TransfersForSelectedAddy.maxPage} */}
                        {/* <LoadingTableSpinner msg={ <>&nbsp; {systemStatuses.erc20TransfersForSelectedAddy.statusMsg} : {systemStatuses.erc20TransfersForSelectedAddy.page} / {systemStatuses.erc20TransfersForSelectedAddy.maxPage}</> }/> */}
                      </div>
                    : 
                    
                    selectedAddressTxList? 
                      Array.isArray(selectedAddressTxList)? 
                      selectedAddressTxList.sort((a,b) => (a.block_timestamp > b.block_timestamp) ? 1 : -1).reverse().map((tx, index) => {
                        // console.log('tx: ', tx)
                        return (
                          <tr style={{textAlign:'right'}}>
                            <td style={{textAlign:'center', display:'flex',justifyContent:'center',}}><img src={ethLogo? ethLogo : <></> } style={{marginTop:'5%', width:'1vw'}} /></td>
                            <td>{timeAgo.format(new Date(tx.block_timestamp))}</td>
                            <td>{
                              tx.token_metadata && tx.token_metadata.symbol?
                              !(tx.token_metadata.symbol.includes('http')  ||  ( tx.token_metadata.symbol.length > 18 ) || tx.token_metadata.symbol.includes('.com'))?
                              tx.token_metadata.symbol 
                              
                              
                              : getEllipsisTxt(tx.address,4): getEllipsisTxt(tx.address,4) }</td>
                            <td>{parseFloat(tx.value / (10**18)).toFixed(2)}</td>
                            <td>{determineWhichFNtoShow(tx.from_address_friendlyName)}</td>
                            <td>{determineWhichFNtoShow(tx.to_address_friendlyName)}</td>
                            <td><a target="_blank" href={"https://etherscan.io/tx/"+tx.transaction_hash}>{getEllipsisTxt(tx.transaction_hash, 3)} </a></td>
                          </tr>
                        )
                      })
                       
                        
                        : <></>
                        : <></>
                        : <></>
                        
                        
                        
                        
                    : <> </>
                  }
                    
                  </table>
                    

                </div>
              </div>

            </div>
          
        {/* </Box> */}
      
    </ThemeProvider>
      </div>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
