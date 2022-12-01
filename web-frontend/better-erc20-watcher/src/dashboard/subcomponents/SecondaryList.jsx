import React, {useContext, useEffect} from 'react';
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
const SecondaryList = () => {
    const {watchedTokenList, setWatchedTokenList} = useContext(GeneralContext);
    const {viewingTokenAddress, setviewingTokenAddress} = useContext(GeneralContext);
    const {clickedDetailsAddress, setclickedDetailsAddress} = useContext(GeneralContext);
    const {clickedDetailsAddressFN, setclickedDetailsAddressFN} = useContext(GeneralContext);
    const {clickedTokenSymbol, setclickedTokenSymbol} = useContext(GeneralContext);
    const {filteredtxDataInflow,   setfilteredtxDataInflow} = useContext(GeneralContext);
    const {filteredtxDataOutflow,  setfilteredtxDataOutflow} = useContext(GeneralContext);
  
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

    return (
        <React.Fragment>
            {/* <ListSubheader component="div" inset> */}
            <ListSubheader component="div" style={{fontSize:'1.5vw'}}>
            
            </ListSubheader>
        {watchedTokenList? watchedTokenList.length > 0? 
        <div style={{display:'flex',}}>
            <div style={{marginBottom:'3vh',width:'90%', marginLeft:'0.5vw',}}>
                {watchedTokenList.map((token, index) => (
                    token? token.tokenAddress?
                        <ListItemButton  style={{marginBottom:'0.1vh',backgroundColor:viewingTokenAddress?token.tokenAddress.address?  viewingTokenAddress == token.tokenAddress.address? 'rgba(255,255,255,0.2)':'rgba(0,0,0,0)':'rgba(0,0,0,0)':'rgba(0,0,0,0)'}} key={index} onClick={()=>{ updateSelectedToken(token) }}>
                        {/* <ListItemIcon>
                            <AssignmentIcon />
                        </ListItemIcon> */}
                        <img src={token.tokenAddress.logo? token.tokenAddress.logo : tokenImage } style={{marginLeft:token.tokenAddress.logo?'0':'-0.5vh', height:token.tokenAddress.logo?'3vh':'4vh'}} />{token.tokenAddress.logo?<>&nbsp;&nbsp;</>: <>&nbsp;</>}
                        <ListItemText primary={token.tokenAddress.symbol} />
                        </ListItemButton> 
                    : <div style={{marginBottom:'1vh'}} key={index}></div> : <div key={index}></div>
                    
                ))}
                <div className="hoverAddNewToken" style={{marginLeft:'1vh', marginTop:'5vh', position:'relative', border:'0px solid #0f0', display:'flex', justifyContent:'center',alignItems:'center',}}>
                    
                        <div style={{position:'absolute', left:'0', float:'left', }}>
                            <AddCircleOutlineIcon style={{fontSize:'4vh',}}/> 
                        </div>
                        <div style={{float:'right', position:'absolute', width:'100%', textAlign:'center',display:'flex', justifyContent:'center',alignItems:'center',}}> 
                            add token
                        </div>
                    
                </div>


                <div style={{width:'90%',textAlign:'center', display:'flex', justifyContent:'center',alignItems:'center', border:'1px solid rgba(100,100,120,1)', borderRight:'0px solid #fff',borderLeft:'0px solid #fff', borderRadius:'5px', backgroundColor:'rgba(100,100,120,0.4)', position:'absolute',top:'150%',height:'100%',}}>
                    Options Panel here<br></br>
                    updates on token selection
                </div>
            </div>
            
        </div>: <></>: <></>

        }

        </React.Fragment>
    )
}

export default SecondaryList