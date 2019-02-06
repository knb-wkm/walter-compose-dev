import React from "react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

const UsagesArea = ({usages, cardWidth}) => {
  const areaWidth = cardWidth - 32;
  const areaHeight = areaWidth * 0.4;

  return (
    <AreaChart
      width={areaWidth} height={areaHeight} data={usages}
      margin={{ top: 50, right: 30, left: 30, bottom: 30}}>
      <XAxis dataKey="name" label={{ value: "年月日", dy: 30 }}/>
      <YAxis label={{ value: "容量(MB)", dx: -10, dy: -180}} />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
      <Area type='monotone' stackId={1} dataKey='usage' fill='#ff9896' stroke="#d62728" />
      <Area type="monotone" stackId={1} dataKey="free" fill="#aec7e8" stroke="#1f77b4" />
    </AreaChart>
  );
};

export default UsagesArea;
