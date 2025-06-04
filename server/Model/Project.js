const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
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
        enum: ['individual', 'group'],
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
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Project owner is required']
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
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
    attachments: [{
        name: String,
        url: String,
        type: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    milestones: [{
        title: {
            type: String,
            required: true
        },
        description: String,
        dueDate: Date,
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: Date
    }],
    settings: {
        allowMemberInvites: {
            type: Boolean,
            default: true
        },
        allowTaskAssignment: {
            type: Boolean,
            default: true
        },
        allowComments: {
            type: Boolean,
            default: true
        },
        allowAttachments: {
            type: Boolean,
            default: true
        }
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for faster queries
projectSchema.index({ owner: 1 });
projectSchema.index({ members: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ type: 1 });

// Virtual for checking if project is overdue
projectSchema.virtual('isOverdue').get(function() {
    return this.dueDate < new Date() && this.status !== 'completed';
});

// Method to update project progress
projectSchema.methods.updateProgress = async function() {
    if (this.tasks.length === 0) {
        this.progress = 0;
        return this.save();
    }

    const completedTasks = await this.model('Task').countDocuments({
        _id: { $in: this.tasks },
        status: 'completed'
    });

    this.progress = Math.round((completedTasks / this.tasks.length) * 100);
    return this.save();
};

// Method to add member to project
projectSchema.methods.addMember = async function(userId) {
    if (!this.members.includes(userId)) {
        this.members.push(userId);
        return this.save();
    }
    return this;
};

// Method to remove member from project
projectSchema.methods.removeMember = async function(userId) {
    this.members = this.members.filter(member => member.toString() !== userId.toString());
    return this.save();
};

// Pre-save middleware to validate dates
projectSchema.pre('save', function(next) {
    if (this.startDate > this.dueDate) {
        next(new Error('Start date cannot be after due date'));
    }
    if (this.dueDate < new Date()) {
        next(new Error('Due date cannot be in the past'));
    }
    next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
