const jwt = require('jsonwebtoken');
const config = require('../config/test.config');

const auth = (req, res, next) => {
  try {
    // Debug logging
    console.log('Auth Header:', req.headers.authorization);

    const token = req.headers.authorization.split(' ')[1];
    console.log('Token:', token);
    console.log('JWT Secret:', config.jwt.secret);

    const decoded = jwt.verify(token, config.jwt.secret);
    console.log('Decoded Token:', decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Middleware for role-based access
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('User Role:', req.user.role);
    console.log('Required Roles:', roles);

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    next();
  };
};

module.exports = { auth, checkRole };