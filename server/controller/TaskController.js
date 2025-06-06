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
        
        // Calculate project progress
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const totalTasks = tasks.length;
        const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        // Update project progress
        await Project.findByIdAndUpdate(projectId, {
            totalTasks,
            completedTasks,
            progress
        });
        
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
            createdBy: req.user._id
        });

        // Save the task
        const savedTask = await newTask.save();

        // Update project's task count and progress
        project.totalTasks += 1;
        project.progress = project.calculateProgress();
        await project.save();

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

// Update task status
exports.updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status, projectId } = req.body;

        // Validate required fields
        if (!taskId || !status || !projectId) {
            return res.status(400).json({
                success: false,
                message: 'Task ID, status, and project ID are required'
            });
        }

        // Validate status
        const validStatuses = ['todo', 'inProgress', 'completed', 'review'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        // Find the current task to check its previous status
        const currentTask = await Task.findById(taskId);
        if (!currentTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Update the task
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { status },
            { new: true }
        );

        // Update project's completed tasks count and progress
        const project = await Project.findById(projectId);
        if (project) {
            if (currentTask.status === 'completed' && status !== 'completed') {
                // Task was completed but is no longer completed
                project.completedTasks = Math.max(0, project.completedTasks - 1);
            } else if (currentTask.status !== 'completed' && status === 'completed') {
                // Task is now completed
                project.completedTasks += 1;
            }
            project.progress = project.calculateProgress();
            await project.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Task status updated successfully',
            data: updatedTask
        });

    } catch (error) {
        console.error('Error in updateTaskStatus:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        // Validate task ID
        if (!taskId) {
            return res.status(400).json({
                success: false,
                message: 'Task ID is required'
            });
        }

        // Find the task to get the project ID and status
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Delete the task
        await Task.findByIdAndDelete(taskId);

        // Update project's task count, completed tasks, and progress
        const project = await Project.findById(task.projectID);
        if (project) {
            project.totalTasks = Math.max(0, project.totalTasks - 1);
            if (task.status === 'completed') {
                project.completedTasks = Math.max(0, project.completedTasks - 1);
            }
            project.progress = project.calculateProgress();
            await project.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });

    } catch (error) {
        console.error('Error in deleteTask:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
