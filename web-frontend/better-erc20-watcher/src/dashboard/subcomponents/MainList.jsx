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

const MainList = () => {
    return (
        <React.Fragment>
            <ListSubheader component="div" >
            
            </ListSubheader>

            {/* <ListItemButton> */}
            <div style={{width:'100%',border:'0px solid #0f0',display:'flex',alignItems:'center',}}>
            <ListItemIcon>
                <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Watched Tokens" />
            </div>
            {/* </ListItemButton> */}

        </React.Fragment>
    )
}

export default MainList