const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/database');

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = await pool.getConnection();

    try {
      const [existingUser] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [req.body.email]
      );

      if (existingUser.length > 0) {
        connection.release();
        return res.status(400).json({ message: 'User already exists' });
      }

      let hashedPassword;
      try {
        hashedPassword = await bcrypt.hash(req.body.password, 10);
      } catch (hashError) {
        console.error('Error during password hashing:', hashError);
        throw hashError;
      }

      try {
        const [result] = await connection.query(
          'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
          [req.body.email, hashedPassword, req.body.firstName, req.body.lastName, 'member']
        );
        connection.release();

        const token = jwt.sign(
          { userId: result.insertId, email: req.body.email, role: 'member' },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return res.status(201).json({
          message: 'User registered successfully',
          token,
          user: {
            id: result.insertId,
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            role: 'member'
          }
        });
      } catch (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }
    } catch (error) {
      console.error('Operation error:', error);
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Global registration error:', error);
    return res.status(500).json({
      message: 'Error registering user',
      error: error.message
    });
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