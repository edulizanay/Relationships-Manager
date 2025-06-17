const express = require('express');
const contactService = require('../services/contactService');

const router = express.Router();

/**
 * GET /api/relationships
 * Get contacts formatted for floating balls UI
 */
router.get('/', async (req, res) => {
  try {
    const relationships = await contactService.getContactsForRelationships();
    res.json(relationships);
  } catch (error) {
    console.error('Error fetching relationships:', error);
    res.status(500).json({
      error: 'Failed to fetch relationships',
      message: error.message
    });
  }
});

module.exports = router; 