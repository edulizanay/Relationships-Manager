'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateBallPositions, generateMovementPattern } from '../../utils/physics';
import { relationshipsApi } from '../../services/relationshipsApi';
import { Step } from '../shared/types';

// --- Types ---
interface Person {
  id: string;
  name: string;
  urgencyLevel: number;
  context: string;
  ctaText: string;
}

interface BallNode {
  id: string;
  name: string;
  urgencyLevel: number;
  context: string;
  ctaText: string;
  radius: number;
  x: number;
  y: number;
}

interface RelationshipDashboardProps {
  onNavigate: (step: Step) => void;
}

// --- Helper Functions ---
// Physics-related utilities moved to /src/utils/physics.ts

// --- Floating Action Components ---
const FloatingButton: React.FC<{
  onClick: () => void;
  tooltip: string;
  className: string;
  children: React.ReactNode;
  badge?: number;
}> = ({ onClick, tooltip, className, children, badge }) => {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className={`${className} relative transition-all duration-200 transform hover:scale-110`}
      >
        {children}
        {badge && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {badge}
          </span>
        )}
      </button>
      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 -translate-x-full bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        {tooltip}
      </div>
    </div>
  );
};

const FloatingActions: React.FC<{
  onNavigate: (step: Step) => void;
  unsortedCount: number;
}> = ({ onNavigate, unsortedCount }) => {
  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="flex flex-col gap-3">
        {/* Add Contact Icon */}
        <FloatingButton 
          onClick={() => onNavigate('contacts')} 
          tooltip="Add Contact"
          className="w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </FloatingButton>
        
        {/* Edit/Manage Icon */}
        <FloatingButton 
          onClick={() => onNavigate('contacts')} 
          tooltip="Manage Contacts"
          className="w-12 h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </FloatingButton>
        
        {/* Sort Icon - Only show if unsorted contacts exist */}
        {unsortedCount > 0 && (
          <FloatingButton 
            onClick={() => onNavigate('sorting')} 
            tooltip={`Sort ${unsortedCount} New Contacts`}
            className="w-12 h-12 bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center relative"
            badge={unsortedCount}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
            </svg>
          </FloatingButton>
        )}
      </div>
    </div>
  );
};

// --- Components ---
const SidePanel: React.FC<{
  visible: boolean;
  person: BallNode | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({ visible, person, onMouseEnter, onMouseLeave }) => {
  if (!person) return null;

  const getCategoryColor = () => {
    switch (person.name) {
      case 'Dad':
      case 'Mom':
      case 'Grandma':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Alex':
      case 'Sarah':
      case 'Carlos':
      case 'Nina':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getPrimaryCTA = () => {
    switch (person.ctaText) {
      case "Send a quick text":
      case "Ask how it went":
      case "Reply with laugh":
        return { text: person.ctaText, icon: "📱", medium: "WhatsApp" };
      case "Schedule a call":
      case "Call now":
        return { text: person.ctaText, icon: "📞", medium: "Phone" };
      case "Plan a meetup":
      case "Schedule meetup":
      case "Plan celebration":
        return { text: person.ctaText, icon: "📍", medium: "Calendar" };
      default:
        return { text: person.ctaText, icon: "📱", medium: "WhatsApp" };
    }
  };

  const primaryCTA = getPrimaryCTA();

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/2 z-40 pointer-events-none"
          />
          
          {/* Side Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-1/2 -translate-y-1/2 w-full max-w-96 bg-white rounded-l-2xl shadow-2xl border-l border-gray-200 z-50 overflow-hidden"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <motion.div
                key={`header-${person.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <motion.h2 
                  className="text-2xl font-bold text-gray-900"
                  layoutId={`name-${person.id}`}
                >
                  {person.name}
                </motion.h2>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getCategoryColor()}`}>
                  {person.urgencyLevel >= 4 ? 'High Priority' : person.urgencyLevel >= 3 ? 'Medium Priority' : 'Low Priority'}
                </span>
              </motion.div>

              {/* Context */}
              <motion.div
                key={`context-${person.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="space-y-2"
              >
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">What&apos;s happening</h3>
                <p className="text-gray-700 leading-relaxed">{person.context}</p>
              </motion.div>

              {/* Primary CTA */}
              <motion.div
                key={`primary-cta-${person.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-3">
                  <span className="text-lg">{primaryCTA.icon}</span>
                  <span>{primaryCTA.text}</span>
                  <span className="text-xs bg-purple-500 px-2 py-1 rounded">{primaryCTA.medium}</span>
                </button>
              </motion.div>

              {/* Secondary CTAs */}
              <motion.div
                key={`secondary-ctas-${person.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="grid grid-cols-1 gap-3"
              >
                <button className="flex items-center justify-start gap-3 py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-gray-200">
                  <span>✏️</span>
                  <span className="font-medium">Add quick note</span>
                </button>
                
                <button className="flex items-center justify-start gap-3 py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-gray-200">
                  <span>⏰</span>
                  <span className="font-medium">Set reminder</span>
                </button>
                
                <button className="flex items-center justify-start gap-3 py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-gray-200">
                  <span>✅</span>
                  <span className="font-medium">Mark as contacted</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Ball: React.FC<{ 
  node: BallNode; 
  isSelected: boolean;
  onClick: (id: string) => void;
}> = ({ node, isSelected, onClick }) => {
  const size = node.radius * 2;
  const strokeWidth = 2;
  
  // Get movement pattern from physics
  const { animationPath, duration, delay } = generateMovementPattern(node.id, node.x, node.y);

  return (
    <motion.g
      initial={{ x: node.x, y: node.y }}
      animate={animationPath}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
    >
      <motion.g
        initial={{ scale: 1 }}
        animate={{ scale: isSelected ? 1.15 : 1 }}
        transition={{ duration: 0.2 }}
        style={{ cursor: 'pointer' }}
        onClick={() => onClick(node.id)}
      >
        {/* Ball */}
        <circle
          r={size / 2}
          strokeWidth={strokeWidth}
          className="fill-purple-400 stroke-purple-600 transition-colors duration-200"
        />
        
        {/* Photo/Initials */}
        <circle
          r={size * 0.4}
          className="fill-white"
        />
        <text
          className="text-sm font-semibold fill-gray-800"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {node.name[0]}
        </text>
      </motion.g>
    </motion.g>
  );
};

// --- Main Component ---
const RelationshipDashboard: React.FC<RelationshipDashboardProps> = ({ onNavigate }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [nodes, setNodes] = useState<BallNode[]>([]);
  const [selectedBallId, setSelectedBallId] = useState<string | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  
  // API state management
  const [relationships, setRelationships] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unsortedCount, setUnsortedCount] = useState(0);

  // Fetch relationships data
  const fetchRelationships = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await relationshipsApi.getRelationships();
      setRelationships(data);
      
      // Calculate unsorted count (contacts without relationshipType)
      // For now, we'll assume all contacts are sorted since we don't have relationshipType in the API response
      // This will be updated when we implement the sorting functionality
      setUnsortedCount(0);
    } catch (err) {
      console.error('Failed to fetch relationships:', err);
      setError(err instanceof Error ? err.message : 'Failed to load relationships');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load relationships on component mount
  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  // Initialize and handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      setDimensions({ width: newWidth, height: newHeight });
      
      if (newWidth > 0 && newHeight > 0 && relationships.length > 0) {
        // Configure the central text area
        const centralArea = {
          width: Math.min(400, newWidth * 0.6),
          height: 80
        };
        
        setNodes(generateBallPositions(newWidth, newHeight, relationships, centralArea));
      }
    };

    // Initial setup
    updateDimensions();

    // Add resize listener with debounce
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateDimensions, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [relationships]);

  // Click-based interaction
  const handleBallClick = useCallback((ballId: string) => {
    if (selectedBallId === ballId && panelVisible) {
      // Clicking the same ball closes the panel
      setSelectedBallId(null);
      setPanelVisible(false);
    } else {
      // Select new ball and show panel
      setSelectedBallId(ballId);
      setPanelVisible(true);
    }
  }, [selectedBallId, panelVisible]);

  // Close panel when clicking outside
  const handleBackgroundClick = useCallback(() => {
    setSelectedBallId(null);
    setPanelVisible(false);
  }, []);

  const selectedPerson = selectedBallId ? nodes.find(node => node.id === selectedBallId) || null : null;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-lg mb-4">Loading your relationships...</div>
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
          <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchRelationships} 
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (relationships.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Relationship Manager</h2>
          <p className="text-gray-600 mb-6">Start by adding your first contacts</p>
          <button 
            onClick={() => onNavigate('contacts')} 
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            Add Your First Contact
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while dimensions are being calculated
  if (dimensions.width === 0 || dimensions.height === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50">
      {/* Background click handler */}
      <div 
        className="absolute inset-0 z-0"
        onClick={handleBackgroundClick}
      />
      
      {/* Floating Action Panel */}
      <FloatingActions onNavigate={onNavigate} unsortedCount={unsortedCount} />
      
      {/* SVG - Full Screen */}
      <svg className="w-screen h-screen relative z-10 pointer-events-none">
        {/* Center Text */}
        <text
          x={dimensions.width / 2}
          y={dimensions.height / 2 - 10}
          className="text-4xl font-bold fill-gray-900"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {relationships.length} people miss you
        </text>

        {/* Balls */}
        <g className="pointer-events-auto">
          {nodes.map(node => (
            <Ball 
              key={node.id} 
              node={node} 
              isSelected={selectedBallId === node.id}
              onClick={handleBallClick}
            />
          ))}
        </g>
      </svg>

      {/* Side Panel */}
      <SidePanel
        visible={panelVisible}
        person={selectedPerson}
        onMouseEnter={() => {}}
        onMouseLeave={() => {}}
      />
    </div>
  );
};

export default RelationshipDashboard;