const express = require('express');
const { body, param, validationResult } = require('express-validator');
const contactService = require('../services/contactService');

const router = express.Router();

/**
 * Validation middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * GET /api/contacts
 * Get all contacts
 */
router.get('/', async (req, res) => {
  try {
    const contacts = await contactService.getAllContacts();
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      error: 'Failed to fetch contacts',
      message: error.message
    });
  }
});

/**
 * POST /api/contacts
 * Create a new contact
 */
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters'),
  body('lastContactMethod').optional().isIn(['phone', 'email', 'text', 'in-person', 'video-call', 'social-media'])
    .withMessage('Invalid contact method'),
  body('relationshipType').isIn(['family', 'friend', 'work', 'acquaintance', 'romantic', 'other'])
    .withMessage('Invalid relationship type'),
  body('frequency').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'rarely'])
    .withMessage('Invalid frequency'),
  handleValidationErrors
], async (req, res) => {
  try {
    const contact = await contactService.createContact(req.body);
    res.status(201).json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(400).json({
      error: 'Failed to create contact',
      message: error.message
    });
  }
});

/**
 * GET /api/contacts/:id
 * Get a specific contact by ID
 */
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('Invalid contact ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    const contact = await contactService.getContactById(parseInt(req.params.id));
    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    if (error.message === 'Contact not found') {
      res.status(404).json({
        error: 'Contact not found',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to fetch contact',
        message: error.message
      });
    }
  }
});

/**
 * PUT /api/contacts/:id
 * Update an existing contact
 */
router.put('/:id', [
  param('id').isInt({ min: 1 }).withMessage('Invalid contact ID'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters'),
  body('lastContactMethod').optional().isIn(['phone', 'email', 'text', 'in-person', 'video-call', 'social-media'])
    .withMessage('Invalid contact method'),
  body('relationshipType').optional().isIn(['family', 'friend', 'work', 'acquaintance', 'romantic', 'other'])
    .withMessage('Invalid relationship type'),
  body('frequency').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'rarely'])
    .withMessage('Invalid frequency'),
  handleValidationErrors
], async (req, res) => {
  try {
    const contact = await contactService.updateContact(parseInt(req.params.id), req.body);
    res.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    if (error.message === 'Contact not found') {
      res.status(404).json({
        error: 'Contact not found',
        message: error.message
      });
    } else {
      res.status(400).json({
        error: 'Failed to update contact',
        message: error.message
      });
    }
  }
});

/**
 * DELETE /api/contacts/:id
 * Delete a contact
 */
router.delete('/:id', [
  param('id').isInt({ min: 1 }).withMessage('Invalid contact ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    await contactService.deleteContact(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting contact:', error);
    if (error.message === 'Contact not found') {
      res.status(404).json({
        error: 'Contact not found',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to delete contact',
        message: error.message
      });
    }
  }
});

/**
 * GET /api/contacts/relationship-type/:type
 * Get contacts by relationship type
 */
router.get('/relationship-type/:type', [
  param('type').isIn(['family', 'friend', 'work', 'acquaintance', 'romantic', 'other'])
    .withMessage('Invalid relationship type'),
  handleValidationErrors
], async (req, res) => {
  try {
    const contacts = await contactService.getContactsByRelationshipType(req.params.type);
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts by relationship type:', error);
    res.status(500).json({
      error: 'Failed to fetch contacts',
      message: error.message
    });
  }
});

/**
 * GET /api/contacts/urgency/:level
 * Get contacts by urgency level
 */
router.get('/urgency/:level', [
  param('level').isInt({ min: 1, max: 5 }).withMessage('Urgency level must be between 1 and 5'),
  handleValidationErrors
], async (req, res) => {
  try {
    const contacts = await contactService.getContactsByUrgencyLevel(parseInt(req.params.level));
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts by urgency level:', error);
    res.status(500).json({
      error: 'Failed to fetch contacts',
      message: error.message
    });
  }
});

module.exports = router; 