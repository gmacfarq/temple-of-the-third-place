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
  deleteCheckIn,
  getRecentCheckIns,
  updateMembership
} = require('../controllers/memberController');

// Place this BEFORE any routes with :id parameter
router.get('/recent-checkins', auth, checkRole(['admin']), getRecentCheckIns);

// GET /api/members/stats
router.get('/stats', auth, checkRole(['admin']), getMemberStats);

// GET /api/members
router.get('/', auth, checkRole(['admin']), getAllMembers);

// GET /api/members/:id - Get member profile
router.get('/:id', auth, getMemberById);

// PUT /api/members/:id - Update member profile
router.put('/:id', auth, updateMemberProfile);

// PUT /api/members/:id/checkin - Update member check-in
router.put('/:id/checkin', auth, checkIn);

// PUT /api/members/:id/subscription - Update member subscription (admin only)
router.put('/:id/subscription', auth, checkRole(['admin']), updateSubscription);

// PUT /api/members/:id/membership - Update member membership details (admin only)
router.put('/:id/membership', auth, checkRole(['admin']), updateMembership);

// DELETE /api/members/:id - Delete member (admin only)
router.delete('/:id', auth, checkRole(['admin']), deleteMember);

// GET /api/members/:id/check-ins - Get member check-ins
router.get('/:id/check-ins', auth, getCheckIns);

// DELETE /api/members/check-ins/:checkInId - Delete a specific check-in
router.delete('/check-ins/:checkInId', auth, deleteCheckIn);

module.exports = router;