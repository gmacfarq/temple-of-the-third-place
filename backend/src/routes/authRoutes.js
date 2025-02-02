const express = require('express');
const { body } = require('express-validator');
const { register, login, registerPrivilegedUser } = require('../controllers/authController');
const { auth, checkRole } = require('../middleware/auth');
const pool = require('../config/database');

console.log('Loading auth routes');

const router = express.Router();

// Auth routes

// Public registration (members only)
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    // Remove role from public registration
  ],
  register
);

// Protected registration route for admin/advisor roles
router.post(
  '/register-privileged',
  auth,
  checkRole(['admin']), // Only admins can create other admins or advisors
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('role').isIn(['advisor', 'admin']).notEmpty()
  ],
  registerPrivilegedUser
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  login
);

// Protected routes
router.get('/me', auth, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [user] = await connection.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = ?',
      [req.user.userId]
    );
    connection.release();

    if (!user[0]) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Admin-only route
router.get('/users', auth, checkRole(['admin']), async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT id, email, first_name, last_name, role FROM users'
    );
    connection.release();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

module.exports = router;