const express = require('express');
const router = express.Router();
const { getTask, createTask, updateTaskStatus, deleteTask } = require('../controller/TaskController');
const auth = require('../middleware/auth');

// Protected routes - require authentication
router.get('/GetTask/:projectId', auth, getTask);
router.post('/createTask/:projectId', auth, createTask);
router.patch('/updateTaskStatus/:taskId', auth, updateTaskStatus);
router.delete('/deleteTask/:taskId', auth, deleteTask);

module.exports = router;