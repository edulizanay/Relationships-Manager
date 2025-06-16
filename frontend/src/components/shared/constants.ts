export const RELATIONSHIP_CATEGORIES = {
  Family: { 
    name: 'Family', 
    bgColor: '#f7f5fa',
    laneColors: { improve: '#f5c24c1A', satisfied: '#84a98c1A' }
  },
  Friend: { 
    name: 'Friend', 
    bgColor: '#f6faf7',
    laneColors: { improve: '#f5c24c1A', satisfied: '#84a98c1A' }
  },
  Work: { 
    name: 'Work', 
    bgColor: '#fffcf2',
    laneColors: { improve: '#f5c24c1A', satisfied: '#84a98c1A' }
  }
};

export const INITIAL_PEOPLE = [
  { id: 1, name: "Mom" }, { id: 2, name: "Dad" }, { id: 3, name: "Tomás" },
  { id: 4, name: "Laurine" }, { id: 5, name: "Joaquín" }, { id: 6, name: "Rodrigo Orpis" },
  { id: 7, name: "Javier Ferraz" }, { id: 8, name: "Javier Cabrera" }
];

export const RELATIONSHIP_STATUS_LABELS = {
  Family: [{ key: 'satisfied', label: 'This is right' }, { key: 'improve', label: 'Want to be closer' }],
  Friend: [{ key: 'satisfied', label: 'Great spot' }, { key: 'improve', label: 'I miss them' }],
  Work: [{ key: 'satisfied', label: 'Great as it is' }, { key: 'improve', label: 'Want to nurture' }]
};

export const COLUMN_IDS = {
  UNCATEGORIZED: 'Uncategorized',
  FAMILY: 'Family',
  FRIEND: 'Friend',
  WORK: 'Work',
} as const; 