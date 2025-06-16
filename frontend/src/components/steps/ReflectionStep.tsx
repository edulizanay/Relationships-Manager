'use client';
import React, { useState, useMemo } from 'react';
import { RelationshipColumns, PersonForReflection, ReflectionQuestion } from '../shared/types';
import { RELATIONSHIP_STATUS_LABELS } from '../shared/constants';

// --- Constants ---

const REFLECTION_QUESTIONS: ReflectionQuestion[] = [
  { id: 1, text: "How did you meet this person?" },
  { id: 2, text: "What's your favorite memory with them?" },
  { id: 3, text: "When's the last time you spoke with them?" },
  { id: 4, text: "What do you have in common with them?" },
];

// --- Helper Components ---

const CategoryTag: React.FC<{ category: string }> = ({ category }) => {
  const getCategoryColor = () => {
    switch (category) {
      case 'Family': return 'bg-purple-100 text-purple-800';
      case 'Friend': return 'bg-green-100 text-green-800';
      case 'Work': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor()}`}>
      {category}
    </span>
  );
};

const StatusTag: React.FC<{ category: string; status: 'satisfied' | 'improve' }> = ({ category, status }) => {
  const getStatusColor = () => {
    if (status === 'improve') return 'bg-amber-100 text-amber-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusLabel = () => {
    const labels = RELATIONSHIP_STATUS_LABELS[category as keyof typeof RELATIONSHIP_STATUS_LABELS];
    return labels?.find(l => l.key === status)?.label || status;
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor()}`}>
      {getStatusLabel()}
    </span>
  );
};

const QuestionItem: React.FC<{ question: { id: number; text: string }; value: string; onChange: (value: string) => void }> = ({ question, value, onChange }) => (
  <div className="mb-6">
    <label className="block text-gray-700 text-sm font-semibold mb-2">
      {question.text}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-purple-500"
      rows={3}
      placeholder="Type your reflection here..."
    />
  </div>
);

// --- Main Component ---

interface ReflectionStepProps {
  relationshipsByColumn: RelationshipColumns;
}

const ReflectionStep: React.FC<ReflectionStepProps> = ({ relationshipsByColumn }) => {
  // Transform relationships into a flat list of people for reflection
  const peopleForReflection = useMemo(() => {
    const people: PersonForReflection[] = [];
    Object.entries(relationshipsByColumn).forEach(([category, relationships]) => {
      if (category !== 'Uncategorized') {
        relationships.forEach(rel => {
          if (rel.category && rel.relationshipStatus) {
            people.push({
              ...rel,
              reflectionAnswers: {}
            });
          }
        });
      }
    });
    return people;
  }, [relationshipsByColumn]);

  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Record<number, string>>>({});

  const currentPerson = peopleForReflection[currentPersonIndex];
  const currentAnswers = answers[currentPerson?.id] || {};

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentPerson.id]: {
        ...prev[currentPerson.id],
        [questionId]: value
      }
    }));
  };

  const handleNext = () => {
    if (currentPersonIndex < peopleForReflection.length - 1) {
      setCurrentPersonIndex(prev => prev + 1);
    }
  };

  if (!currentPerson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-amber-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No relationships to reflect on</h2>
          <p className="text-gray-600">Please categorize some relationships first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Progress indicator */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {currentPersonIndex + 1} of {peopleForReflection.length}
              </div>
              <div className="flex gap-2">
                <CategoryTag category={currentPerson.category!} />
                <StatusTag category={currentPerson.category!} status={currentPerson.relationshipStatus!} />
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left side - Person info */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">
                  {currentPerson.name}
                </h2>
                <div className="prose prose-purple">
                </div>
              </div>

              {/* Right side - Questions */}
              <div className="space-y-4">
                {REFLECTION_QUESTIONS.map(question => (
                  <QuestionItem
                    key={question.id}
                    question={question}
                    value={currentAnswers[question.id] || ''}
                    onChange={(value) => handleAnswerChange(question.id, value)}
                  />
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                disabled={currentPersonIndex === peopleForReflection.length - 1}
                className={`px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 transform hover:scale-105 ${
                  currentPersonIndex === peopleForReflection.length - 1
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {currentPersonIndex === peopleForReflection.length - 1 ? 'Complete' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReflectionStep; 