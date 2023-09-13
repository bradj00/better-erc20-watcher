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

TimeAgo.addDefaultLocale(en);

const mdTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

function determineGroup(address, TxSummaryData) {
    // Find the entry for the given address
    const entry = TxSummaryData.result.find(item => item.address === address);

    if (!entry) return { group: 3, color: 'cyan' }; // Default to "equal" if no entry found

    const { sent, received } = entry;

    const ratio = sent / received;

    if (ratio > 1.2) return { group: 1, color: 'red' }; // send is "much greater" than receive
    if (ratio > 1) return { group: 2, color: '#ff6666' }; // send is "a bit greater" than receive (lighter red)
    if (ratio === 1) return { group: 3, color: 'cyan' }; // send is "equal" to receive
    if (ratio > 0.8) return { group: 4, color: '#66ff66' }; // receive is "a bit greater" than send (lighter green)
    return { group: 5, color: 'green' }; // receive is "much greater" than send
}



function computeNodeRadius(address, TxSummaryData) {
    const maxReceived = TxSummaryData.result[0].received;
    const minReceived = TxSummaryData.result[TxSummaryData.result.length - 1].received;
    const maxRadius = 30;
    const minRadius = 2;

    const entry = TxSummaryData.result.find(item => item.address === address);
    if (!entry) return minRadius;

    const scale = (entry.received - minReceived) / (maxReceived - minReceived);
    return minRadius + scale * (maxRadius - minRadius);
}

function DashboardContent() {
    const fgRef = useRef();
    const [fullScreenToggle, setfullScreenToggle] = useState(false);
    const { defaultData, setDefaultData } = useContext(GeneralContext);
    const { filteredtxData } = useContext(GeneralContext);
    const { txVisualData } = useContext(GeneralContext);
    const { TxSummaryData, setTxSummaryData } = useContext(GeneralContext);

    const handleNodeClick = useCallback(node => {
        const { nodes, links } = defaultData;
        const newLinks = links.filter(l => l.source !== node && l.target !== node);
        const newNodes = nodes.slice();
        newNodes.splice(node.id, 1);
        setDefaultData({ nodes: newNodes, links: newLinks });
    }, [defaultData, setDefaultData, fgRef]);

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

    
    function getUniqueAddysForVisualizer(data) {
        let temp = { nodes: [], links: [] };
        for (let i = 0; i < data.length; i++) {
            let from_address = data[i].from_address;
            let from_address_friendlyName = data[i].from_address_friendlyName;
            let to_address = data[i].to_address;
            let to_address_friendlyName = data[i].to_address_friendlyName;
            let from_address_exists = false;
            let to_address_exists = false;

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
                temp.links.push({ source: displayAddressFN(from_address_friendlyName), target: displayAddressFN(to_address_friendlyName) });
            }
            temp.nodes = temp.nodes.filter((thing, index, self) =>
                index === self.findIndex((t) => (
                    t.id === thing.id
                ))
            )
        }
        return temp;
    }

    useEffect(() => {
        if (filteredtxData && txVisualData && filteredtxData.length > 0 && txVisualData.length > 0) {
            setDefaultData(getUniqueAddysForVisualizer(filteredtxData));
        }
        else if (txVisualData && txVisualData.length > 0) {
            setDefaultData(getUniqueAddysForVisualizer(txVisualData));
        }
    }, [filteredtxData, txVisualData]);

    return (
        <div style={{ display: 'flex', justifyContent: 'left', alignItems: 'center', position: 'absolute', bottom: '1vh', width: '100vw', height: '91vh', }}>
            <div style={{ display: 'flex', borderRadius: '0.5vh', justifyContent: 'center', alignItems: 'center', position: 'absolute', left: '0.5vw', top: '1%', width: '75vw', height: '18%', border: '1px solid rgba(255,255,255,0.1)' }}>
                Filter Panel
            </div>
            <div style={{ display: 'flex', borderRadius: '0.5vh', justifyContent: 'center', alignItems: 'center', position: 'absolute', right: '0.5vw', top: '1%', width: '23.5vw', height: '99%', border: '1px solid rgba(255,255,255,0.1)' }}>
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
                nodeColor={node => node.color}
                linkHoverPrecision={10}
                backgroundColor="rgba(5,5,8,1)"
                nodeLabel={function (d) {
                    return "<div style='color: #111; background-color: #999; border: 1px solid rgba(255,255,255,0.5); border-radius:0.5vh; padding:0.5vh'; text-align:center><span class='label'>Name: " + d.id + "<br />...</span></div>";
                }}
                nodeThreeObject={(node) => {
                    const sphereGeometry = new THREE.SphereGeometry(node.radius);
                    const material = new THREE.MeshBasicMaterial({ color: node.color });
                    return new THREE.Mesh(sphereGeometry, material);
                }}
                enableNodeDrag={false}
                enableNavigationControls={true}
                showNavInfo={true}
                onNodeClick={handleNodeClick}
                linkDirectionalParticles={1}
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
