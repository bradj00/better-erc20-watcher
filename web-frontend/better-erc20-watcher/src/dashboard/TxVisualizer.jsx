import React, {useContext, useState, useEffect, useRef, useCallback} from 'react';
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
import LinkIcon from '@mui/icons-material/Link';
import ChartAddysOverTime from './ChartAddysOverTime';
import {ForceGraph3D,} from "react-force-graph";
import  "../App.css";
import SettingsOverscanIcon from '@mui/icons-material/SettingsOverscan';

TimeAgo.addDefaultLocale(en);

const mdTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});


// function genRandomTree(N = 80, reverse = false) {
//     return {
//       nodes: [...Array(N).keys()].map((i) => ({ id: i, group: i % 5 })),
//       links: [...Array(N).keys()]
//         .filter((id) => id)
//         .map((id) => ({
//           [reverse ? "target" : "source"]: id,
//           [reverse ? "source" : "target"]: Math.round(Math.random() * (id - 1))
//         }))
//     };
// }
function genRandomTree(N = 80, reverse = false) {
    return {
      nodes: [...Array(N).keys()].map((i) => ({ id: i, group: i % 5 })),
      links: [...Array(N).keys()]
        .filter((id) => id)
        .map((id) => ({
          [reverse ? "target" : "source"]: id,
          [reverse ? "source" : "target"]: Math.round(Math.random() * (id - 1))
        }))
    };
}



function DashboardContent() {
    const fgRef = useRef();


    const [fullScreenToggle, setfullScreenToggle] = useState(false);
    const [defaultData, setDefaultData] = useState(genRandomTree());
    const [defaultDataLabels, setDefaultDataLabels] = useState(genRandomTree());
    const {txData, settxData} = useContext(GeneralContext); 
    const {filteredtxData, setfilteredtxData} = useContext(GeneralContext); 
    const {txVisualData, settxVisualData} = useContext(GeneralContext);


    const handleNodeClick = useCallback(node => {
        // Aim at node from outside it
        const distance = 400;
        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
    
        fgRef.current.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
          node, // lookAt ({ x, y, z })
          1000  // ms transition duration
        );
      }, [fgRef]);
    



    const displayAddressFN = (friendlyNameObj) => {
        if (friendlyNameObj === null || friendlyNameObj == undefined) {return 'null'}
        let firstAddress;
        Object.keys(friendlyNameObj).map(key => {
          if (key !== '_id' && key !== 'ENS' && key !== 'address' && ( typeof friendlyNameObj[key] === 'string' && !friendlyNameObj[key].startsWith('0x') ) ) {
            firstAddress = friendlyNameObj[key];
            return;
          }
          else if (key === 'ENS' && Array.isArray(friendlyNameObj[key])) {
            firstAddress = friendlyNameObj[key][0];
            return;
          }
          else if (key === 'address') {
            firstAddress = getEllipsisTxt(friendlyNameObj[key], 6);
            return;
          }
        });
        return firstAddress;
      }

    function getUniqueAddysForVisualizer(data) {
        let temp = {nodes: [], links: []};
        for (let i = 0; i < data.length; i++){
            // console.log('from: ',data[i].from_address_friendlyName, 'to: ', data[i].to_address_friendlyName)
            console.log(data[i])
            let from_address                = data[i].from_address;
            let from_address_friendlyName   = data[i].from_address_friendlyName;
            let to_address                  = data[i].to_address;
            let to_address_friendlyName     = data[i].to_address_friendlyName;
            let from_address_exists = false;
            let to_address_exists = false;

            for (let j = 0; j < temp.nodes.length; j++){
                if (temp.nodes[j].id === from_address_friendlyName){
                    from_address_exists = true;
                }
                if (temp.nodes[j].id === to_address_friendlyName){
                    to_address_exists = true;
                }
            }
            if (!from_address_exists){
                temp.nodes.push({id: displayAddressFN(from_address_friendlyName), group: 1, })
            }
            if (!to_address_exists){
                temp.nodes.push({id: displayAddressFN(to_address_friendlyName), group: 1, })
            }
            if (displayAddressFN(from_address_friendlyName) && displayAddressFN(to_address_friendlyName)){
                temp.links.push({source: displayAddressFN(from_address_friendlyName), target: displayAddressFN(to_address_friendlyName), });
            }
            //make nodes unique
            temp.nodes = temp.nodes.filter((thing, index, self) =>
                index === self.findIndex((t) => (
                    t.id === thing.id
                ))
            )

        }
        return(temp);
    }

    useEffect(() => {
        if (filteredtxData && txVisualData && filteredtxData.length > 0 && txVisualData.length > 0){
            setDefaultData( getUniqueAddysForVisualizer(filteredtxData) );
        }
        else if (txVisualData && txVisualData.length > 0){
            setDefaultData( getUniqueAddysForVisualizer(txVisualData) );
        }
    }, [filteredtxData, txVisualData])

    
    // const distance = 900;

    // useEffect(() => {
    //     fgRef.current.cameraPosition({ z: distance });

    //     // camera orbit
    //     let angle = 0;
    //     setInterval(() => {
    //       fgRef.current.cameraPosition({
    //         x: distance * Math.sin(angle),
    //         z: distance * Math.cos(angle)
    //       });
    //       angle += Math.PI / 300;
    //     }, 10);
    //   }, []);


    return (
        <div style={{display:'flex',justifyContent:'left', alignItems:'center',position:'absolute', bottom:'1vh', width:'100vw', height:'91vh', }}>
        
            <div style={{display:'flex', borderRadius:'0.5vh',justifyContent:'center', alignItems:'center', position:'absolute', left:'0.5vw', top:'1%', width:'75vw', height:'18%', border:'1px solid rgba(255,255,255,0.1)'}}>
                Filter Panel
            </div>
            <div style={{display:'flex', borderRadius:'0.5vh',justifyContent:'center', alignItems:'center', position:'absolute', right:'0.5vw', top:'1%', width:'23.5vw', height:'99%', border:'1px solid rgba(255,255,255,0.1)'}}>
                TX Details
            </div>

            <div className={fullScreenToggle? "expandedTxView":"fitTxView"} >
                <div className="hoverOpacity" onClick={ ()=>{setfullScreenToggle(!fullScreenToggle)}} style={{position:'absolute', right:'1%', top:'1%',zIndex:'10000'}}>
                    <SettingsOverscanIcon style={{}}/>
                </div>
                    
                <ThemeProvider theme={mdTheme}>
                    <Box sx={{ display: 'flex' }}>
                        <CssBaseline />
                    </Box>
                </ThemeProvider>
                




                <ForceGraph3D 
                    ref={fgRef}
                    graphData={defaultData} 
                    nodeAutoColorBy="group" 
                    
                    linkHoverPrecision={10}
                    backgroundColor="rgba(5,5,8,1)"
                    // nodeLabel="id"
                    nodeLabel= {function(d) {
                        return "<div style='color: #111; background-color: #999; border: 1px solid rgba(255,255,255,0.5); border-radius:0.5vh; padding:0.5vh'; text-align:center><span class='label'>Name: " + d.id + "<br />...</span></div>";
                    }}
                    // controlType= "orbit"
                    enableNodeDrag={false}
                    enableNavigationControls={true}
                    showNavInfo={true}
                    onNodeClick={handleNodeClick}
                    // onLinkClick={link => fgRef.current.emitParticle(link)}
                    // linkDirectionalArrowLength	={5}
                    linkDirectionalParticles= {1}
                    linkDirectionalParticleSpeed={0.005}
                    linkDirectionalParticleColor={() => "#0f0"} 
                    linkDirectionalParticleWidth={2}
                />

            </div>
        </div>
    );
}

export default function Dashboard() {
  return <DashboardContent />;
}
