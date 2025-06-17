// API service for relationships data
export interface RelationshipApiResponse {
  id: string;
  name: string;
  urgencyLevel: number;
  context: string;
  ctaText: string;
}

const API_BASE_URL = 'http://localhost:3001/api';

export const relationshipsApi = {
  getRelationships: async (): Promise<RelationshipApiResponse[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/relationships`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching relationships:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to load relationships from server'
      );
    }
  }
}; 