import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FaPlus, FaEllipsisV, FaClock, FaUser, FaTag } from 'react-icons/fa';
import './GroupDashboard.css';

const IndivisualDashboard = () => {
  const [columns, setColumns] = useState({
    todo: {
      title: 'TO-DO',
      items: [
        {
          id: '1',
          title: 'Design System Setup',
          description: 'Create a consistent design system for the project',
          priority: 'high',
          assignee: 'John Doe',
          dueDate: '2024-03-25',
          tags: ['Design', 'UI']
        },
        {
          id: '2',
          title: 'API Integration',
          description: 'Integrate backend APIs with frontend',
          priority: 'medium',
          assignee: 'Jane Smith',
          dueDate: '2024-03-28',
          tags: ['Backend', 'API']
        }
      ]
    },
    inProgress: {
      title: 'In Progress',
      items: [
        {
          id: '3',
          title: 'User Authentication',
          description: 'Implement OAuth2 authentication flow',
          priority: 'high',
          assignee: 'Mike Johnson',
          dueDate: '2024-03-26',
          tags: ['Security', 'Auth']
        }
      ]
    },
    completed: {
      title: 'Completed',
      items: [
        {
          id: '4',
          title: 'Project Setup',
          description: 'Initial project configuration and setup',
          priority: 'low',
          assignee: 'Sarah Wilson',
          dueDate: '2024-03-20',
          tags: ['Setup']
        }
      ]
    },
    review: {
      title: 'Review',
      items: [
        {
          id: '5',
          title: 'Database Schema',
          description: 'Review and optimize database schema',
          priority: 'medium',
          assignee: 'Alex Brown',
          dueDate: '2024-03-27',
          tags: ['Database']
        }
      ]
    }
  });

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    tags: []
  });

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
                        key={task.id}
                        draggableId={task.id}
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
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddTask();
            }}>
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
              <div className="modal-actions">
                <button type="button" onClick={() => setShowNewTaskModal(false)}>
                  Cancel
                </button>
                <button type="submit">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndivisualDashboard;
