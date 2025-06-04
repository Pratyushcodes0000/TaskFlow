const express = require('express');
const router = express.Router();

//controller
const IndProjectController = require('../controller/IndProjectController');

//Routes
router.post('/addproject', IndProjectController.createProject);
router.get('/getAllProject', IndProjectController.getAllProject);
router.put('/project', IndProjectController.updateProject);
router.delete('/project/', IndProjectController.deleteProject);

module.exports = router;