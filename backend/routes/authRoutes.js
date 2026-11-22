const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { validateRegister, validateLogin } = require('../middlewares/validateMiddleware');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/profile', verifyToken, getProfile);

module.exports = router;