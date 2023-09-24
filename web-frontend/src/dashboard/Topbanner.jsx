import React, {useContext, useState, useEffect} from 'react';

// import { mainListItems, secondaryListItems } from './listItems.js.back';

import { GeneralContext } from '../App';
import AudioToggle from './subcomponents/AudioToggle';
import SearchIcon from '@mui/icons-material/Search';

import {getEllipsisTxt} from './helpers/h.js';
import TimeAgo from 'javascript-time-ago'

import {commaNumber} from './helpers/h.js';
import ConnectionStatusBanner from './ConnectionStatusBanner';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import tokenImage from './images/token_image.png';

import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FastForwardIcon from '@mui/icons-material/FastForward';
import ClearIcon from '@mui/icons-material/Clear';
import Button from '@mui/material/Button';
import ReactSlider from 'react-slider';
import Datetime from 'react-datetime';



const Topbanner = () => {
    const {audioEnabled, setAudioEnabled} = React.useContext(GeneralContext);
    const {watchedTokenList, setWatchedTokenList} = useContext(GeneralContext);
    const {viewingTokenAddress, setviewingTokenAddress} = useContext(GeneralContext); //this is the address of the token we are viewing
    const {clickedDetailsAddress, setclickedDetailsAddress} = useContext(GeneralContext); //this is the address of the token we are viewing
    const {clickedDetailsAddressFN, setclickedDetailsAddressFN} = useContext(GeneralContext); //this is the address of the token we are viewing
    const {clickedTokenSymbol, setclickedTokenSymbol} = useContext(GeneralContext);
    const {clickedToken, setclickedToken} = useContext(GeneralContext);
    const {heldTokensSelectedAddress, setheldTokensSelectedAddress} = useContext(GeneralContext);
    
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

  useEffect(()=>{
    if (clickedDetailsAddressFN){
        console.log('clickedDetailsAddressFN: ',clickedDetailsAddressFN);
    }
  },[clickedDetailsAddressFN])

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


    function doTheUpdate(nameItem){
        setclickedDetailsAddress(nameItem.address); 
        setheldTokensSelectedAddress(nameItem.address); 
        setclickedDetailsAddressFN(displayAddressFN(nameItem)); 
        setclickedSearchBar(false);
    }
    
    useEffect(() => {
        if (friendlyLookupResponse){
            console.log('~!~! friendlyLookupResponse: ',friendlyLookupResponse);
        }
    },[friendlyLookupResponse]);

    useEffect(() => {
        const timer = setTimeout(() => {
          console.log("Executing function after 1 second of not typing in input field: ",searchInput);
          setsearchInputLookup(searchInput);
          if (searchInput.length == 0) {
            setFriendlyLookupResponse(null);
          }
        }, 500);
      
        return () => clearTimeout(timer);
      }, [searchInput]);



    const [subRange, setSubRange] = useState({
        start: new Date(),  // You can set default values here
        end: new Date()     // You can set default values here
    });

    const [sliderValue, setSliderValue] = useState(50);  // Initial value set to 50

    const handleSliderChange = (value) => {
        setSliderValue(value);
    };


    const [timeRange, setTimeRange] = useState({
        start: new Date(),
        end: new Date()
    });


    const handleStartDateChange = (date) => {
        setTimeRange(prev => ({ ...prev, start: date.toDate() }));
    };
    
    const handleEndDateChange = (date) => {
        setTimeRange(prev => ({ ...prev, end: date.toDate() }));
    };
    

    return (
    <div style={{backgroundColor:'rgba(0,0,0,0.5)', position:'absolute', height:'7vh', width:'100vw',  borderBottom:'1px solid #222', display:'flex', justifyContent:'center', alignItems:'center', top:'0',}}>
                
                
    <div onClick={()=>{setshowTokenSelector(!showTokenSelector) }} className="hoverWatchedTokenSelector" style={{zIndex:'10000', border:'1px solid rgba(255,255,255,0.8)', borderRadius:'1vh', display:'flex', justifyContent:'center', textAlign:'center', position:'absolute', left:'19%', width:'15%',height:'80%'}} >
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
        clickedToken?<></>: <>Select a token to watch</>
        }

        


    </div>

    { showTokenSelector  ?
        <div style={{zIndex:'9999', width:'15%', height:'20vh', top:'5.5vh', border:'1px solid rgba(255,255,255,0.2)', borderTop:'0px solid #000', backgroundColor:'rgba(0,0,5,0.99)', left:'19vw', paddingTop:'1vh', position:'absolute'}}>
        {watchedTokenList && Array.isArray(watchedTokenList)? watchedTokenList.map((token, index) => (
            token? token.data.address?
                <div style={{cursor:'pointer', zIndex:'10000', position:'relative', }} onClick={()=>{ updateSelectedToken(token); setshowTokenSelector(false) }}>
                    <div  style={{padding:'0.6vw',backgroundColor:viewingTokenAddress?token.data.address?  viewingTokenAddress == token.data.address? 'rgba(215,215,255,0.2)':'rgba(0,0,0,0)':'rgba(0,0,0,0)':'rgba(0,0,0,0)'}} key={index} >
                        <img src={token.data.logo? token.data.logo : tokenImage } style={{marginLeft:token.tokenAddress.logo?'0':'-0.5vh', height:token.data.logo?'3vh':'4vh'}} />{token.data.logo?<>&nbsp;&nbsp;</>: <>&nbsp;</>}
                        {token.data.symbol}
                    </div>
                    {/* <div style={{border:'0px solid #0f0', textAlign:'left', fontSize:'1.3vh', left:'3vw', bottom:'-2%', position:'absolute',color:'#999',fontStyle:'italic', width:'100%',}}>
                        re-indexing database in progress
                    </div> */}

                </div> 
            : <div style={{marginBottom:'1vh'}} key={index}></div> : <div key={index}></div>
            
        )) : <></>}
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
        
            <div style={{zIndex:'10000', }} id="searchBox" >
                <form onSubmit={(e)=>{console.log('searching watchedToken TXs for address: ', searchInput); e.preventDefault(); setclickedDetailsAddress(searchInput); setclickedSearchBar(false); !clickedDetailsAddressFN? setclickedDetailsAddressFN(searchInput): <></> }}>
                {/* <input onKeyDown={(e) => e.key === "Enter" && doTheUpdate({address: e.target.value})} style={{backgroundColor:'rgba(0,0,0,0.2)',height:'3vh', width:'15vw', display:'flex',textAlign:'center', border:'1px solid rgba(255,255,255,0.4)', color:'#fff'}} autoFocus placeholder='search for a holder address' type="text" value={searchInput? searchInput: ''} onChange={(e) => {setsearchInput(e.target.value); }}  /> */}
                <input onKeyDown={(e) => e.key === "Enter" && doTheUpdate({address: e.target.value})} style={{backgroundColor:'rgba(0,0,0,0.2)',height:'3vh', width:'15vw', display:'flex',textAlign:'center', border:'1px solid rgba(255,255,255,0.4)', color:'#fff'}} autoFocus placeholder='search for a holder address' type="text" value={searchInput? searchInput: ''} onChange={(e) => {setsearchInput(e.target.value); }}  />
                </form>
            <div style={{border:'2px dashed rgba(255,255,255,0.4)', overflowY:'scroll', position:'absolute',top:'100%',width:'15vw', cursor:'pointer', backgroundColor:'rgba(10,10,10,1)', padding:'1vh', height:'12vh', }}>
            {friendlyLookupResponse && Array.isArray(friendlyLookupResponse)?
            friendlyLookupResponse.map((nameItem, index)=>{
                return(
                    <div style={{display:'flex', width:'100%', border:'0px solid #0f0'}}>
                    <div key={index} style={{color:'rgba(220,220,255,1)', width:'100%', float:'left'}} onClick={()=>{doTheUpdate(nameItem); }} >
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
    <div style={{border:'0px solid #0ff', position:'fixed',top:'1vh',left:'1vw', height:'5vh', width:'10vw', zIndex:'10002'}}>
        <ConnectionStatusBanner diff={chainDataHeartbeatDiff}/>
    </div>

    {/* <div onClick={()=>{ setAudioEnabled(!audioEnabled) }}  style={{zIndex:'10000', cursor:'pointer', border:'0px solid #0ff', right:'5%', top:'20%', position:'absolute',}}>
        {audioEnabled? <NotificationsActiveIcon style={{fontSize:'1.5vw'}}/> : <NotificationsOffIcon style={{fontSize:'1.5vw'}}/>}
    </div> */}

    <div style={{ zIndex: '50', display: 'flex', backgroundColor: 'rgba(20,20,20,0.6)', borderRadius: '0.5vh', alignItems: 'center', position: 'absolute', right: '0vw', top: '0.4vh', width: '63vw', height: '6vh', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
        <TextField 
            label="Search" 
            variant="outlined" 
            size="small" 
            style={{border:'1px solid rgba(255,255,255,0.2)',borderRadius:'0.3vw', width: '25%', marginLeft:'0.5vw', color: '#fff' }}
            InputLabelProps={{
                style: { color: '#fff' },
            }}
            inputProps={{
                style: { color: '#fff' },
            }}
             
            placeholder='enter a name or address' 
            type="text" 
            value={searchInput? searchInput: ''} 
            onChange={(e) => {setsearchInput(e.target.value); }}
        />
        <div style={{ height:'100%', width:'100%',position:'absolute', display:'flex', alignItems:'end', paddingBottom:'0.5vh', left:'17vw', marginLeft: '1vw', marginRight: '1vw' }}>
            {/* {timeRange.start.toLocaleDateString()} - {timeRange.end.toLocaleDateString()} */}
            <div style={{
                border: '0px solid #0f0',
                position: 'absolute',
                width: '35.4vw',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'start',  
                // background: 'linear-gradient(90deg, rgba(20,20,20,1) 0%, rgba(60,60,60,1) 100%)',  
                padding: '10px 0'  
            }}>
                <ReactSlider
                    min={1}
                    max={100}
                    value={sliderValue}
                    onChange={handleSliderChange}
                    className="my-slider"
                    thumbClassName="my-slider-thumb"
                />
            </div>



            <Datetime 
                className="customDatetime"
                value={timeRange.start}
                onChange={date => setTimeRange({ ...timeRange, start: date })}
                inputProps={{
                    placeholder: "Start Date",
                    style: { color: '#fff', fontSize: '1.2vw', width:'13vw', backgroundColor: 'rgba(20,20,20,0.6)', border: '1px solid #fff',   }
                }}
            />
            <div style={{height:'100%', display:'flex', alignItems:'end',}}>
                <IconButton color="primary" style={{ marginLeft: '10px', marginRight: '10px' }}>
                    <FastRewindIcon />
                </IconButton>
                <IconButton color="primary" style={{ marginLeft: '10px', marginRight: '10px' }}>
                    <PlayArrowIcon />
                </IconButton>
                <IconButton color="primary" style={{ marginLeft: '10px', marginRight: '10px' }}>
                    <FastForwardIcon />
                </IconButton>
            </div>

            <Datetime 
                className="customDatetime"
                value={timeRange.end}
                onChange={date => setTimeRange({ ...timeRange, end: date })}
                inputProps={{
                    placeholder: "End Date",
                    style: { color: '#fff', fontSize: '1.2vw', width:'13vw', backgroundColor: 'rgba(20,20,20,0.6)', border: '1px solid #fff' },
                    
                    
                }}
            />
            
        </div>
        
        <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<ClearIcon />} 
            style={{ position:'absolute', right:'1%', marginLeft: '10px', marginRight: '10px' }}
        >
            Clear
        </Button>
    </div>

    </div>
    )
}

export default Topbanner