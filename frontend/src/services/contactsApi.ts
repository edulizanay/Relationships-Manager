import { Contact, ContactFormData, RelationshipContact } from '@/types/contact';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ContactsApi {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the server. Please check if the backend is running on port 3001.');
      }
      throw error;
    }
  }

  async getAllContacts(): Promise<Contact[]> {
    return this.request<Contact[]>('/contacts');
  }

  async getContactById(id: number): Promise<Contact> {
    return this.request<Contact>(`/contacts/${id}`);
  }

  async createContact(contactData: ContactFormData): Promise<Contact> {
    return this.request<Contact>('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  async updateContact(id: number, contactData: Partial<ContactFormData>): Promise<Contact> {
    return this.request<Contact>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  }

  async deleteContact(id: number): Promise<void> {
    return this.request<void>(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  async getContactsByRelationshipType(type: string): Promise<Contact[]> {
    return this.request<Contact[]>(`/contacts/relationship-type/${type}`);
  }

  async getContactsByUrgencyLevel(level: number): Promise<Contact[]> {
    return this.request<Contact[]>(`/contacts/urgency/${level}`);
  }

  async getRelationships(): Promise<RelationshipContact[]> {
    return this.request<RelationshipContact[]>('/relationships');
  }

  async getHealthStatus(): Promise<{ status: string; database: { status: string; message: string } }> {
    return this.request<{ status: string; database: { status: string; message: string } }>('/health');
  }
}

export const contactsApi = new ContactsApi(); 