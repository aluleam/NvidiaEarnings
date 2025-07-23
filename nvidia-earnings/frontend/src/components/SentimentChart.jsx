import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
        <p className="font-bold text-gray-800 mb-2">{label}</p>
        {payload.map((entry, index) => {
          const isNegative = entry.value < 0;
          const sentiment = isNegative ? 'Negative' : 'Positive';
          const confidence = Math.abs(entry.value).toFixed(2);
          
          return (
            <div key={index} className="flex items-center mb-1 last:mb-0">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="font-medium">{entry.name}:</span>
              <span className={`ml-2 ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                {sentiment} ({confidence})
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const SentimentChart = ({ data }) => {
  // Log all received data for debugging
  console.log("SentimentChart data:", data);
  
  const chartData = data.map(quarter => ({
    quarter: quarter.quarter,
    management: quarter.management.sentiment === 'negative' 
      ? -quarter.management.confidence 
      : quarter.management.confidence,
    qa: quarter.qa.sentiment === 'negative' 
      ? -quarter.qa.confidence 
      : quarter.qa.confidence,
    date: quarter.date
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Sentiment Analysis by Quarter</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="quarter" 
            tick={{ fontSize: 12 }}
            padding={{ left: 20, right: 20 }}
          />
          <YAxis 
            domain={[-1, 1]} 
            tickFormatter={(value) => value.toFixed(1)}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36}
            formatter={(value) => (
              <span className="text-sm text-gray-600">{value}</span>
            )}
          />
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
          <Bar 
            dataKey="management" 
            name="Management Discussion" 
            fill="#4f46e5"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="qa" 
            name="Q&A Session" 
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-3 text-sm text-gray-500 text-center">
        <p>Positive sentiment shown above zero line, negative below</p>
      </div>
    </div>
  );
};

export default SentimentChart;