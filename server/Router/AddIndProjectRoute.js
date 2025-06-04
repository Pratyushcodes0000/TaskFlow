const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

//controller
const IndProjectController = require('../controller/IndProjectController');

//Routes
router.post('/addproject', auth, IndProjectController.createProject);
router.get('/getAllProject', auth, IndProjectController.getAllProject);

module.exports = router;