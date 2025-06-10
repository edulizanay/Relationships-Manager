'use client';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { INITIAL_CONTACTS, CIRCLE_CONFIGS, CATEGORY_COLORS, getCategoryColor } from '@/config/relationship';

// ============================================================================
// TYPES
// ============================================================================

interface Contact {
  id: number;
  name: string;
  categories: string[];
  position?: { x: number; y: number };
  velocity?: { x: number; y: number };
}

interface CircleConfig {
  name: string;
  color: string;
  angle: number;
}

interface AreaBoundary {
  type: 'circle' | 'intersection';
  centerX: number;
  centerY: number;
  radius: number;
  categories?: string[];
}

// ============================================================================
// CONSTANTS & UTILITIES
// ============================================================================

// Utility Functions
const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => 
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

// ============================================================================
// LAYOUT CALCULATION
// ============================================================================

const useLayoutCalculation = (containerRef: React.RefObject<HTMLDivElement | null>, radiusMultiplier: number, showContacts: boolean) => {
  const [layout, setLayout] = useState<any>(null);

  const calculateLayout = () => {
    if (!containerRef.current) return null;
    
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    
    const availableWidth = rect.width;
    const availableHeight = rect.height - 100; // Account for title
    const maxSize = Math.min(availableWidth, availableHeight);
    const triangleHeight = maxSize * 0.36;
    
    const triangleCenter = {
      x: availableWidth / 2,
      y: (availableHeight + 100) / 2
    };
    
    const centerToVertex = triangleHeight * (2/3);
    const circleRadius = triangleHeight * radiusMultiplier;
    const circleSize = circleRadius * 2;
    
    // Calculate circle positions
    const circles = CIRCLE_CONFIGS.reduce((acc, config) => {
      const centerX = triangleCenter.x + centerToVertex * Math.cos(config.angle);
      const centerY = triangleCenter.y + centerToVertex * Math.sin(config.angle);
      
      acc[config.name] = {
        left: centerX - circleRadius,
        top: centerY - circleRadius,
        center: { x: centerX, y: centerY },
        config
      };
      return acc;
    }, {} as any);
    
    return {
      circleSize,
      circleRadius,
      triangleHeight,
      circles
    };
  };

  useLayoutEffect(() => {
    if (!showContacts) return;
    
    const updateLayout = () => {
      const newLayout = calculateLayout();
      if (newLayout) {
        setLayout(newLayout);
      } else {
        // Fallback layout
        setLayout({
          circleSize: 160,
          circleRadius: 80,
          triangleHeight: 300,
          circles: {
            family: { left: 170, top: 50, center: { x: 250, y: 130 }, config: CIRCLE_CONFIGS[0] },
            friends: { left: 310, top: 180, center: { x: 390, y: 260 }, config: CIRCLE_CONFIGS[1] },
            work: { left: 30, top: 180, center: { x: 110, y: 260 }, config: CIRCLE_CONFIGS[2] }
          }
        });
      }
    };

    const timer = setTimeout(updateLayout, 100);
    return () => clearTimeout(timer);
  }, [showContacts]);

  useEffect(() => {
    if (!showContacts) return;
    
    const handleResize = () => {
      const timer = setTimeout(() => {
        const newLayout = calculateLayout();
        if (newLayout) setLayout(newLayout);
      }, 100);
      return () => clearTimeout(timer);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showContacts]);

  return layout;
};

// ============================================================================
// DRAG & DROP LOGIC
// ============================================================================

const useDragAndDrop = (layout: any, contacts: Contact[], setContacts: React.Dispatch<React.SetStateAction<Contact[]>>) => {
  const [draggedContact, setDraggedContact] = useState<Contact | null>(null);
  const [hoverZones, setHoverZones] = useState<string[]>([]);

  const getCirclesContainingPoint = (x: number, y: number) => {
    if (!layout) return [];
    
    return Object.entries(layout.circles)
      .filter(([_, circle]: [string, any]) => {
        const distance = calculateDistance(x, y, circle.center.x, circle.center.y);
        return distance <= layout.circleRadius;
      })
      .map(([name]) => name);
  };

  const handleDragStart = (e: React.DragEvent, contact: Contact) => {
    setDraggedContact(contact);
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDragEnd = () => {
    setDraggedContact(null);
    setHoverZones([]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedContact || !layout) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const zones = getCirclesContainingPoint(x, y);
    setHoverZones(zones);
  };

  const handleDragLeave = () => {
    setHoverZones([]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedContact || !layout) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const zones = getCirclesContainingPoint(x, y);
    
    if (zones.length > 0) {
      setContacts(prev => {
        const updatedContacts = prev.map(contact => 
          contact.id === draggedContact.id 
            ? { ...contact, categories: [...zones], position: undefined, velocity: undefined } // Reset physics state
            : contact
        );
        
        // Run physics simulation after contact update
        setTimeout(() => {
          const categorizedContacts = updatedContacts.filter(c => c.categories.length > 0);
          if (categorizedContacts.length > 0) {
            runPhysicsSimulation(categorizedContacts, layout);
            setContacts([...updatedContacts]); // Trigger re-render with updated positions
          }
        }, 50);
        
        return updatedContacts;
      });
    }
    
    setHoverZones([]);
    setDraggedContact(null);
  };

  return {
    draggedContact,
    hoverZones,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
};

// ============================================================================
// FORCE-BASED POSITIONING SYSTEM
// ============================================================================

const isPointInCircle = (pointX: number, pointY: number, centerX: number, centerY: number, radius: number) => {
  const distance = calculateDistance(pointX, pointY, centerX, centerY);
  return distance <= radius;
};

const getAreaBoundary = (categories: string[], layout: any): AreaBoundary | null => {
  if (!layout || categories.length === 0) return null;
  
  if (categories.length === 1) {
    // Single category - circular boundary
    const circle = layout.circles[categories[0]];
    return {
      type: 'circle',
      centerX: circle.center.x,
      centerY: circle.center.y,
      radius: layout.circleRadius * 0.8, // Slightly smaller to keep within visual bounds
    };
  } else {
    // Multi-category - intersection area
    const centers = categories.map(cat => layout.circles[cat].center);
    const avgX = centers.reduce((sum, c) => sum + c.x, 0) / centers.length;
    const avgY = centers.reduce((sum, c) => sum + c.y, 0) / centers.length;
    
    return {
      type: 'intersection',
      centerX: avgX,
      centerY: avgY,
      radius: layout.circleRadius * 0.4, // Smaller area for intersections
      categories: categories
    };
  }
};

const isPointInBoundary = (x: number, y: number, boundary: AreaBoundary | null, layout: any) => {
  if (!boundary) return false;
  
  if (boundary.type === 'circle') {
    return isPointInCircle(x, y, boundary.centerX, boundary.centerY, boundary.radius);
  } else if (boundary.type === 'intersection' && boundary.categories) {
    // For intersections, point must be within ALL relevant circles
    return boundary.categories.every((category: string) => {
      const circle = layout.circles[category];
      return isPointInCircle(x, y, circle.center.x, circle.center.y, layout.circleRadius);
    });
  }
  return false;
};

const calculateForces = (contact: Contact, allContacts: Contact[], layout: any) => {
  const boundary = getAreaBoundary(contact.categories, layout);
  if (!boundary) return { x: 0, y: 0 };
  
  const currentPos = contact.position || { x: boundary.centerX, y: boundary.centerY };
  let forceX = 0;
  let forceY = 0;
  
  // 1. Weak attraction to center (reduced strength)
  const centerForceStrength = 0.05;
  const toCenterX = boundary.centerX - currentPos.x;
  const toCenterY = boundary.centerY - currentPos.y;
  forceX += toCenterX * centerForceStrength;
  forceY += toCenterY * centerForceStrength;
  
  // 2. STRONG repulsion from other contacts in same area
  const sameAreaContacts = allContacts.filter(c => 
    c.id !== contact.id && 
    c.categories.length > 0 && 
    c.categories.sort().join('+') === contact.categories.sort().join('+') &&
    c.position
  );
  
  sameAreaContacts.forEach(other => {
    if (!other.position) return;
    const dx = currentPos.x - other.position.x;
    const dy = currentPos.y - other.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0 && distance < 120) { // Increased repulsion radius
      const repulsionStrength = 800 / (distance * distance); // Stronger repulsion
      forceX += (dx / distance) * repulsionStrength;
      forceY += (dy / distance) * repulsionStrength;
    }
  });
  
  // 3. NEW: Edge repulsion - push away from circle boundaries
  if (boundary.type === 'circle') {
    const distanceFromCenter = Math.sqrt(
      Math.pow(currentPos.x - boundary.centerX, 2) + 
      Math.pow(currentPos.y - boundary.centerY, 2)
    );
    
    const distanceFromEdge = boundary.radius - distanceFromCenter;
    
    // Apply edge repulsion when within 40px of the edge
    if (distanceFromEdge < 40 && distanceFromCenter > 0) {
      const edgeRepulsionStrength = 200 / (distanceFromEdge + 5); // Stronger near edge
      
      // Direction pointing inward (away from edge)
      const inwardX = (boundary.centerX - currentPos.x) / distanceFromCenter;
      const inwardY = (boundary.centerY - currentPos.y) / distanceFromCenter;
      
      forceX += inwardX * edgeRepulsionStrength;
      forceY += inwardY * edgeRepulsionStrength;
    }
  } else if (boundary.type === 'intersection' && boundary.categories) {
    // For intersections, check distance to each circle's edge
    boundary.categories.forEach((category: string) => {
      const circle = layout.circles[category];
      const distanceFromCenter = Math.sqrt(
        Math.pow(currentPos.x - circle.center.x, 2) + 
        Math.pow(currentPos.y - circle.center.y, 2)
      );
      
      const distanceFromEdge = layout.circleRadius - distanceFromCenter;
      
      // Apply edge repulsion for intersection areas
      if (distanceFromEdge < 30 && distanceFromCenter > 0) {
        const edgeRepulsionStrength = 150 / (distanceFromEdge + 3);
        
        // Direction pointing inward
        const inwardX = (circle.center.x - currentPos.x) / distanceFromCenter;
        const inwardY = (circle.center.y - currentPos.y) / distanceFromCenter;
        
        forceX += inwardX * edgeRepulsionStrength;
        forceY += inwardY * edgeRepulsionStrength;
      }
    });
  }
  
  // 4. Boundary constraint - strong push back if outside (safety net)
  if (!isPointInBoundary(currentPos.x, currentPos.y, boundary, layout)) {
    const pushBackStrength = 0.5;
    const backToCenterX = boundary.centerX - currentPos.x;
    const backToCenterY = boundary.centerY - currentPos.y;
    forceX += backToCenterX * pushBackStrength;
    forceY += backToCenterY * pushBackStrength;
  }
  
  return { x: forceX, y: forceY };
};

const runPhysicsSimulation = (contacts: Contact[], layout: any, maxIterations = 100) => {
  const categorizedContacts = contacts.filter(c => c.categories.length > 0);
  
  // Initialize positions if not set
  categorizedContacts.forEach(contact => {
    if (!contact.position) {
      const boundary = getAreaBoundary(contact.categories, layout);
      if (boundary) {
        // Add some randomization to avoid all starting at same point
        const randomOffset = 20;
        contact.position = {
          x: boundary.centerX + (Math.random() - 0.5) * randomOffset,
          y: boundary.centerY + (Math.random() - 0.5) * randomOffset
        };
      }
    }
  });
  
  // Run simulation
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let totalMovement = 0;
    
    const forces = categorizedContacts.map(contact => 
      calculateForces(contact, categorizedContacts, layout)
    );
    
    // Apply forces with damping
    const damping = 0.8;
    categorizedContacts.forEach((contact, index) => {
      const force = forces[index];
      const velocity = contact.velocity || { x: 0, y: 0 };
      
      // Update velocity
      velocity.x = (velocity.x + force.x) * damping;
      velocity.y = (velocity.y + force.y) * damping;
      
      // Update position
      if (contact.position) {
        contact.position.x += velocity.x;
        contact.position.y += velocity.y;
      }
      
      // Track movement for convergence
      totalMovement += Math.abs(velocity.x) + Math.abs(velocity.y);
      
      contact.velocity = velocity;
    });
    
    // Check for convergence
    if (totalMovement < 0.1) {
      console.log(`Physics simulation converged after ${iteration} iterations`);
      break;
    }
  }
  
  return categorizedContacts;
};

const getContactPosition = (contact: Contact, allContacts: Contact[], layout: any) => {
  if (!layout || contact.categories.length === 0) {
    return { left: '50%', top: '50%' };
  }
  
  // Use the position calculated by physics simulation
  if (contact.position) {
    return {
      left: `${contact.position.x - 25}px`,
      top: `${contact.position.y - 10}px`
    };
  }
  
  // Fallback to center if no position set yet
  const boundary = getAreaBoundary(contact.categories, layout);
  if (boundary) {
    return {
      left: `${boundary.centerX - 25}px`,
      top: `${boundary.centerY - 10}px`
    };
  }
  
  return { left: '50%', top: '50%' };
};

// ============================================================================
// COMPONENTS
// ============================================================================

const Circle = ({ name, circle, hoverZones, layout }: any) => {
  const isHovered = hoverZones.includes(name);
  const colorClass = `border-${circle.config.color}-400 bg-${circle.config.color}-100`;
  const hoverClass = isHovered ? 
    `bg-${circle.config.color}-200 border-${circle.config.color}-500 scale-105` : 
    'bg-opacity-40';
  
  return (
    <div 
      className={`absolute rounded-full border-4 transition-all duration-200 ${colorClass} ${hoverClass}`}
      style={{ 
        left: `${circle.left}px`,
        top: `${circle.top}px`,
        width: `${layout.circleSize}px`,
        height: `${layout.circleSize}px`
      }}
    >
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <div className={`font-semibold text-center text-sm text-${circle.config.color}-700 capitalize`}>
          {name}
        </div>
      </div>
    </div>
  );
};

const ContactChip = ({ contact, allContacts, layout, onDragStart, onDragEnd, isDragging }: any) => {
  const position = getContactPosition(contact, allContacts, layout);
  const colorClass = getCategoryColor(contact.categories);
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, contact)}
      onDragEnd={onDragEnd}
      className={`absolute text-xs px-3 py-1 rounded-full ${colorClass} transition-all duration-300 z-10 shadow-sm cursor-move hover:scale-105 ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={position}
    >
      {contact.name}
    </div>
  );
};

const DropIndicator = ({ draggedContact, hoverZones }: any) => {
  if (!draggedContact) return null;
  
  const hasZones = hoverZones.length > 0;
  const bgClass = hasZones ? 'bg-white' : 'bg-red-100';
  const textClass = hasZones ? 'text-gray-700' : 'text-red-700';
  const text = hasZones ? `Drop zone: ${hoverZones.join(' + ')}` : 'Outside circles';
  
  return (
    <div className={`absolute top-4 right-4 ${bgClass} bg-opacity-90 px-3 py-2 rounded-lg shadow-lg z-20`}>
      <div className={`text-sm font-medium ${textClass}`}>
        {text}
      </div>
    </div>
  );
};

const ContactList = ({ contacts, draggedContact, onDragStart, onDragEnd }: any) => {
  const uncategorizedContacts = contacts.filter((c: any) => c.categories.length === 0);
  
  return (
    <div className="w-80 bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-6 text-gray-800">Your Contacts</h3>
      
      <div className="space-y-3">
        {uncategorizedContacts.map((contact: any) => (
          <div
            key={contact.id}
            draggable
            onDragStart={(e) => onDragStart(e, contact)}
            onDragEnd={onDragEnd}
            className={`flex items-center p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors duration-150 ${
              draggedContact?.id === contact.id ? 'opacity-50' : ''
            }`}
          >
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-4"></div>
            <span className="text-gray-800 font-medium">{contact.name}</span>
          </div>
        ))}
        
        {uncategorizedContacts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>All contacts categorized!</p>
            <p className="text-sm mt-2">Great job organizing your relationships.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const RelationshipManager = () => {
  const [showContacts, setShowContacts] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const layout = useLayoutCalculation(containerRef, 0.8, showContacts);
  const dragAndDrop = useDragAndDrop(layout, contacts, setContacts);

  // Run physics simulation when layout changes or contacts are categorized
  useEffect(() => {
    if (!layout) return;
    
    const categorizedContacts = contacts.filter(c => c.categories.length > 0);
    if (categorizedContacts.length === 0) return;
    
    // Check if any contacts need physics simulation (no position set)
    const needsSimulation = categorizedContacts.some(c => !c.position);
    
    if (needsSimulation) {
      setTimeout(() => {
        runPhysicsSimulation(categorizedContacts, layout);
        setContacts([...contacts]); // Trigger re-render
      }, 100);
    }
  }, [layout, contacts]);

  const handleAddContacts = () => setShowContacts(true);

  if (!showContacts) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <button 
              onClick={handleAddContacts}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Add Contacts
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div>Calculating layout...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="flex h-screen gap-8">
        <div className="flex-1 flex flex-col">
          
          <div 
            className="relative flex-1 border-2 border-dashed border-gray-300 rounded-lg"
            ref={containerRef}
            onDragOver={dragAndDrop.handleDragOver}
            onDragLeave={dragAndDrop.handleDragLeave}
            onDrop={dragAndDrop.handleDrop}
          >
            {/* Render Circles */}
            {Object.entries(layout.circles).map(([name, circle]) => (
              <Circle 
                key={name}
                name={name}
                circle={circle}
                hoverZones={dragAndDrop.hoverZones}
                layout={layout}
              />
            ))}

            {/* Render Contact Chips */}
            {contacts
              .filter(c => c.categories.length > 0)
              .map(contact => (
                <ContactChip 
                  key={contact.id}
                  contact={contact}
                  allContacts={contacts}
                  layout={layout}
                  onDragStart={dragAndDrop.handleDragStart}
                  onDragEnd={dragAndDrop.handleDragEnd}
                  isDragging={dragAndDrop.draggedContact?.id === contact.id}
                />
              ))
            }

            {/* Drop Indicator */}
            <DropIndicator 
              draggedContact={dragAndDrop.draggedContact}
              hoverZones={dragAndDrop.hoverZones}
            />
          </div>
        </div>

        <ContactList 
          contacts={contacts}
          draggedContact={dragAndDrop.draggedContact}
          onDragStart={dragAndDrop.handleDragStart}
          onDragEnd={dragAndDrop.handleDragEnd}
        />
      </div>
    </div>
  );
};

export default RelationshipManager;