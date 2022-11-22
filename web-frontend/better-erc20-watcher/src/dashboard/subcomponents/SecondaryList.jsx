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
        document.title = token.tokenAddress.name;
        setclickedTokenSymbol(token.tokenAddress.symbol);
        setfilteredtxDataInflow(); 
        setfilteredtxDataOutflow();
    }

    return (
        <React.Fragment>
            {/* <ListSubheader component="div" inset> */}
            <ListSubheader component="div" style={{fontSize:'1.5vw'}}>
            
            </ListSubheader>
        {watchedTokenList? watchedTokenList.length > 0? watchedTokenList.map((token, index) => (
            token? token.tokenAddress?
                <ListItemButton  style={{backgroundColor:viewingTokenAddress?token.tokenAddress.address?  viewingTokenAddress == token.tokenAddress.address? 'rgba(255,255,255,0.2)':'rgba(0,0,0,0)':'rgba(0,0,0,0)':'rgba(0,0,0,0)'}} key={index} onClick={()=>{ updateSelectedToken(token) }}>
                {/* <ListItemIcon>
                    <AssignmentIcon />
                </ListItemIcon> */}
                <img src={token.tokenAddress.logo? token.tokenAddress.logo : tokenImage } style={{marginLeft:token.tokenAddress.logo?'0':'-0.5vh', height:token.tokenAddress.logo?'3vh':'4vh'}} />{token.tokenAddress.logo?<>&nbsp;&nbsp;</>: <>&nbsp;</>}
                <ListItemText primary={token.tokenAddress.symbol} />
                </ListItemButton>
            : <div key={index}></div> : <div key={index}></div>
            
        )): <></>: <></>

        }

        </React.Fragment>
    )
}

export default SecondaryList