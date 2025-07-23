import React from 'react';
import { motion } from 'framer-motion';
import { FaChevronRight, FaChartLine, FaNetworkWired, FaRobot, FaCloud } from 'react-icons/fa';

// Icon mapping for common themes
const themeIcons = {
  ai: FaRobot,
  growth: FaChartLine,
  infrastructure: FaNetworkWired,
  cloud: FaCloud,
};

const getThemeIcon = (theme) => {
  const lowerTheme = theme.toLowerCase();
  for (const [keyword, Icon] of Object.entries(themeIcons)) {
    if (lowerTheme.includes(keyword)) {
      return <Icon className="text-blue-500 mr-2 flex-shrink-0" />;
    }
  }
  return <FaChevronRight className="text-blue-500 mr-2 flex-shrink-0" />;
};

const StrategicFocus = ({ quarter }) => {
  if (!quarter.management.themes || quarter.management.themes.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl shadow-sm border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
          Strategic Focus Areas
        </h3>
        <p className="text-gray-500 italic">No strategic focus areas identified for this quarter</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl shadow-sm border border-blue-100"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-blue-800 flex items-center">
        
          Strategic Focus Areas
        </h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {quarter.quarter}
        </span>
      </div>
      
      <ul className="space-y-3">
        {quarter.management.themes.map((theme, index) => (
          <motion.li 
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start bg-white p-3 rounded-lg shadow-xs border border-blue-100 hover:shadow-sm transition-shadow"
          >
            {getThemeIcon(theme)}
            <span className="text-gray-700">{theme}</span>
          </motion.li>
        ))}
      </ul>
      
      <div className="mt-4 pt-3 border-t border-blue-100">
        <p className="text-xs text-gray-500 flex items-center">
          <FaChartLine className="mr-1 text-blue-400" />
          Based on management discussion sentiment: 
          <span className={`ml-1 font-medium ${
            quarter.management.sentiment === 'positive' ? 'text-green-600' :
            quarter.management.sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {quarter.management.sentiment} ({(quarter.management.confidence * 100).toFixed(0)}% confidence)
          </span>
        </p>
      </div>
    </motion.div>
  );
};

export default StrategicFocus;