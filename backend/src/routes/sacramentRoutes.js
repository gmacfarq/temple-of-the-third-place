const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const {
  getAllSacraments,
  getSacramentById,
  createSacrament,
  updateSacrament,
  deleteSacrament,
  getLowInventory,
  updateBatch
} = require('../controllers/sacramentController');

// GET /api/sacraments - List all sacraments
router.get('/', auth, getAllSacraments);

// GET /api/sacraments/low-inventory - Get sacraments below threshold
router.get('/low-inventory', auth, checkRole(['admin', 'advisor']), getLowInventory);

// GET /api/sacraments/:id - Get single sacrament
router.get('/:id', auth, getSacramentById);

// POST /api/sacraments - Create new sacrament (admin/advisor only)
router.post('/', auth, checkRole(['admin', 'advisor']), createSacrament);

// PUT /api/sacraments/:id - Update sacrament (admin/advisor only)
router.put('/:id', auth, checkRole(['admin', 'advisor']), updateSacrament);

// PUT /api/sacraments/:id/batch - Update batch information (admin/advisor only)
router.put('/:id/batch', auth, checkRole(['admin', 'advisor']), updateBatch);

// DELETE /api/sacraments/:id - Delete sacrament (admin only)
router.delete('/:id', auth, checkRole(['admin']), deleteSacrament);

module.exports = router;