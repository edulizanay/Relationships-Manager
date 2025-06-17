'use client';
import React, { useState } from 'react';
import { Step, RelationshipColumns } from './shared/types';
import { INITIAL_PEOPLE, COLUMN_IDS } from './shared/constants';
import WelcomeStep from './steps/WelcomeStep';
import SortingStep from './steps/SortingStep';
import ReflectionStep from './steps/ReflectionStep';
import RelationshipDashboard from './steps/RelationshipDashboard';

const RelationshipManager: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');

  const [relationshipsByColumn, setRelationshipsByColumn] = useState<RelationshipColumns>({
    [COLUMN_IDS.UNCATEGORIZED]: INITIAL_PEOPLE.map(person => ({ ...person, category: null, relationshipStatus: null })),
    [COLUMN_IDS.FAMILY]: [],
    [COLUMN_IDS.FRIEND]: [],
    [COLUMN_IDS.WORK]: [],
  });

  // Single source of truth for navigation
  const handleNextStep = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('sorting');
        break;
      case 'sorting':
        setCurrentStep('reflection');
        break;
      case 'reflection':
        setCurrentStep('dashboard');
        break;
      case 'dashboard':
        setCurrentStep('welcome');
        break;
    }
  };

  const getStepLabel = () => {
    switch (currentStep) {
      case 'welcome': return 'Go to Sorting';
      case 'sorting': return 'Go to Reflection';
      case 'reflection': return 'Go to Dashboard';
      case 'dashboard': return 'Back to Welcome';
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Step Navigation Button */}
      <button
        onClick={handleNextStep}
        className="fixed bottom-4 right-4 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium shadow-lg hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 z-50"
      >
        {getStepLabel()}
      </button>

      {/* Current Step Content */}
      {currentStep === 'welcome' && (
        <WelcomeStep />
      )}
      {currentStep === 'reflection' && (
        <ReflectionStep relationshipsByColumn={relationshipsByColumn} />
      )}
      {currentStep === 'sorting' && (
        <SortingStep
          relationshipsByColumn={relationshipsByColumn}
          setRelationshipsByColumn={setRelationshipsByColumn}
        />
      )}
      {currentStep === 'dashboard' && (
        <RelationshipDashboard />
      )}
    </div>
  );
};

export default RelationshipManager; 