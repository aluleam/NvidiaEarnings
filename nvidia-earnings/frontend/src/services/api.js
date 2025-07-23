import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

export const fetchAnalysis = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/analysis`);
    return response.data;
  } catch (error) {
    // Helpful debugging info in console
    console.error('❌ Failed to fetch analysis:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error('Failed to fetch analysis data');
  }
};
