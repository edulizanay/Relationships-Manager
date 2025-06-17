const {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  getContactsByRelationshipType,
  getContactsByUrgencyLevel
} = require('../database/contactsDB');
const { validateContactData, formatContactForRelationships } = require('../utils/helpers');

/**
 * Service class for contact operations
 */
class ContactService {
  /**
   * Create a new contact
   * @param {Object} contactData - Contact data
   * @returns {Promise<Object>} Created contact
   */
  async createContact(contactData) {
    // Validate contact data
    const validation = validateContactData(contactData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Create contact in database
    const contact = await createContact(contactData);
    return contact;
  }

  /**
   * Get all contacts
   * @returns {Promise<Array>} Array of contacts
   */
  async getAllContacts() {
    const contacts = await getAllContacts();
    return contacts;
  }

  /**
   * Get a contact by ID
   * @param {number} id - Contact ID
   * @returns {Promise<Object>} Contact data
   */
  async getContactById(id) {
    const contact = await getContactById(id);
    if (!contact) {
      throw new Error('Contact not found');
    }
    return contact;
  }

  /**
   * Update a contact
   * @param {number} id - Contact ID
   * @param {Object} contactData - Updated contact data
   * @returns {Promise<Object>} Updated contact
   */
  async updateContact(id, contactData) {
    // Validate contact data (isUpdate = true for partial updates)
    const validation = validateContactData(contactData, true);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Update contact in database
    const contact = await updateContact(id, contactData);
    return contact;
  }

  /**
   * Delete a contact
   * @param {number} id - Contact ID
   * @returns {Promise<void>}
   */
  async deleteContact(id) {
    const contact = await getContactById(id);
    if (!contact) {
      throw new Error('Contact not found');
    }
    await deleteContact(id);
  }

  /**
   * Get contacts by relationship type
   * @param {string} type - Relationship type
   * @returns {Promise<Array>} Array of contacts
   */
  async getContactsByRelationshipType(type) {
    const contacts = await getContactsByRelationshipType(type);
    return contacts;
  }

  /**
   * Get contacts by urgency level
   * @param {number} level - Urgency level (1-5)
   * @returns {Promise<Array>} Array of contacts
   */
  async getContactsByUrgencyLevel(level) {
    if (level < 1 || level > 5) {
      throw new Error('Urgency level must be between 1 and 5');
    }
    const contacts = await getContactsByUrgencyLevel(level);
    return contacts;
  }

  /**
   * Get contacts formatted for relationships endpoint (floating balls UI)
   * @returns {Promise<Array>} Array of formatted contacts
   */
  async getContactsForRelationships() {
    const contacts = await getAllContacts();
    return contacts.map(contact => formatContactForRelationships(contact));
  }

  /**
   * Calculate urgency level based on contact data (placeholder for future implementation)
   * @param {Object} contact - Contact data
   * @returns {number} Urgency level (1-5)
   */
  calculateUrgency(contact) {
    // TODO: Implement proper urgency calculation based on:
    // - Last contact date
    // - Frequency setting
    // - Relationship type
    // - User preferences
    
    // For now, return random urgency 1-5
    return Math.floor(Math.random() * 5) + 1;
  }
}

module.exports = new ContactService(); 