/**
 * Physics utilities for spatial calculations, collision detection, and positioning algorithms.
 * 
 * This module contains physics-related functions for:
 * - Ball positioning and collision detection
 * - Spatial algorithms and geometric calculations
 * - Force simulations and boundary constraints
 * 
 * Future physics-related utilities should be added here.
 */

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
  
  interface CentralArea {
    width: number;
    height: number;
    x?: number;  // Center x position (defaults to viewport center)
    y?: number;  // Center y position (defaults to viewport center)
  }
  
  interface MovementPattern {
    animationPath: {
      x: number[];
      y: number[];
    };
    duration: number;
    delay: number;
  }
  
  /**
   * Generates optimal positions for balls around a central text area using collision detection
   * and spatial constraints. Uses an angular sweep algorithm to place balls without overlaps.
   * 
   * @param width - Viewport width
   * @param height - Viewport height
   * @param people - Array of people to position as balls
   * @param centralArea - Configuration for the central area to avoid (text, logo, etc.)
   * @returns Array of positioned ball nodes with x,y coordinates
   */
  export const generateBallPositions = (
    width: number, 
    height: number, 
    people: Person[] = [],
    centralArea?: CentralArea
  ): BallNode[] => {
    const centerX = centralArea?.x ?? width / 2;
    const centerY = centralArea?.y ?? height / 2;
    const textWidth = centralArea?.width ?? Math.min(400, width * 0.6);
    const textHeight = centralArea?.height ?? 80;
    const padding = 20;
    const angleStep = 5;
    const maxDistance = Math.min(width, height) * 0.4;
    
    // Convert people to balls with radius
    const ballsToPlace = people.map(person => ({
      ...person,
      radius: 25 + (person.urgencyLevel * 10),
      x: 0,
      y: 0
    }));
    
    const placedBalls: BallNode[] = [];
    const smallestBallRadius = Math.min(...ballsToPlace.map(b => b.radius));
    const distanceStep = smallestBallRadius / 2;
    
    // Helper functions
    const polarToCartesian = (distance: number, angleDegrees: number) => ({
      x: centerX + distance * Math.cos((angleDegrees * Math.PI) / 180),
      y: centerY + distance * Math.sin((angleDegrees * Math.PI) / 180)
    });
    
    const getBallToBallDistance = (x1: number, y1: number, x2: number, y2: number) => 
      Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    
    const getDistanceToRectangle = (pointX: number, pointY: number) => {
      const leftEdge = centerX - textWidth / 2;
      const rightEdge = centerX + textWidth / 2;
      const topEdge = centerY - textHeight / 2;
      const bottomEdge = centerY + textHeight / 2;
      
      const dx = Math.max(0, Math.max(leftEdge - pointX, pointX - rightEdge));
      const dy = Math.max(0, Math.max(topEdge - pointY, pointY - bottomEdge));
      
      return Math.sqrt(dx * dx + dy * dy);
    };
    
    const isValidPosition = (position: {x: number, y: number}, ballRadius: number) => {
      // Check if position is within screen bounds
      if (position.x - ballRadius < 50 || position.x + ballRadius > width - 50 ||
          position.y - ballRadius < 50 || position.y + ballRadius > height - 50) {
        return false;
      }
      
      // Check distance from text rectangle
      const distanceToText = getDistanceToRectangle(position.x, position.y);
      if (distanceToText < ballRadius + padding) {
        return false;
      }
      
      // Check collision with other balls
      for (const placedBall of placedBalls) {
        const distance = getBallToBallDistance(position.x, position.y, placedBall.x, placedBall.y);
        const minDistance = ballRadius + placedBall.radius + 10;
        if (distance < minDistance) {
          return false;
        }
      }
      
      return true;
    };
    
    // Place each ball using angular sweep algorithm
    for (const ball of ballsToPlace) {
      let placed = false;
      const startDistance = 100;
      
      for (let currentDistance = startDistance; currentDistance < maxDistance && !placed; currentDistance += distanceStep) {
        for (let angle = 0; angle < 360 && !placed; angle += angleStep) {
          const position = polarToCartesian(currentDistance, angle);
          
          if (isValidPosition(position, ball.radius)) {
            const placedBall: BallNode = {
              ...ball,
              x: position.x,
              y: position.y
            };
            placedBalls.push(placedBall);
            placed = true;
          }
        }
      }
      
      // Fallback: if we couldn't place the ball, place it at a safe distance
      if (!placed) {
        const fallbackDistance = startDistance + (placedBalls.length * 30);
        const fallbackAngle = (placedBalls.length * 45) % 360;
        const fallbackPosition = polarToCartesian(fallbackDistance, fallbackAngle);
        
        placedBalls.push({
          ...ball,
          x: fallbackPosition.x,
          y: fallbackPosition.y
        });
      }
    }
    
    return placedBalls;
  };
  
  /**
   * Generates stable movement patterns for floating balls using seeded randomization.
   * Each ball gets a unique but consistent movement pattern based on its ID.
   * 
   * @param ballId - Unique identifier for the ball (used for seeded randomization)
   * @param centerX - Ball's center X position
   * @param centerY - Ball's center Y position
   * @returns Movement pattern with animation paths, duration, and delay
   */
  export const generateMovementPattern = (
    ballId: string,
    centerX: number,
    centerY: number
  ): MovementPattern => {
    // Generate stable movement pattern based on ball ID (won't change on re-render)
    const seed = parseInt(ballId) || 1;
    const seededRandom = (offset: number) => {
      const x = Math.sin(seed * 9.973 + offset) * 10000;
      return x - Math.floor(x);
    };
    
    const movementRange = 8 + seededRandom(1) * 4; // 8-12px movement range
    const duration = 6 + seededRandom(2) * 4; // 6-10 second cycles
    const delay = seededRandom(3) * 3; // 0-3 second delay
    
    // Create stable random movement path
    const animationPath = {
      x: [
        centerX,
        centerX + (seededRandom(4) - 0.5) * movementRange * 2,
        centerX + (seededRandom(5) - 0.5) * movementRange * 2,
        centerX + (seededRandom(6) - 0.5) * movementRange * 2,
        centerX
      ],
      y: [
        centerY,
        centerY + (seededRandom(7) - 0.5) * movementRange * 2,
        centerY + (seededRandom(8) - 0.5) * movementRange * 2,
        centerY + (seededRandom(9) - 0.5) * movementRange * 2,
        centerY
      ]
    };
  
    return {
      animationPath,
      duration,
      delay
    };
  };