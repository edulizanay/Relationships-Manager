'use client';

import { Contact, RELATIONSHIP_TYPES, FREQUENCIES } from '@/types/contact';

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export default function ContactCard({ contact, onEdit, onDelete, isDeleting = false }: ContactCardProps) {
  const getUrgencyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 5: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelationshipTypeColor = (type: string) => {
    switch (type) {
      case 'family': return 'bg-purple-100 text-purple-800';
      case 'friend': return 'bg-blue-100 text-blue-800';
      case 'work': return 'bg-green-100 text-green-800';
      case 'romantic': return 'bg-pink-100 text-pink-800';
      case 'acquaintance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getRelationshipTypeLabel = (type: string) => {
    return RELATIONSHIP_TYPES.find(t => t.value === type)?.label || type;
  };

  const getFrequencyLabel = (freq: string) => {
    return FREQUENCIES.find(f => f.value === freq)?.label || freq;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{contact.name}</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRelationshipTypeColor(contact.relationshipType)}`}>
              {getRelationshipTypeLabel(contact.relationshipType)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(contact.urgencyLevel)}`}>
              Urgency: {contact.urgencyLevel}/5
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {getFrequencyLabel(contact.frequency)}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(contact)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit contact"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            disabled={isDeleting}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            title="Delete contact"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contact.phone && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm text-gray-600">{contact.phone}</span>
            </div>
          )}
          
          {contact.email && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-600">{contact.email}</span>
            </div>
          )}
        </div>

        {/* Last Contact Information */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Last Contact:</span>
            <span className="text-sm text-gray-600">{formatDate(contact.lastContactDate)}</span>
          </div>
          {contact.lastContactMethod && (
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-medium text-gray-700">Method:</span>
              <span className="text-sm text-gray-600 capitalize">{contact.lastContactMethod.replace('-', ' ')}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {contact.notes && (
          <div className="border-t pt-3">
            <span className="text-sm font-medium text-gray-700 block mb-1">Notes:</span>
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{contact.notes}</p>
          </div>
        )}

        {/* Created/Updated Info */}
        <div className="border-t pt-3 text-xs text-gray-500">
          <div>Created: {new Date(contact.createdAt).toLocaleDateString()}</div>
          {contact.updatedAt !== contact.createdAt && (
            <div>Updated: {new Date(contact.updatedAt).toLocaleDateString()}</div>
          )}
        </div>
      </div>
    </div>
  );
} 