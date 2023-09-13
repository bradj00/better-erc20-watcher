import React, {useContext, useEffect, useState} from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';
import AssignmentIcon from '@mui/icons-material/Assignment';
import {GeneralContext} from '../../App.js';
import tokenImage from '../images/token_image.png';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';


import { getEllipsisTxt } from '../helpers/h.js';
const SecondaryList = () => {
    const {watchedTokenList, setWatchedTokenList} = useContext(GeneralContext);
    const {viewingTokenAddress, setviewingTokenAddress} = useContext(GeneralContext);
    const {clickedDetailsAddress, setclickedDetailsAddress} = useContext(GeneralContext);
    const {clickedDetailsAddressFN, setclickedDetailsAddressFN} = useContext(GeneralContext);
    const {clickedTokenSymbol, setclickedTokenSymbol} = useContext(GeneralContext);
    const {filteredtxDataInflow,   setfilteredtxDataInflow} = useContext(GeneralContext);
    const {filteredtxDataOutflow,  setfilteredtxDataOutflow} = useContext(GeneralContext);
    
    const {RequestFriendlyLookup, setRequestFriendlyLookup} = useContext(GeneralContext);
    const {friendlyLookupResponse, setFriendlyLookupResponse} = useContext(GeneralContext);
    const {updateFriendlyName, setupdateFriendlyName} = useContext(GeneralContext);

    const [DesiredFriendlyNameUpdate, setDesiredFriendlyNameUpdate] = useState();
    const [editingTokens, setEditingTokens] = useState(false);

    useEffect(() => {
        console.log('watchedTokenList: ',watchedTokenList);
    }, [watchedTokenList]);

    function updateSelectedToken (token){

        console.log('clicked: ',token, token); 
        setviewingTokenAddress(token.tokenAddress.address); 
        setclickedDetailsAddress(null);
        setclickedDetailsAddressFN(null);
        document.title = "👁️ "+token.tokenAddress.name;
        setclickedTokenSymbol(token.tokenAddress.symbol);
        setfilteredtxDataInflow(); 
        setfilteredtxDataOutflow(); 
    }

    function finalizeFriendlyNameUpdate(){
        console.log('finalizeFriendlyNameUpdate: ',DesiredFriendlyNameUpdate);
        setupdateFriendlyName(DesiredFriendlyNameUpdate);
    }

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
        <React.Fragment>
            {/* <ListSubheader component="div" inset> */}
            <ListSubheader component="div" style={{fontSize:'1.5vw'}}>
            
            </ListSubheader>
        {watchedTokenList? watchedTokenList.length > 0? 
        <div style={{display:'flex', height:'70vh',border:'0px solid #f0f'}}>
            <div style={{marginBottom:'3vh',width:'100%', }}>
                {watchedTokenList.map((token, index) => (
                    token? token.tokenAddress?
                        <div style={{position:'relative',}}>
                            <ListItemButton  style={{marginBottom:'0.1vh',backgroundColor:viewingTokenAddress?token.tokenAddress.address?  viewingTokenAddress == token.tokenAddress.address? 'rgba(255,255,255,0.2)':'rgba(0,0,0,0)':'rgba(0,0,0,0)':'rgba(0,0,0,0)'}} key={index} onClick={()=>{ updateSelectedToken(token) }}>
                            {/* <ListItemIcon>
                                <AssignmentIcon />
                            </ListItemIcon> */}
                            <img src={token.tokenAddress.logo? token.tokenAddress.logo : tokenImage } style={{marginLeft:token.tokenAddress.logo?'0':'-0.5vh', height:token.tokenAddress.logo?'3vh':'4vh'}} />{token.tokenAddress.logo?<>&nbsp;&nbsp;</>: <>&nbsp;</>}
                            <ListItemText primary={token.tokenAddress.symbol} />
                            </ListItemButton>
                            <div style={{border:'0px solid #0f0', textAlign:'left', fontSize:'1.3vh', left:'3vw', bottom:'-2%', position:'absolute',color:'#999',fontStyle:'italic', width:'100%',}}>
                                re-indexing database in progress
                            </div>
                            <div title="Stop watching this token" className="hoverRemoveToken" style={{position:'absolute', right:'3%', bottom:'0%',}}>
                                { editingTokens? <RemoveCircleIcon /> : <></> }
                            </div>
                        </div> 
                    : <div style={{marginBottom:'1vh'}} key={index}></div> : <div key={index}></div>
                    
                ))}

                {editingTokens?
                <div onClick={()=>{  }}  style={{ marginTop:'5vh', position:'relative', border:'0px solid #0f0', display:'flex', justifyContent:'center',alignItems:'center',}}>
                    <div title="Add token to watch" className="hoverAddNewToken" style={{marginRight:'1vw' }}>
                        <AddCircleOutlineIcon style={{fontSize:'4vh',}}/> 
                    </div>
                    <div title="Close editing window" className="hoverCloseEditTokenWindow" onClick={()=>{ setEditingTokens(false) }} style={{marginLeft:'1vw'}}>
                        <CheckCircleIcon style={{fontSize:'4vh',}}/> 
                    </div>
                </div> 
                :
                <div onClick={()=>{ setEditingTokens(true) }} className="hoverAddNewToken" style={{left:'25%', marginTop:'5vh', position:'relative', border:'0px solid #0f0', display:'flex', justifyContent:'center',alignItems:'center',}}>
                    
                        <div style={{position:'absolute', left:'0', float:'left', }}>
                            <ModeEditIcon style={{fontSize:'3vh',}}/>
                        </div>
                        <div style={{ position:'absolute', left:'15%',  textAlign:'center',display:'flex', justifyContent:'center',alignItems:'center',}}> 
                            edit tokens
                        </div>
                    
                </div>
                }

                <div style={{zIndex:'10000', textAlign:'center', display:'flex', justifyContent:'center',alignItems:'center', border:'1px solid rgba(0,0,20,0.4)', borderRight:'0px solid #fff',borderLeft:'0px solid #fff', backgroundColor:'rgba(100,100,120,0.1)', position:'absolute',bottom:'0%',width:'100%',height:'40%',}}>
                    {friendlyLookupResponse? 
                        <>
                            <div onClick={()=>{CopyToClipboard(RequestFriendlyLookup)}} style={{cursor:'pointer', position:'absolute',top:'1%',fontSize:'1vw'}}>
                                {getEllipsisTxt(RequestFriendlyLookup, 6)}
                            </div>

                            <div style={{position:'absolute',top:'13%',left:'0%',width:'100%'}}>
                                {/* {friendlyLookupResponse} */}
                                FN:<input  value={DesiredFriendlyNameUpdate} onChange={(e) => setDesiredFriendlyNameUpdate(e.target.value)} style={{width:'82%', padding:'2%', backgroundColor:'rgba(0,0,0,0.4)', color:'#999', border:'none', textAlign:'center'}} placeholder={displayAddressFN(friendlyLookupResponse)} />
                            </div>

                            <div onClick={()=>{finalizeFriendlyNameUpdate()}} style={{position:'absolute',top:'25%', width:'50%', height: '10%', backgroundColor:'rgba(0,0,0,0.4)', display:'flex', justifyContent:'center', alignItems:'center'}}>
                                update
                            </div>
                        </>
                    : 
                        <>.qq..</> 
                        
                    }
                </div>
            </div>
        </div>: <></>: <></>

        }

        </React.Fragment>
    )
}

export default SecondaryList