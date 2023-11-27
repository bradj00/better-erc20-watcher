import React, { useContext, useEffect } from 'react';
import { GeneralContext } from '../../../App';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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



const HoldersOverTime = () => {
    const { holdersOverTimeData, setHoldersOverTimeData } = useContext(GeneralContext);
    const { setRequestFetchHoldersOverTimeData } = useContext(GeneralContext);

    useEffect(() => {
        setRequestFetchHoldersOverTimeData(true);
    }, []);

    useEffect(() => {
        if (holdersOverTimeData) {
            console.log('holdersOverTimeData: ', holdersOverTimeData);
        }
    }, [holdersOverTimeData]);

    const getStartOfDayTicks = (data) => {
        return data
          .filter((item) => item.date.endsWith('T00')) // Filter items that represent the start of a day
          .map((item) => item.date); // Map to an array of date strings
      };
      
      const formatDate = (dateString) => {
        // Complete the date string to the full ISO 8601 format by adding minutes and seconds
        const fullDateString = `${dateString}:00:00`;
        const date = new Date(fullDateString);
        // Check for Invalid Date
        if (isNaN(date)) {
          return '';
        }
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
      };
      
    const startOfDayTicks = getStartOfDayTicks(holdersOverTimeData);

    useEffect(() => {
        if (holdersOverTimeData) {
            // Now we can safely call the function because the data is loaded
            const startOfDayTicks = getStartOfDayTicks(holdersOverTimeData);
            // Do something with startOfDayTicks, like storing them in the state
        }
    }, [holdersOverTimeData]);


    return (
        <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#0f0f0f' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={holdersOverTimeData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                    <XAxis
                        dataKey="date"
                        stroke="#999999"
                        tick={{ fill: '#999999' }}
                        ticks={startOfDayTicks}
                        tickFormatter={formatDate}
                    />

                    <YAxis label={{ value: 'New Unique Addresses', angle: -90, position: 'insideLeft', fill: '#999999' }} stroke="#999999" tick={{ fill: '#999999' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: '#999999' }} />
                    <Line type="monotone" dataKey="uniqueCount" stroke="cyan" dot={{ r: 0 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default HoldersOverTime;
