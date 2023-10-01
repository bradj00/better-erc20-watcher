import React, { useEffect, useState, useRef, useContext } from 'react';
import { GeneralContext } from '../App.js';
import * as socketHandlers from './service-library/socketHandlers';

const WebsocketInfoGrabber = () => {
    const txDataRef = useRef();

    const ws = useRef(null);
    const [status, setStatus] = useState("Disconnected");
    const hasConnectedBefore = useRef(false);

    const { watchedTokenList, setWatchedTokenList } = useContext(GeneralContext);
    const {searchInputLookup} = useContext(GeneralContext);
    const {RequestFriendlyLookup} = useContext(GeneralContext);
    const {RequestTransactionList} = useContext(GeneralContext);
    const {setFriendlyLookupResponse} = useContext(GeneralContext);
    const {txData, settxData} = useContext(GeneralContext);
    const {CacheFriendlyLabelsRequest, setCacheFriendlyLabelsRequest} = useContext(GeneralContext);
    const {setCacheFriendlyLabels} = useContext(GeneralContext);
    const {viewingTokenAddress} = useContext(GeneralContext);

    const previousSubscription = useRef(null); // To keep track of the previous subscription

    const [dataSetterObj] = useState({
        setWatchedTokenList,
        setFriendlyLookupResponse,
        settxData,
        setCacheFriendlyLabelsRequest,
        setCacheFriendlyLabels,
        
    });

    useEffect(() => {
        if (viewingTokenAddress) {
            // De-subscribe from the previous topic
            if (previousSubscription.current && ws.current && ws.current.readyState === WebSocket.OPEN) {
                const deSubscriptionMessage = {
                    type: 'unsubscribe',
                    topic: previousSubscription.current
                };
                ws.current.send(JSON.stringify(deSubscriptionMessage));
            }

            // Subscribe to the new topic
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                const subscriptionMessage = {
                    type: 'subscribe',
                    topic: viewingTokenAddress
                };
                ws.current.send(JSON.stringify(subscriptionMessage));
            }

            // Update the previousSubscription ref
            previousSubscription.current = viewingTokenAddress;
        }
    }, [viewingTokenAddress]);

  
    useEffect(() => {
        if (CacheFriendlyLabelsRequest) {
            console.log('CacheFriendlyLabelsRequest: ', CacheFriendlyLabelsRequest);
            requestCacheFriendlyLabels(CacheFriendlyLabelsRequest)
        }
    }, [CacheFriendlyLabelsRequest]);
    
    useEffect(() => {
        if (RequestTransactionList) {
            console.log('RequestTransactionList: ', RequestTransactionList);
            requestGetTransactions(RequestTransactionList)
        }
    }, [RequestTransactionList]);


    useEffect(() => {
        if (searchInputLookup) {
            console.log('searchInputLookup: ', searchInputLookup);
            requestFnLookup(searchInputLookup)
        }
    }, [searchInputLookup]);

    useEffect(() => {
        if (RequestFriendlyLookup) {
            console.log('RequestFriendlyLookup: ', RequestFriendlyLookup);
            requestFnLookup(RequestFriendlyLookup)
        }
    }, [RequestFriendlyLookup]);

    useEffect(() => {
        if (watchedTokenList) {
            console.log('watchedTokenList: ', watchedTokenList);
        }
    }, [watchedTokenList]);

    // useEffect(() => {
    //     txDataRef.current = txData;
    // }, [txData]);

    useEffect(() => {
        if (txDataRef.current) {
            console.log("Previous txData:", txDataRef.current);
            console.log("Current txData:", txData);
        }
        txDataRef.current = txData;
    }, [txData]);
    
    const connectWebSocket = () => {
        ws.current = new WebSocket('wss://10.0.3.240:4050');
    
        ws.current.onopen = () => {
            setStatus("Connected");
    
            // Subscribe to the test topic after connection is established
            // const subscriptionMessage = {
            //     type: 'subscribe',
            //     topic: 'testTopic'
            // };
            // ws.current.send(JSON.stringify(subscriptionMessage));
    
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
                    if (handlerName === 'handleAppendTransactions') {
                        socketHandlers[handlerName](data, dataSetterObj, txDataRef.current);
                    }
                     else {
                        socketHandlers[handlerName](data, dataSetterObj);
                    }
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
    

    const requestFnLookup = (friendlyName) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const requestPayload = {
                service: 'general',
                method: 'GetFriendlyName',
                data: {friendlyName}
            };
            ws.current.send(JSON.stringify(requestPayload));
        }
    }

    const requestCacheFriendlyLabels = (addresses) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const requestPayload = {
                service: 'watched-tokens',
                method: 'CacheFriendlyLabelsRequest',
                data: addresses
            };
            ws.current.send(JSON.stringify(requestPayload));
        }
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
    const requestGetTransactions = (parameters) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const requestPayload = {
                service: 'watched-tokens',
                method: 'GetTransactions',
                data: parameters
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
