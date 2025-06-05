const Task = require('../Model/Task');
const Project = require('../Model/Project');
const User = require('../Model/User');

const getAllProject = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        const projects = await Project.find({ userId: req.user._id })
            .populate('members', 'name email picture')
            .populate('tasks');

        // Calculate progress for each project
        for (let project of projects) {
            const tasks = await Task.find({ projectID: project._id });
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            const totalTasks = tasks.length;
            
            project.totalTasks = totalTasks;
            project.completedTasks = completedTasks;
            project.progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
            await project.save();
        }

        res.status(200).json({
            success: true,
            projects
        });
    } catch (error) {
        console.error('Error in getAllProject:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching projects",
            error: error.message
        });
    }
};


const createProject = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('User from request:', req.user);

        if (!req.user || !req.user._id) {
            console.log('Authentication failed - no user or user._id');
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        const { 
            title, 
            description, 
            priority, 
            dueDate, 
            startDate,
            status,
            type,
            tags 
        } = req.body;

        console.log('Extracted data:', {
            title,
            description,
            priority,
            dueDate,
            startDate,
            status,
            type,
            tags
        });

        // Validate required fields
        if (!title || !description) {
            console.log('Validation failed - missing required fields');
            return res.status(400).json({
                success: false,
                message: "Title and description are required"
            });
        }

        // Validate dates
        if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
            console.log('Validation failed - invalid dates');
            return res.status(400).json({
                success: false,
                message: "Due date must be after start date"
            });
        }

        // Create project data object
        const projectData = {
            title,
            description,
            priority: priority || 'medium',
            dueDate: dueDate || null,
            startDate: startDate || new Date(),
            status: status || 'planning',
            type: type || 'individual',
            userId: req.user._id,
            progress: 0,
            completedTasks: 0,
            totalTasks: 0,
            members: [],
            tasks: [],
            tags: tags || []
        };

        console.log('Attempting to create project with data:', projectData);

        // Create new project
        const newProject = await Project.create(projectData);
        console.log('Project created successfully:', newProject);

        // Populate the created project
        const populatedProject = await Project.findById(newProject._id)
            .populate('members', 'name email picture')
            .populate('tasks');

        console.log('Populated project:', populatedProject);

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            project: populatedProject
        });
    } catch (error) {
        console.error('Detailed error in createProject:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({
            success: false,
            message: "Error creating project",
            error: error.message
        });
    }
};

const getProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        
        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: 'Project ID is required'
            });
        }

        const project = await Project.findById(projectId)
            .populate('members', 'name email picture')
            .populate('tasks');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Calculate progress
        const tasks = await Task.find({ projectID: projectId });
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const totalTasks = tasks.length;
        
        project.totalTasks = totalTasks;
        project.completedTasks = completedTasks;
        project.progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
        await project.save();

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error('Error in getProject:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching project',
            error: error.message
        });
    }
};

module.exports = {
    getAllProject,
    createProject,
    getProject
};


