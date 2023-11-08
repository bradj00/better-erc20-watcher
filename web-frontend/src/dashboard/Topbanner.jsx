
import React, {useContext, useState, useRef, useEffect} from 'react';

// import { mainListItems, secondaryListItems } from './listItems.js.back';

import { GeneralContext } from '../App';
import AudioToggle from './subcomponents/AudioToggle';
import SearchIcon from '@mui/icons-material/Search';

import {getEllipsisTxt} from './helpers/h.js';
import TimeAgo from 'javascript-time-ago'

import {commaNumber} from './helpers/h.js';
import NavigatorDropdown from './NavigatorDropdown';
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
import "../App.css"


const Topbanner = () => {
    const [expandedAddresses, setExpandedAddresses] = useState({});

    const {audioEnabled, setAudioEnabled} = React.useContext(GeneralContext);
    const {watchedTokenList} = useContext(GeneralContext);
    const {viewingTokenAddress, setviewingTokenAddress} = useContext(GeneralContext); //this is the address of the token we are viewing
    const {setclickedDetailsAddress} = useContext(GeneralContext); //this is the address of the token we are viewing
    const {clickedDetailsAddressFN, setclickedDetailsAddressFN} = useContext(GeneralContext); //this is the address of the token we are viewing
    const {setclickedTokenSymbol} = useContext(GeneralContext);
    const {clickedToken, setclickedToken} = useContext(GeneralContext);
    const {setheldTokensSelectedAddress} = useContext(GeneralContext);
    
    const {chainDataHeartbeat, setchainDataHeartbeat} = useContext(GeneralContext);
    const [chainDataHeartbeatDiff, setchainDataHeartbeatDiff] = React.useState(0);
    
    const {MinAmountFilterValue, setMinAmountFilterValue} = useContext(GeneralContext);
    const {MaxAmountFilterValue, setMaxAmountFilterValue} = useContext(GeneralContext);
    const {systemStatuses, setSystemStatuses} = useContext(GeneralContext);
    const {setfilteredtxDataInflow} = useContext(GeneralContext);
    const {setfilteredtxDataOutflow} = useContext(GeneralContext);
    const [clickedSearchBar, setclickedSearchBar] = React.useState(false);
    const [showTokenSelector, setshowTokenSelector] = React.useState(false);
    
    const [searchInput, setsearchInput] = useState("")
    const {setsearchInputLookup} = useContext(GeneralContext);
    const {friendlyLookupResponse, setFriendlyLookupResponse} = useContext(GeneralContext);


    const {DisplayMinAmountFilterValue, setDisplayMinAmountFilterValue} = useContext(GeneralContext);
    const {DisplayMaxAmountFilterValue, setDisplayMaxAmountFilterValue} = useContext(GeneralContext);
    const {latestEthBlock, setlatestEthBlock} = useContext(GeneralContext); 
    const {setRequestTransactionList} = useContext(GeneralContext); 
    const {validatedTokenToAddToWatchlist, setvalidatedTokenToAddToWatchlist } = useContext(GeneralContext); 
    const { submitvalidatedTokenToAddToWatchlist, setsubmitvalidatedTokenToAddToWatchlist } = useContext(GeneralContext); 
  
    const [isAddWatchedButtonClicked, setisAddWatchedButtonClicked] = useState(false);
    const {tokenLookupRequestAddy, settokenLookupRequestAddy} = useContext(GeneralContext);
    
    const {cachedErc20TokenMetadata} = useContext(GeneralContext);

    const [timer, setTimer] = useState(null);
    const [placeholder, setPlaceholder] = useState('Enter token');
    const inputRef = useRef(null);
    
    const [showSpinner, setShowSpinner] = useState(false);


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
    if (clickedToken){
        console.log('clickedToken: ',clickedToken, clickedToken.data.data["detail_platforms"].ethereum["decimal_place"])
        
    }
  },[clickedToken]);

  useEffect(()=>{
    if (clickedDetailsAddressFN){
        console.log('clickedDetailsAddressFN: ',clickedDetailsAddressFN);
    }
  },[clickedDetailsAddressFN])

  function updateSelectedToken(token) {
    // Check if token and token.data are defined before proceeding
    if (!token || !token.data) {
        console.error('Token or token.data is not defined');
        return;
    }

    console.log('clicked: ', token); 
    setviewingTokenAddress(token.data.contractAddress); 
    setclickedDetailsAddress(null);
    setclickedDetailsAddressFN(null);
    document.title = "👁️ " + token.data.data.name;
    setclickedTokenSymbol(token.data.data.symbol);
    setclickedToken(token); 
    setfilteredtxDataInflow(); 
    setfilteredtxDataOutflow(); 

    //refactor project
    setRequestTransactionList({
        dateFrom: 0,
        dateTo: 0,
        offset: 0,
        tokenAddress: token.data.contractAddress
    });
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
          if (searchInput.length === 0) {
            setFriendlyLookupResponse(null);
          }
        }, 500);
      
        return () => clearTimeout(timer);
      }, [searchInput]);

      useEffect(() => {
        if (tokenLookupRequestAddy) {
            setShowSpinner(true);
        }
    }, [tokenLookupRequestAddy]);

      useEffect(() => {
        console.log('cachedErc20TokenMetadata:',cachedErc20TokenMetadata)
        if (cachedErc20TokenMetadata[tokenLookupRequestAddy]) {
            setShowSpinner(false);
            setvalidatedTokenToAddToWatchlist(cachedErc20TokenMetadata[tokenLookupRequestAddy])
        }
    }, [cachedErc20TokenMetadata]);
    

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

    useEffect(() => {
        // After fetching your data and setting it to friendlyLookupResponse
        // set all addresses to be expanded by default.
        if (friendlyLookupResponse) {
            const initialExpandState = friendlyLookupResponse.reduce((acc, item) => {
                acc[item.address] = true; // Set each address to be expanded
                return acc;
            }, {});
            setExpandedAddresses(initialExpandState);
        }
    }, [friendlyLookupResponse]);

    const handleInputChange = () => {
  
        // Clear the existing timer (if any)
        if (timer) {
          clearTimeout(timer);
        }
    
        // Set up a new timer
        const newTimer = setTimeout(() => {
          if (inputRef.current.value === '') {
            setPlaceholder('Please enter a token'); // or any other placeholder message you want
          }

        //   console.log('value is: ',inputRef.current.value)
          settokenLookupRequestAddy(inputRef.current.value);
        }, 500); // 0.5 second delay
    
        // Save the timer
        setTimer(newTimer);
      };
    
    const handleWatchClick = () => {
        console.log('Start Watching button clicked!'); // Placeholder handler, replace with your actual functionality
        setsubmitvalidatedTokenToAddToWatchlist(true)
    };

    return (
    <div style={{backgroundColor:'rgba(0,0,0,0.5)', position:'absolute', height:'7vh', width:'100vw',  borderBottom:'1px solid #222', display:'flex', justifyContent:'center', alignItems:'center', top:'0',}}>

{
    friendlyLookupResponse && friendlyLookupResponse.length > 0 && (
        <div style={{
            position: 'absolute', 
            top: '6vh', 
            left: '37vw', 
            zIndex: '99999', 
            border: '1px solid rgba(255,255,255,0.2)', 
            borderRadius: '0.3vw', 
            marginTop: '1vh', 
            backgroundColor: '#2a2a2a',
            maxHeight: '35vh', 
            overflowY: 'scroll'
        }}>
            {
                friendlyLookupResponse.map(item => (
                    <div key={item._id} style={{padding: '1vh'}}>
                        <strong style={{cursor: 'pointer'}} onClick={() => {
                            // Toggle expansion logic
                            const currentVisibility = expandedAddresses[item.address] || false;
                            setExpandedAddresses({
                                ...expandedAddresses,
                                [item.address]: !currentVisibility
                            });
                        }}>
                            {item.address}
                        </strong>
                        {
                            expandedAddresses[item.address] && (
                                <div style={{marginLeft: '2vh', marginTop: '1vh'}}>
                                    {item.manuallyDefined && item.manuallyDefined !== item.address && <p>Manual: {item.manuallyDefined}</p>}
                                    {item.OpenSea && item.OpenSea !== item.address && <p>OpenSea: {item.OpenSea}</p>}
                                    {item.ENS && item.ENS !== item.address && <p>ENS: {Array.isArray(item.ENS) ? item.ENS.join(', ') : item.ENS}</p>}
                                    {item.MegaWorld && item.MegaWorld !== item.address && <p>MegaWorld: {item.MegaWorld}</p>}
                                </div>
                            )
                            
                        }
                    </div>
                ))
            }
        </div>
    )
}



                
    <div onClick={()=>{setshowTokenSelector(!showTokenSelector) }} className="hoverWatchedTokenSelector" style={{zIndex:'10000', border:'1px solid rgba(255,255,255,0.8)', borderRadius:'1vh', display:'flex', justifyContent:'center', textAlign:'center', position:'absolute', left:'19%', width:'15%',height:'80%'}} >
        {
        viewingTokenAddress? 
            <div style={{zIndex:'10000', cursor:'pointer', }} >
            <div style={{display:'flex', justifyContent:'center', alignItems:'center', position:'absolute', top:'0.3vh', left:'0.5vw', border:'0px solid #f00', width:'17%'}}>
                <img src={clickedToken && clickedToken.data.data.image.small? clickedToken.data.data.image.small : tokenImage } style={{width:'90%'}} />
            </div>
            <div style={{fontSize:'1.5vw', zIndex:'1', position:'absolute', width:'100%', left:'0', top:'-10%',}} onClick={() => {updateSelectedToken();setclickedSearchBar(false);setshowTokenSelector(false) }}>
            {    clickedToken? <>${clickedToken.data.data.symbol.toUpperCase()}</> : '...'}
            </div>

            <div style={{ color:'#999',fontSize:'2vh',  bottom:'-10%', width:'100%', left:'0',position:'absolute',}}  >
            {getEllipsisTxt(viewingTokenAddress, 6)}
            </div>

            </div>
        : 
        clickedToken?<></>: <>Select a token to watch</>
        }

        


    </div>

    {showTokenSelector && (
    <div 
        style={{
            zIndex: '9999', 
            width: '15%', 
            
            
            top: '5.5vh', 
            border: '1px solid rgba(255,255,255,0.2)', 
            borderTop: '0px solid #000', 
            backgroundColor: 'rgba(0,0,5,0.99)', 
            left: '19vw', 
            paddingTop: '1vh', 
            position: 'absolute'
        }}
    >
        {watchedTokenList && Array.isArray(watchedTokenList) && 
            watchedTokenList.map((token, index) => (
                token && token.data && token.data.contractAddress ? (
                    <div 
                        key={index}
                        style={{
                            
                            cursor: 'pointer', 
                            zIndex: '10000', 
                            position: 'relative',
                            backgroundColor: viewingTokenAddress && token.data.contractAddress && viewingTokenAddress === token.data.contractAddress 
                                ? 'rgba(100,100,150,0.4)' 
                                : 'rgba(0,0,0,0)'
                        }}
                        onClick={() => {
                            updateSelectedToken(token);
                            setshowTokenSelector(false);
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#666'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = viewingTokenAddress && token.data.contractAddress && viewingTokenAddress === token.data.contractAddress ? 'rgba(215,215,255,0.2)' : 'rgba(0,0,0,0)'}
                    >
                        <div
                            style={{
                                padding: '0.6vw',
                                display: 'flex',  // Set to flex layout
                                alignItems: 'center'  // Center items vertically
                            }}
                        >
                            <img 
                                src={token.data.data.image.small ? token.data.data.image.small : tokenImage}
                                style={{
                                    height: token.data.data.image.small ? '3vh' : '4vh'
                                }}
                                alt={`${token.data.data.image.small} logo`}
                            />
                            <div
                                style={{
                                    marginLeft: '1vw'  // Space to the right of the logo
                                }}
                            >
                                <div style={{fontSize:'0.8vw', color:'#fff'}}>{token.data.data.symbol.toUpperCase()}</div>
                                <div style={{fontSize:'0.6vw', color:'#888'}}>{getEllipsisTxt(token.data.data["contract_address"], 6)}</div>
                            </div>
                        </div>
                        <div
                            style={{
                                textAlign: 'end',
                                fontSize: '0.5vw',
                                color: '#999',
                                marginRight: '0.5vw' ,
                                position: 'absolute',
                                right: '0',
                                bottom: '0.25vh',
                            }}
                        >
                            Status: SYNCED
                        </div>
                    </div>
                ) : (
                    <div key={index} style={{marginBottom: '1vh'}}></div>
                )
            ))
            
        }
        <div className="container">
            {!isAddWatchedButtonClicked ? (
                <div
                    className="watchNewTokenButton"
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        color: '#fff',
                        borderRadius: '4px',
                        margin: '1vh 0.6vw',
                        padding: '0.5vh 0',
                    }}
                    onClick={() => {
                        setisAddWatchedButtonClicked(true);
                    }}
                >
                    <div style={{ fontSize: '1vw', marginRight: '0.5vw' }}>+</div>
                    Watch New Token
                </div>
            ) : (

                <div className="info-pane">
                <div className="header">
                    {cachedErc20TokenMetadata[tokenLookupRequestAddy]?.data?.name ?? '...'}
                </div>

            
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    onChange={handleInputChange}
                    style={{
                        width: '75%',
                        height: '18%',
                        padding: '0.5vh 0.5vw',
                        borderRadius: '4px',
                        background: '#333',
                        border: 'none',
                        color: '#fff',
                        marginTop: '10px'
                    }}
                />
            
            <div className="grid-layout" style={{ display:'flex', justifyContent:'center', background: '#333', color: '#fff', padding: '10px', borderRadius: '8px',  }}>
                <img
                    className="thumbnail"
                    src={cachedErc20TokenMetadata[tokenLookupRequestAddy]?.data?.image?.small ?? '#'}
                    alt="Thumbnail"
                    style={{ width: '2.25vw', height: '2.25vw', background: '#fff', borderRadius: '4px' }}
                />
                <table style={{ width: '100%',   }}>
                    <tbody>

                    
                    <tr>
                        <td style={{ padding: '5px 10px' }}>Site</td>
                        <td style={{ padding: '5px 10px' }}>
                        <a target="_blank" href={cachedErc20TokenMetadata[tokenLookupRequestAddy]?.data?.links.homepage[0] ?? '...'}>{cachedErc20TokenMetadata[tokenLookupRequestAddy]?.data?.links.homepage[0] ?? '...'}</a>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: '5px 10px' }}>Watchers</td>
                        <td style={{ padding: '5px 10px' }}>
                        {cachedErc20TokenMetadata[tokenLookupRequestAddy]?.data?.watchlist_portfolio_users ?? '...'}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: '5px 10px' }}>Chain</td>
                        <td style={{ padding: '5px 10px' }}>
                        {cachedErc20TokenMetadata[tokenLookupRequestAddy]?.data?.asset_platform_id ?? '...'}
                        </td>
                    </tr>
                    </tbody>
                </table>
                </div>


            
                <button className={validatedTokenToAddToWatchlist? "watch-button" : "disabled-watch-button"} onClick={handleWatchClick}>Start Watching</button>
            
                <div
                    style={{
                        cursor: 'pointer',
                        padding: '0.25vh 0.7vh',
                        borderRadius: '0.25vw',
                        background: '#aa0000',
                        color: '#fff',
                        textAlign: 'center',
                        position: 'absolute',
                        right: '0.2vw',
                        top: '0.2vw',
                        fontSize: '0.5vw',
                    }}
                    onClick={() => {
                        setisAddWatchedButtonClicked(false);
                    }}
                >
                    X
                </div>
            </div>
            





                // <div style={{
                //     display: 'flex',
                //     flexDirection: 'column',
                //     alignItems: 'flex-start',
                //     border: '1px solid #0f0',
                //     minHeight: '7vh',
                //     position: 'relative',
                //     padding: '0.5vh 0.5vw',
                // }}>
                //     <select name="network" id="network-select" style={{
                //         marginBottom: '0.5vh',
                //     }}>
                //         <option value="" disabled selected>Chain</option>
                //         <option value="auto">Auto</option>
                //         <option value="eth">Ethereum</option>
                //         <option value="polygon">Polygon</option>
                //     </select>

                    

                    
                    

                // </div>

                
            )}
            {/* {showSpinner?<div className="spinner">
            </div>
            :
            
              
            
        } */}
        </div>
        

    </div>
)}







    <div className="hoverWatchedTokenClippy" onClick={() => { CopyToClipboard(viewingTokenAddress) }} style={{zIndex:'10000', position:'absolute', left:'34.5vw'}}>
        <ContentCopyIcon style={{fontSize:'1vw'}}/>
    </div>



    <div style={{color:'#999', width:'30%',display:'flex', border:'0px solid #ff0', position:'absolute', top:'25%', left:'0%'}} >
    {/* <div onClick={()=>{setclickedSearchBar(!clickedSearchBar);}} style={{cursor:'pointer', zIndex:'10000'}}>
        {viewingTokenAddress? <SearchIcon />:<></>}
    </div> */}

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
        // <div style={{zIndex:'9999', }} onClick={()=>{setclickedSearchBar(!clickedSearchBar)}}>
        //     {displayAddressFN(friendlyLookupResponse)? displayAddressFN(friendlyLookupResponse)
        //     :
        //     <div style={{zIndex:'9999', color:'#999', position:'absolute', left:'15%', }} id="searchBox" onClick={()=>{setclickedSearchBar(!clickedSearchBar)}}>
        //         {viewingTokenAddress? <>(click to search)</>:<></>}
        //     </div>
        //     }
        // </div>
        <></>
        :
        // <div style={{zIndex:'9999', color:'#999', position:'absolute', left:'15%', }} id="searchBox" onClick={()=>{setclickedSearchBar(!clickedSearchBar)}}>
        //     {viewingTokenAddress? <>(click to search)</>:<></>}
        // </div>
            <></>
    } 

    </div>
    <div style={{border:'0px solid #0ff', position:'fixed',top:'1vh',left:'1vw', height:'5vh', width:'10vw', zIndex:'10002'}}>
        <NavigatorDropdown diff={chainDataHeartbeatDiff}/>
    </div>

    {/* <div onClick={()=>{ setAudioEnabled(!audioEnabled) }}  style={{zIndex:'10000', cursor:'pointer', border:'0px solid #0ff', right:'5%', top:'20%', position:'absolute',}}>
        {audioEnabled? <NotificationsActiveIcon style={{fontSize:'1.5vw'}}/> : <NotificationsOffIcon style={{fontSize:'1.5vw'}}/>}
    </div> */}

    <div style={{ zIndex: '50', display: 'flex', backgroundColor: 'rgba(20,20,20,0.6)', borderRadius: '0.5vh', alignItems: 'center', position: 'absolute', right: '0vw', top: '0.4vh', width: '63vw', height: '6vh', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
        <TextField 
        label="Search" 
        variant="outlined" 
        size="small" 
        style={{border:'1px solid rgba(255,255,255,0.2)', borderRadius:'0.3vw', width: '25%', marginLeft:'0.5vw', color: '#fff' }}
        InputLabelProps={{
            style: { color: '#fff' },
        }}
        inputProps={{
            style: { color: '#fff' },
        }}
        placeholder='enter a name or address' 
        type="text" 
        value={searchInput ? searchInput : ''} 
        onChange={(e) => { setsearchInput(e.target.value); }}
        onBlur={() => setsearchInput('')}
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