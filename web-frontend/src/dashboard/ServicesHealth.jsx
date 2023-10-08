import React, { useContext } from 'react';
import styled from 'styled-components';
import {ErrorsContext} from '../App';
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
const {ServicesErrorMessages} = useContext(ErrorsContext);

  return (
    <TerminalStyled>
      {ServicesErrorMessages? ServicesErrorMessages.map((error, index) => (
        <div key={index}>{error.message}</div>
      )): <></>}
    </TerminalStyled>
  );
}

export default ServicesHealth;
