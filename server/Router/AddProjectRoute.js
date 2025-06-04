const express = require('express')
const router = express.Router();

//controller
const AddtaskController = require('../controller/AddtaskController');

//Routes
router.post('/addtask',AddtaskController);