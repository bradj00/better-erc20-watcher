import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const data = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    amt: 2210
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    amt: 2290
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000
  },
  {
    name: "Page E",
    uv: 1890,
    pv: 4800,
    amt: 2181
  },
  {
    name: "Page F",
    uv: 2390,
    pv: 3800,
    amt: 2500
  },
  {
    name: "Page G",
    uv: 3490,
    pv: 4300,
    amt: 2100
  }
];

export default function ChartAddysOverTime(props) {
  return (
    <LineChart
      width={1150}
      height={300}
      data={props.data}
      margin={{
        top: 10,
        right: 10,
        bottom: 0,
        left: 10,
      }}
    >
      {/* <CartesianGrid strokeDasharray="3 3" /> */}
      {/* <XAxis dataKey="name" /> */}
      <YAxis yAxisId="left" />
      <YAxis yAxisId="right" orientation="right" />
      {/* <Tooltip /> */}
      {/* <Legend /> */}
      
      <Line yAxisId="right" type="monotone" dot={{r:1}}  dataKey="uniqueAddresses" stroke="#82ca9d" />
    </LineChart>
  );
}
