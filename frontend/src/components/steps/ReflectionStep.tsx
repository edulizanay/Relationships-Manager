'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Step } from '../shared/types';
import { contactsApi } from '../../services/contactsApi';
import { Contact } from '../../types/contact';

// --- Types ---
interface ReflectionStepProps {
  onNavigate: (step: Step) => void;
}

// --- Constants ---

const QUESTION_SETS = [
  [
    { id: 1, text: "How did you meet this person?" },
    { id: 2, text: "What's your favorite memory with them?" },
    { id: 3, text: "When's the last time you spoke with them?" },
    { id: 4, text: "What do you have in common with them?" },
  ],
  [
    { id: 5, text: "What qualities do you admire most about them?" },
    { id: 6, text: "How has your relationship evolved over time?" },
    { id: 7, text: "What's something you'd like to do together in the future?" },
    { id: 8, text: "What makes this relationship special to you?" },
  ]
];

// Mock AI Insights with categories and timing
const INSIGHT_CATEGORIES = {
  connection: { color: 'bg-purple-100 text-purple-800', label: 'Connection' },
  location: { color: 'bg-blue-100 text-blue-800', label: 'Location' },
  frequency: { color: 'bg-green-100 text-green-800', label: 'Frequency' },
  sentiment: { color: 'bg-amber-100 text-amber-800', label: 'Sentiment' },
  history: { color: 'bg-rose-100 text-rose-800', label: 'History' },
} as const;

const MOCK_INSIGHTS = [
  { id: 1, text: 'Met in college', category: 'history', delay: 0 },
  { id: 2, text: 'Close friend', category: 'connection', delay: 1 },
  { id: 3, text: 'Lives in Madrid', category: 'location', delay: 2 },
  { id: 4, text: 'Monthly catch-ups', category: 'frequency', delay: 3 },
  { id: 5, text: 'Shared love for music', category: 'connection', delay: 4 },
  { id: 6, text: 'Positive relationship', category: 'sentiment', delay: 5 },
  { id: 7, text: 'Known for 5+ years', category: 'history', delay: 6 },
] as const;

// --- Helper Components ---

const CategoryTag: React.FC<{ category: string }> = ({ category }) => {
  const getCategoryColor = () => {
    switch (category) {
      case 'family': return 'bg-purple-100 text-purple-800';
      case 'friend': return 'bg-green-100 text-green-800';
      case 'work': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor()}`}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
};

const UrgencyTag: React.FC<{ urgencyLevel: number }> = ({ urgencyLevel }) => {
  const getUrgencyColor = () => {
    if (urgencyLevel >= 4) return 'bg-amber-100 text-amber-800';
    if (urgencyLevel >= 2) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getUrgencyLabel = () => {
    if (urgencyLevel >= 4) return 'High Priority';
    if (urgencyLevel >= 2) return 'Medium Priority';
    return 'Low Priority';
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getUrgencyColor()}`}>
      {getUrgencyLabel()}
    </span>
  );
};

const InsightTag: React.FC<{ 
  text: string; 
  category: keyof typeof INSIGHT_CATEGORIES;
  isVisible: boolean;
}> = ({ text, category, isVisible }) => {
  const { color, label } = INSIGHT_CATEGORIES[category];
  
  return (
    <div 
      className={`transition-all duration-500 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${color} shadow-sm`}>
        <span className="text-xs font-medium opacity-75">{label}</span>
        <span className="text-sm font-semibold">{text}</span>
      </div>
    </div>
  );
};

const PromptItem: React.FC<{ 
  question: string; 
  personName: string;
  isTransitioning: boolean;
}> = ({ question, personName, isTransitioning }) => (
  <div 
    className={`p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 ${
      isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
    }`}
  >
    <p className="text-gray-700 font-medium">
      {question.replace('this person', personName)}
    </p>
  </div>
);

const EmptyInsightsState: React.FC = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-16 h-16 text-purple-200">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    </div>
  </div>
);

// --- Main Component ---

const ReflectionStep: React.FC<ReflectionStepProps> = ({ onNavigate }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
  const [visibleInsights, setVisibleInsights] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentQuestionSet, setCurrentQuestionSet] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch categorized contacts from API
  const fetchCategorizedContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allContacts = await contactsApi.getAllContacts();
      // Filter to only contacts with relationshipType set
      const categorized = allContacts.filter((contact: Contact) => contact.relationshipType);
      setContacts(categorized);
    } catch (err) {
      console.error('Failed to fetch categorized contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategorizedContacts();
  }, [fetchCategorizedContacts]);

  const currentPerson = contacts[currentPersonIndex];
  const currentQuestions = QUESTION_SETS[currentQuestionSet];

  const handleNext = () => {
    if (currentPersonIndex < contacts.length - 1) {
      setCurrentPersonIndex(prev => prev + 1);
      setVisibleInsights([]);
      setIsAnimating(false);
      setCurrentQuestionSet(0);
    }
  };

  const handleStepAnimation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setVisibleInsights([]);
    
    MOCK_INSIGHTS.forEach((insight) => {
      setTimeout(() => {
        setVisibleInsights(prev => [...prev, insight.id]);
      }, insight.delay * 1000);
    });
  };

  const handleMoreQuestions = () => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      // Cycle to next question set (0 -> 1 -> 0 -> 1...)
      setCurrentQuestionSet(prev => (prev + 1) % QUESTION_SETS.length);
      setIsTransitioning(false);
    }, 150); // Half of the transition duration
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-lg mb-4">Loading contacts for reflection...</div>
          <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Contacts</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchCategorizedContacts} 
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="ml-4 px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Empty state - no categorized contacts
  if (contacts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No contacts to reflect on</h2>
          <p className="text-gray-600 mb-6">Please categorize some contacts first.</p>
          <button 
            onClick={() => onNavigate('sorting')} 
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            Go to Sorting
          </button>
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="ml-4 px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Progress indicator */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {currentPersonIndex + 1} of {contacts.length}
              </div>
              <div className="flex gap-2">
                <CategoryTag category={currentPerson.relationshipType!} />
                <UrgencyTag urgencyLevel={currentPerson.urgencyLevel || 1} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Left side - Conversation Prompts */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Let&apos;s talk about {currentPerson.name}
              </h2>
              
              {/* Question Slots - Always 4 slots */}
              <div className="space-y-6">
                {currentQuestions.map((question, index) => (
                  <PromptItem 
                    key={`${currentQuestionSet}-${index}`}
                    question={question.text}
                    personName={currentPerson.name}
                    isTransitioning={isTransitioning}
                  />
                ))}
                
                {/* More Button */}
                <div className="pt-4">
                  <button
                    onClick={handleMoreQuestions}
                    disabled={isTransitioning}
                    className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-300 transform hover:scale-[1.02] ${
                      isTransitioning
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {isTransitioning ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      'More'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right side - AI Insights */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">AI Insights</h3>
                <button
                  onClick={handleStepAnimation}
                  disabled={isAnimating}
                  className={`px-6 py-3 rounded-xl font-medium text-white transition-all duration-200 transform hover:scale-[1.02] shadow-lg ${
                    isAnimating 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {isAnimating ? 'Processing...' : 'Generate Insights'}
                </button>
              </div>
              
              <div className="space-y-4">
                {visibleInsights.length === 0 ? (
                  <EmptyInsightsState />
                ) : (
                  MOCK_INSIGHTS.map(insight => (
                    <InsightTag
                      key={insight.id}
                      text={insight.text}
                      category={insight.category}
                      isVisible={visibleInsights.includes(insight.id)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className={`px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 transform hover:scale-105 ${
                  currentPersonIndex === contacts.length - 1
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {currentPersonIndex === contacts.length - 1 ? 'Complete' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReflectionStep;