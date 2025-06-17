const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

/**
 * SQLite database connection instance
 * @type {import('sqlite').Database}
 */
let db = null;

/**
 * Initialize the SQLite database connection and create tables if they don't exist
 * @returns {Promise<import('sqlite').Database>}
 */
async function initializeDatabase() {
  if (db) {
    return db;
  }

  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'contacts.db');
  
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        lastContactDate DATE,
        lastContactMethod TEXT CHECK(lastContactMethod IN ('phone', 'email', 'text', 'in-person', 'video-call', 'social-media')),
        relationshipType TEXT CHECK(relationshipType IN ('family', 'friend', 'work', 'acquaintance', 'romantic', 'other')) NOT NULL DEFAULT 'other',
        notes TEXT,
        urgencyLevel INTEGER CHECK(urgencyLevel >= 1 AND urgencyLevel <= 5),
        frequency TEXT CHECK(frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'rarely')) DEFAULT 'monthly',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Trigger to update the updatedAt timestamp
      CREATE TRIGGER IF NOT EXISTS update_contacts_timestamp 
      AFTER UPDATE ON contacts
      BEGIN
        UPDATE contacts SET updatedAt = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
      END;
    `);

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

/**
 * Create a new contact
 * @param {Object} contactData - The contact data
 * @returns {Promise<Object>} The created contact
 */
async function createContact(contactData) {
  const db = await initializeDatabase();
  const {
    name,
    phone,
    email,
    lastContactDate,
    lastContactMethod,
    relationshipType,
    notes,
    frequency
  } = contactData;

  const result = await db.run(
    `INSERT INTO contacts (
      name, phone, email, lastContactDate, lastContactMethod,
      relationshipType, notes, urgencyLevel, frequency
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      phone || null,
      email || null,
      lastContactDate || null,
      lastContactMethod || null,
      relationshipType,
      notes || null,
      Math.floor(Math.random() * 5) + 1, // Random urgency 1-5
      frequency || 'monthly'
    ]
  );

  return getContactById(result.lastID);
}

/**
 * Get all contacts
 * @returns {Promise<Array>} Array of contacts
 */
async function getAllContacts() {
  const db = await initializeDatabase();
  return db.all('SELECT * FROM contacts ORDER BY name');
}

/**
 * Get a contact by ID
 * @param {number} id - Contact ID
 * @returns {Promise<Object>} Contact data
 */
async function getContactById(id) {
  const db = await initializeDatabase();
  return db.get('SELECT * FROM contacts WHERE id = ?', [id]);
}

/**
 * Update a contact
 * @param {number} id - Contact ID
 * @param {Object} contactData - Updated contact data
 * @returns {Promise<Object>} Updated contact
 */
async function updateContact(id, contactData) {
  const db = await initializeDatabase();
  const existingContact = await getContactById(id);
  
  if (!existingContact) {
    throw new Error('Contact not found');
  }

  const updates = [];
  const values = [];
  
  Object.keys(contactData).forEach(key => {
    if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
      updates.push(`${key} = ?`);
      values.push(contactData[key]);
    }
  });

  values.push(id);

  await db.run(
    `UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  return getContactById(id);
}

/**
 * Delete a contact
 * @param {number} id - Contact ID
 * @returns {Promise<void>}
 */
async function deleteContact(id) {
  const db = await initializeDatabase();
  return db.run('DELETE FROM contacts WHERE id = ?', [id]);
}

/**
 * Get contacts by relationship type
 * @param {string} type - Relationship type
 * @returns {Promise<Array>} Array of contacts
 */
async function getContactsByRelationshipType(type) {
  const db = await initializeDatabase();
  return db.all('SELECT * FROM contacts WHERE relationshipType = ?', [type]);
}

/**
 * Get contacts by urgency level
 * @param {number} level - Urgency level (1-5)
 * @returns {Promise<Array>} Array of contacts
 */
async function getContactsByUrgencyLevel(level) {
  const db = await initializeDatabase();
  return db.all('SELECT * FROM contacts WHERE urgencyLevel = ?', [level]);
}

/**
 * Get database health status
 * @returns {Promise<Object>} Health status
 */
async function getHealthStatus() {
  try {
    const db = await initializeDatabase();
    await db.get('SELECT 1');
    return { status: 'healthy', message: 'Database connection successful' };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
}

module.exports = {
  initializeDatabase,
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  getContactsByRelationshipType,
  getContactsByUrgencyLevel,
  getHealthStatus
}; 