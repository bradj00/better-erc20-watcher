import React, { useContext, useEffect, useState, useRef } from 'react';
import { GeneralContext } from '../../../App';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HoldersOverTime = () => {
    const { holdersOverTimeData, setRequestFetchHoldersOverTimeData } = useContext(GeneralContext);
    const { clickedToken } = useContext(GeneralContext);
    const { txData } = useContext(GeneralContext);

    // State for storing the ticks for the start of each day
    const [startOfDayTicks, setStartOfDayTicks] = useState([]);
    

    // State for storing the modified data
    const [modifiedData, setModifiedData] = useState([]);


    // Market open times by hour
    const marketOpenHours = {
        US: 14, // 14:00 is US market open
        Europe: 8, // 08:00 is Europe market open
        Asia: 1, // 01:00 is Asia market open
    };
    
    
    // Custom Dot Component
    const MarketOpenDot = (props) => {
        const { cx, cy, payload } = props;

        // Extract the hour from the data point
        const dataHour = new Date(payload.date + ":00:00").getHours();

        // Determine the color based on the market open hour
        let dotColor = null;
        if (dataHour === marketOpenHours.US) {
            dotColor = 'rgba(0, 0, 255, 0.7)'; // Blue for US
        } else if (dataHour === marketOpenHours.Europe) {
            dotColor = 'rgba(255, 0, 0, 0.7)'; // Red for Europe
        } else if (dataHour === marketOpenHours.Asia) {
            dotColor = 'rgba(255, 255, 0, 0.7)'; // Yellow for Asia
        }

        if (dotColor) {
            // return <circle cx={cx} cy={cy} r={4} fill={dotColor} stroke="none" />;
        }

        // Default dot for other data points
        // return <circle cx={cx} cy={cy} r={0} fill="none" stroke="none" />;
    };

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const date = payload[0].payload.date; // Extracting the date from the payload
            return (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: '10px', border: '1px solid #999999' }}>
                    <p style={{ color: '#999999' }}>{`Date: ${date}`}</p>
                    <p style={{ color: '#999999' }}>{`New Unique Addresses: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    // Function to format the date string for the axis tick labels
    const formatDate = (dateString) => {
        const [datePart] = dateString.split('T');
        const [year, month, day] = datePart.split('-');
        return `${month}/${day}`;
    };

    // Function to process the data and extract ticks for the start of each day
    const getStartOfDayTicks = (data) => {
        return Array.isArray(data) ? data.filter(item => item.date && item.date.endsWith('T00')).map(item => item.date) : [];
    };

    // Effect to fetch data
    useEffect(() => {
        setRequestFetchHoldersOverTimeData(true);
    }, [clickedToken, txData]);

    useEffect(() => {
        if (holdersOverTimeData && holdersOverTimeData.length > 0) {
            const ticks = getStartOfDayTicks(holdersOverTimeData);
            setStartOfDayTicks(ticks);

            setModifiedData(holdersOverTimeData.slice(0, -1)); //remove last one
        }
    }, [holdersOverTimeData]);

    return (
        <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#0f0f0f' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={modifiedData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                    <XAxis
                        dataKey="date"
                        stroke="#999999"
                        tick={{ fill: '#999999' }}
                        ticks={startOfDayTicks}
                        tickFormatter={formatDate}
                    />
                    <YAxis
                        label={{ value: 'New Unique Addresses', angle: -90, position: 'insideLeft', fill: '#999999' }}
                        stroke="#999999"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: '#999999' }} />
                    <Line
                        type="monotone"
                        dataKey="uniqueCount"
                        stroke="cyan"
                        dot={<MarketOpenDot />} // Use custom dot component for market open times
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default HoldersOverTime;
