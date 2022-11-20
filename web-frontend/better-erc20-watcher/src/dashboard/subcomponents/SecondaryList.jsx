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

const SecondaryList = () => {
    const {watchedTokenList, setWatchedTokenList} = useContext(GeneralContext);
    const {viewingTokenAddress, setviewingTokenAddress} = useContext(GeneralContext);
    useEffect(() => {
        console.log('watchedTokenList: ',watchedTokenList);
    }, [watchedTokenList]);


    return (
        <React.Fragment>
            {/* <ListSubheader component="div" inset> */}
            <ListSubheader component="div" style={{fontSize:'1.5vw'}}>
            💰
            </ListSubheader>
        {watchedTokenList? watchedTokenList.length > 0? watchedTokenList.map((token, index) => (
            token? token.tokenAddress?
                <ListItemButton  key={index} onClick={()=>{console.log('clicked: ',token); setviewingTokenAddress(token.tokenAddress.address)}}>
                {/* <ListItemIcon>
                    <AssignmentIcon />
                </ListItemIcon> */}
                <img src={token.tokenAddress.logo? token.tokenAddress.logo : <></>} style={{height:'3vh'}} ></img>&nbsp;&nbsp;
                <ListItemText primary={token.tokenAddress.symbol} />
                </ListItemButton>
            : <div key={index}></div> : <div key={index}></div>
            
        )): <></>: <></>

        }

        </React.Fragment>
    )
}

export default SecondaryList