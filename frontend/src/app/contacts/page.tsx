'use client';

import { useState, useEffect } from 'react';
import { Contact, ContactFormData } from '@/types/contact';
import { contactsApi } from '@/services/contactsApi';
import ContactForm from '@/components/contacts/ContactForm';
import ContactList from '@/components/contacts/ContactList';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load contacts on component mount
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading contacts...');
      const data = await contactsApi.getAllContacts();
      console.log('Contacts loaded:', data);
      setContacts(data);
    } catch (err) {
      console.error('Error loading contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: ContactFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (editingContact) {
        // Update existing contact
        const updatedContact = await contactsApi.updateContact(editingContact.id, formData);
        setContacts(prev => prev.map(c => c.id === editingContact.id ? updatedContact : c));
        setSuccessMessage('Contact updated successfully!');
      } else {
        // Create new contact
        const newContact = await contactsApi.createContact(formData);
        setContacts(prev => [...prev, newContact]);
        setSuccessMessage('Contact added successfully!');
      }

      // Reset form state
      setShowForm(false);
      setEditingContact(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact. Please try again.');
      console.error('Error saving contact:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      await contactsApi.deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
      setSuccessMessage('Contact deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to delete contact. Please try again.');
      console.error('Error deleting contact:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingContact(null);
    setError(null);
  };

  const handleAddNew = () => {
    setEditingContact(null);
    setShowForm(true);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading contacts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contact Management</h1>
              <p className="mt-2 text-gray-600">
                Manage your relationships and stay connected with the people who matter most.
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Contact
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Contact Form */}
        {showForm && (
          <ContactForm
            contact={editingContact || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        )}

        {/* Contact List */}
        <ContactList
          contacts={contacts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />

        {/* Empty State */}
        {!loading && contacts.length === 0 && !showForm && (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No contacts yet</h3>
            <p className="mt-2 text-gray-500">
              Get started by adding your first contact to begin managing your relationships.
            </p>
            <div className="mt-6">
              <button
                onClick={handleAddNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Your First Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 