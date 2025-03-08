const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { transferSchema, auditSchema } = require('../schemas/inventorySchemas');
const {
  recordTransfer,
  getInventoryHistory,
  getInventoryAlerts,
  recordAudit,
  getInventoryAudits,
  removeInventory
} = require('../controllers/inventoryController');


// POST /api/inventory/transfer - Record inventory transfer
router.post('/transfer', auth, checkRole(['admin', 'advisor']), validate(transferSchema), recordTransfer);

// GET /api/inventory/history - Get inventory history
router.get('/history', auth, checkRole(['admin', 'advisor']), getInventoryHistory);

// GET /api/inventory/alerts - Get low inventory alerts
router.get('/alerts', auth, checkRole(['admin', 'advisor']), getInventoryAlerts);

// POST /api/inventory/audit - Record inventory audit
router.post('/audit', auth, checkRole(['admin']), validate(auditSchema), recordAudit);

// GET /api/inventory/audits - Get audit history
router.get('/audits', auth, checkRole(['admin']), getInventoryAudits);

// POST /api/inventory/remove - Remove inventory
router.post('/remove', auth, removeInventory);

module.exports = router;