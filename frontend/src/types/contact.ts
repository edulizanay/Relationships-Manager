export interface Contact {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  lastContactDate?: string;
  lastContactMethod?: ContactMethod;
  relationshipType: RelationshipType;
  notes?: string;
  urgencyLevel: number;
  frequency: Frequency;
  createdAt: string;
  updatedAt: string;
}

export type ContactMethod = 'phone' | 'email' | 'text' | 'in-person' | 'video-call' | 'social-media';

export type RelationshipType = 'family' | 'friend' | 'work' | 'acquaintance' | 'romantic' | 'other';

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'rarely';

export interface ContactFormData {
  name: string;
  phone?: string;
  email?: string;
  lastContactDate?: string;
  lastContactMethod?: ContactMethod;
  relationshipType: RelationshipType;
  notes?: string;
  frequency?: Frequency;
  urgencyLevel?: number;
}

export interface RelationshipContact {
  id: string;
  name: string;
  urgencyLevel: number;
  context: string;
  ctaText: string;
}

export const CONTACT_METHODS: { value: ContactMethod; label: string }[] = [
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'text', label: 'Text' },
  { value: 'in-person', label: 'In Person' },
  { value: 'video-call', label: 'Video Call' },
  { value: 'social-media', label: 'Social Media' }
];

export const RELATIONSHIP_TYPES: { value: RelationshipType; label: string }[] = [
  { value: 'family', label: 'Family' },
  { value: 'friend', label: 'Friend' },
  { value: 'work', label: 'Work' },
  { value: 'acquaintance', label: 'Acquaintance' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'other', label: 'Other' }
];

export const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'rarely', label: 'Rarely' }
]; 