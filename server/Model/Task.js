const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        minlength: [3, 'Task title must be at least 3 characters long']
    },
    description: {
        type: String,
        required: [true, 'Task description is required'],
        trim: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['todo', 'inProgress', 'completed', 'review'],
        default: 'todo'
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    projectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project ID is required']
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator ID is required']
    },
    tags: [{
        type: String,
        trim: true
    }],
    type: {
        type: String,
        enum: ['individual', 'group'],
        required: [true, 'Task type is required']
    }, 
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ createdBy: 1 });

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
    return this.dueDate < new Date() && this.status !== 'completed';
});

// Method to update task status
taskSchema.methods.updateStatus = async function(newStatus) {
    this.status = newStatus;
    if (newStatus === 'completed') {
        this.completedAt = new Date();
    }
    return this.save();
};

// Pre-save middleware to validate dates
taskSchema.pre('save', function(next) {
    if (this.dueDate < new Date()) {
        next(new Error('Due date cannot be in the past'));
    }
    next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
