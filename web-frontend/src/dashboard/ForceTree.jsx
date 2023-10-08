import React, { useState, useEffect, useRef } from 'react';
import { ForceGraph2D } from 'react-force-graph-2d';
import * as d3 from 'd3-force';
import { csvParse } from 'd3-dsv';
import dat from 'dat.gui';

const useForceUpdate = () => {
  const setToggle = useState(false)[1];
  return () => setToggle(b => !b);
};

const ForceTree = ({ dataUrl }) => {
  const fgRef = useRef();

  const [controls] = useState({ 'DAG Orientation': 'td' });
  const forceUpdate = useForceUpdate();
  const [data, setData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    // add controls GUI
    const gui = new dat.GUI();
    gui.add(controls, 'DAG Orientation', ['td', 'bu', 'lr', 'rl', 'radialout', 'radialin', null])
      .onChange(forceUpdate);
  }, []);

  useEffect(() => {
    // add collision force
    fgRef.current.d3Force('collision', d3.forceCollide(node => Math.sqrt(100 / (node.level + 1))));
  }, []);

  useEffect(() => {
    fetch(dataUrl)
      .then(r => r.text())
      .then(csvParse)
      .then(data => {
        const nodes = [], links = [];
        data.forEach(({ size, path }) => {
          const levels = path.split('/'),
            level = levels.length - 1,
            module = level > 0 ? levels[1] : null,
            leaf = levels.pop(),
            parent = levels.join('/');

          const node = {
            path,
            leaf,
            module,
            size: +size || 20,
            level
          };

          nodes.push(node);

          if (parent) {
            links.push({ source: parent, target: path, targetNode: node });
          }
        });

        setData({ nodes, links });
      });
  }, [dataUrl]);

  return (
    <ForceGraph2D
      ref={fgRef}
      graphData={data}
      dagMode={controls['DAG Orientation']}
      dagLevelDistance={300}
      backgroundColor="#101020"
      linkColor={() => 'rgba(255,255,255,0.2)'}
      nodeRelSize={1}
      nodeId="path"
      nodeVal={node => 100 / (node.level + 1)}
      nodeLabel="path"
      nodeAutoColorBy="module"
      linkDirectionalParticles={2}
      linkDirectionalParticleWidth={2}
      d3VelocityDecay={0.3}
    />
  );
};

export default ForceTree;
