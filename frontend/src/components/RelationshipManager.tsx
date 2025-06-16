'use client';
import React, { useState } from 'react';
import { Step, RelationshipColumns } from './shared/types';
import { INITIAL_PEOPLE, COLUMN_IDS } from './shared/constants';
import WelcomeStep from './steps/WelcomeStep';
import SortingStep from './steps/SortingStep';
import ReflectionStep from './steps/ReflectionStep';

const RelationshipManager: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');

  const [relationshipsByColumn, setRelationshipsByColumn] = useState<RelationshipColumns>({
    [COLUMN_IDS.UNCATEGORIZED]: INITIAL_PEOPLE.map(person => ({ ...person, category: null, relationshipStatus: null })),
    [COLUMN_IDS.FAMILY]: [],
    [COLUMN_IDS.FRIEND]: [],
    [COLUMN_IDS.WORK]: [],
  });

  const handleStart = () => setCurrentStep('sorting');
  const handleSubmit = () => setCurrentStep('reflection');

  switch (currentStep) {
    case 'welcome':
      return <WelcomeStep onStart={handleStart} />;
    case 'reflection':
      return <ReflectionStep relationshipsByColumn={relationshipsByColumn} />;
    case 'sorting':
    default:
      return (
        <SortingStep
          relationshipsByColumn={relationshipsByColumn}
          setRelationshipsByColumn={setRelationshipsByColumn}
          onSubmit={handleSubmit}
        />
      );
  }
};

export default RelationshipManager; 