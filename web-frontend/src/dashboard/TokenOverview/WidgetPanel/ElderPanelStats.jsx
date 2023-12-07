import React, { useContext, useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { GeneralContext } from '../../../App.js';
import { getEllipsisTxt, formatNumber } from '../../helpers/h.js';
import { useTable, useSortBy } from 'react-table';

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo('en-US');



ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EldersPanelStats = () => {
    const { txData, txHashActionCache, addressTags, elderCount, clickedToken, CacheFriendlyLabels, TxHashDetailsObj } = useContext(GeneralContext);

    const tokenDecimals = clickedToken?.data?.data?.detail_platforms?.ethereum?.decimal_place || 0;
    const tokenPriceUSD = clickedToken?.data?.data?.market_data?.current_price?.usd || 0;

    const [tooltipInfo, setTooltipInfo] = useState({ visible: false, content: null, position: { x: 0, y: 0 } });
    const [sortState, setSortState] = useState({ field: null, ascending: true });
    const [isExpanded, setIsExpanded] = useState(false);
    const [showCexVolume, setShowCexVolume] = useState(false);
    const [showLiquidityVolume, setShowLiquidityVolume] = useState(false);
    const [showIncomingVolume, setShowIncomingVolume] = useState(true);
    const [showOutgoingVolume, setShowOutgoingVolume] = useState(true);

    const [chartData, setChartData] = useState({
        labels: Array.from({ length: 100 }, (_, i) => `${i + 1}`),
        datasets: [
            {
                label: 'Incoming Volume',
                data: [],
                backgroundColor: 'rgba(0, 255, 0, 0.6)',
                borderColor: 'rgba(0, 255, 0, 1)',
                borderWidth: 2,
            },
            // ... other datasets
        ],
    });

    useEffect(() => {
        const updateChartData = () => {
            const { incomingVolumes, outgoingVolumes, liquidityVolumes, cexVolumes } = calculateVolume();
            setChartData({
                ...chartData,
                datasets: [
                    { ...chartData.datasets[0], data: incomingVolumes },
                    { ...chartData.datasets[1], data: outgoingVolumes },
                    { ...chartData.datasets[2], data: liquidityVolumes },
                    { ...chartData.datasets[3], data: cexVolumes }
                ]
            });
        };
        
        updateChartData();
    }, [txData]);

    const calculateVolume = () => {
        let incomingVolumeByElderRank = Array(200).fill(0);
        let outgoingVolumeByElderRank = Array(200).fill(0);
        let liquidityVolumeByElderRank = Array(200).fill(0);
        let cexVolumeByElderRank = Array(200).fill(0);
        let addressDetailsByElderRank = Array(200).fill().map(() => []);

        const decimalFactor = Math.pow(10, tokenDecimals);

        if (TxHashDetailsObj && txData) {
            txData.forEach(tx => {
                const txHash = tx.transaction_hash;
                const isLiquidityMove = TxHashDetailsObj[txHash]?.isUniswapPositionManagement;
                const tokenTransferSummary = TxHashDetailsObj[txHash]?.tokenTransferSummary?.[clickedToken.data.contractAddress];

                if (tokenTransferSummary) {
                    let isCexTransaction = false;

                    Object.keys(tokenTransferSummary).forEach(address => {
                        if (addressTags[address]?.isCEX) {
                            isCexTransaction = true;
                        }
                    });

                    Object.keys(tokenTransferSummary).forEach(address => {
                        let incoming = tokenTransferSummary[address]?.incoming;
                        let outgoing = tokenTransferSummary[address]?.outgoing;

                        incoming = incoming !== undefined ? Number(incoming) / decimalFactor : 0;
                        outgoing = outgoing !== undefined ? Number(outgoing) / decimalFactor : 0;

                        const elderRank = getNormalizedElderRank(address);
                        const blockTimestamp = tx.block_timestamp; 

                        if (elderRank) {
                            if (isCexTransaction) {
                                cexVolumeByElderRank[elderRank - 1] += incoming + outgoing;
                            } else if (isLiquidityMove) {
                                liquidityVolumeByElderRank[elderRank - 1] += incoming + outgoing;
                            } else {
                                incomingVolumeByElderRank[elderRank - 1] += incoming;
                                outgoingVolumeByElderRank[elderRank - 1] += outgoing;
                            }

                            addressDetailsByElderRank[elderRank - 1].push({
                                address, 
                                incoming, 
                                outgoing, 
                                txHash, // Include the transaction hash
                                blockTimestamp // Include the block timestamp
                            });
                        }
                    });
                }
            });
        }

        return {
            incomingVolumes: showIncomingVolume ? incomingVolumeByElderRank : Array(200).fill(0),
            outgoingVolumes: showOutgoingVolume ? outgoingVolumeByElderRank : Array(200).fill(0),
            liquidityVolumes: showLiquidityVolume ? liquidityVolumeByElderRank : Array(200).fill(0),
            cexVolumes: showCexVolume ? cexVolumeByElderRank : Array(200).fill(0),
            addressDetails: addressDetailsByElderRank
        };
    };

    const handleSort = (field) => {
        setSortState(prevState => ({
            field,
            ascending: prevState.field === field ? !prevState.ascending : true
        }));
    };

    const handleHover = (event, activeElements) => {
        if (activeElements && activeElements.length > 0) {
            const { index } = activeElements[0];
            const details = addressDetails[index];
    
            const sortedDetails = details.sort((a, b) => {
                const aMax = Math.max(a.incoming * tokenPriceUSD, a.outgoing * tokenPriceUSD);
                const bMax = Math.max(b.incoming * tokenPriceUSD, b.outgoing * tokenPriceUSD);
                return bMax - aMax;
            });
    
            const position = { x: event.clientX, y: event.clientY };
            const content = sortedDetails.map((detail, i) => {
                const label = CacheFriendlyLabels?.[detail.address]?.manuallyDefined 
                              ? CacheFriendlyLabels[detail.address].manuallyDefined 
                              : getEllipsisTxt(detail.address, 6);
    
                const incomingUSD = detail.incoming * tokenPriceUSD;
                const outgoingUSD = detail.outgoing * tokenPriceUSD;
    
                // Convert blockTimestamp string to Date object
                const date = new Date(detail.blockTimestamp);
    
                return (
                    <tr key={i}>
                        <td style={tableDataStyle}>
                            {timeAgo.format(date)} {/* Use the Date object here */}
                        </td>
                        <td style={tableDataStyle}>
                            <a href={`https://etherscan.io/tx/${detail.txHash}`} target="_blank" rel="noopener noreferrer">
                                View
                            </a>
                        </td>
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
            return null;
        }

        const elderRank = addressTags[address]?.ElderRank;
        if (elderRank && !isNaN(elderRank)) {
            const ratio = elderRank / elderCount;
            if (ratio === 1) {
                return 100;
            }
            return Math.floor(ratio * 100) || 0;
        }
        return null;
    };

    const isUniswapPool = (address) => {
        const tags = addressTags[address];
        return tags?.isUniswapV2Pool || tags?.isUniswapV3Pool;
    };

    const { incomingVolumes, outgoingVolumes, liquidityVolumes, cexVolumes, addressDetails } = calculateVolume();

    const data2 = {
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
                backgroundColor: 'rgba(0, 255, 255, 1)',
                borderColor: 'rgba(0, 255, 255, 1)',
                borderWidth: 2,
            },
            {
                label: 'CEX Volume',
                data: cexVolumes,
                backgroundColor: 'rgba(255, 255, 0, 1)',
                borderColor: 'rgba(255, 255, 0, 1)',
                borderWidth: 2,
            }
        ],
    };


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
        top: '0%',
        left: '0%',
        width: '30%',
        height: '75%',
        backgroundColor: 'rgba(10, 10, 30, 0.9)',
        color: 'cyan',
        overflow: 'auto', // In case content overflows
        border: '1px solid cyan',
        borderRadius: '5px',
        padding: '10px',
    };


    const CustomTooltip = ({ visible, position, content }) => {
        if (!visible) {
            return null;
        }


        return (
            <div style={tooltipStyle}>
                <table style={{ fontSize:'0.4vw', width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Timestamp</th>
                            <th style={tableHeaderStyle}>Tx Hash</th>
                            <th style={tableHeaderStyle} onClick={() => handleSort('address')}>Address</th>
                            <th style={tableHeaderStyle} onClick={() => handleSort('incomingUSD')}>In</th>
                            <th style={tableHeaderStyle} onClick={() => handleSort('outgoingUSD')}>Out</th>
                            <th style={tableHeaderStyle} onClick={() => handleSort('elderRank')}>Elder</th>
                        </tr>
                    </thead>
                    <tbody>
                        {content}
                    </tbody>
                </table>
            </div>
        );
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const containerStyle = isExpanded ? {
        position: 'fixed',
        top: '7vh',
        left: 0,
        width: '100%',
        height: '95vh',
        zIndex: 100000,
        backgroundColor: '#111',
        padding: '20px',
        borderRadius: '0'
    } : {
        padding: '20px',
        borderRadius: '8px',
        width: '100%',
        height: '100%'
    };

    const handleCheckboxChange = (event) => {
        switch (event.target.name) {
            case "cexVolume":
                setShowCexVolume(event.target.checked);
                break;
            case "liquidityVolume":
                setShowLiquidityVolume(event.target.checked);
                break;
            case "incomingVolume":
                setShowIncomingVolume(event.target.checked);
                break;
            case "outgoingVolume":
                setShowOutgoingVolume(event.target.checked);
                break;
            default:
                break;
        }
    };

    const tableHeaderStyle = {
        borderBottom: '1px solid cyan',
        padding: '5px',
        textAlign: 'right',
        color: 'cyan'
    };
    
    const tableDataStyle = {
        borderBottom: '1px solid cyan',
        padding: '1px',
        textAlign: 'right',
        color: 'white'
    };

    const options = {
        onHover: handleHover,
        layout: {
            padding: {
              left: 0,
              right: 0,
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
                    color: '#888',
                },
            },
            x: {
                ticks: {
                    color: 'white',
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                    display: false,
                },
                grid: {
                    color: 'white',
                    display: false,
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Volume by Elder Address',
                color: 'white',
            },
            tooltip: {
                enabled: false,
            },
        },
        maintainAspectRatio: false,
        responsive: true,
    };

    if (!TxHashDetailsObj) {
        return <div>Loading...</div>;
    } else {
        return (
            <div style={containerStyle}>
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <label>
                        <input
                            type="checkbox"
                            name="incomingVolume"
                            checked={showIncomingVolume}
                            onChange={handleCheckboxChange}
                        />
                        Incoming
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="outgoingVolume"
                            checked={showOutgoingVolume}
                            onChange={handleCheckboxChange}
                        />
                        Outgoing
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="cexVolume"
                            checked={showCexVolume}
                            onChange={handleCheckboxChange}
                        />
                        CEX
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="liquidityVolume"
                            checked={showLiquidityVolume}
                            onChange={handleCheckboxChange}
                        />
                        Liquidity
                    </label>
                    <button onClick={toggleExpand}>
                        {isExpanded ? 'Normal View' : 'Expand'}
                    </button>
                </div>
                <Bar data={data2} options={options} height={400} />
                <CustomTooltip visible={tooltipInfo.visible} position={tooltipInfo.position} content={tooltipInfo.content} />
            </div>
        );
    }
};

export default EldersPanelStats;
