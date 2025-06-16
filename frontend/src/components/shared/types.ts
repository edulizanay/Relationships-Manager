export interface Relationship {
  id: number;
  name: string;
  category: string | null;
  relationshipStatus: 'satisfied' | 'improve' | null;
}

export type Step = 'welcome' | 'sorting' | 'reflection';
export type RelationshipColumns = Record<string, Relationship[]>;
export type RoundingSide = 'left' | 'right' | 'full' | 'none';

// Reflection Step Types
export interface ReflectionQuestion {
  id: number;
  text: string;
}

export interface PersonForReflection extends Relationship {
  reflectionAnswers?: Record<number, string>; // questionId -> answer
}

// Removed REFLECTION_QUESTIONS as it's now in ReflectionStep.tsx 