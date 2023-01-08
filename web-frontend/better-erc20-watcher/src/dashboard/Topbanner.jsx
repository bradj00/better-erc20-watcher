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

const Topbanner = () => {
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
    const {searchInputLookup, setsearchInputLookup} = useContext(GeneralContext);
    const {friendlyLookupResponse, setFriendlyLookupResponse} = useContext(GeneralContext);


    const {DisplayMinAmountFilterValue, setDisplayMinAmountFilterValue} = useContext(GeneralContext);
    const {DisplayMaxAmountFilterValue, setDisplayMaxAmountFilterValue} = useContext(GeneralContext);
    const {latestEthBlock, setlatestEthBlock} = useContext(GeneralContext); 
    const timeAgo = new TimeAgo('en-US'); 
  

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
  const displayAddressFN = (clickedDetailsAddressFN) => {
    if (!clickedDetailsAddressFN) return;
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
    
    useEffect(() => {
        if (friendlyLookupResponse){
            console.log('~!~! friendlyLookupResponse: ',friendlyLookupResponse);
        }
    },[friendlyLookupResponse]);

    useEffect(() => {
        const timer = setTimeout(() => {
          console.log("Executing function after 1 second of not typing in input field");
          setsearchInputLookup(searchInput);
          if (searchInput.length == 0) {
            setFriendlyLookupResponse(null);
          }
        }, 500);
      
        return () => clearTimeout(timer);
      }, [searchInput]);


    return (
    <div style={{backgroundColor:'rgba(0,0,0,0.5)', position:'absolute', height:'7vh', width:'100vw',  borderBottom:'1px solid #222', display:'flex', justifyContent:'center', alignItems:'center', top:'0',}}>
                
                
    <div onClick={()=>{setshowTokenSelector(!showTokenSelector) }} className="hoverWatchedTokenSelector" style={{zIndex:'10000', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'1vh', display:'flex', justifyContent:'center', textAlign:'center', position:'absolute', left:'19%', width:'15%',height:'80%'}} >
        {
        viewingTokenAddress? 
            <div style={{zIndex:'10000', cursor:'pointer', }} >
            <div style={{display:'flex', justifyContent:'center', alignItems:'center', position:'absolute', top:'0.3vh', left:'0.5vw', border:'0px solid #f00', width:'17%'}}>
                <img src={clickedToken && clickedToken.tokenAddress.logo? clickedToken.tokenAddress.logo : tokenImage } style={{width:'90%'}} />
            </div>
            <div style={{fontSize:'1.5vw', zIndex:'1', position:'absolute', width:'100%', left:'0', top:'-10%',}} onClick={() => {updateSelectedToken();setclickedSearchBar(false);setshowTokenSelector(false) }}>
            {    clickedToken? <>${clickedToken.tokenAddress.symbol}</> : '...'}
            </div>

            <div style={{fontSize:'1vw', color:'#999',fontSize:'2vh',  bottom:'-10%', width:'100%', left:'0',position:'absolute',}}  >
            {getEllipsisTxt(viewingTokenAddress, 6)}
            </div>

            </div>
        : 
            <></>
        }

        


    </div>

    { showTokenSelector  ?
        <div style={{zIndex:'9999', width:'15%', height:'20vh', top:'5.5vh', border:'1px solid rgba(255,255,255,0.2)', borderTop:'0px solid #000', backgroundColor:'rgba(0,0,5,0.99)', left:'19vw', paddingTop:'1vh', position:'absolute'}}>
        {watchedTokenList.map((token, index) => (
            token? token.tokenAddress?
                <div style={{cursor:'pointer', zIndex:'10000', position:'relative', }} onClick={()=>{ updateSelectedToken(token); setshowTokenSelector(false) }}>
                    <div  style={{padding:'0.6vw',backgroundColor:viewingTokenAddress?token.tokenAddress.address?  viewingTokenAddress == token.tokenAddress.address? 'rgba(215,215,255,0.2)':'rgba(0,0,0,0)':'rgba(0,0,0,0)':'rgba(0,0,0,0)'}} key={index} >
                        <img src={token.tokenAddress.logo? token.tokenAddress.logo : tokenImage } style={{marginLeft:token.tokenAddress.logo?'0':'-0.5vh', height:token.tokenAddress.logo?'3vh':'4vh'}} />{token.tokenAddress.logo?<>&nbsp;&nbsp;</>: <>&nbsp;</>}
                        {token.tokenAddress.symbol}
                    </div>
                    {/* <div style={{border:'0px solid #0f0', textAlign:'left', fontSize:'1.3vh', left:'3vw', bottom:'-2%', position:'absolute',color:'#999',fontStyle:'italic', width:'100%',}}>
                        re-indexing database in progress
                    </div> */}

                </div> 
            : <div style={{marginBottom:'1vh'}} key={index}></div> : <div key={index}></div>
            
        ))}
        </div>: <></>
        }



    <div className="hoverWatchedTokenClippy" onClick={() => { CopyToClipboard(viewingTokenAddress) }} style={{zIndex:'10000', position:'absolute', left:'34.5vw'}}>
        <ContentCopyIcon style={{fontSize:'1vw'}}/>
    </div>



    <div style={{color:'#999', width:'30%',display:'flex', border:'0px solid #ff0', position:'absolute', top:'25%', left:'0%'}} >
    <div onClick={()=>{setclickedSearchBar(!clickedSearchBar);}} style={{cursor:'pointer', zIndex:'10000'}}>
        {viewingTokenAddress? <SearchIcon />:<></>}
    </div>

    {
        (clickedDetailsAddressFN || clickedSearchBar)?
        clickedSearchBar?
        
            <div style={{zIndex:'9999', }} id="searchBox" >
                <form onSubmit={(e)=>{console.log('searching watchedToken TXs for address: ', searchInput); e.preventDefault(); setclickedDetailsAddress(searchInput); setclickedSearchBar(false); !clickedDetailsAddressFN? setclickedDetailsAddressFN(searchInput): <></> }}>
                <input style={{backgroundColor:'rgba(0,0,0,0.2)',height:'3vh', width:'15vw', display:'flex',textAlign:'center', border:'1px solid rgba(255,255,255,0.4)', color:'#fff'}} autoFocus placeholder='search for a holder address' type="text" value={searchInput? searchInput: ''} onChange={(e) => {setsearchInput(e.target.value); }}  />
                </form>
            <div style={{border:'2px dashed rgba(255,255,255,0.4)', position:'absolute',top:'100%',width:'15vw', cursor:'pointer', backgroundColor:'rgba(10,10,10,1)', padding:'1vh', height:'12vh', }}>
            {friendlyLookupResponse?
            friendlyLookupResponse.map((nameItem, index)=>{
                return(
                    <div style={{display:'flex', width:'100%', border:'0px solid #0f0'}}>
                    <div key={index} style={{color:'rgba(220,220,255,1)', width:'100%', float:'left'}} onClick={()=>{setclickedDetailsAddress(nameItem.address); setclickedDetailsAddressFN(displayAddressFN(nameItem)); setclickedSearchBar(false) }} >
                        {displayAddressFN(nameItem)}
                    </div>
                    <div style={{float:'right',}}>
                        {getEllipsisTxt(nameItem.address, 4)}
                    </div>
                    </div>
                )
            })
        :<></>
        }
        </div>
        </div>
        
        :
        <div style={{zIndex:'9999', }} onClick={()=>{setclickedSearchBar(!clickedSearchBar)}}>
            {displayAddressFN(friendlyLookupResponse)? displayAddressFN(friendlyLookupResponse)
            :
            <div style={{zIndex:'9999', color:'#999', position:'absolute', left:'15%', }} id="searchBox" onClick={()=>{setclickedSearchBar(!clickedSearchBar)}}>
                {viewingTokenAddress? <>(click to search)</>:<></>}
            </div>
            }
        </div>
        :
        <div style={{zIndex:'9999', color:'#999', position:'absolute', left:'15%', }} id="searchBox" onClick={()=>{setclickedSearchBar(!clickedSearchBar)}}>
            {viewingTokenAddress? <>(click to search)</>:<></>}
        </div>

    } 

    </div>
    <div style={{border:'0px solid #0ff', position:'absolute',top:'5%',}}>
        <ConnectionStatusBanner diff={chainDataHeartbeatDiff}/>
    </div>

    <div onClick={()=>{ setAudioEnabled(!audioEnabled) }}  style={{zIndex:'10000', cursor:'pointer', border:'0px solid #0ff', right:'5%', top:'20%', position:'absolute',}}>
        {audioEnabled? <NotificationsActiveIcon style={{fontSize:'1.5vw'}}/> : <NotificationsOffIcon style={{fontSize:'1.5vw'}}/>}
    </div>


    </div>
    )
}

export default Topbanner