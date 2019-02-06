import React from "react";

import { PieChart, Pie } from "recharts";

const ShapePie = ({data, cardWidth, pieColor}) => {
  const renderShape = (data) => {
    if (data.length === 0) return "N/A";

    const x = pieWidth / 2;
    const y = pieHeight / 2;

    return (
      <g>
        <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
              fill="#777" fontSize={20}>
          {data[0].value}
        </text>
      </g>
    );
  };

  const pieWidth = cardWidth - 32;
  const pieHeight = pieWidth * 0.65;

  return (
    <div>
      <PieChart width={pieWidth} height={pieHeight}>
        <Pie
          data={data}
          innerRadius="80%"
          outerRadius="100%"
          fill={pieColor} />
        {renderShape(data, pieWidth, pieHeight)}
      </PieChart>
    </div>
  );
};

export default ShapePie;
