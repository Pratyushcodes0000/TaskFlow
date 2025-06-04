import React, { useState } from 'react';
import { FaUsers, FaUser, FaPlus, FaEllipsisV, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import './ProjectsManagement.css';

const ProjectsManagement = () => {
  const [activeTab, setActiveTab] = useState('group');
  const navigate = useNavigate();

  // Sample data - replace with actual data from your backend
  const groupProjects = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete overhaul of company website with modern design',
      progress: 75,
      members: 4,
      dueDate: '2024-04-15',
      status: 'In Progress',
      priority: 'High',
      tasks: 12,
      completedTasks: 9
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'Development of cross-platform mobile application',
      progress: 30,
      members: 6,
      dueDate: '2024-05-20',
      status: 'Planning',
      priority: 'Medium',
      tasks: 8,
      completedTasks: 2
    }
  ];

  const individualProjects = [
    {
      id: 1,
      name: 'Personal Portfolio',
      description: 'Create a professional portfolio website',
      progress: 90,
      dueDate: '2024-03-30',
      status: 'Almost Done',
      priority: 'High',
      tasks: 5,
      completedTasks: 4
    },
    {
      id: 2,
      name: 'Learning React',
      description: 'Complete React.js course and build sample projects',
      progress: 45,
      dueDate: '2024-04-10',
      status: 'In Progress',
      priority: 'Medium',
      tasks: 10,
      completedTasks: 4
    }
  ];

  const handleProjectClick = (projectId) => {
    navigate(`GroupDashboard/${projectId}`);
  };

  const ProjectCard = ({ project, isGroup }) => (
    <div 
      className="project-card"
      onClick={() => handleProjectClick(project.id)}
    >
      <div className="project-header">
        <div className="project-title-section">
          <h3>{project.name}</h3>
          <span className={`priority-badge ${project.priority.toLowerCase()}`}>
            {project.priority}
          </span>
        </div>
        <div className="project-actions">
          <button 
            className="action-button"
            onClick={(e) => {
              e.stopPropagation();
              // Handle project actions
            }}
          >
            <FaEllipsisV />
          </button>
        </div>
      </div>

      <p className="project-description">{project.description}</p>
      
      <div className="project-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
        <span className="progress-text">{project.progress}%</span>
      </div>

      <div className="project-details">
        {isGroup && (
          <div className="project-members">
            <FaUsers />
            <span>{project.members} members</span>
          </div>
        )}
        <div className="project-tasks">
          <FaChartLine />
          <span>{project.completedTasks}/{project.tasks} tasks</span>
        </div>
        <div className="project-due-date">
          <FaCalendarAlt />
          <span>{new Date(project.dueDate).toLocaleDateString()}</span>
        </div>
        <div className="project-status">
          <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
            {project.status}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="projects-management-container">
      <div className="projects-header">
        <h1>Projects</h1>
        <Link to="/NewProject" className="new-project-button">
          <FaPlus />
          New Project
        </Link>
      </div>

      <div className="project-tabs">
        <button 
          className={`tab-button ${activeTab === 'group' ? 'active' : ''}`}
          onClick={() => setActiveTab('group')}
        >
          <FaUsers />
          Group Projects
        </button>
        <button 
          className={`tab-button ${activeTab === 'individual' ? 'active' : ''}`}
          onClick={() => setActiveTab('individual')}
        >
          <FaUser />
          Individual Projects
        </button>
      </div>

      <div className="projects-section">
        {activeTab === 'group' ? (
          <div className="projects-grid">
            {groupProjects.map(project => (
              <ProjectCard key={project.id} project={project} isGroup={true} />
            ))}
          </div>
        ) : (
          <div className="projects-grid">
            {individualProjects.map(project => (
              <ProjectCard key={project.id} project={project} isGroup={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsManagement;
