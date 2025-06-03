const express = require('express');
const router = express.Router();
// controllers here
const loginController = require('../controller/loginController');

//Google login
router.post('/auth/google', loginController.verifyGoogleToken);

module.exports = router;