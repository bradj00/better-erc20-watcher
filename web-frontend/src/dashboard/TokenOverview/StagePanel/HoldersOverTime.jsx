import React, { useContext, useEffect } from 'react';
import { GeneralContext } from '../../../App';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: '10px', border: '1px solid #999999' }}>
                <p style={{ color: '#999999' }}>{`Date: ${label}`}</p>
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

    return (
        <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#0f0f0f' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={holdersOverTimeData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                    <XAxis dataKey="dayNumber" stroke="#999999" tick={{ fill: '#999999' }} />
                    <YAxis label={{ value: 'New Unique Addresses', angle: -90, position: 'insideLeft', fill: '#999999' }} stroke="#999999" tick={{ fill: '#999999' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: '#999999' }} />
                    <Line type="monotone" dataKey="uniqueCount" stroke="cyan" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default HoldersOverTime;
