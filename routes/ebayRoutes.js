const express = require('express');
const { listEbayItem } = require('../controllers/ebayController.js');

const router = express.Router();

// Route to list an item on eBay
router.post('/list', listEbayItem);

// Export the router
module.exports = router; // Make sure this line is correct
