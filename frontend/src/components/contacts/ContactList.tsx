'use client';

import { useState, useMemo } from 'react';
import { Contact, RELATIONSHIP_TYPES } from '@/types/contact';
import ContactCard from './ContactCard';

interface ContactListProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export default function ContactList({ contacts, onEdit, onDelete, isDeleting = false }: ContactListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.phone?.includes(searchTerm);
      
      const matchesRelationship = relationshipFilter === 'all' || contact.relationshipType === relationshipFilter;
      const matchesUrgency = urgencyFilter === 'all' || contact.urgencyLevel.toString() === urgencyFilter;

      return matchesSearch && matchesRelationship && matchesUrgency;
    });
  }, [contacts, searchTerm, relationshipFilter, urgencyFilter]);

  const getUrgencyCount = (level: number) => {
    return contacts.filter(c => c.urgencyLevel === level).length;
  };

  const getRelationshipCount = (type: string) => {
    return contacts.filter(c => c.relationshipType === type).length;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Contacts
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Relationship Filter */}
          <div>
            <label htmlFor="relationshipFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Relationship Type
            </label>
            <select
              id="relationshipFilter"
              value={relationshipFilter}
              onChange={(e) => setRelationshipFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types ({contacts.length})</option>
              {RELATIONSHIP_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} ({getRelationshipCount(type.value)})
                </option>
              ))}
            </select>
          </div>

          {/* Urgency Filter */}
          <div>
            <label htmlFor="urgencyFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Urgency Level
            </label>
            <select
              id="urgencyFilter"
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels ({contacts.length})</option>
              {[1, 2, 3, 4, 5].map(level => (
                <option key={level} value={level.toString()}>
                  Level {level} ({getUrgencyCount(level)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filteredContacts.length} of {contacts.length} contacts
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Contact Grid */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || relationshipFilter !== 'all' || urgencyFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Get started by adding your first contact.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
} 