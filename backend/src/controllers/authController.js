const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/database');

const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password = 'DefaultPass123!', // Default password if not provided
      birthDate,
      phoneNumber,
      membershipType = 'Exploratory'
    } = req.body;

    // Validate input
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'First name, last name, and email are required' });
    }

    const connection = await pool.getConnection();

    // Check if user already exists
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Calculate membership status based on age
    let membershipStatus = 'Active';
    if (birthDate) {
      const birthDateObj = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }

      if (age < 21) {
        membershipStatus = 'Pending';
      }
    }

    // Calculate membership expiration (1 year from now)
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    const formattedExpirationDate = expirationDate.toISOString().split('T')[0];

    // Insert new user
    const [result] = await connection.query(
      `INSERT INTO users (
        first_name,
        last_name,
        email,
        password_hash,
        role,
        birth_date,
        phone_number,
        membership_type,
        membership_status,
        membership_expiration
      ) VALUES (?, ?, ?, ?, 'member', ?, ?, ?, ?, ?)`,
      [
        firstName,
        lastName,
        email,
        passwordHash,
        birthDate || null,
        phoneNumber || null,
        membershipType,
        membershipStatus,
        membershipStatus === 'Active' ? formattedExpirationDate : null
      ]
    );

    const userId = result.insertId;

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, role: 'member' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    connection.release();

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        role: 'member',
        birthDate,
        phoneNumber,
        membershipType,
        membershipStatus
      }
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

const registerPrivilegedUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, firstName, lastName, role } = req.body;

  try {
    const connection = await pool.getConnection();

    // Check if user already exists
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new privileged user
    const [result] = await connection.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, role]
    );

    connection.release();

    res.status(201).json({
      message: `${role} user registered successfully`,
      user: {
        id: result.insertId,
        email,
        firstName,
        lastName,
        role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const connection = await pool.getConnection();

    // Get user
    const [users] = await connection.query(
      'SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = ?',
      [email]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

module.exports = {
  register,
  registerPrivilegedUser,
  login
};