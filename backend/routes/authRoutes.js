const express = require('express');
const router = express.Router();
const {
  register,
  login,
  me,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, me);
router.post('/logout', protect, logout);

module.exports = router;
