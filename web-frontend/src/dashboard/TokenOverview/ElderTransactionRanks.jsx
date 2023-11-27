import React, { useContext, useEffect, useState } from 'react';
import { GeneralContext } from '../../App.js';
import { getEllipsisTxt, commaNumber } from '../helpers/h.js';

const ElderTransactionRanks = () => {
    const { addressStats, addressTags, txData, clickedToken } = useContext(GeneralContext);
    const [processedData, setProcessedData] = useState([]);
    const {CacheFriendlyLabels} = useContext(GeneralContext);

    const isUniswapPool = (address) => {
        const tags = addressTags[address];
        return tags?.isUniswapV2Pool || tags?.isUniswapV3Pool;
    };

    const convertTokensToUSD = (tokenAmount, tokenDecimals, tokenPriceUSD) => {
        const valueBigInt = BigInt(tokenAmount);
        return Number(valueBigInt / BigInt(10 ** tokenDecimals)) * tokenPriceUSD;
    };

    useEffect(() => {
        const tokenDecimals = clickedToken?.data?.data?.detail_platforms?.ethereum?.decimal_place || 0;
        const tokenPriceUSD = clickedToken?.data?.data?.market_data?.current_price?.usd || 0;

        const transactionSums = {};
        txData?.forEach(tx => {
            if (isUniswapPool(tx.from_address) || isUniswapPool(tx.to_address)) {
                // Skip if either address is a Uniswap pool
                return;
            }

            transactionSums[tx.from_address] = transactionSums[tx.from_address] || { incoming: 0, outgoing: 0 };
            transactionSums[tx.to_address] = transactionSums[tx.to_address] || { incoming: 0, outgoing: 0 };

            const valueInUSD = parseInt(tx.value, 10) / (10 ** tokenDecimals) * tokenPriceUSD;
            transactionSums[tx.from_address].outgoing += valueInUSD;
            transactionSums[tx.to_address].incoming += valueInUSD;
        });

        const combinedData = Object.entries(transactionSums)
        .map(([address, stats]) => {
            const currentTokens = addressTags[address]?.currentTokens || "0";
            const bagValueUSD = convertTokensToUSD(currentTokens, tokenDecimals, tokenPriceUSD);

            return {
                address,
                elderRank: addressTags[address]?.ElderRank || 0,
                incoming: stats.incoming.toFixed(0),
                outgoing: stats.outgoing.toFixed(0),
                bag: bagValueUSD.toFixed(0)
            };
        }).filter(item => item.elderRank !== 0);

        combinedData.sort((a, b) => a.bag - b.bag).reverse();
        setProcessedData(combinedData);
    }, [txData, addressStats, addressTags, clickedToken]);



    const tableHeaderStyle = {
        color: 'yellow', // Neon bright font color for headers
        borderBottom: '1px solid cyan', // Neon bright border color
        padding: '5px',
        textAlign: 'right',
        fontSize: '0.65vw',

    };

    return (
        <div style={{
            overflowY: 'scroll', 
            paddingTop: '1vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'start', 
            position: 'absolute', 
            left: '0.95vw', 
            top: '38vh', 
            height: '60vh', 
            width: '16vw', 
            borderRadius: '0.25vw', 
            border: '1px solid rgba(200, 200, 255, 0.3)'
        }}>
            <table style={{ 
                color: 'rgba(230,230,255,1)', // Neon bright font color
                backgroundColor: '#111', // Dark background
                width: '95%', 
                textAlign: 'center', 
                borderCollapse: 'collapse' // Ensure borders collapse into a single border
            }}>
                <thead style={{position:'sticky', top:'0', backgroundColor:'rgba(5,5,10,1)', }}>
                    <tr>
                        <th style={tableHeaderStyle}>Address</th>
                        <th style={tableHeaderStyle}>In $</th>
                        <th style={tableHeaderStyle}>Out $</th>
                        <th style={tableHeaderStyle}>Age</th>
                        <th style={tableHeaderStyle}>Bag $</th>
                    </tr>
                </thead>
                <tbody style={{fontSize:'0.55vw'}}>
                    {processedData.map((item, index) => {
                        const displayText = CacheFriendlyLabels[item.address]?.manuallyDefined
                                            ? CacheFriendlyLabels[item.address].manuallyDefined
                                            : getEllipsisTxt(item.address, 4);
                        const truncatedText = displayText.length > 10 ? `${displayText.substring(0, 10)}..` : displayText;

                        return (
                            <tr key={index}>
                                <td align='right' title={displayText}>  <a target="__blank" href={`https://etherscan.io/address/${item.address}`}>{truncatedText}</a> </td>
                                <td align='right'>{commaNumber(item.incoming)}</td>
                                <td align='right'>{commaNumber(item.outgoing)}</td>
                                <td>{item.elderRank}</td>
                                <td align='right'>{item.bag}</td>
                            </tr>
                        );
                    })}
                </tbody>

            </table>
        </div>
    );
};

export default ElderTransactionRanks;
