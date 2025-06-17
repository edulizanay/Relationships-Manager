/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email ? emailRegex.test(email) : true;
}

/**
 * Validate phone number format (basic validation)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone number is valid
 */
function isValidPhone(phone) {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phone ? phoneRegex.test(phone) : true;
}

/**
 * Format date to YYYY-MM-DD
 * @param {string|Date} date - Date to format
 * @returns {string|null} Formatted date or null if invalid
 */
function formatDate(date) {
  if (!date) return null;
  try {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  } catch (error) {
    return null;
  }
}

/**
 * Validate contact data
 * @param {Object} data - Contact data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} Validation result {isValid, errors}
 */
function validateContactData(data, isUpdate = false) {
  const errors = [];

  // For updates, only validate fields that are present
  if (!isUpdate) {
    // For creation, name and relationshipType are required
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Name is required');
    }
    
    if (!data.relationshipType || 
        !['family', 'friend', 'work', 'acquaintance', 'romantic', 'other'].includes(data.relationshipType)) {
      errors.push('Valid relationship type is required');
    }
  } else {
    // For updates, validate only present fields
    if (data.name !== undefined && (!data.name || data.name.trim().length === 0)) {
      errors.push('Name cannot be empty');
    }
    
    if (data.relationshipType !== undefined && 
        !['family', 'friend', 'work', 'acquaintance', 'romantic', 'other'].includes(data.relationshipType)) {
      errors.push('Invalid relationship type');
    }
  }

  // Validate email if present
  if (data.email && !isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }

  // Validate phone if present
  if (data.phone && !isValidPhone(data.phone)) {
    errors.push('Invalid phone number format');
  }

  // Validate lastContactMethod if present
  if (data.lastContactMethod && 
      !['phone', 'email', 'text', 'in-person', 'video-call', 'social-media'].includes(data.lastContactMethod)) {
    errors.push('Invalid contact method');
  }

  // Validate frequency if present
  if (data.frequency && 
      !['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'rarely'].includes(data.frequency)) {
    errors.push('Invalid frequency');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format contact for relationships API response
 * @param {Object} contact - Contact data
 * @returns {Object} Formatted contact for relationships endpoint
 */
function formatContactForRelationships(contact) {
  const lastContactDays = contact.lastContactDate
    ? Math.floor((new Date() - new Date(contact.lastContactDate)) / (1000 * 60 * 60 * 24))
    : null;

  let context = 'No previous contact recorded';
  if (lastContactDays !== null) {
    context = `Last contact: ${lastContactDays} days ago`;
    if (contact.lastContactMethod) {
      context += ` via ${contact.lastContactMethod}`;
    }
  }

  let ctaText = 'Reach out';
  if (contact.frequency === 'daily' && lastContactDays > 1) {
    ctaText = 'Contact today!';
  } else if (contact.frequency === 'weekly' && lastContactDays > 7) {
    ctaText = 'Contact this week';
  } else if (contact.frequency === 'monthly' && lastContactDays > 30) {
    ctaText = 'Contact this month';
  }

  return {
    id: contact.id.toString(),
    name: contact.name,
    urgencyLevel: contact.urgencyLevel,
    context,
    ctaText
  };
}

module.exports = {
  isValidEmail,
  isValidPhone,
  formatDate,
  validateContactData,
  formatContactForRelationships
}; 