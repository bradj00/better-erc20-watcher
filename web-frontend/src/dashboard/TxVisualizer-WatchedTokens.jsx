import React, { useRef, useContext, useCallback, useEffect, useMemo } from 'react';
import { ForceGraph3D } from "react-force-graph";
import * as THREE from 'three';
import { GeneralContext } from '../App';
import Web3 from 'web3';

const ForceGraphComponent = () => {
    const web3 = new Web3(Web3.givenProvider);
    const fgRef = useRef();
    const { txData } = useContext(GeneralContext);

    const handleNodeClick = useCallback((node) => {
        // TODO: Define what should happen when a node is clicked
    }, []);

    // Preprocess the txData to convert it into graph data
    const graphData = useMemo(() => {
        let nodes = [];
        let links = [];
        let addressSet = new Set();
        let addressAggregate = {};
        let addressOpacityAggregate = {}; // to store the sum of opacities for each address
        let addressCounts = {}; // to store the number of occurrences for each address

        // Check if txData is defined and if it's an array
        if (Array.isArray(txData)) {
            txData.forEach((tx, idx) => {
                addressSet.add(tx?.from_address);
                addressSet.add(tx?.to_address);

                const opacity = 1 - (0.7 * (idx / (txData.length - 1))); // Compute the opacity for this transaction

                addressOpacityAggregate[tx?.from_address] = (addressOpacityAggregate[tx?.from_address] || 0) + opacity;
                addressOpacityAggregate[tx?.to_address] = (addressOpacityAggregate[tx?.to_address] || 0) + opacity;

                addressCounts[tx?.from_address] = (addressCounts[tx?.from_address] || 0) + 1;
                addressCounts[tx?.to_address] = (addressCounts[tx?.to_address] || 0) + 1;

                addressAggregate[tx?.from_address] = (addressAggregate[tx?.from_address] || 0) - Number(tx?.value);
                addressAggregate[tx?.to_address] = (addressAggregate[tx?.to_address] || 0) + Number(tx?.value);

                links.push({
                    source: tx?.from_address,
                    target: tx?.to_address,
                    value: tx?.value,
                    color: `rgba(${255 - 85 * (1 - opacity)}, ${255 - 68 * (1 - opacity)}, ${255 - 51 * (1 - opacity)}, ${opacity})` // Interpolated color based on opacity
                });
                
            });

            const maxAggregate = Math.max(...Object.values(addressAggregate));

            addressSet.forEach(addr => {
                if (addr) {
                    const avgOpacity = addressOpacityAggregate[addr] / addressCounts[addr];
                    nodes.push({
                        id: addr,
                        color: `rgba(170, 187, 204, ${avgOpacity})`, // Apply the average opacity to the node color
                        radius: 7 + (15 * Math.abs(addressAggregate[addr]) / maxAggregate)
                    });
                }
            });
        }

        return { nodes, links };
    }, [txData]);


    return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <ForceGraph3D
                ref={fgRef}
                graphData={graphData}
                linkDistance={() => 3} 
                nodeColor={node => node.color}
                linkHoverPrecision={10}

                backgroundColor="rgba(5,5,8,1)"
                nodeLabel={function (d) {
                    return "<div style='color: #111; background-color: #999; border: 1px solid rgba(255,255,255,0.5); border-radius:0.5vh; padding:0.5vh'; text-align:center><span class='label'>Name: " + d.id + "<br />...</span></div>";
                }}
                nodeThreeObject={(node) => {
                    const group = new THREE.Group();
                    const mainSphereGeometry = new THREE.SphereGeometry(node.radius); 
                
                    // Extract opacity from node.color
                    const rgbaMatch = node.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*(\d*\.?\d*)?\)/);
                    const opacity = rgbaMatch && rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
                
                    const mainMaterial = new THREE.MeshBasicMaterial({ 
                        color: new THREE.Color(node.color),
                        transparent: true, 
                        opacity: opacity
                    });
                
                    const mainSphere = new THREE.Mesh(mainSphereGeometry, mainMaterial);
                    group.add(mainSphere);
                    const canvas = document.createElement('canvas');
                    canvas.width = 64;
                    canvas.height = 64;
                    const context = canvas.getContext('2d');
                    context.arc(32, 32, 30, 0, 2 * Math.PI);
                    context.fillStyle = 'rgba(0,0,0,1)';
                    context.fill();
                    const texture = new THREE.CanvasTexture(canvas);
                    const spriteMaterial = new THREE.SpriteMaterial({
                        map: texture,
                        transparent: true,
                        depthTest: false,
                        depthWrite: false
                    });
                    const sprite = new THREE.Sprite(spriteMaterial);
                    sprite.scale.set(node.radius * 0.03, node.radius * 0.03, 1);
                    group.add(sprite);
                    return group;
                }}
                enableNodeDrag={false}
                enableNavigationControls={true}
                showNavInfo={true}
                onNodeClick={handleNodeClick}
                linkDirectionalParticles={1} 
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleColor={() => "#444"}
                linkDirectionalParticleWidth={2}
                linkColor={link => new THREE.Color(link.color).getStyle()}
    linkOpacity={link => {
        const rgbaMatch = link.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*(\d*\.?\d*)?\)/);
        return rgbaMatch && rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
    }}
            />
        </div>
    );
}

export default ForceGraphComponent;
