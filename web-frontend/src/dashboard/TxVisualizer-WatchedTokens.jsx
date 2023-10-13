import React, { useEffect, useContext, useRef, useCallback, useState } from 'react';
import {getEllipsisTxt} from './helpers/h.js';
import { ForceGraph3D } from "react-force-graph";
import { GeneralContext } from '../App';
import { UnrealBloomPass } from './helpers/UnrealBloomPass';
import * as THREE from 'three';
import person from './images/person.png';
import personOld from './images/person-old.png';
import '../App.css';

const ForceGraphComponent = () => {
    // const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const {txDataForceGraph, settxDataForceGraph} = useContext(GeneralContext);
    const {txData} = useContext(GeneralContext);
    const {CacheFriendlyLabels} = useContext(GeneralContext);

    const [highlightedNodes, setHighlightedNodes] = useState(new Set());

    // const [bloomApplied, setBloomApplied] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  
    const panelStyle = `
        padding: 0.2vw 0.4vw;
        background-color: rgba(50, 50, 60, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 0.25vh;
        color: #FFFFFF;
        font-size: 100%;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        max-width: 15vw;
        
    `;

    const titleStyle = `
        font-size: 100%;
        margin: 0;
        padding-bottom: 1vh;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        display: flex;
        justify-content: center;
    `;

    const paragraphStyle = `
        margin: 10px 0;
    `;


    useEffect(() => {
      if (CacheFriendlyLabels){
        console.log('CacheFriendlyLabels: ',CacheFriendlyLabels)
      }

    },[CacheFriendlyLabels]);

    useEffect(() => {
      if (highlightedNodes){
        console.log('HIGHLIGHTED NODES: ',highlightedNodes)
      }

    },[highlightedNodes]);

    useEffect(() => {
      if (txData){
        const newHighlightNodes = new Set([]);

        // Create a function to check if a node exists
        const nodeExists = (address) => txDataForceGraph.nodes.some(node => node.id === address);
    
        // Create a function to check if a link exists
        const linkExists = (from, to) => txDataForceGraph.links.some(link => link.source.id === from && link.target.id === to);
    
        let newNodes = [];
        let newLinks = [];
    
        txData.forEach(tx => {
            // Check and add from_address node
            if (!nodeExists(tx.from_address)) {
                newNodes.push({
                    id: tx.from_address,
                    // ... other properties with default or calculated values
                });
                newHighlightNodes.add(tx.from_address);
            }
    
            // Check and add to_address node
            if (!nodeExists(tx.to_address)) {
                newNodes.push({
                    id: tx.to_address,
                    // ... other properties with default or calculated values
                });
                newHighlightNodes.add(tx.to_address);
            }
    
            // Check and add link
            if (!linkExists(tx.from_address, tx.to_address)) {
                newLinks.push({
                    source: tx.from_address,
                    target: tx.to_address,
                    value: tx.value,
                    newlyAdded: true, // Add this line
                    // ... other properties with default or calculated values
                });
            }
        });
    
        // Update the graph data with the new nodes and links
        settxDataForceGraph(prevData => {
          const updatedLinks = [...prevData.links, ...newLinks].map(link => {
              return { ...link, newlyAdded: false };
          });
          return {
              nodes: [...prevData.nodes, ...newNodes],
              links: updatedLinks
          };
      });

        setHighlightedNodes(newHighlightNodes);
    }
  }, [txData]);


 

    // Calculate the number of links connected to each node
    const linkCount = {};
    txDataForceGraph.links.forEach(link => {
        linkCount[link.source.id] = (linkCount[link.source.id] || 0) + 1;
        linkCount[link.target.id] = (linkCount[link.target.id] || 0) + 1;
    });

    useEffect(() => {
      console.log('txDataForceGraph:', txDataForceGraph);
  
      // Remove duplicate nodes based on id
      const uniqueNodes = txDataForceGraph.nodes.reduce((acc, node) => {
          if (!acc.temp[node.id]) {
              acc.temp[node.id] = true;
              acc.result.push(node);
          }
          return acc;
      }, { temp: {}, result: [] }).result;
  
      txDataForceGraph.nodes = uniqueNodes;
  
      // if (fgRef.current && !bloomApplied) {
      //     // Calculate the number of links connected to each node
      //     const linkCount = {};
  
      //     txDataForceGraph.links.forEach(link => {
      //         linkCount[link.source.id] = (linkCount[link.source.id] || 0) + 1;
      //         linkCount[link.target.id] = (linkCount[link.target.id] || 0) + 1;
      //     });
  
      //     // Apply the bloom effect to nodes with at least 3 links
      //     const bloomPass = new UnrealBloomPass();
      //     bloomPass.strength = 0.1;
      //     bloomPass.radius = 1;
      //     bloomPass.threshold = 0;
      //     fgRef.current.postProcessingComposer().addPass(bloomPass);
  
      //     setBloomApplied(true); // Set the state to indicate that the bloom effect has been applied
      // }
  }, [txDataForceGraph]);
  
  useEffect(() => {
    const closeMenu = (e) => {
        if (showMenu && e.button === 0) { // Check for left click
            setShowMenu(false);
        }
    };

    document.addEventListener('mousedown', closeMenu);

    return () => {
        document.removeEventListener('mousedown', closeMenu);
    };
}, [showMenu]);
  

    const fgRef = useRef();

    const handleNodeClick = useCallback(node => {
      // Aim at node from outside it
      const distance = 40;
      const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
  
      // Adjustments to center the node on the screen
      const offsetX = -node.x * 0.05; // Adjust these values based on your requirements
      const offsetY = -node.y * 0.05;
  
      fgRef.current.cameraPosition(
          { 
              x: node.x * distRatio + offsetX, 
              y: node.y * distRatio + offsetY, 
              z: node.z * distRatio 
          }, // new position
          node, // lookAt ({ x, y, z })
          2000  // ms transition duration
      );
  }, []);
  

    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>

{showMenu? <div 
    style={{
        position: 'absolute',
        top: `${menuPosition.y}px`,
        left: `${menuPosition.x}px`,
        backgroundColor: '#222',
        color:'#fff',
        border: '1px solid black',
        zIndex: 1000
    }}
    onClick={() => setShowMenu(false)}
>
    <table className="menu-table">
        <tbody onClick={() => setShowMenu(false)}>
            <tr >
                <td>Action 1</td>
            </tr>
            <tr>
                <td>Action 2</td>
            </tr>
            <tr>
                <td>Action 3</td>
            </tr>
        </tbody>
    </table>
</div> : <></>}


        <ForceGraph3D
            ref={fgRef}
            graphData={txDataForceGraph}
            backgroundColor="rgba(5,5,8,1)"
            nodeLabel={d => {
              const labelData = CacheFriendlyLabels[d.id];
              if (labelData && Object.keys(labelData).length > 1 && !labelData[d.id]) {
                let infoString = "";
                let title = "Node Info"; // default title
                if (labelData["manuallyDefined"]) {
                    title = labelData["manuallyDefined"]; // set the title if manuallyDefined exists
                }
            
                const etherscanLink = `https://etherscan.io/address/${d.id}`;
                const shortenedAddress = getEllipsisTxt(d.id, 6);
            
                Object.keys(labelData).forEach(key => {
                    if (key !== "_id" && key !== "address" && key !== "manuallyDefined" && labelData[key] !== d.id && labelData[key] !== undefined) {
                        let displayValue = labelData[key];
                        if (typeof displayValue === "string" && displayValue.startsWith("0x")) {
                            displayValue = getEllipsisTxt(displayValue, 6);
                        }
                        infoString += `
                            <tr>
                                <td style="text-align:left; padding-right:10px;">${key}</td>
                                <td style="text-align:left;">${displayValue}</td>
                            </tr>
                        `;
                    }
                });
            
                return `
                    <div style="${panelStyle}">
                        <h2 style="${titleStyle}">${title}</h2>
                        <a href="${etherscanLink}" style="display:block; text-align:center; font-size:12px; margin-bottom:10px;" target="_blank">${shortenedAddress}</a>
                        <table>
                            ${infoString}
                        </table>
                    </div>
                `;
              } else {
                return `
                    <div style="${panelStyle}">
                        <h2 style="${titleStyle}">Node Info</h2>
                        <a href="https://etherscan.io/address/${d.id}" style="display:block; text-align:center; font-size:12px; margin-bottom:10px;" target="_blank">${getEllipsisTxt(d.id, 6)}</a>
                        <p style="${paragraphStyle}">Other info: No additional information available.</p>
                    </div>
                `;
              }
            }}
            
            onNodeRightClick={(node, event) => {
              setShowMenu(true);
              setMenuPosition({
                  x: event.pageX - 200,  // Adjust the value as needed
                  y: event.pageY - 50   // Adjust the value as needed
              });
            }}
          
          
          
          
            enableNodeDrag={false}
            enableNavigationControls={true}
            showNavInfo={true}
            onNodeClick={handleNodeClick}
            nodeThreeObject={(node) => {
              // Conditionally choose the texture based on whether the node is highlighted or not
              const chosenTexture = highlightedNodes.has(node.id) ? person : personOld;
              const imgTexture = new THREE.TextureLoader().load(chosenTexture);
          
              const material = new THREE.SpriteMaterial({ map: imgTexture });
              const sprite = new THREE.Sprite(material);
              sprite.scale.set(12, 12); // Adjust the scale as needed

              // Set a high renderOrder to ensure the sprite is always at the front
              sprite.renderOrder = 9999;

              return sprite;
          }}
          linkWidth={link => link.newlyAdded ? 10 : 1}
          linkColor={link => link.newlyAdded ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,1)'}
        />
    </div>
    );
}

export default ForceGraphComponent;
