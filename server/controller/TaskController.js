const Project = require('../Model/Project');
const Task = require('../Model/Task');
const User = require('../Model/User');

// Get all tasks for a specific project
exports.getTask = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        
        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: 'Project ID is required'
            });
        }

        const tasks = await Task.find({ projectID: projectId });
        
        return res.status(200).json({
            success: true,
            message: 'Tasks retrieved successfully',
            data: tasks
        });

    } catch (error) {
        console.error('Error in getTask:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Create a new task
exports.createTask = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            priority, 
            dueDate, 
            tags,
            type
        } = req.body;

        const projectId = req.params.projectId;

        // Validate required fields
        if (!title || !projectId) {
            return res.status(400).json({
                success: false,
                message: 'Title and Project ID are required'
            });
        }

        // Check if project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Ensure we have a user ID
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        // Create new task
        const newTask = new Task({
            title,
            description,
            priority: priority || 'medium',
            dueDate,
            tags: tags || [],
            projectID: projectId,
            status: 'todo',
            type: type || 'individual',
            createdBy: req.user._id // Use the authenticated user's ID
        });

        // Save the task
        const savedTask = await newTask.save();

        // Update project's task count
        await Project.findByIdAndUpdate(projectId, {
            $inc: { totalTasks: 1 }
        });

        return res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: savedTask
        });

    } catch (error) {
        console.error('Error in createTask:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
