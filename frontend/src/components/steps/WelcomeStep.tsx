'use client';
import React from 'react';

interface WelcomeStepProps {
  onStart: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onStart }) => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
    <div className="text-center transform hover:scale-105 transition-transform duration-300">
      <div className="mb-8">
        <h1 className="text-5xl font-bold mb-4" style={{ background: 'linear-gradient(135deg, #6b4ba3 0%, #563d92 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Relationship Manager
        </h1>
        <p className="text-xl text-gray-600">Organize and nurture your meaningful connections</p>
      </div>
      <button onClick={onStart} className="px-12 py-4 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #f5c24c 0%, #e9c46a 100%)', color: '#563d92' }}>
        Start Organizing ✨
      </button>
    </div>
  </div>
);

export default WelcomeStep; 