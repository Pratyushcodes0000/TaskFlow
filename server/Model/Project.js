const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
        minlength: [3, 'Project title must be at least 3 characters long']
    },
    description: {
        type: String,
        required: [true, 'Project description is required'],
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    type: {
        type: String,
        enum: ['individual', 'group'],
        default: 'individual'
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
    completedTasks: {
        type: Number,
        default: 0
    },
    totalTasks: {
        type: Number,
        default: 0
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
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

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
