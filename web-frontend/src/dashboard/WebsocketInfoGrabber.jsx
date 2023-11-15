import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { GeneralContext, ErrorsContext } from '../App.js';
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
    const {txVisualData, settxVisualData} = useContext(GeneralContext);
    const {CacheFriendlyLabelsRequest, setCacheFriendlyLabelsRequest} = useContext(GeneralContext);
    const {setCacheFriendlyLabels} = useContext(GeneralContext);
    const {viewingTokenAddress} = useContext(GeneralContext);
    const {updateCommitFriendlyNameRequest} = useContext(GeneralContext);
    const {tokenLookupRequestAddy} = useContext(GeneralContext);
    const { validatedTokenToAddToWatchlist } = useContext(GeneralContext);
    const { submitvalidatedTokenToAddToWatchlist, setsubmitvalidatedTokenToAddToWatchlist } = useContext(GeneralContext);
    const { cachedErc20TokenMetadata, setcachedErc20TokenMetadata } = useContext(GeneralContext);
    const {SummarizedTxsRequest, setSummarizedTxsRequest} = useContext(GeneralContext);
    const {TxHashDetailsObj, setTxHashDetailsObj} = useContext(GeneralContext);
    
    const { uniqueContractAddresses, setUniqueContractAddresses } = useContext(GeneralContext);
    const { areAllMultiTxCellsLoaded, setareAllMultiTxCellsLoaded } = useContext(GeneralContext);


    
    const {addressTags, setAddressTags} = useContext(GeneralContext); 
    const {elderCount, setElderCount} = useContext(GeneralContext); 
    
    const {ServicesErrorMessages, setServicesErrorMessages} = useContext(GeneralContext);
    // [{message:'something here'},{message:'something here'},{message:'something here'},{message:'something here'},]
    



    const previousSubscription = useRef(null); // To keep track of the previous subscription

    const hasOpenedCertPage = useRef(false);
    const hasConnectedSuccessfully = useRef(false);
    


    const [dataSetterObj] = useState({
        setWatchedTokenList,
        setFriendlyLookupResponse,
        settxData, settxVisualData,
        setCacheFriendlyLabelsRequest,
        setCacheFriendlyLabels,
        setAddressTags,
        setServicesErrorMessages,
        setcachedErc20TokenMetadata,
        setTxHashDetailsObj,
        setcachedErc20TokenMetadata,
        setElderCount, 
    });

    
    useEffect(() => {
        console.log('addressTags: ',addressTags)

    },[addressTags]);

    useEffect(() => {
        // Ensure that there are entries in the areAllMultiTxCellsLoaded object
        const hasEntries = Object.keys(areAllMultiTxCellsLoaded).length > 0;
      
        const allLoaded = hasEntries && Object.values(areAllMultiTxCellsLoaded).every(status => status);
        if (allLoaded) {
            console.log('WE HAVE FINISHED AGGREGATING ALL THE CONTRACT ADDRESSES FROM THE TX HASH LOGS');
            
            // Filter out addresses already present in cachedErc20TokenMetadata
            const addressesToFetch = uniqueContractAddresses.filter(address => !cachedErc20TokenMetadata[address]);
    
            // Check if there are any new addresses to fetch
            if (addressesToFetch.length > 0) {
                requestErc20BulkCacheInfo(addressesToFetch);
            }
        }
    }, [areAllMultiTxCellsLoaded, uniqueContractAddresses, cachedErc20TokenMetadata]);
      



    useEffect(() => {
        if (validatedTokenToAddToWatchlist){
            //send token watch request to api-gw
        }
    },[validatedTokenToAddToWatchlist]);

    useEffect(() => {
        if (SummarizedTxsRequest){
            //send TX ARRAY SUMMARY request to api-gw
            console.log('OK SENDING')
            requestTxArraySummary(SummarizedTxsRequest)
        }
    },[SummarizedTxsRequest]);

    useEffect(() => {
        if (tokenLookupRequestAddy  ){
            console.log('tokenLookupRequestAddy: ',tokenLookupRequestAddy)
            requestTokenLookup(tokenLookupRequestAddy)           
        }
    },[tokenLookupRequestAddy]);


    useEffect(() => {
        if (updateCommitFriendlyNameRequest){
            // console.log('~~~~ updateCommitFriendlyNameRequest: ', updateCommitFriendlyNameRequest);
            updateAFriendlyName(updateCommitFriendlyNameRequest.address, updateCommitFriendlyNameRequest.friendlyName)
        }
    },[updateCommitFriendlyNameRequest]);

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
        if ( cachedErc20TokenMetadata ) {
            console.log('cachedErc20TokenMetadata: ',cachedErc20TokenMetadata)
        }
    }, [cachedErc20TokenMetadata]);


    useEffect(() => {
        if ( submitvalidatedTokenToAddToWatchlist ) {
            requestWatchNewToken(validatedTokenToAddToWatchlist)
            setsubmitvalidatedTokenToAddToWatchlist(false);
        }
    }, [submitvalidatedTokenToAddToWatchlist]);


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

    const isTagCached = useCallback((address) => {
        return addressTags.hasOwnProperty(address);
    }, [addressTags]);
    
    const getUniqueAddresses = useCallback((transactions) => {
        const addresses = new Set();
    
        transactions.forEach(tx => {
            if (!isTagCached(tx.from_address)) {
                addresses.add(tx.from_address);
            }
            if (!isTagCached(tx.to_address)) {
                addresses.add(tx.to_address);
            }
        });
    
        return Array.from(addresses);
    }, [isTagCached]);
    
    useEffect(() => {
        if (txDataRef.current) {
            // console.log("Previous txData:", txDataRef.current);
            // console.log("Current txData:", txData);
        }
        txDataRef.current = txData;
        
        if (txData?.length>0){
            const newAddressesToLookup = getUniqueAddresses(txData);
        
            if (newAddressesToLookup.length > 0) {
                requestGetBulkTagsRequest(newAddressesToLookup);
            }
        }
    
    }, [txData]);
    
    
    const connectWebSocket = () => {
        const hostIP = window.location.hostname;

        // ws.current = new WebSocket('wss://api-gateway:4050');
        ws.current = new WebSocket('wss://'+hostIP+':4050');
    
        ws.current.onopen = () => {
            setStatus("Connected");
            hasConnectedSuccessfully.current = true;

            // Subscribe to the test topic after connection is established
            ws.current.send(JSON.stringify({type:'subscribe', topic: 'errors'}));
            ws.current.send(JSON.stringify({type:'subscribe', topic: 'tokenLookupRequest'}));
            ws.current.send(JSON.stringify({type:'subscribe', topic: 'TxHashDetailsLookupFinished'}));

    
            if (ws.current.readyState === WebSocket.OPEN && !hasConnectedBefore.current) {
                requestWatchedTokensList();
                hasConnectedBefore.current = true;
            }
        };
    
        ws.current.onerror = (error) => {
        console.error(`WebSocket Error: ${error}`);

        // Open the cert page only if it has never been opened and there has never been a successful connection
        if (!hasOpenedCertPage.current && !hasConnectedSuccessfully.current) {
            hasOpenedCertPage.current = true;
            window.open(`https://${hostIP}:4050`, '_blank');
        }
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
                    else if (handlerName === 'handleLookupTokenRequest'){
                        // socketHandlers[handlerName](data, dataSetterObj, cachedErc20TokenMetadata, setcachedErc20TokenMetadata());
                        console.log('~~~~~',data.data)
                        if (data.data.status == 'success'){
                            const contractAddress = data.data.data.contractAddress.toLowerCase();
                            const updatedMetadata = {
                                ...cachedErc20TokenMetadata, 
                                [contractAddress]: data.data.data  // add/update the token data using the contract address as the key
                            };
                            setcachedErc20TokenMetadata(updatedMetadata);
                        }
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
    
    const requestErc20BulkCacheInfo = (bulkErc20Contracts) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const requestPayload = {
                service: 'general',
                method: 'RequestErc20BulkCacheInfo',
                data: bulkErc20Contracts
            };
            ws.current.send(JSON.stringify(requestPayload));
        }
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


    // tell the API GW we want to start caching tx's for a new token
    const requestTxArraySummary = (TxHashes) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            console.log('AYYYY TX HASHES: ',TxHashes)

            const requestPayload = {
                service: 'general',
                method: 'TxArraySummary',
                data: {
                    action: 'request',
                    txHashes: TxHashes
                }
                
            };
            ws.current.send(JSON.stringify(requestPayload));
        }
    }

    const requestGetBulkTagsRequest = (addressArray,) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const collection = 'a_'+viewingTokenAddress

            console.log(`[ ${viewingTokenAddress} ] asking for address TAGS (x${addressArray.length})`)
            const requestPayload = {
                service: 'general',
                method: 'GetBulkTagsRequest',
                data: {
                    action: 'request',
                    addresses: addressArray,
                    collection: collection
                }
                
            };
            ws.current.send(JSON.stringify(requestPayload));
        }
    }

    // tell the API GW we want to start caching tx's for a new token
    const requestWatchNewToken = (address) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const requestPayload = {
                service: 'general',
                method: 'WatchNewToken',
                data: {
                    action: 'add',
                    address: address
                }
                
            };
            ws.current.send(JSON.stringify(requestPayload));
        }
    }

    // lookup function when we enter a token address to possibly start watching. api gw tells external lookup service.
    const requestTokenLookup = (contractAddress) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const requestPayload = {
                service: 'general',
                method: 'LookupTokenRequest',
                data: {
                    token: contractAddress
                }
            };
            ws.current.send(JSON.stringify(requestPayload));
        }
    }

    
    

    const updateAFriendlyName = (address, friendlyName) => {
        console.log('updating address '+address+' with manually defined label: ', friendlyName)
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const requestPayload = {
                service: 'general',
                method: 'SetManualLabel',
                data: {address, friendlyName}
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
