import React from "react";

// recharts
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const TotalPie = ({useRateTotal, cardWidth}) => {
  const colors = [
    "#d2584c", // 使用中
    "#00bcd4"  // 空き
  ];

  const renderShape = (useRateTotal, pieWidth, pieHeight) => {

    const renderUsagePer = (useRateTotal) => {
      if (useRateTotal.length === 0) return "N/A";
      const total = useRateTotal.reduce( (a, b) => a.value + b.value );
      const usage = useRateTotal.filter( total => total.name === "usage" )[0].value;
      return (usage / total * 100).toFixed(2);
    };

    const x = pieWidth / 2;
    const y = pieHeight / 2;

    return (
      <g>
        <text x={x} y={y} textAnchor="middle"
              dominantBaseline="central" fill="#777" fontSize={30}>
          {renderUsagePer(useRateTotal)}%
        </text>
      </g>
    );
  };

  const renderCell = (color, idx) => (
    <Cell key={idx} fill={color} />
  );

  const pieWidth = cardWidth - 32;  // cardTextのpaddingが16なので
  const pieHeight = pieWidth * 0.65;

  return (
    <div>
      <PieChart width={pieWidth} height={pieHeight}>
        <Pie
          data={useRateTotal}
          innerRadius="80%"
          outerRadius="100%"
          paddingAngle={1}
          fill="#8884d8">

          {colors.map( (color, idx) => renderCell(color, idx))}

        </Pie>
        <Tooltip />
        {renderShape(useRateTotal, pieWidth, pieHeight)}
      </PieChart>
    </div>
  );
};

export default TotalPie;
