'use client';
import React from 'react';

const WelcomeStep: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-amber-50">
      <div className="max-w-2xl mx-auto text-center p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to Relationship Manager
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Let's take a moment to reflect on your relationships and strengthen the connections that matter.
        </p>
        <button
          onClick={() => {}}
          className="px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-purple-700 transition-all duration-200 transform hover:scale-105"
        >
          Add new relationships
        </button>
      </div>
    </div>
  );
};

export default WelcomeStep; 