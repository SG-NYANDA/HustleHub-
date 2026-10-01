const express = require('express');
const { register, login } = require('../controllers/authController');
const { registerRules, loginRules, handleValidationErrors } = require('../middleware/validators');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, registerRules, handleValidationErrors, register);
router.post('/login', authLimiter, loginRules, handleValidationErrors, login);

module.exports = router;
