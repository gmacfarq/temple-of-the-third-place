const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const {
  getAllMembers,
  getMemberById,
  updateMemberProfile,
  checkInMember,
  updateSubscription,
  getMemberStats,
  deleteMember,
  getCheckIns,
  checkIn,
  deleteCheckIn
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
router.put('/:id/checkin', auth, checkIn);

// PUT /api/members/:id/subscription - Update member subscription (admin only)
router.put('/:id/subscription', auth, checkRole(['admin']), updateSubscription);

// DELETE /api/members/:id - Delete member (admin only)
router.delete('/:id', auth, checkRole(['admin']), deleteMember);

// GET /api/members/:id/checkins - Get member check-ins
router.get('/:id/checkins', auth, getCheckIns);

// DELETE /api/members/check-ins/:checkInId - Delete a specific check-in
router.delete('/check-ins/:checkInId', auth, deleteCheckIn);

module.exports = router;