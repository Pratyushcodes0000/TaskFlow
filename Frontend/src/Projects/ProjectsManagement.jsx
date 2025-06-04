import React, { useState, useEffect } from 'react';
import { FaUsers, FaUser, FaPlus, FaEllipsisV, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './ProjectsManagement.css';

const ProjectsManagement = () => {
  const [activeTab, setActiveTab] = useState('group');
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const googleToken = localStorage.getItem('googleToken');
    
    // Use the appropriate token
    const authToken = token || googleToken;
    if (authToken) {
      fetchProjects(authToken);
    }
  }, []);

  const fetchProjects = async (token) => {
    try {
      const response = await axios.get('http://localhost:8000/api/getAllProject', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setProjects(response.data.projects || []);
      } else {
        console.error('Failed to fetch projects:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('googleToken');
        navigate('/login');
      }
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/GroupDashboard/${projectId}`);
  };

  const ProjectCard = ({ project, isGroup }) => {
    console.log('Project data in card:', project);
    return (
      <div 
        className="project-card"
        onClick={() => handleProjectClick(project._id)}
      >
        <div className="project-header">
          <div className="project-title-section">
            <h3>{project.title || 'Untitled Project'}</h3>
            <span className={`priority-badge ${(project.priority || 'medium').toLowerCase()}`}>
              {project.priority || 'Medium'}
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

        <p className="project-description">{project.description || 'No description available'}</p>
        
        <div className="project-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${project.progress || 0}%` }}
            ></div>
          </div>
          <span className="progress-text">{project.progress || 0}%</span>
        </div>

        <div className="project-details">
          {isGroup && (
            <div className="project-members">
              <FaUsers />
              <span>{Array.isArray(project.members) ? project.members.length : 0} members</span>
            </div>
          )}
          <div className="project-tasks">
            <FaChartLine />
            <span>{project.completedTasks || 0}/{project.totalTasks || 0} tasks</span>
          </div>
          <div className="project-due-date">
            <FaCalendarAlt />
            <span>{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}</span>
          </div>
          <div className="project-status">
            <span className={`status-badge ${(project.status || 'pending').toLowerCase().replace(' ', '-')}`}>
              {project.status || 'Pending'}
            </span>
          </div>
        </div>
      </div>
    );
  };

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
            {projects
              .filter(project => project.type === 'group')
              .map(project => (
                <ProjectCard key={project._id} project={project} isGroup={true} />
              ))}
          </div>
        ) : (
          <div className="projects-grid">
            {projects
              .filter(project => project.type === 'individual')
              .map(project => (
                <ProjectCard key={project._id} project={project} isGroup={false} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsManagement;
