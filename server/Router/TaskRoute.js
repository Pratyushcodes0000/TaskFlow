const express = require('express');
const router = express.Router();
const TaskController = require('../controller/TaskController');
const auth = require('../middleware/auth');

// Protected routes - require authentication
router.get('/GetTask/:projectId', auth, TaskController.getTask);
router.post('/createTask/:projectId', auth, TaskController.createTask);

module.exports = router;