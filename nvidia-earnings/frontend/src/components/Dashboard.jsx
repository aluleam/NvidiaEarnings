import React, { useState, useEffect } from 'react';
import SentimentChart from './SentimentChart';
import ToneChangeChart from './ToneChangeChart';
import QuarterSelector from './QuarterSelector';
import StrategicFocus from './StrategicFocus';
import TranscriptViewer from './TranscriptViewer';
import { fetchAnalysis } from '../services/api';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getAnalysisData = async () => {
      try {
        setLoading(true);
        const analysisData = await fetchAnalysis();
        if (!Array.isArray(analysisData) || analysisData.length === 0) {
          throw new Error('No data returned from API.');
        }
        setData(analysisData);
        setSelectedQuarter(analysisData[0]);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load analysis data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getAnalysisData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg text-blue-700 font-medium">Analyzing earnings calls...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-blue-800 mb-4">📈 Sentiment Analysis</h2>
          <SentimentChart data={data} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-blue-800 mb-4">📊 Tone Change Quarter-over-Quarter</h2>
          <ToneChangeChart data={data} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <QuarterSelector
          quarters={data}
          selected={selectedQuarter}
          onSelect={setSelectedQuarter}
        />
      </div>

      {selectedQuarter && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <StrategicFocus quarter={selectedQuarter} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <TranscriptViewer transcript={selectedQuarter} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
