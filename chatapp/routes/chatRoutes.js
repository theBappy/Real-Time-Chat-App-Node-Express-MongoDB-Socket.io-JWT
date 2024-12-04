const express = require('express');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Example: Protected chat endpoint
router.get('/preotected-messages', authenticate, (req, res) => {
  res.status(200).json({ message: 'Welcome to the protected chat area!', user: req.user });
});

module.exports = router;


