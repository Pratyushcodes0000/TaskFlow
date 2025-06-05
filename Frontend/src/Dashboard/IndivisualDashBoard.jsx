import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FaPlus, FaEllipsisV, FaClock, FaUser, FaTag, FaTrash, FaPlay, FaStop, FaInfoCircle, FaCheck, FaCalendarAlt } from 'react-icons/fa';
import './IndivisualDashboard.css';
import axios from 'axios';
import ProjectProgress from '../components/ProjectProgress';


const IndivisualDashboard = () => {
  const { ID } = useParams();
  const navigate = useNavigate();

  const[todo,setTodo] = useState([]);
  const[inProgress,setInprogress] = useState([]);
  const[completed,setCompleted] = useState([]);
  const[review,setReview] = useState([]);
  const[data,setData] = useState(null);
  const [projectData, setProjectData] = useState(null);

  const [columns, setColumns] = useState({
    todo: {
      title: 'TO-DO',
      items: todo
    },
    inProgress: {
      title: 'In Progress',
      items: inProgress
    },
    completed: {
      title: 'Completed',
      items: completed
    },
    review: {
      title: 'Review',
      items: review
    }
  });

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    project: ID,
    tags: []
  });

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [taskDetails, setTaskDetails] = useState(null);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);

  const organizeTasks = (tasks) => {
    const todoTasks = tasks.filter(task => task.status === 'todo');
    const inProgressTasks = tasks.filter(task => task.status === 'inProgress');
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const reviewTasks = tasks.filter(task => task.status === 'review');

    setTodo(todoTasks);
    setInprogress(inProgressTasks);
    setCompleted(completedTasks);
    setReview(reviewTasks);

    setColumns({
      todo: {
        title: 'TO-DO',
        items: todoTasks
      },
      inProgress: {
        title: 'In Progress',
        items: inProgressTasks
      },
      completed: {
        title: 'Completed',
        items: completedTasks
      },
      review: {
        title: 'Review',
        items: reviewTasks
      }
    });
  };

  const fetchTask = async (projectId) => {
    if (!projectId) {
      console.error('Project ID is missing for fetchTask');
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('googleToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await axios.get(`http://localhost:8000/api/GetTask/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setData(response.data.data);
        organizeTasks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        // Handle unauthorized error - maybe redirect to login
        console.error('Authentication failed. Please log in again.');
      }
    }
  };

  const fetchProjectData = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('googleToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await axios.get(`http://localhost:8000/api/getProject/${ID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setProjectData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
    }
  };

  // Add useEffect to fetch tasks when component mounts
  useEffect(() => {
    if (ID) {
      fetchTask(ID);
      fetchProjectData();
    }
  }, [ID]);

  // Add useEffect to log projectId when it changes
  useEffect(() => {
    console.log('Current project ID:', ID);
  }, [ID]);

  const createTask = async (e) => {
    e.preventDefault();
    
    // Validate projectId
    if (!ID) {
      console.error('Project ID is missing');
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('googleToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await axios.post(`http://localhost:8000/api/createTask/${ID}`,
        {
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          dueDate: newTask.dueDate,
          projectId: ID,
          tags: newTask.tags,
          status: 'todo',
          type: 'individual'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Refresh tasks and project data after creating new one
        fetchTask(ID);
        fetchProjectData();
        setShowNewTaskModal(false);
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          dueDate: '',
          project: ID,
          tags: []
        });
      }
    } catch (error) {
      console.error('Error creating task:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        // Handle unauthorized error - maybe redirect to login
        console.error('Authentication failed. Please log in again.');
      }
    }
  };

  const availableTags = ['Design', 'UI', 'Backend', 'Frontend', 'Auth', 'Security', 'Setup','Review'];

  const handleTagChange = (tag) => {
    setNewTask(prev => {
      const currentTags = [...prev.tags];
      if (currentTags.includes(tag)) {
        return {
          ...prev,
          tags: currentTags.filter(t => t !== tag)
        };
      } else {
        return {
          ...prev,
          tags: [...currentTags, tag]
        };
      }
    });
  };

  const onDragStart = (result) => {
    const { draggableId } = result;
    const task = data.find(task => task._id === draggableId);
    if (task) {
      document.body.style.cursor = 'grabbing';
    }
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
    ) {
        return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId;
    const oldStatus = source.droppableId;

    // Get the token from localStorage - check both regular and Google tokens
    const token = localStorage.getItem('token') || localStorage.getItem('googleToken');
    if (!token) {
        console.error('No authentication token found');
        navigate('/login');
        return;
    }

    // Optimistically update the UI
    const updatedTasks = data.map(task => {
        if (task._id === taskId) {
            return { ...task, status: newStatus };
        }
        return task;
    });
    setData(updatedTasks);

    // Update the backend
    axios.patch(
        `http://localhost:8000/api/updateTaskStatus/${taskId}`,
        { 
            status: newStatus,
            projectId: ID
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    )
    .then(response => {
        if (response.data.success) {
            Promise.all([
                fetchTask(ID),
                fetchProjectData()
            ]).catch(error => {
                console.error('Error fetching updated data:', error);
            });
        } else {
            setData(data);
            console.error('Failed to update task status:', response.data.message);
        }
    })
    .catch(error => {
        setData(data);
        console.error('Error updating task status:', error.response?.data || error);
        if (error.response?.status === 401) {
            navigate('/login');
        }
    });
  };

  const onDragUpdate = (update) => {
    const { destination } = update;
    if (destination) {
      document.body.style.cursor = 'grabbing';
    }
  };

  const handleAddTask = () => {
    const newTaskId = Date.now().toString();
    const updatedColumns = {
      ...columns,
      todo: {
        ...columns.todo,
        items: [
          ...columns.todo.items,
          {
            id: newTaskId,
            ...newTask
          }
        ]
      }
    };
    setColumns(updatedColumns);
    setShowNewTaskModal(false);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      assignee: '',
      dueDate: '',
      tags: []
    });
  };

  const handleTaskAction = async (action, taskId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('googleToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      switch (action) {
        case 'delete':
          const deleteResponse = await axios.delete(
            `http://localhost:8000/api/deleteTask/${taskId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          if (deleteResponse.data.success) {
            fetchTask(ID);
            fetchProjectData();
          }
          break;

        case 'start':
          const startResponse = await axios.patch(
            `http://localhost:8000/api/updateTaskStatus/${taskId}`,
            {
              status: 'inProgress',
              projectId: ID,
              startedAt: new Date()
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          if (startResponse.data.success) {
            fetchTask(ID);
            fetchProjectData();
          }
          break;

        case 'end':
          const endResponse = await axios.patch(
            `http://localhost:8000/api/updateTaskStatus/${taskId}`,
            {
              status: 'completed',
              projectId: ID,
              completedAt: new Date()
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          if (endResponse.data.success) {
            fetchTask(ID);
            fetchProjectData();
          }
          break;

        case 'details':
          setTaskDetails(data.find(task => task._id === taskId));
          setShowTaskDetailsModal(true);
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error.response?.data || error.message);
    }
    setActiveDropdown(null);
  };

  const TaskCard = ({ task, dragHandleProps }) => (
    <div className="task-card">
      <div className="task-header" {...dragHandleProps}>
        <h3>{task.title}</h3>
        <div className="task-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === task._id ? null : task._id);
            }}
            className="task-menu"
            title="Task Actions"
          >
            <FaEllipsisV />
          </button>
          {activeDropdown === task._id && (
            <div className="task-dropdown">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleTaskAction('delete', task._id);
                }}
                className="dropdown-item delete"
              >
                <FaTrash /> Delete Task
              </button>
              {task.status === 'todo' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTaskAction('start', task._id);
                  }}
                  className="dropdown-item start"
                >
                  <FaPlay /> Start Task
                </button>
              )}
              {task.status === 'inProgress' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTaskAction('end', task._id);
                  }}
                  className="dropdown-item end"
                >
                  <FaStop /> End Task
                </button>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleTaskAction('details', task._id);
                }}
                className="dropdown-item details"
              >
                <FaInfoCircle /> See Full Details
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="task-description">{task.description}</p>
      <div className="task-footer">
        <div className="task-priority">
          <span className={`priority-badge ${task.priority}`}>
            {task.priority}
          </span>
        </div>
        <div className="task-due-date">
          <FaClock />
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );

  const TaskDetailsModal = ({ task, onClose }) => {
    if (!task) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content task-details-modal">
          <div className="modal-header">
            <h2>{task.title}</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="task-details-content">
            <div className="detail-section">
              <h3>Description</h3>
              <p>{task.description}</p>
            </div>
            <div className="detail-section">
              <h3>Priority</h3>
              <span className={`priority-badge ${task.priority}`}>
                {task.priority}
              </span>
            </div>
            <div className="detail-section">
              <h3>Due Date</h3>
              <p>{new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
            <div className="detail-section">
              <h3>Status</h3>
              <span className={`status-badge ${task.status}`}>
                {task.status}
              </span>
            </div>
            <div className="detail-section">
              <h3>Tags</h3>
              <div className="tags-container">
                {task.tags.map((tag, index) => (
                  <span key={index} className="task-tag">
                    <FaTag />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {task.startedAt && (
              <div className="detail-section">
                <h3>Started At</h3>
                <p>{new Date(task.startedAt).toLocaleString()}</p>
              </div>
            )}
            {task.completedAt && (
              <div className="detail-section">
                <h3>Completed At</h3>
                <p>{new Date(task.completedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {projectData && (
        <ProjectProgress
          progress={projectData.progress}
          totalTasks={projectData.totalTasks}
          completedTasks={projectData.completedTasks}
        />
      )}
      
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <div className="kanban-board">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="kanban-column">
              <div className="column-header">
                <h2>{column.title}</h2>
                {columnId === 'todo' && (
                  <button 
                    className="add-task-button"
                    onClick={() => setShowNewTaskModal(true)}
                  >
                    <FaPlus />
                    Add Task
                  </button>
                )}
              </div>
              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    className={`column-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {column.items.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                            style={{
                              ...provided.draggableProps.style,
                              transform: snapshot.isDragging ? provided.draggableProps.style.transform : 'none',
                              transition: snapshot.isDragging ? 'none' : 'all 0.2s ease',
                              cursor: 'grab'
                            }}
                          >
                            <div className="task-header">
                              <h3>{task.title}</h3>
                              <div className="task-actions">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdown(activeDropdown === task._id ? null : task._id);
                                  }}
                                  className="task-menu"
                                  title="Task Actions"
                                >
                                  <FaEllipsisV />
                                </button>
                                {activeDropdown === task._id && (
                                  <div className="task-dropdown">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTaskAction('delete', task._id);
                                      }}
                                      className="dropdown-item delete"
                                    >
                                      <FaTrash /> Delete Task
                                    </button>
                                    {task.status === 'todo' && (
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTaskAction('start', task._id);
                                        }}
                                        className="dropdown-item start"
                                      >
                                        <FaPlay /> Start Task
                                      </button>
                                    )}
                                    {task.status === 'inProgress' && (
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTaskAction('end', task._id);
                                        }}
                                        className="dropdown-item end"
                                      >
                                        <FaStop /> End Task
                                      </button>
                                    )}
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTaskAction('details', task._id);
                                      }}
                                      className="dropdown-item details"
                                    >
                                      <FaInfoCircle /> See Full Details
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="task-description">{task.description}</p>
                            <div className="task-footer">
                              <div className="task-priority">
                                <span className={`priority-badge ${task.priority}`}>
                                  {task.priority}
                                </span>
                              </div>
                              <div className="task-due-date">
                                <FaClock />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {showNewTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Task</h2>
            <form onSubmit={createTask}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tags</label>
                <div className="tags-container">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-option ${newTask.tags.includes(tag) ? 'selected' : ''}`}
                      onClick={() => handleTagChange(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowNewTaskModal(false)}>
                  Cancel
                </button>
                <button type="submit">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTaskDetailsModal && (
        <TaskDetailsModal 
          task={taskDetails} 
          onClose={() => {
            setShowTaskDetailsModal(false);
            setTaskDetails(null);
          }} 
        />
      )}
    </div>
  );
};

export default IndivisualDashboard;