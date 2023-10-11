import React, { useEffect, useContext, useRef, useCallback, useState } from 'react';
import { ForceGraph3D } from "react-force-graph";
import { GeneralContext } from '../App';
import { UnrealBloomPass } from './helpers/UnrealBloomPass'; // Import the required module
const ForceGraphComponent = () => {
    // const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const {txDataForceGraph, settxDataForceGraph} = useContext(GeneralContext);
    const {txData} = useContext(GeneralContext);

    useEffect(() => {
      if (txData){
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
            }
    
            // Check and add to_address node
            if (!nodeExists(tx.to_address)) {
                newNodes.push({
                    id: tx.to_address,
                    // ... other properties with default or calculated values
                });
            }
    
            // Check and add link
            if (!linkExists(tx.from_address, tx.to_address)) {
                newLinks.push({
                    source: tx.from_address,
                    target: tx.to_address,
                    value: tx.value,
                    // ... other properties with default or calculated values
                });
            }
        });
    
        // Update the graph data with the new nodes and links
        settxDataForceGraph(prevData => ({
            nodes: [...prevData.nodes, ...newNodes],
            links: [...prevData.links, ...newLinks]
        }));
    }
  }, [txData]);


  const [bloomApplied, setBloomApplied] = useState(false);

    // Calculate the number of links connected to each node
    const linkCount = {};
    txDataForceGraph.links.forEach(link => {
        linkCount[link.source.id] = (linkCount[link.source.id] || 0) + 1;
        linkCount[link.target.id] = (linkCount[link.target.id] || 0) + 1;
    });

    useEffect(() => {
        if (fgRef.current && !bloomApplied) {
            // Calculate the number of links connected to each node
            const linkCount = {};
            txDataForceGraph.links.forEach(link => {
                linkCount[link.source.id] = (linkCount[link.source.id] || 0) + 1;
                linkCount[link.target.id] = (linkCount[link.target.id] || 0) + 1;
            });

            // Apply the bloom effect to nodes with at least 3 links
            const bloomPass = new UnrealBloomPass();
            bloomPass.strength = 0.5;
            bloomPass.radius = 1;
            bloomPass.threshold = 0;
            fgRef.current.postProcessingComposer().addPass(bloomPass);

            setBloomApplied(true); // Set the state to indicate that the bloom effect has been applied
        }
    }, [txDataForceGraph]);
  

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
            <ForceGraph3D
                ref={fgRef}
                graphData={txDataForceGraph}
                nodeColor={node => {
                    const count = linkCount[node.id] || 0;
                    return count >= 5 ? "cyan" : "purple"; // Replace "bloomColor" with the desired color for nodes with bloom
                }}
                backgroundColor="rgba(5,5,8,1)"
                nodeLabel={d => `Name: ${d.id}`}
                enableNodeDrag={false}
                enableNavigationControls={true}
                showNavInfo={true}
                onNodeClick={handleNodeClick} // Attach the handleNodeClick function here
            />
        </div>
    );
}

export default ForceGraphComponent;
