const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createDonationSchema } = require('../schemas/donationSchemas');
const {
  createDonation,
  getDonations,
  getMemberDonations,
  getDonationStats,
  deleteDonation
} = require('../controllers/donationController');

// POST /api/donations - Record new donation
router.post('/', auth, validate(createDonationSchema), createDonation);

// GET /api/donations - List all donations (admin/advisor only)
router.get('/', auth, checkRole(['admin', 'advisor']), getDonations);

// GET /api/donations/stats - Get donation statistics (admin/advisor only)
router.get('/stats', auth, checkRole(['admin', 'advisor']), getDonationStats);

// GET /api/donations/member/:memberId - Get member's donation history
router.get('/member/:memberId', auth, getMemberDonations);

// Add delete route
router.delete('/:id', auth, checkRole(['admin']), deleteDonation);

module.exports = router;