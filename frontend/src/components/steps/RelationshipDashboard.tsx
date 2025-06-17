'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateBallPositions, generateMovementPattern } from '../../utils/physics';

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
}

// --- Mock Data ---
const MOCK_PEOPLE: Person[] = [
  {
    id: '1',
    name: 'Dad',
    urgencyLevel: 5,
    context: "Haven't talked in 3 months",
    ctaText: "Send a quick text"
  },
  {
    id: '2',
    name: 'Mom',
    urgencyLevel: 4,
    context: "Last call was 2 weeks ago",
    ctaText: "Schedule a call"
  },
  {
    id: '3',
    name: 'Tomás',
    urgencyLevel: 3,
    context: "Missed his birthday last week",
    ctaText: "Send belated wishes"
  },
  {
    id: '4',
    name: 'Laurine',
    urgencyLevel: 5,
    context: "Haven't seen in 6 months",
    ctaText: "Plan a meetup"
  },
  {
    id: '5',
    name: 'Grandma',
    urgencyLevel: 4,
    context: "Weekly call missed",
    ctaText: "Call now"
  },
  {
    id: '6',
    name: 'Alex',
    urgencyLevel: 2,
    context: "Last message 2 days ago",
    ctaText: "Continue conversation"
  },
  {
    id: '7',
    name: 'Sarah',
    urgencyLevel: 3,
    context: "Birthday coming up",
    ctaText: "Plan celebration"
  },
  {
    id: '8',
    name: 'Uncle John',
    urgencyLevel: 1,
    context: "Regular monthly check-in due",
    ctaText: "Schedule call"
  },
  {
    id: '9',
    name: 'Emma',
    urgencyLevel: 4,
    context: "Job interview yesterday",
    ctaText: "Ask how it went"
  },
  {
    id: '10',
    name: 'Carlos',
    urgencyLevel: 2,
    context: "Shared funny meme",
    ctaText: "Reply with laugh"
  },
  {
    id: '11',
    name: 'Jessica',
    urgencyLevel: 5,
    context: "Going through divorce",
    ctaText: "Check in on her"
  },
  {
    id: '12',
    name: 'Mike',
    urgencyLevel: 3,
    context: "New baby last month",
    ctaText: "Congratulate him"
  },
  {
    id: '13',
    name: 'Lisa',
    urgencyLevel: 1,
    context: "Regular coffee date",
    ctaText: "Schedule meetup"
  },
  {
    id: '14',
    name: 'Kevin',
    urgencyLevel: 4,
    context: "Started new job",
    ctaText: "Ask about work"
  },
  {
    id: '15',
    name: 'Nina',
    urgencyLevel: 2,
    context: "Concert next week",
    ctaText: "Discuss plans"
  },
  {
    id: '16',
    name: 'Roberto',
    urgencyLevel: 3,
    context: "Moving to new city",
    ctaText: "Offer help"
  }
];

// --- Helper Functions ---
// Physics-related utilities moved to /src/utils/physics.ts

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
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">What's happening</h3>
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
const RelationshipDashboard: React.FC<RelationshipDashboardProps> = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [nodes, setNodes] = useState<BallNode[]>([]);
  const [selectedBallId, setSelectedBallId] = useState<string | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);

  // Initialize and handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      setDimensions({ width: newWidth, height: newHeight });
      
      if (newWidth > 0 && newHeight > 0) {
        // Configure the central text area
        const centralArea = {
          width: Math.min(400, newWidth * 0.6),
          height: 80
        };
        
        setNodes(generateBallPositions(newWidth, newHeight, MOCK_PEOPLE, centralArea));
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
  }, []);

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
          {MOCK_PEOPLE.length} people miss you
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