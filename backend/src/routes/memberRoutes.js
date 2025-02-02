const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const {
  getAllMembers,
  getMemberById,
  updateMemberProfile,
  checkInMember,
  updateSubscription,
  getMemberStats
} = require('../controllers/memberController');

// GET /api/members - List all members (admin only)
router.get('/', auth, checkRole(['admin']), getAllMembers);

// GET /api/members/stats - Get membership statistics (admin only)
router.get('/stats', auth, checkRole(['admin']), getMemberStats);

// GET /api/members/:id - Get member profile
router.get('/:id', auth, getMemberById);

// PUT /api/members/:id - Update member profile
router.put('/:id', auth, updateMemberProfile);

// PUT /api/members/:id/checkin - Update member check-in
router.put('/:id/checkin', auth, checkInMember);

// PUT /api/members/:id/subscription - Update member subscription (admin only)
router.put('/:id/subscription', auth, checkRole(['admin']), updateSubscription);

module.exports = router;