/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */

import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FastForwardIcon from '@mui/icons-material/FastForward';
import ClearIcon from '@mui/icons-material/Clear';
import Button from '@mui/material/Button';
import ReactSlider from 'react-slider';


import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";

import "./styles.css";
import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { GeneralContext } from '../App';
import { getEllipsisTxt } from './helpers/h.js';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { ForceGraph3D } from "react-force-graph";
import "../App.css";
import SettingsOverscanIcon from '@mui/icons-material/SettingsOverscan';
import * as THREE from 'three';
// import * as d3 from 'd3';
import Web3 from 'web3';


// TimeAgo.addDefaultLocale(en);

const mdTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

function determineGroup(address, TxSummaryData) {
    if (TxSummaryData === null){return}
    console.log('SUMMARY DATA: ',TxSummaryData)
    // Find the entry for the given address
    const entry = TxSummaryData.result.find(item => item.address === address);

    if (!entry) return { group: 3, color: 'cyan' }; // Default to "equal" if no entry found

    const { sent, received } = entry;

    const ratio = sent / received;

    if (ratio > 1.2) return { group: 1, color: '#FF0000' }; // send is "much greater" than receive
    if (ratio > 1) return { group: 2, color: '#A00000' }; // send is "a bit greater" than receive (lighter red)
    if (ratio === 1) return { group: 3, color: '#0dd' }; // send is "equal" to receive
    if (ratio > 0.8) return { group: 4, color: '#00B000' }; // receive is "a bit greater" than send (lighter green)
    return { group: 5, color: '#00FF00' }; // receive is "much greater" than send
}



function computeNodeRadius(address, TxSummaryData) {
    if (TxSummaryData === null){return}
    
    const maxReceived = TxSummaryData.result[0].received;
    const minReceived = TxSummaryData.result[TxSummaryData.result.length - 1].received;
    const maxRadius = 10;
    const minRadius = 3;

    const entry = TxSummaryData.result.find(item => item.address === address);
    if (!entry) return minRadius;

    const scale = (entry.received - minReceived) / (maxReceived - minReceived);
    return minRadius + scale * (maxRadius - minRadius);
}

function DashboardContent() {
    const fgRef = useRef();
    const [fullScreenToggle, setfullScreenToggle] = useState(true);
    const { defaultData, setDefaultData } = useContext(GeneralContext);
    const { filteredtxData } = useContext(GeneralContext);
    const { txVisualData } = useContext(GeneralContext);
    const { TxSummaryData} = useContext(GeneralContext);
    const web3 = new Web3(Web3.givenProvider);

    // Assuming you have state for the time range:
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
    
  

    const handleNodeClick = useCallback(node => {
        const { nodes, links } = defaultData;
    
        // Remove links connected to the clicked node
        const newLinks = links.filter(l => l.source !== node && l.target !== node);
    
        // Create a set of all unique node IDs that are present in the newLinks array
        const linkedNodeIds = new Set();
        newLinks.forEach(link => {
            linkedNodeIds.add(link.source.id);
            linkedNodeIds.add(link.target.id);
        });
    
        // Filter the nodes array to only include nodes whose IDs are in the linkedNodeIds set
        const newNodes = nodes.filter(n => linkedNodeIds.has(n.id));
    
        setDefaultData({ nodes: newNodes, links: newLinks });
    }, [defaultData, setDefaultData]);
    

    const displayAddressFN = (friendlyNameObj) => {
        if (friendlyNameObj === null || friendlyNameObj == undefined) { return 'null' }
        let firstAddress;
        Object.keys(friendlyNameObj).map(key => {
            if (key !== '_id' && key !== 'ENS' && key !== 'address' && (typeof friendlyNameObj[key] === 'string' && !friendlyNameObj[key].startsWith('0x'))) {
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


    useEffect(() => {
        console.log('defaultData:', defaultData);
    }, [defaultData]);


    

    function getMaxMinLinkValue(links) {
        let max = -Infinity;
        let min = Infinity;
    
        links.forEach(link => {
            if (link.value > max) max = link.value;
            if (link.value < min) min = link.value;
        });
    
        return { max, min };
    }
    
    function computeLinkWidth(value, max, min) {
        const MIN_WIDTH = 1;  // minimum link width
        const MAX_WIDTH = 5;  // maximum link width
        return MIN_WIDTH + (value - min) * (MAX_WIDTH - MIN_WIDTH) / (max - min);
    }

    
    
    function getUniqueAddysForVisualizer(data) {
        let temp = { nodes: [], links: [] };
        for (let i = 0; i < data.length; i++) {
            let from_address = data[i].from_address;
            let from_address_friendlyName = data[i].from_address_friendlyName;
            let to_address = data[i].to_address;
            let to_address_friendlyName = data[i].to_address_friendlyName;
            let from_address_exists = false;
            let to_address_exists = false;
            let txValue = web3.utils.fromWei(data[i].value, 'ether');

            for (let j = 0; j < temp.nodes.length; j++) {
                if (temp.nodes[j].id === from_address_friendlyName) {
                    from_address_exists = true;
                }
                if (temp.nodes[j].id === to_address_friendlyName) {
                    to_address_exists = true;
                }
            }
            const fromGroupColor = determineGroup(from_address, TxSummaryData);
            const toGroupColor = determineGroup(to_address, TxSummaryData);
            const fromRadius = computeNodeRadius(from_address, TxSummaryData);
            const toRadius = computeNodeRadius(to_address, TxSummaryData);
    

            if (!from_address_exists) {
                temp.nodes.push({
                    id: displayAddressFN(from_address_friendlyName),
                    group: fromGroupColor.group,
                    color: fromGroupColor.color,
                    eth_address: from_address,
                    radius: fromRadius
                });
            }
            if (!to_address_exists) {
                temp.nodes.push({
                    id: displayAddressFN(to_address_friendlyName),
                    group: toGroupColor.group,
                    color: toGroupColor.color,
                    eth_address: to_address,
                    radius: toRadius
                });
            }
            if (displayAddressFN(from_address_friendlyName) && displayAddressFN(to_address_friendlyName)) {
                temp.links.push({ source: displayAddressFN(from_address_friendlyName), target: displayAddressFN(to_address_friendlyName), value: txValue});
            }
            temp.nodes = temp.nodes.filter((thing, index, self) =>
                index === self.findIndex((t) => (
                    t.id === thing.id
                ))
            )
        }
        const { max, min } = getMaxMinLinkValue(temp.links);       
        // Adjust link width based on its value
        temp.links = temp.links.map(link => ({
            ...link,
            width: computeLinkWidth(link.value, max, min)
        }));

        

        
        return temp;
    }

    useEffect(() => { 
        let dataToSet;
    
        if (filteredtxData && txVisualData && filteredtxData.length > 0 && txVisualData.length > 0) {
            dataToSet = getUniqueAddysForVisualizer(filteredtxData);
        } else if (txVisualData && txVisualData.length > 0) {
            console.log('txVisualData: ', txVisualData);
            dataToSet = getUniqueAddysForVisualizer(txVisualData);
        }
    
        if (dataToSet) {
            const { max, min } = getMaxMinLinkValue(dataToSet.links);
    
            // Adjust link width and distance based on its value
            dataToSet.links = dataToSet.links.map(link => ({
                ...link,
                width: computeLinkWidth(parseFloat(link.value), max, min),
            }));
    
            setDefaultData(dataToSet);
        }
    }, [filteredtxData, txVisualData]);
    
    const [subRange, setSubRange] = useState({
        start: new Date(),  // You can set default values here
        end: new Date()     // You can set default values here
    });

    const [sliderValue, setSliderValue] = useState(50);  // Initial value set to 50

    const handleSliderChange = (value) => {
        setSliderValue(value);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'left', alignItems: 'center', position: 'absolute', bottom: '0vh', width: '100vw', height: '91vh', }}>
            


            <div style={{ zIndex:'50', display: 'flex', borderRadius: '0.5vh', justifyContent: 'center', alignItems: 'center', position: 'absolute', right: '1vw', top: '1%', width: '17vw', height: '40vh', border: '1px solid rgba(255,255,255,0.1)' }}>
                TX Details
            </div>
            <div className={fullScreenToggle ? "expandedTxView" : "fitTxView"}>
                <div className="hoverOpacity" onClick={() => { setfullScreenToggle(!fullScreenToggle) }} style={{ position: 'absolute', right: '1%', top: '1%', zIndex: '10000' }}>
                    <SettingsOverscanIcon style={{}} />
                </div>
                <ThemeProvider theme={mdTheme}>
                    <Box sx={{ display: 'flex' }}>
                        <CssBaseline />
                    </Box>
                </ThemeProvider>

                <ForceGraph3D
                ref={fgRef}
                graphData={defaultData}
                // nodeAutoColorBy="group"
                
                linkDistance={() => 5}  // fixed distance 
                nodeColor={node => node.color}
                linkHoverPrecision={10}
                backgroundColor="rgba(5,5,8,1)"
                nodeLabel={function (d) {
                    return "<div style='color: #111; background-color: #999; border: 1px solid rgba(255,255,255,0.5); border-radius:0.5vh; padding:0.5vh'; text-align:center><span class='label'>Name: " + d.id + "<br />...</span></div>";
                }}

                nodeThreeObject={(node) => {
                    const group = new THREE.Group();
                
                    // Main sphere (fill color)
                    const mainSphereGeometry = new THREE.SphereGeometry(node.radius);
                    const mainMaterial = new THREE.MeshBasicMaterial({ color: node.color });
                    const mainSphere = new THREE.Mesh(mainSphereGeometry, mainMaterial);
                    group.add(mainSphere);
                
                    // Create a circular texture
                    const canvas = document.createElement('canvas');
                    canvas.width = 64;
                    canvas.height = 64;
                    const context = canvas.getContext('2d');
                    context.arc(32, 32, 30, 0, 2 * Math.PI); // Adjust the radius as needed
                    context.fillStyle = 'rgba(0,0,0,1)';
                    context.fill();
                    const texture = new THREE.CanvasTexture(canvas);
                
                    // Sprite for the border
                    const spriteMaterial = new THREE.SpriteMaterial({
                        map: texture,
                        transparent: true,
                        depthTest: false,  // Ensure sprite is always rendered on top
                        depthWrite: false  // Prevent sprite from affecting depth buffer
                    });
                    const sprite = new THREE.Sprite(spriteMaterial);
                    sprite.scale.set(node.radius * 0.03, node.radius * 0.03, 1); // Adjust the multiplier as needed to control the border size
                    group.add(sprite);
                
                    return group;
                  }}

                // linkWidth={link => link.width}
                

                enableNodeDrag={false}
                enableNavigationControls={true}
                showNavInfo={true}
                onNodeClick={handleNodeClick}
                linkDirectionalParticles={0}
                linkDirectionalParticleSpeed={0.001}
                linkDirectionalParticleColor={() => "#444"}
                linkDirectionalParticleWidth={2}

                />
            </div>
        </div>
    );
}

export default function Dashboard() {
    return <DashboardContent />;
}
