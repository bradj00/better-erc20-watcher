import React, { useContext, useEffect } from 'react';
import styled from 'styled-components';
import {GeneralContext} from '../App';
const TerminalStyled = styled.div`
background-color: #000;
color: #0F0;
padding: 20px;
border-radius: 5px;
overflow-y: auto;
position: absolute;
width: 90vw;
height: 80vh;
top: 10vh;
font-family: 'Courier New', monospace;
white-space: pre-wrap;
`;

const ServicesHealth = () => {
const {ServicesErrorMessages} = useContext(GeneralContext);
// [{message:'something here'},{message:'something here'},{message:'something here'},{message:'something here'},]

// useEffect(()=>{
//   if (ServicesErrorMessages){
//     console.log('ServicesErrorMessages:',ServicesErrorMessages)
//   }
//   },[ServicesErrorMessages])


return (
  
  <div style={{ overflowY:'scroll', backgroundColor:'#333', position:'absolute', width:'99.3%', height:'80vh',left:'0', top:'8vh', }}>
    {ServicesErrorMessages && ServicesErrorMessages.length > 0 ? (
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        boxShadow: '0 2px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <thead style={{position:'sticky', top:'0'}}>
          <tr style={{ backgroundColor: '#000', textAlign: 'left' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Time</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Service</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Method</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Data</th>
          </tr>
        </thead>
        <tbody style={{color:'#fff'}}>
          {ServicesErrorMessages.reverse().map((error, index) => (
            <tr key={index}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{error.timestamp}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{error.service}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{error.method}</td>
              {/* <td style={{ padding: '10px', border: '1px solid #ddd' }}>{error.data.txieContract}</td> */}
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{JSON.stringify(error.data)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>No error messages to display.</p>
    )}
  </div>
);
}

export default ServicesHealth;
