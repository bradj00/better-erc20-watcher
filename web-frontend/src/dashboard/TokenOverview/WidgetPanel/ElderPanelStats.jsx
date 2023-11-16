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
    
    const calculateVolumeAndColor = () => {
        let volumesByGroup = Array(50).fill(null).map(() => ({ buyVolume: 0, sellVolume: 0 }));

        txData?.forEach(tx => {
            const actionType = txHashActionCache[tx.transaction_hash];
            if (actionType === 'BUY' || actionType === 'SELL') {
                if (!isCEXOrDEX(tx.from_address) && !isCEXOrDEX(tx.to_address)) {
                    const fromElderRank = getNormalizedElderRank(tx.from_address);
                    const toElderRank = getNormalizedElderRank(tx.to_address);
    
                    const valueInTokens = parseInt(tx.value, 10) / (10 ** tokenDecimals);
                    const valueInUSD = valueInTokens * tokenPriceUSD;

                    // Determine the group based on ElderRank (1-50)
                    const groupIndex = (elderRank) => Math.ceil(elderRank / 2) - 1;

                    if (fromElderRank) {
                        const group = groupIndex(fromElderRank);
                        actionType === 'BUY' ? volumesByGroup[group].buyVolume += valueInUSD : volumesByGroup[group].sellVolume += valueInUSD;
                    }
                    if (toElderRank) {
                        const group = groupIndex(toElderRank);
                        actionType === 'BUY' ? volumesByGroup[group].buyVolume += valueInUSD : volumesByGroup[group].sellVolume += valueInUSD;
                    }
                            }
                        }
        });
    
        const barData = volumesByGroup.flatMap(group => [group.buyVolume, group.sellVolume]);
        const backgroundColors = volumesByGroup.flatMap(() => ['#0f0', '#f00']); // Green for buy, Red for sell

        return { barData, backgroundColors };
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

    const { barData, backgroundColors } = calculateVolumeAndColor();

    const data = {
        labels: Array.from({ length: 100 }, (_, i) => i % 2 === 0 ? `Buy ${(i / 2) + 1}` : `Sell ${(i / 2) + 1}`),
        datasets: [{
            label: 'Elders Data',
            data: barData,
            backgroundColor: backgroundColors,
            borderColor: 'rgba(255, 255, 255, 1)',
            borderWidth: 1,
        }],
    };

    const options = {
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#333', // Set grid line color
                },
                ticks: {
                    // Custom formatter for Y-axis ticks
                    callback: function(value, index, values) {
                        // Format the value as a USD currency string
                        return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 2 });
                    },
                    color: 'white', // Set tick color to white
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
