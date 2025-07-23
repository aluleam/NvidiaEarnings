import React from 'react';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800">
      <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-6 shadow-md">
        <h1 className="text-3xl font-bold tracking-tight text-center">NVIDIA Earnings Call Insights</h1>
      </header>
      <main className="container mx-auto p-6">
        <Dashboard />
      </main>
      <footer className="bg-gray-100 p-4 text-center text-sm text-gray-600 border-t">
        AI-powered financial analysis • {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;
