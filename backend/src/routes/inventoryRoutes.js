const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const {
  recordTransfer,
  getInventoryHistory,
  getInventoryAlerts,
  recordAudit
} = require('../controllers/inventoryController');

// POST /api/inventory/transfer - Record inventory transfer
router.post('/transfer', auth, checkRole(['admin', 'advisor']), recordTransfer);

// GET /api/inventory/history - Get inventory history
router.get('/history', auth, checkRole(['admin', 'advisor']), getInventoryHistory);

// GET /api/inventory/alerts - Get low inventory alerts
router.get('/alerts', auth, checkRole(['admin', 'advisor']), getInventoryAlerts);

// POST /api/inventory/audit - Record inventory audit
router.post('/audit', auth, checkRole(['admin']), recordAudit);

module.exports = router;