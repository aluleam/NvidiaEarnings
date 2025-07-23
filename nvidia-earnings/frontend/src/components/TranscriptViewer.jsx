import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaQuoteLeft, FaComments, FaChartBar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const TranscriptViewer = ({ transcript }) => {
  const [activeTab, setActiveTab] = useState('management');
  const [expandedSections, setExpandedSections] = useState({
    management: false,
    qa: false
  });

  // Ensure transcript has the expected structure
  const management = transcript?.management || {
    sentiment: 'neutral',
    confidence: 0.5,
    themes: [],
    content: 'No management content available'
  };
  
  const qa = transcript?.qa || {
    sentiment: 'neutral',
    confidence: 0.5,
    themes: [],
    content: 'No Q&A content available'
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sentimentColor = (sentiment) => {
    return sentiment === 'positive' ? 'text-green-600' : 
           sentiment === 'negative' ? 'text-red-600' : 'text-gray-600';
  };

  const sentimentIcon = (sentiment) => {
    return sentiment === 'positive' ? '😊' : 
           sentiment === 'negative' ? '😞' : '😐';
  };

  const renderContent = (content, section) => {
    if (!content) return <p className="text-gray-500 italic">No content available</p>;
    
    const previewLength = 300;
    const isExpanded = expandedSections[section];
    
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <AnimatePresence>
          {isExpanded ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="whitespace-pre-wrap text-gray-700 mb-3">{content}</div>
              <button 
                onClick={() => toggleSection(section)}
                className="text-blue-500 flex items-center text-sm"
              >
                <FaChevronUp className="mr-1" /> Show Less
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-gray-700 mb-3">
                {content.length > previewLength 
                  ? `${content.substring(0, previewLength)}...` 
                  : content}
              </p>
              {content.length > previewLength && (
                <button 
                  onClick={() => toggleSection(section)}
                  className="text-blue-500 flex items-center text-sm"
                >
                  <FaChevronDown className="mr-1" /> Show More
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-5 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-blue-800 flex items-center">
          <FaQuoteLeft className="mr-2 text-blue-500" />
          Transcript Analysis
        </h3>
        <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          <FaChartBar className="mr-1" />
          {transcript?.quarter || 'No Quarter'}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 font-medium flex items-center ${
            activeTab === 'management'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-blue-500'
          }`}
          onClick={() => setActiveTab('management')}
        >
          <FaComments className="mr-2" />
          Management Discussion
        </button>
        <button
          className={`px-4 py-2 font-medium flex items-center ${
            activeTab === 'qa'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-blue-500'
          }`}
          onClick={() => setActiveTab('qa')}
        >
          <FaComments className="mr-2" />
          Q&A Session
        </button>
      </div>

      {/* Content Area */}
      <div className="mb-6">
        {activeTab === 'management' ? (
          <div>
            <div className="flex items-center mb-4">
              <h4 className="font-medium text-gray-700">Sentiment:</h4>
              <span className={`ml-2 font-semibold ${sentimentColor(management.sentiment)}`}>
                {sentimentIcon(management.sentiment)} {management.sentiment} 
                <span className="text-gray-500 font-normal"> ({(management.confidence * 100).toFixed(0)}% confidence)</span>
              </span>
            </div>
            
            {management.themes?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Key Themes:</h4>
                <div className="flex flex-wrap gap-2">
                  {management.themes.map((theme, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <h4 className="font-medium text-gray-700 mb-2">Content Preview:</h4>
            {renderContent(management.content, 'management')}
          </div>
        ) : (
          <div>
            <div className="flex items-center mb-4">
              <h4 className="font-medium text-gray-700">Sentiment:</h4>
              <span className={`ml-2 font-semibold ${sentimentColor(qa.sentiment)}`}>
                {sentimentIcon(qa.sentiment)} {qa.sentiment} 
                <span className="text-gray-500 font-normal"> ({(qa.confidence * 100).toFixed(0)}% confidence)</span>
              </span>
            </div>
            
            {qa.themes?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Key Themes:</h4>
                <div className="flex flex-wrap gap-2">
                  {qa.themes.map((theme, index) => (
                    <span 
                      key={index} 
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <h4 className="font-medium text-gray-700 mb-2">Content Preview:</h4>
            {renderContent(qa.content, 'qa')}
          </div>
        )}
      </div>

      {/* Full Transcript Toggle */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-700 mb-2">Full Transcript:</h4>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm max-h-60 overflow-y-auto">
          <p className="text-gray-700 whitespace-pre-wrap">{transcript?.content || 'No full transcript available'}</p>
        </div>
      </div>
    </div>
  );
};

export default TranscriptViewer;