const mongoose = require('mongoose');

const IndprojectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true,
        minlength: [3, 'Project name must be at least 3 characters long']
    },
    description: {
        type: String,
        required: [true, 'Project description is required'],
        trim: true
    },
    type: {
        type: String,
        enum: 'individual',
        required: [true, 'Project type is required']
    },
    status: {
        type: String,
        enum: ['planning', 'inProgress', 'completed', 'onHold'],
        default: 'planning'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }], 
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});



const IndProject = mongoose.model('Project', IndprojectSchema); 

module.exports = IndProject;
