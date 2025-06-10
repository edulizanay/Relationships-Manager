import { Contact, CircleConfig } from '../types/relationship';

export const INITIAL_CONTACTS: Contact[] = [
  { id: 1, name: "Mom", categories: [] },
  { id: 2, name: "Dad", categories: [] },
  { id: 3, name: "Tomás", categories: [] },
  { id: 4, name: "Laurine", categories: [] },
  { id: 5, name: "Joaquín", categories: [] },
  { id: 6, name: "Rodrigo Orpis", categories: [] },
  { id: 7, name: "Javier Ferraz", categories: [] },
  { id: 8, name: "Javier Cabrera", categories: [] }
];

export const CIRCLE_CONFIGS: CircleConfig[] = [
  { name: 'family', color: 'rose', angle: -Math.PI/2 },    // Top (270°)
  { name: 'friends', color: 'emerald', angle: Math.PI/6 },   // Bottom-right (30°)
  { name: 'work', color: 'sky', angle: 5*Math.PI/6 }      // Bottom-left (150°)
];

// Updated with more vibrant colors
export const CATEGORY_COLORS = {
  'family+friends+work': 'bg-purple-400 text-purple-900',
  'family+friends': 'bg-orange-400 text-orange-900',
  'family+work': 'bg-yellow-400 text-yellow-900',
  'friends+work': 'bg-teal-400 text-teal-900',
  'family': 'bg-rose-400 text-rose-900',
  'friends': 'bg-emerald-400 text-emerald-900',
  'work': 'bg-sky-400 text-sky-900'
} as const;

// Utility function for category colors
export const getCategoryColor = (categories: string[]) => {
  const key = categories.sort().join('+');
  return CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS] || 'bg-gray-400 text-gray-900';
}; 