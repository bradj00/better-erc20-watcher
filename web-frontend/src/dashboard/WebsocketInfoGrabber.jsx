import React, { useEffect, useState, useRef, useContext } from 'react';
import { GeneralContext } from '../App.js';
import * as socketHandlers from './service-library/socketHandlers';

const WebsocketInfoGrabber = () => {
    const ws = useRef(null);
    const [status, setStatus] = useState("Disconnected");
    const hasConnectedBefore = useRef(false);

    const { watchedTokenList, setWatchedTokenList } = useContext(GeneralContext);

    const [dataSetterObj] = useState({
        setWatchedTokenList,
    });

    useEffect(() => {
        if (watchedTokenList) {
            console.log('watchedTokenList: ', watchedTokenList);
        }
    }, [watchedTokenList]);

    const connectWebSocket = () => {
        ws.current = new WebSocket('wss://10.0.3.240:4050');

        ws.current.onopen = () => {
            setStatus("Connected");

            if (ws.current.readyState === WebSocket.OPEN && !hasConnectedBefore.current) {
                requestWatchedTokensList();
                hasConnectedBefore.current = true;
            }
        };

        ws.current.onerror = (error) => {
            console.error(`WebSocket Error: ${error}`);
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('socket returned data: ', data);
            if (data.service) {
                const handlerName = `handle${data.method}`;
                if (socketHandlers[handlerName]) {
                    socketHandlers[handlerName](data, dataSetterObj);
                } else {
                    console.warn(`Handler not found for service: ${data.service}, method: ${data.method}`);
                }
            }
        };

        ws.current.onclose = (event) => {
            if (event.wasClean) {
                setStatus(`Closed cleanly, code=${event.code}, reason=${event.reason}`);
            } else {
                setStatus('Connection died');
                setTimeout(connectWebSocket, 2000);
            }
        };
    }

    const requestWatchedTokensList = () => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const requestPayload = {
                service: 'watched-tokens',
                method: 'GetWatchedTokens',
                data: {}
            };
            ws.current.send(JSON.stringify(requestPayload));
        }
    }

    useEffect(() => {
        connectWebSocket();
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    return (
        <></>
    );
}

export default WebsocketInfoGrabber;
