import React, { useState, useEffect, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GeneralContext } from '../../../App.js';

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo('en-US');

const VolumeGraph = () => {
    const [data, setData] = useState([]);
    const { txData, txHashActionCache } = useContext(GeneralContext);
    const { clickedToken } = useContext(GeneralContext);

    const tokenDecimals = clickedToken?.data?.data?.detail_platforms?.ethereum?.decimal_place || 0;
    const tokenPriceUSD = clickedToken?.data?.data?.market_data?.current_price?.usd  || 0;
  



    useEffect(() => {
        if (txData && txHashActionCache){
            const graphData = processTransactions();
            setData(graphData);
        }
    }, [txData, txHashActionCache]);


    const formatToUSD = (value) => {
        return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    };
    
    const processTransactions = () => {
        // Sort transactions by block_timestamp
        const sortedTxData = [...txData].sort((a, b) => new Date(a.block_timestamp) - new Date(b.block_timestamp));

        if (sortedTxData.length === 0) {
            return [];
        }

        // Get the start and end times of the transactions
        const startTime = new Date(sortedTxData[0].block_timestamp);
        const endTime = new Date(sortedTxData[sortedTxData.length - 1].block_timestamp);
        const timeWindow = endTime - startTime;
        const segmentSize = timeWindow / 10;

        // Initialize stats object for each segment
        const segments = Array.from({ length: 10 }, () => ({
            uniqueBuyers: new Set(),
            buyerVolume: 0,
            uniqueSellers: new Set(),
            sellerVolume: 0,
        }));



        // Calculate stats for each transaction
        sortedTxData.forEach(tx => {
            const txDate = new Date(tx.block_timestamp);
            const segmentIndex = Math.min(Math.floor((txDate - startTime) / segmentSize), 9);
            const action = txHashActionCache[tx.transaction_hash];


            const valueInTokens = parseInt(tx.value, 10) / (10 ** tokenDecimals); // Convert raw value to token amount
            const valueInUSD = valueInTokens * tokenPriceUSD; // Convert token amount to USD

    
            if (action === 'BUY') {
                segments[segmentIndex].uniqueBuyers.add(tx.from_address); // Add buyer
                segments[segmentIndex].uniqueSellers.add(tx.to_address); // Add seller
                segments[segmentIndex].buyerVolume += valueInUSD;
            } else if (action === 'SELL') {
                segments[segmentIndex].uniqueSellers.add(tx.from_address); // Add seller
                segments[segmentIndex].uniqueBuyers.add(tx.to_address); // Add buyer
                segments[segmentIndex].sellerVolume += valueInUSD; // Add USD value instead of raw token value
            }
            // Add more conditions if there are other types of actions
        });

        // Convert segment stats to graph data with "Time Ago" timestamps
        const graphData = segments.map((segment, index) => {
            const segmentStart = new Date(startTime.getTime() + segmentSize * index);
            const segmentEnd = new Date(segmentStart.getTime() + segmentSize);

            const timestamp = `${timeAgo.format(segmentEnd)}`;

            return {
                timestamp,
                unique_buyers: segment.uniqueBuyers.size,
                buyer_volume: segment.buyerVolume,
                unique_sellers: segment.uniqueSellers.size,
                seller_volume: segment.sellerVolume,
            };
        });

        return graphData;
    };

    return (
        <>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="timestamp" stroke="#aaa" />
                <YAxis yAxisId="left" stroke="#fff" strokeDasharray="3 3"/>
                <YAxis yAxisId="right" orientation="right" stroke="#fff"  tickFormatter={formatToUSD} />
                <Tooltip contentStyle={{ backgroundColor: '#333', color: '#fff' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="unique_buyers" stroke="rgba(0,255,0,1)" strokeDasharray="5 5" />
                <Line yAxisId="left" type="monotone" dataKey="unique_sellers" stroke="rgba(255,0,0,1)" strokeDasharray="5 5"/>
                <Line yAxisId="right" type="monotone" dataKey="buyer_volume" stroke="rgba(100,255,100,1)" />
                <Line yAxisId="right" type="monotone" dataKey="seller_volume" stroke="rgba(255,0,0,1)" />
            </LineChart>
        </ResponsiveContainer>
        
        </>
    );
}

export default VolumeGraph;
