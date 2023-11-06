import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const VolumeGraph = () => {
  // Helper function to generate a random number between min and max (inclusive)
    const getRandomNumber = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    
    // Function to generate a data object for a specific timestamp
    const generateDataForTimestamp = (hour) => {
        const timestamp = `${hour < 10 ? '0' : ''}${hour}:00`;
        return {
        timestamp,
        addresses: getRandomNumber(1, 5000),
        amount: getRandomNumber(1, 5000),
        whales: getRandomNumber(1, 5000),
        foundation: getRandomNumber(1, 5000),
        };
    };
    
    // Generate the data array
    const generateData = () => {
        const data = [];
        for (let i = 1; i <= 17; i++) {
        data.push(generateDataForTimestamp(i));
        }
        return data;
    };
    
    const data = generateData();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}> 
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="timestamp" stroke="#aaa" />
        <YAxis yAxisId="left" stroke="#aaa" />
        <YAxis yAxisId="right" orientation="right" stroke="#48cae4" />
        <Tooltip />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="addresses" stroke="#ff7300" />
        <Line yAxisId="left" type="monotone" dataKey="amount" stroke="#387908" />
        <Line yAxisId="left" type="monotone" dataKey="foundation" stroke="#f6416c" />
        <Line yAxisId="right" type="monotone" dataKey="whales" stroke="#48cae4" />
      </LineChart>
    </ResponsiveContainer>
  );
  
}

export default VolumeGraph;
