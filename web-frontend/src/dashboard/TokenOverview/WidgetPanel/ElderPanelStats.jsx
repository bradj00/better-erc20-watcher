// THIS IS PROBABLY SOMETHING WE'LL WANT TO PRE-PROCESS ON THE SERVER SIDE AND SERVE UP

import React, { useContext } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { GeneralContext } from '../../../App.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EldersPanelStats = () => {
    const { txData, txHashActionCache, addressTags, elderCount, clickedToken } = useContext(GeneralContext);

    const tokenDecimals = clickedToken?.data?.data?.detail_platforms?.ethereum?.decimal_place || 0;
    const tokenPriceUSD = clickedToken?.data?.data?.market_data?.current_price?.usd     || 0;
    const calculateVolume = () => {
        let volumeByElderRank = Array(100).fill(0);

        txData?.forEach(tx => {
            const actionType = txHashActionCache[tx.transaction_hash];
            if (actionType === 'BUY' || actionType === 'SELL') {
                // Check for CEX or DEX tags
                if (!isCEXOrDEX(tx.from_address) && !isCEXOrDEX(tx.to_address)) {
                    const fromElderRank = getNormalizedElderRank(tx.from_address);
                    const toElderRank = getNormalizedElderRank(tx.to_address);
                    const value = parseInt(tx.value, 10);

                    const valueInTokens = parseInt(tx.value, 10) / (10 ** tokenDecimals);
                    const valueInUSD = valueInTokens * tokenPriceUSD;

                    if (fromElderRank) volumeByElderRank[fromElderRank - 1] += valueInUSD;
                    if (toElderRank) volumeByElderRank[toElderRank - 1] += valueInUSD;
                }
            }
        });

        return volumeByElderRank.map(volume => volume); // Adjust for token's decimals
    };

    const isCEXOrDEX = (address) => {
        const tags = addressTags[address];
        return tags?.isCEXAddress || tags?.isDEXPool;
    };

    const getNormalizedElderRank = (address) => {
        const elderRank = addressTags[address]?.ElderRank;
        if (elderRank && !isNaN(elderRank)) {
            return Math.floor((elderRank / elderCount) * 100) || 1;
        }
        return null;
    };

    const data = {
        labels: Array.from({ length: 100 }, (_, i) => `${i + 1}`),
        datasets: [{
            label: 'Elders Data',
            data: calculateVolume(),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(255, 255, 255, 1)',
            borderWidth: 1,
        }],
    };

    const options = {
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#888', // Set grid line color to white for y-axis
                },
            },
            x: {
                ticks: {
                    color: 'white', // Change tick color to white
                    autoSkip: false, // Show all ticks
                    maxRotation: 0,
                    minRotation: 0,
                    display: false,
                },
                grid: {
                    color: 'white', // Set grid line color to white for x-axis
                    display: false, // Optionally, keep this if you want to hide x-axis grid lines
                }
            }
        },
        plugins: {
            legend: {
                display: false // Hides the legend
            },
            title: {
                display: true,
                text: 'Volume by Elder Address',
                color: 'white',
            },
            // Register the arrow plugin
            arrowPlugin: {
                display: true,
            },
        },
        maintainAspectRatio: false,
        responsive: true,
    };
    
    return (
        <div style={{ padding: '20px', borderRadius: '8px', width: '100%', height: '100%' }}>
            <Bar data={data} options={options} height={400} />
        </div>
    );
};

export default EldersPanelStats;
