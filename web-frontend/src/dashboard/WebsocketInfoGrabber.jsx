import React, { useState, useEffect, useContext } from 'react';
import { GeneralContext } from '../App.js';

const WebsocketInfoGrabber = () => {
    const [ws, setWs] = useState(null);
    const [status, setStatus] = useState("Disconnected");
    const [responseData, setResponseData] = useState(null);
    const {dataCalls, setDataCalls} = useContext(GeneralContext);

    useEffect(() => {
        if (dataCalls) {
            console.log('dataCalls: ', dataCalls);
        }
    }, [dataCalls]);

    const connectWebSocket = () => {
        const socket = new WebSocket('wss://10.0.3.240:4050');

        socket.onopen = () => {
            setStatus("Connected");
        };

        socket.onerror = (error) => {
            console.error(`WebSocket Error: ${error}`);
        };

        socket.onmessage = (event) => {
            // Handle received data here
            const data = JSON.parse(event.data);

            if (data.service === 'SomeService' && data.method === 'SomeMethod') {
                setResponseData(data.data);
                setDataCalls(data);
            }
        };

        socket.onclose = (event) => {
            if (event.wasClean) {
                setStatus(`Closed cleanly, code=${event.code}, reason=${event.reason}`);
            } else {
                // Connection died
                setStatus('Connection died');

                // Try to reconnect after 2 seconds
                setTimeout(connectWebSocket, 2000);
            }
        };

        // Set websocket to state
        setWs(socket);
    }

    useEffect(() => {
        connectWebSocket();

        // Cleanup logic
        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, []);

    const requestData = () => {
        if (ws) {
            const requestPayload = {
                service: 'watched-tokens',
                method: 'GetWatchedTokens',
                data: {} // Add any necessary data here
            };

            ws.send(JSON.stringify(requestPayload));
        }
    }

    return (
        <div style={{ zIndex: '10001' }}>
            WebSocket Status: {status}
            <button onClick={requestData}>Request Mock Data</button>
            {responseData && <div>Received data: {responseData}</div>}
        </div>
    );
}

export default WebsocketInfoGrabber;
