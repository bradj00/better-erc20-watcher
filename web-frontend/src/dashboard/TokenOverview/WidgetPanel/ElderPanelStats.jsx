// THIS IS PROBABLY SOMETHING WE'LL WANT TO PRE-PROCESS ON THE SERVER SIDE AND SERVE UP

import React, { useContext, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { GeneralContext } from '../../../App.js';
import {getEllipsisTxt} from '../../helpers/h.js';
import {formatNumber} from '../../helpers/h.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EldersPanelStats = () => {
    const { txData, txHashActionCache, addressTags, elderCount, clickedToken, CacheFriendlyLabels, TxHashDetailsObj } = useContext(GeneralContext);

    const tokenDecimals = clickedToken?.data?.data?.detail_platforms?.ethereum?.decimal_place || 0;
    const tokenPriceUSD = clickedToken?.data?.data?.market_data?.current_price?.usd     || 0;
    
    const [tooltipInfo, setTooltipInfo] = useState({ visible: false, content: null, position: { x: 0, y: 0 } });
    
    const calculateVolume = () => {
        let incomingVolumeByElderRank = Array(200).fill(0);
        let outgoingVolumeByElderRank = Array(200).fill(0);
        let liquidityVolumeByElderRank = Array(200).fill(0);
        let cexVolumeByElderRank = Array(200).fill(0); // New array for CEX moves
        let addressDetailsByElderRank = Array(200).fill().map(() => []);
    
        const tokenDecimals = clickedToken?.data?.data?.detail_platforms?.ethereum?.decimal_place || 0;
        const decimalFactor = Math.pow(10, tokenDecimals);
    
        if (TxHashDetailsObj && txData) {
            txData.forEach(tx => {
                const txHash = tx.transaction_hash;
                const isLiquidityMove = TxHashDetailsObj[txHash]?.isUniswapPositionManagement;
                const tokenTransferSummary = TxHashDetailsObj[txHash]?.tokenTransferSummary?.[clickedToken.data.contractAddress];
    
                if (tokenTransferSummary) {
                    Object.keys(tokenTransferSummary).forEach(address => {
                        let incoming = tokenTransferSummary[address]?.incoming;
                        let outgoing = tokenTransferSummary[address]?.outgoing;
    
                        // Convert to float if defined, else default to 0
                        incoming = incoming !== undefined ? Number(incoming) / decimalFactor : 0;
                        outgoing = outgoing !== undefined ? Number(outgoing) / decimalFactor : 0;
    
                        const elderRank = getNormalizedElderRank(address);
    
                        if (elderRank) {
                            if (addressTags[address]?.isCEX) {
                                // Add to CEX volume
                                cexVolumeByElderRank[elderRank - 1] += incoming + outgoing;
                            } else if (isLiquidityMove) {
                                // Add to liquidity volume if it's a liquidity move
                                liquidityVolumeByElderRank[elderRank - 1] += incoming + outgoing;
                            } else {
                                // Add to regular volume otherwise
                                incomingVolumeByElderRank[elderRank - 1] += incoming;
                                outgoingVolumeByElderRank[elderRank - 1] += outgoing;
                            }
                            addressDetailsByElderRank[elderRank - 1].push({ address, incoming, outgoing });
                        }
                    });
                }
            });
        }
    
        return {
            incomingVolumes: incomingVolumeByElderRank,
            outgoingVolumes: outgoingVolumeByElderRank,
            liquidityVolumes: liquidityVolumeByElderRank,
            cexVolumes: cexVolumeByElderRank, // Include the new CEX data
            addressDetails: addressDetailsByElderRank
        };
    };
    
    
    
    
    

    const handleHover = (event, activeElements) => {
        if (activeElements && activeElements.length > 0) {
            const { index } = activeElements[0];
            const details = addressDetails[index];
    
            // Sort the details by the greater of incoming or outgoing USD values
            const sortedDetails = details.sort((a, b) => {
                const aMax = Math.max(a.incoming * tokenPriceUSD, a.outgoing * tokenPriceUSD);
                const bMax = Math.max(b.incoming * tokenPriceUSD, b.outgoing * tokenPriceUSD);
                return bMax - aMax; // Sort in descending order
            });
    
            const position = { x: event.clientX, y: event.clientY };
            const content = sortedDetails.map((detail, i) => {
                const label = CacheFriendlyLabels?.[detail.address]?.manuallyDefined 
                              ? CacheFriendlyLabels[detail.address].manuallyDefined 
                              : getEllipsisTxt(detail.address, 6);
    
                // Convert to USD values
                const incomingUSD = detail.incoming * tokenPriceUSD;
                const outgoingUSD = detail.outgoing * tokenPriceUSD;
    
                return (
                    <tr key={i}>
                        <td style={tableDataStyle}>{label}</td>
                        <td style={tableDataStyle}>{formatNumber(Number(incomingUSD).toFixed(2))} USD</td>
                        <td style={tableDataStyle}>{formatNumber(Number(outgoingUSD).toFixed(2))} USD</td>
                        <td style={tableDataStyle}>{addressTags[detail.address]?.ElderRank || 'N/A'}</td>
                    </tr>
                );
            });
    
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
            // Calculate the ratio
            const ratio = elderRank / elderCount;
            // console.log('ratio: ',parseFloat(ratio).toFixed(2), elderRank, elderCount)
            // If ratio is 1 (meaning elderRank is equal to elderCount), return 100
            if (ratio === 1) {
                return 100;
            }
    
            // Otherwise, calculate the percentage and floor it
            return Math.floor(ratio * 100) || 0;
        }
        return null;
    };
    

    const isUniswapPool = (address) => {
        const tags = addressTags[address];
        return tags?.isUniswapV2Pool || tags?.isUniswapV3Pool;
    };

    const { incomingVolumes, outgoingVolumes, liquidityVolumes, addressDetails, cexVolumes } = calculateVolume();

    const data = {
        labels: Array.from({ length: 100 }, (_, i) => `${i + 1}`),
        datasets: [
            {
                label: 'Incoming Volume',
                data: incomingVolumes,
                backgroundColor: 'rgba(0, 255, 0, 0.6)',
                borderColor: 'rgba(0, 255, 0, 1)',
                borderWidth: 2,
            },
            {
                label: 'Outgoing Volume',
                data: outgoingVolumes,
                backgroundColor: 'rgba(255, 0, 0, 0.6)',
                borderColor: 'rgba(255, 0, 0, 1)',
                borderWidth: 2,
            },
            {
                label: 'Liquidity Management Volume',
                data: liquidityVolumes,
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                borderColor: 'rgba(0, 255, 255, 0.1)',
                borderWidth: 2,
            },
            {
                label: 'CEX Volume',
                data: cexVolumes,
                backgroundColor: 'rgba(255, 255, 0, 0.1)', // Yellow color for CEX
                borderColor: 'rgba(255, 255, 0, 0.1)',
                borderWidth: 2,
            }
        ],
    };
    



    const CustomTooltip = ({ visible, position, content }) => {
        if (!visible) {
            return null;
        }
    
        const tooltipStyle = isExpanded ? {
            position: 'absolute',
            top: '9%',
            left: 0,
            width: '100%',
            height: '70%', // 70% height when expanded
            backgroundColor: 'rgba(10, 10, 30, 0.9)',
            color: 'cyan',
            overflow: 'auto',
            border: '1px solid cyan',
            borderRadius: '5px',
            padding: '10px',
        } : {
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
                <table style={{ fontSize:'0.4vw', width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Address</th>
                            <th style={tableHeaderStyle}>In</th>
                            <th style={tableHeaderStyle}>Out</th>
                            <th style={tableHeaderStyle}>Elder</th>
                        </tr>
                    </thead>
                    <tbody>
                        {content}
                    </tbody>
                </table>
            </div>
        );
    };


    // State to manage whether the component is expanded or not
    const [isExpanded, setIsExpanded] = useState(false);

    // Function to toggle the expanded state
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // Conditional styling based on whether the component is expanded
    const containerStyle = isExpanded ? {
        position: 'fixed', // Fixed position
        top: '7vh',
        left: 0,
        width: '100%',
        height: '95vh',
        zIndex: 100000, // Ensure it's on top
        backgroundColor: '#111', // Or any other background color
        padding: '20px',
        borderRadius: '0' // No border-radius when expanded
    } : {
        padding: '20px',
        borderRadius: '8px',
        width: '100%',
        height: '100%'
    };




























    
    const tableHeaderStyle = {
        borderBottom: '1px solid cyan',
        padding: '5px',
        textAlign: 'right',
        color: 'cyan'
    };
    
    const tableDataStyle = {
        borderBottom: '1px solid cyan',
        padding: '5px',
        textAlign: 'right',
        color: 'white'
    };

    const options = {
        onHover: handleHover,
        layout: {
            padding: {
              left: 0,
              right: 0,
              // Adjust top and bottom as needed
            }
          },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        const valueInUSD = value * tokenPriceUSD;
                        return '$' + formatNumber(Number(valueInUSD).toFixed(2));
                    }
                },
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
            
        },
        maintainAspectRatio: false,
        responsive: true,
    };
    

    if (!TxHashDetailsObj) {
        return <div>Loading...</div>; // or any other placeholder
    }
    else {
        return (
            <div style={containerStyle}>
                <button onClick={toggleExpand} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    {isExpanded ? 'Normal View' : 'Expand'}
                </button>
                <Bar data={data} options={options} height={400} />
                <CustomTooltip visible={tooltipInfo.visible} position={tooltipInfo.position} content={tooltipInfo.content} />
            </div>
        );
    }
};

export default EldersPanelStats;
