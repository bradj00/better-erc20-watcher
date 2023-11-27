// THIS IS PROBABLY SOMETHING WE'LL WANT TO PRE-PROCESS ON THE SERVER SIDE AND SERVE UP

import React, { useContext, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { GeneralContext } from '../../../App.js';
import {getEllipsisTxt} from '../../helpers/h.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EldersPanelStats = () => {
    const { txData, txHashActionCache, addressTags, elderCount, clickedToken } = useContext(GeneralContext);

    const tokenDecimals = clickedToken?.data?.data?.detail_platforms?.ethereum?.decimal_place || 0;
    const tokenPriceUSD = clickedToken?.data?.data?.market_data?.current_price?.usd     || 0;
    
    
    const calculateVolume = () => {
        let volumeByElderRank = Array(100).fill(0);
        let addressDetailsByElderRank = Array(100).fill().map(() => []);
    
        txData?.forEach(tx => {
            const actionType = txHashActionCache[tx.transaction_hash];

            if (actionType === 'BUY' || actionType === 'SELL') {
                const fromElderRank = getNormalizedElderRank(tx.from_address);
                const toElderRank = getNormalizedElderRank(tx.to_address);
                const valueInTokens = parseInt(tx.value, 10) / (10 ** tokenDecimals);
                const valueInUSD = valueInTokens * tokenPriceUSD;
    
                if (fromElderRank) {
                    volumeByElderRank[fromElderRank - 1] += valueInUSD;
                    addressDetailsByElderRank[fromElderRank - 1].push({ address: tx.from_address, volume: valueInUSD });
                }
                if (toElderRank) {
                    volumeByElderRank[toElderRank - 1] += valueInUSD;
                    addressDetailsByElderRank[toElderRank - 1].push({ address: tx.to_address, volume: valueInUSD });
                }
            }
        });
    
        return { volumes: volumeByElderRank.map(volume => volume), addressDetails: addressDetailsByElderRank };
    }; 
    


    const [tooltipInfo, setTooltipInfo] = useState({ visible: false, content: null, position: { x: 0, y: 0 } });

    const handleHover = (event, activeElements) => {
        if (activeElements && activeElements.length > 0) {
            const { index } = activeElements[0];
            const details = addressDetails[index];
            const position = { x: event.clientX, y: event.clientY };
    
            const content = details.map((detail, i) => (
                <tr key={i}>
                    <td style={tableDataStyle}>{getEllipsisTxt(detail.address, 6)}</td>
                    <td style={tableDataStyle}>{detail.volume.toFixed(2)} USD</td>
                    <td style={tableDataStyle}>{addressTags[detail.address]?.ElderRank || 'N/A'}</td>
                </tr>
            ));
    
            setTooltipInfo({ visible: true, content, position });
        } else {
            setTooltipInfo({ ...tooltipInfo, visible: false });
        }
    };



    const getNormalizedElderRank = (address) => {
        if (isUniswapPool(address)) {
            return null; // Exclude Uniswap V2 or V3 pool addresses
        }
    
        const elderRank = addressTags[address]?.ElderRank;
        if (elderRank && !isNaN(elderRank)) {
            return Math.floor((elderRank / elderCount) * 100) || 0;
        }
        return null;
    };

    const isUniswapPool = (address) => {
        const tags = addressTags[address];
        return tags?.isUniswapV2Pool || tags?.isUniswapV3Pool;
    };

    const { volumes, addressDetails } = calculateVolume();

    const data = {
        labels: Array.from({ length: 100 }, (_, i) => `${i + 1}`),
        datasets: [{
            label: 'Elders Data',
            data: volumes,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(255, 255, 255, 1)',
            borderWidth: 1,
        }],
    };


    const CustomTooltip = ({ visible, position, content }) => {
        if (!visible) {
            return null;
        }
    
        const tooltipStyle = {
            position: 'absolute',
            top: '9%',
            left: 0,
            width: '100%',
            height: '15vh',
            backgroundColor: 'rgba(10, 10, 30, 0.9)',
            color: 'cyan',
            overflow: 'auto', // In case content overflows
            border: '1px solid cyan',
            borderRadius: '5px',
            padding: '10px',
        };
    
        return (
            <div style={tooltipStyle}>
                <table style={{ fontSize:'0.6vw', width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Address</th>
                            <th style={tableHeaderStyle}>Volume</th>
                            <th style={tableHeaderStyle}>Elder Rank</th>
                        </tr>
                    </thead>
                    <tbody>
                        {content}
                    </tbody>
                </table>
            </div>
        );
    };
    
    const tableHeaderStyle = {
        borderBottom: '1px solid cyan',
        padding: '5px',
        textAlign: 'left',
        color: 'cyan'
    };
    
    const tableDataStyle = {
        borderBottom: '1px solid cyan',
        padding: '5px',
        textAlign: 'left',
        color: 'white'
    };

    const options = {
        onHover: handleHover,
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
            tooltip: {
                enabled: false, // Disable the default tooltip
            },
            
            // tooltip: {
            //     enabled: true,
            //     mode: 'index',
            //     intersect: false,
            //     callbacks: {
            //         label: (tooltipItem) => {
            //             const elderRank = tooltipItem.label;
            //             const details = addressDetails[elderRank - 1];
            //             let tooltipText = `Volume: ${tooltipItem.formattedValue} USD`;
            //             tooltipText += 'Addresses:\n';
    
            //             // Create a table-like structure
            //             details?.forEach(detail => {
            //                 tooltipText += `${detail.address}: ${detail.volume.toFixed(2)} USD\n`;
            //             });
    
            //             return tooltipText;
            //         },
            //     },
            //     // You can add more styling options here
            //     backgroundColor: 'rgba(0, 0, 0, 0.7)', // Custom background color
            //     titleFont: { size: 16 }, // Custom font size for the title
            //     bodyFont: { size: 14 }, // Custom font size for the body
            // },
        },
        maintainAspectRatio: false,
        responsive: true,
    };
    
    return (
        <div style={{ padding: '20px', borderRadius: '8px', width: '100%', height: '100%' }}>
            <Bar data={data} options={options} height={400} />
            <CustomTooltip visible={tooltipInfo.visible} position={tooltipInfo.position} content={tooltipInfo.content} />
        </div>
    );
};

export default EldersPanelStats;
