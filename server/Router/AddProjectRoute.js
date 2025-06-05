const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

//controller
const ProjectController = require('../controller/ProjectController');

//Routes
router.post('/addproject', auth, ProjectController.createProject);
router.get('/getAllProject', auth, ProjectController.getAllProject);

module.exports = router;