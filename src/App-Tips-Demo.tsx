import React from 'react';
import { TipsPage } from './pages/TipsPage';
import './index.css';

function App() {
  return (
    <div className="App">
      <nav className="bg-blue-900 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">BDBT</h1>
          <div className="flex gap-6">
            <a href="#" className="hover:text-blue-200">Home</a>
            <a href="#" className="hover:text-blue-200">About</a>
            <a href="#" className="text-blue-200 font-semibold">Tips</a>
            <a href="#" className="hover:text-blue-200">Blueprint</a>
            <a href="#" className="hover:text-blue-200">Podcast</a>
            <a href="#" className="hover:text-blue-200">Daily Wins</a>
            <a href="#" className="hover:text-blue-200">Partnership</a>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
              Get Started
            </button>
          </div>
        </div>
      </nav>
      <TipsPage />
    </div>
  );
}

export default App;