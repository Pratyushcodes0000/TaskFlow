import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FaPlus, FaEllipsisV, FaClock, FaUser, FaTag } from 'react-icons/fa';
import './IndivisualDashboard.css';
import axios from 'axios';

const IndivisualDashboard = () => {
  const { ID } = useParams();

  const[todo,setTodo] = useState([]);
  const[inProgress,setInprogress] = useState([]);
  const[completed,setCompleted] = useState([]);
  const[review,setReview] = useState([]);
  const[data,setData] = useState(null);

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

  // Add useEffect to fetch tasks when component mounts
  useEffect(() => {
    if (ID) {
      fetchTask(ID);
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
        // Refresh tasks after creating new one
        fetchTask(ID);
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

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems
        }
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems
        }
      });
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

  const TaskCard = ({ task }) => (
    <div className="task-card">
      <div className="task-header">
        <h3>{task.title}</h3>
        <button className="task-menu">
          <FaEllipsisV />
        </button>
      </div>
      <p className="task-description">{task.description}</p>
      <div className="task-meta">
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
      <div className="task-footer">
        <div className="task-assignee">
          <FaUser />
          <span>{task.assignee}</span>
        </div>
        <div className="task-tags">
          {task.tags.map((tag, index) => (
            <span key={index} className="task-tag">
              <FaTag />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <DragDropContext onDragEnd={onDragEnd}>
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
                {(provided) => (
                  <div
                    className="column-content"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {column.items.map((task, index) => (
                      <Draggable
                        key={task._id || task.id}
                        draggableId={task._id || task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard task={task} />
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
    </div>
  );
};

export default IndivisualDashboard;
