import React, { useEffect, useContext } from 'react';
import { ForceGraph3D } from "react-force-graph";
import { GeneralContext } from '../App';

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
  

    useEffect(() => {
        let nodeId = 0;

        const interval = setInterval(() => {
            const newNode = {
                id: `node${nodeId}`,
                color: 'rgba(170, 187, 204, 1)',
                radius: 10
            };

            const newLink = nodeId > 0 ? {
                source: `node${nodeId - 1}`,
                target: `node${nodeId}`,
                value: 'linkValue'
            } : null;

            // Update the graph data with the new node and link
            // settxDataForceGraph(prevData => ({
            //     nodes: [...prevData.nodes, newNode],
            //     links: newLink ? [...prevData.links, newLink] : [...prevData.links]
            // }));

            nodeId++;
        }, 1000);

        return () => clearInterval(interval); // Cleanup on component unmount
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <ForceGraph3D
                graphData={txDataForceGraph}
                nodeColor={node => node.color}
                backgroundColor="rgba(5,5,8,1)"
                nodeLabel={d => `Name: ${d.id}`}
                enableNodeDrag={false}
                enableNavigationControls={true}
                showNavInfo={true}
            />
        </div>
    );
}

export default ForceGraphComponent;
