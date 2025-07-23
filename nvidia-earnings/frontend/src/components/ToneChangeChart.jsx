import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Label
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const isPositive = value > 0;
    const arrow = isPositive ? '↑' : '↓';
    
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
        <p className="font-bold text-gray-800">{label}</p>
        <p className={`text-lg font-semibold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {`${(value * 100).toFixed(1)}% ${arrow}`}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {isPositive 
            ? 'Increased positive sentiment compared to previous quarter' 
            : 'Decreased sentiment compared to previous quarter'}
        </p>
      </div>
    );
  }
  return null;
};

const ToneChangeChart = ({ data }) => {
  // Enhanced data structure with sentiment direction indicators
  const chartData = data.slice(1).map((quarter, index) => {
    const change = quarter.tone_change ?? 0;
    return {
      quarter: `${data[index].quarter} → ${quarter.quarter}`,
      change,
      sentiment: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral',
      currentSentiment: quarter.management.sentiment,
      previousSentiment: data[index].management.sentiment
    };
  });

  // Custom dot component with sentiment-based coloring
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    const size = 8;
    const colors = {
      positive: '#10b981',
      negative: '#ef4444',
      neutral: '#94a3b8'
    };

    return (
      <g>
        <circle cx={cx} cy={cy} r={size + 2} fill="white" stroke={colors[payload.sentiment]} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={size} fill={colors[payload.sentiment]} />
      </g>
    );
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Quarter-over-Quarter Tone Change
      </h2>
      
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="quarter"
            angle={-45}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 11, fill: '#64748b' }}
            height={60}
          >
            <Label value="Quarter Transition" position="bottom" offset={20} style={{ fill: '#475569' }} />
          </XAxis>
          <YAxis
            domain={['dataMin - 0.1', 'dataMax + 0.1']}
            tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`}
            tick={{ fontSize: 12, fill: '#64748b' }}
          >
            <Label value="Sentiment Change" angle={-90} position="left" offset={-10} style={{ fill: '#475569', textAnchor: 'middle' }} />
          </YAxis>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={40} />
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
          
          {/* Sentiment change line */}
          <Line
            type="monotone"
            dataKey="change"
            name="Tone Change"
            stroke="#4f46e5"
            strokeWidth={2}
            strokeDasharray="3 3"
            activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }}
            dot={<CustomDot />}
          />
          
          {/* Trend line for visual guidance */}
          <Line
            type="monotone"
            dataKey="change"
            name="Trend Line"
            stroke="#4f46e5"
            strokeWidth={0}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-sm text-gray-600 text-center">
        <p>Compares management sentiment between consecutive quarters</p>
        <p>Positive values indicate improved sentiment, negative values indicate decline</p>
      </div>
    </div>
  );
};

export default ToneChangeChart;