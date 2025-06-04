const express = require('express')
const router = express.Router();

//controller
const IndProjectController = require('../controller/IndProjectController');

//Routes
router.post('/addproject', IndProjectController.createTask);
router.get('/project/:projectId', IndProjectController.getProjectTasks);
router.put('/project/:taskId/status', IndProjectController.updateTaskStatus);
router.delete('/project/:taskId', IndProjectController.deleteTask);

module.exports = router;