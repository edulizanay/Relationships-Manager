'use client';
import React, { useState } from 'react';
import { Step } from './shared/types';
import SortingStep from './steps/SortingStep';
import ReflectionStep from './steps/ReflectionStep';
import RelationshipDashboard from './steps/RelationshipDashboard';

const RelationshipManager: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('dashboard');

  // Simple navigation handler
  const handleNavigate = (step: Step) => {
    setCurrentStep(step);
  };

  // Debug helper - can be removed in production
  const getStepInfo = () => {
    return `Current Step: ${currentStep}`;
  };

  return (
    <div className="relative min-h-screen">
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 bg-black text-white p-2 rounded text-xs z-50">
          {getStepInfo()}
        </div>
      )}

      {/* Current Step Content */}
      {currentStep === 'dashboard' && (
        <RelationshipDashboard onNavigate={handleNavigate} />
      )}
      {currentStep === 'sorting' && (
        <SortingStep onNavigate={handleNavigate} />
      )}
      {currentStep === 'reflection' && (
        <ReflectionStep onNavigate={handleNavigate} />
      )}
      {currentStep === 'contacts' && (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Management</h2>
            <p className="text-gray-600 mb-6">Redirecting to contact management page...</p>
            <button 
              onClick={() => window.location.href = '/contacts'} 
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Go to Contacts
            </button>
            <button 
              onClick={() => handleNavigate('dashboard')} 
              className="ml-4 px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelationshipManager;