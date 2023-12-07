import React, { useContext, useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { GeneralContext } from '../../../App.js';
import { getEllipsisTxt, formatNumber } from '../../helpers/h.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EldersPanelStats = () => {
    const { txData, txHashActionCache, addressTags, elderCount, clickedToken, CacheFriendlyLabels, TxHashDetailsObj } = useContext(GeneralContext);

    const tokenDecimals = clickedToken?.data?.data?.detail_platforms?.ethereum?.decimal_place || 0;
    const tokenPriceUSD = clickedToken?.data?.data?.market_data?.current_price?.usd || 0;

    const [tooltipInfo, setTooltipInfo] = useState({ visible: false, content: null, position: { x: 0, y: 0 } });
    const [sortState, setSortState] = useState({ field: null, ascending: true });
    const [isExpanded, setIsExpanded] = useState(false);
    const [data, setData] = useState({
        labels: Array.from({ length: 100 }, (_, i) => `${i + 1}`),
        datasets: []
    });


    const [showCexVolume, setShowCexVolume] = useState(true);
    const [showLiquidityVolume, setShowLiquidityVolume] = useState(true);
    const [showIncomingVolume, setShowIncomingVolume] = useState(true);
    const [showOutgoingVolume, setShowOutgoingVolume] = useState(true);




    // Define state for chart data
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
        // This function will be called whenever txData changes.
        const updateChartData = () => {
            // Call your calculateVolume or any other function that needs to be updated with the new txData
            const { incomingVolumes, outgoingVolumes, liquidityVolumes, cexVolumes, addressDetails } = calculateVolume();
            
            // Update your chart's data state here, if you have a state for it
            // For example, if you have a state called 'chartData' you would do the following:
            setChartData({
                ...data, // Spread in the existing data properties
                datasets: [
                    { ...data.datasets[0], data: incomingVolumes },
                    { ...data.datasets[1], data: outgoingVolumes },
                    { ...data.datasets[2], data: liquidityVolumes },
                    { ...data.datasets[3], data: cexVolumes }
                    // ... any other dataset updates
                ]
            });
        };
        
        updateChartData();
    }, [txData]); // Only re-run the effect if txData changes











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
                    let isCexTransaction = false;
    
                    // Check if any address in the transaction is a CEX
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
    
                        if (elderRank) {
                            if (isCexTransaction) {
                                // Add total volume to CEX volume if it's a CEX transaction
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
            incomingVolumes: showIncomingVolume ? incomingVolumeByElderRank : Array(200).fill(0),
            outgoingVolumes: showOutgoingVolume ? outgoingVolumeByElderRank : Array(200).fill(0),
            liquidityVolumes: showLiquidityVolume ? liquidityVolumeByElderRank : Array(200).fill(0),
            cexVolumes: showCexVolume ? cexVolumeByElderRank : Array(200).fill(0),
            addressDetails: addressDetailsByElderRank
        };
    };
    

    const handleSort = (field) => {
        console.log('CLICKED: ',field)
        setSortState(prevState => ({
            field,
            ascending: prevState.field === field ? !prevState.ascending : true
        }));
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
                backgroundColor: 'rgba(255, 255, 0, 1)', // Yellow color for CEX
                borderColor: 'rgba(255, 255, 0, 1)',
                borderWidth: 2,
            }
        ],
    };
    



    const CustomTooltip = ({ visible, position, content }) => {


        // Sort the content based on sortState
        const sortedContent = React.useMemo(() => {
            if (!sortState.field) return content;

            const sorted = [...content].sort((a, b) => {
                const aValue = a[sortState.field];
                const bValue = b[sortState.field];
                const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
                return sortState.ascending ? comparison : -comparison;
            });

            console.log("Sorted Content: ", sorted); // Debugging line
            return sorted;
        }, [content, sortState]);

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
    
        return (
            <div style={tooltipStyle}>
                <table style={{ fontSize:'0.4vw', width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle} onClick={() => handleSort('address')}>Address</th>
                            <th style={tableHeaderStyle} onClick={() => handleSort('incomingUSD')}>In</th>
                            <th style={tableHeaderStyle} onClick={() => handleSort('outgoingUSD')}>Out</th>
                            <th style={tableHeaderStyle} onClick={() => handleSort('elderRank')}>Elder</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedContent}
                    </tbody>
                </table>
            </div>
        );
    }


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
