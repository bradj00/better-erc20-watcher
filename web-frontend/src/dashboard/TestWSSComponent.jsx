import React, { useState, useEffect, useContext } from 'react';
import {GeneralContext} from '../App.js'


const WebSocketComponent = () => {
    const [ws, setWs] = useState(null);
    const [status, setStatus] = useState("Disconnected");
    const [responseData, setResponseData] = useState(null);
    const {dataCalls, setDataCalls} = useContext(GeneralContext);

    useEffect(() => {
        if (dataCalls){
            console.log('dataCalls: ',dataCalls)
        }
    },[dataCalls]);

    useEffect(() => {
        // Create WebSocket connection
        const socket = new WebSocket('wss://api-gateway:4050');

        socket.onopen = () => {
            setStatus("Connected");
        };

        socket.onerror = (error) => {
            console.error(`WebSocket Error: ${error}`);
        };

        socket.onmessage = (event) => {
            // Handle received data here
            const data = JSON.parse(event.data);

            // if (data.service === 'SomeService' && data.method === 'SomeMethod') {
            //     setResponseData(data.data);
            //     setDataCalls(data);
            // }
        };

        socket.onclose = (event) => {
            if (event.wasClean) {
                setStatus(`Closed cleanly, code=${event.code}, reason=${event.reason}`);
            } else {
                // Connection died
                setStatus('Connection died');
            }
        };

        // Set websocket to state
        setWs(socket);

        // Cleanup logic
        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);

    const requestData = () => {
        if (ws) {
            const requestPayload = {
                service: 'SomeService',
                method: 'SomeMethod',
                data: {} // Add any necessary data here
            };

            ws.send(JSON.stringify(requestPayload));
        }
    }

    return (
        <div style={{zIndex:'10001'}}>
            WebSocket Status: {status}
            <button onClick={requestData}>Request Mock Data</button>
            {responseData && <div>Received data: {responseData}</div>}
        </div>
    );
}

export default WebSocketComponent;
