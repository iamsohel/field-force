import { useEffect, useState } from 'react';
import { Plus, CheckCircle, Clock, AlertCircle, Filter, List, LayoutGrid, Users, Trash2, Calendar, Search } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { useTasksStore } from '@store/tasksStore';
import { formatDate, formatTime } from '@utils/helpers';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import StatCard from '@components/common/StatCard';
import Pagination from '@components/common/Pagination';
import ConfirmModal from '@components/common/ConfirmModal';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';
import { usersApi } from '@services/api';

function Tasks() {
  const { user } = useAuthStore();
  const { tasks, fetchTasks, updateTaskStatus, updateTask, deleteTask, isLoading } = useTasksStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewType, setViewType] = useState('list'); // 'list' or 'kanban'
  const [statusFilter, setStatusFilter] = useState('all'); // all, todo, in-progress, completed, on-hold, cancelled
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState(''); // For admin only
  const [searchQuery, setSearchQuery] = useState(''); // Search by task name or description
  const [allUsers, setAllUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // For list view pagination
  const [draggedTask, setDraggedTask] = useState(null);
  const isAdmin = user?.role === 'admin';

  // Fetch all users for admin dropdown
  useEffect(() => {
    if (isAdmin) {
      const loadUsers = async () => {
        try {
          const response = await usersApi.getAll();
          if (response.success) {
            const employees = response.data.filter(u => u.role !== 'admin');
            setAllUsers(employees);
          }
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };
      loadUsers();
    }
  }, [isAdmin]);

  // Set default date range based on date filter
  useEffect(() => {
    const today = new Date();
    let start, end;

    switch (dateFilter) {
      case 'today':
        start = new Date(today);
        end = new Date(today);
        break;
      case 'week':
        start = new Date(today);
        start.setDate(today.getDate() - today.getDay()); // Start of week
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'custom':
        // Keep existing dates
        break;
      default:
        start = null;
        end = null;
    }

    if (dateFilter !== 'custom' && dateFilter !== 'all') {
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  }, [dateFilter]);

  // Fetch tasks with filters
  useEffect(() => {
    if (user) {
      const filters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        startDate: dateFilter !== 'all' ? startDate : undefined,
        endDate: dateFilter !== 'all' ? endDate : undefined,
        employeeId: isAdmin && employeeFilter ? employeeFilter : undefined,
      };
      fetchTasks(user.id, filters);
      setCurrentPage(1); // Reset to first page when filters change
    }
  }, [user, statusFilter, dateFilter, startDate, endDate, employeeFilter, isAdmin]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', task.id);
    
    // Make original element semi-transparent and add scale
    e.currentTarget.style.opacity = '0.4';
    e.currentTarget.style.transform = 'scale(0.95)';
    e.currentTarget.style.transition = 'all 0.2s ease';
    e.currentTarget.style.cursor = 'grabbing';
  };

  const handleDragEnd = (e) => {
    // Reset styles smoothly
    e.currentTarget.style.opacity = '1';
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.cursor = '';
    // Mark that we just finished dragging to prevent click event
    e.currentTarget.dataset.justDragged = 'true';
    setTimeout(() => {
      e.currentTarget.style.transition = '';
      delete e.currentTarget.dataset.justDragged;
    }, 200);
    setDraggedTask(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    // Add visual feedback with smooth transition
    const dropZone = e.currentTarget;
    if (!dropZone.classList.contains('drag-over')) {
      dropZone.classList.add('drag-over');
      dropZone.style.backgroundColor = '#eff6ff';
      dropZone.style.borderColor = '#3b82f6';
      dropZone.style.borderWidth = '2px';
      dropZone.style.borderStyle = 'dashed';
      dropZone.style.borderRadius = '8px';
      dropZone.style.transition = 'all 0.2s ease';
    }
  };

  const handleDragLeave = (e) => {
    // Only remove if we're actually leaving the drop zone
    const dropZone = e.currentTarget;
    const rect = dropZone.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      dropZone.classList.remove('drag-over');
      dropZone.style.backgroundColor = '';
      dropZone.style.borderColor = '';
      dropZone.style.borderWidth = '';
      dropZone.style.borderStyle = '';
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    e.stopPropagation();
    
    const dropZone = e.currentTarget;
    // Remove visual feedback
    dropZone.classList.remove('drag-over');
    dropZone.style.backgroundColor = '';
    dropZone.style.borderColor = '';
    dropZone.style.borderWidth = '';
    dropZone.style.borderStyle = '';
    
    // Get task data from drag event or state
    let taskToMove = draggedTask;
    if (!taskToMove) {
      try {
        const data = e.dataTransfer.getData('application/json');
        if (data) {
          const parsedData = JSON.parse(data);
          // Find the actual task from the tasks array
          taskToMove = tasks.find(t => t.id === parsedData.id);
          if (!taskToMove) {
            // Fallback to parsed data if task not found
            taskToMove = parsedData;
          }
        }
      } catch (err) {
        console.error('Error parsing drag data:', err);
      }
    }
    
    // Also try to get from dataTransfer text/html as fallback
    if (!taskToMove) {
      const taskId = e.dataTransfer.getData('text/html');
      if (taskId) {
        taskToMove = tasks.find(t => t.id === taskId);
      }
    }
    
    if (taskToMove && taskToMove.status !== targetStatus) {
      // Optimistic update - update immediately without waiting for API
      const success = await updateTaskStatus(taskToMove.id, targetStatus, true);
      if (!success) {
        console.error('Failed to update task status');
      }
    }
    setDraggedTask(null);
  };

  // Get user initials for avatar
  const getUserInitials = (userId) => {
    // Check in allUsers first (for admin)
    let foundUser = allUsers.find(u => u.id === userId);
    
    // If not found and it's the current user, use current user data
    if (!foundUser && user && user.id === userId) {
      foundUser = user;
    }
    
    if (foundUser) {
      const names = foundUser.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return foundUser.name.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Get user avatar or return null
  const getUserAvatar = (userId) => {
    // Check in allUsers first (for admin)
    let foundUser = allUsers.find(u => u.id === userId);
    
    // If not found and it's the current user, use current user data
    if (!foundUser && user && user.id === userId) {
      foundUser = user;
    }
    
    return foundUser?.avatar || null;
  };

  const handleCardClick = (task, e) => {
    // Don't open edit modal if clicking on delete button
    if (e && e.target.closest('button')) {
      return;
    }
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleDelete = (task, e) => {
    e.stopPropagation(); // Prevent card click
    setSelectedTask(task);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedTask) {
      await deleteTask(selectedTask.id);
      setShowDeleteModal(false);
      setSelectedTask(null);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600 bg-red-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-blue-600 bg-blue-100',
    };
    return colors[priority] || colors.low;
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-yellow-50 border-yellow-300',
      'in-progress': 'bg-blue-50 border-blue-300',
      completed: 'bg-green-50 border-green-300',
      'on-hold': 'bg-purple-50 border-purple-300',
      cancelled: 'bg-red-50 border-red-300',
    };
    return colors[status] || colors.todo;
  };

  // Colorful status badge styles
  const getStatusBadgeStyle = (status) => {
    const styles = {
      todo: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-yellow-600 shadow-sm',
      'in-progress': 'bg-gradient-to-r from-blue-400 to-blue-500 text-white border-blue-600 shadow-sm',
      completed: 'bg-gradient-to-r from-green-400 to-green-500 text-white border-green-600 shadow-sm',
      'on-hold': 'bg-gradient-to-r from-purple-400 to-purple-500 text-white border-purple-600 shadow-sm',
      cancelled: 'bg-gradient-to-r from-red-400 to-red-500 text-white border-red-600 shadow-sm',
    };
    return styles[status] || styles.todo;
  };

  // Get user name helper
  const getUserName = (userId) => {
    const foundUser = allUsers.find(u => u.id === userId);
    return foundUser ? foundUser.name : `User ${userId}`;
  };

  // Filter tasks by search query (name or description)
  const filteredTasksBySearch = searchQuery
    ? tasks.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;

  // Filtered tasks for stats and kanban (only todo, in-progress, completed)
  const todoTasks = filteredTasksBySearch.filter(t => t.status === 'todo');
  const inProgressTasks = filteredTasksBySearch.filter(t => t.status === 'in-progress');
  const completedTasks = filteredTasksBySearch.filter(t => t.status === 'completed');
  const onHoldTasks = filteredTasksBySearch.filter(t => t.status === 'on-hold');
  const cancelledTasks = filteredTasksBySearch.filter(t => t.status === 'cancelled');

  // For list view, paginate all tasks together
  const getPaginatedTasks = (taskList, page) => {
    const indexOfLastItem = page * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTasks = taskList.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(taskList.length / itemsPerPage);
    return { currentTasks, totalPages, indexOfFirstItem, indexOfLastItem };
  };

  const listPagination = getPaginatedTasks(filteredTasksBySearch, currentPage);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Tasks</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary text-sm lg:text-base whitespace-nowrap"
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5 inline mr-2" />
            New Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          icon={AlertCircle}
          title="Todo"
          value={todoTasks.length}
          color="warning"
        />
        <StatCard
          icon={Clock}
          title="In Progress"
          value={inProgressTasks.length}
          color="info"
        />
        <StatCard
          icon={CheckCircle}
          title="Completed"
          value={completedTasks.length}
          color="success"
        />
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>
          
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Search className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              placeholder="Search by task name or description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Employee Filter (Admin only) */}
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Users className="w-4 h-4 inline mr-1" />
                  Employee
                </label>
                <select
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  className="input"
                >
                  <option value="">All Employees</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Status</option>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* View Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">View</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewType('kanban')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewType === 'kanban'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 inline mr-1" />
                  Kanban
                </button>
                <button
                  onClick={() => setViewType('list')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewType === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <List className="w-4 h-4 inline mr-1" />
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading tasks...</div>
      ) : viewType === 'kanban' ? (
        /* Kanban View - Only Todo, In Progress, Completed */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Todo */}
            <Card title="Todo" subtitle={`${todoTasks.length} tasks`} className="bg-gray-50">
              <div
                className="space-y-3 max-h-[600px] overflow-y-auto min-h-[200px] pr-2 bg-gray-50 rounded-lg"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'todo')}
              >
                {todoTasks.map(task => {
                  const priorityBarColor = {
                    high: 'bg-red-500',
                    medium: 'bg-yellow-500',
                    low: 'bg-blue-500',
                  }[task.priority] || 'bg-gray-500';
                  
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        handleDragStart(e, task);
                      }}
                      onDragEnd={(e) => {
                        e.stopPropagation();
                        handleDragEnd(e);
                      }}
                      onDragOver={(e) => {
                        // Prevent cards from blocking drop zones
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        // Don't trigger click if we just finished dragging
                        if (!e.currentTarget.dataset.justDragged) {
                          handleCardClick(task, e);
                        }
                        delete e.currentTarget.dataset.justDragged;
                      }}
                      onMouseDown={(e) => {
                        // Clear the flag when mouse is pressed
                        delete e.currentTarget.dataset.justDragged;
                      }}
                      className="group bg-white border border-gray-200 rounded-lg p-3 cursor-move hover:shadow-lg transition-all duration-200 shadow-sm"
                    >
                      {/* Priority Bar */}
                      <div className={`h-1 ${priorityBarColor} rounded-t-lg -mx-3 -mt-3 mb-3`} />
                      
                      {/* Task Title */}
                      <h4 className="font-medium text-gray-900 text-sm mb-3 line-clamp-2">{task.title}</h4>
                      
                      {/* Due Date */}
                      <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                      
                      {/* Footer: Responsible Person */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          {getUserAvatar(task.userId) ? (
                            <img
                              src={getUserAvatar(task.userId)}
                              alt={getUserName(task.userId)}
                              className="w-6 h-6 rounded-full border border-gray-200"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium border border-primary-200">
                              {getUserInitials(task.userId)}
                            </div>
                          )}
                          <span className="text-xs text-gray-600">{getUserName(task.userId)}</span>
                        </div>
                        <button
                          onClick={(e) => handleDelete(task, e)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {todoTasks.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">No todo tasks</p>
                )}
              </div>
            </Card>

            {/* In Progress */}
            <Card title="In Progress" subtitle={`${inProgressTasks.length} tasks`}>
              <div
                className="space-y-3 max-h-[600px] overflow-y-auto min-h-[200px] pr-2 bg-gray-50 rounded-lg -mx-4 -mb-4 px-4 pb-4"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'in-progress')}
              >
                {inProgressTasks.map(task => {
                  const priorityBarColor = {
                    high: 'bg-red-500',
                    medium: 'bg-yellow-500',
                    low: 'bg-blue-500',
                  }[task.priority] || 'bg-gray-500';
                  
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => handleCardClick(task, e)}
                      className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200"
                    >
                      {/* Priority Bar */}
                      <div className={`h-1 ${priorityBarColor} rounded-t-lg -mx-3 -mt-3 mb-3`} />
                      
                      {/* Task Title */}
                      <h4 className="font-medium text-gray-900 text-sm mb-3 line-clamp-2">{task.title}</h4>
                      
                      {/* Due Date */}
                      <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                      
                      {/* Footer: Responsible Person */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          {getUserAvatar(task.userId) ? (
                            <img
                              src={getUserAvatar(task.userId)}
                              alt={getUserName(task.userId)}
                              className="w-6 h-6 rounded-full border border-gray-200"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium border border-primary-200">
                              {getUserInitials(task.userId)}
                            </div>
                          )}
                          <span className="text-xs text-gray-600">{getUserName(task.userId)}</span>
                        </div>
                        <button
                          onClick={(e) => handleDelete(task, e)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {inProgressTasks.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">No tasks in progress</p>
                )}
              </div>
            </Card>

            {/* Completed */}
            <Card title="Completed" subtitle={`${completedTasks.length} tasks`}>
              <div
                className="space-y-3 max-h-[600px] overflow-y-auto min-h-[200px] pr-2 bg-gray-50 rounded-lg -mx-4 -mb-4 px-4 pb-4"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'completed')}
              >
                {completedTasks.map(task => {
                  const priorityBarColor = {
                    high: 'bg-red-500',
                    medium: 'bg-yellow-500',
                    low: 'bg-blue-500',
                  }[task.priority] || 'bg-gray-500';
                  
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => handleCardClick(task, e)}
                      className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200 opacity-75"
                    >
                      {/* Priority Bar */}
                      <div className={`h-1 ${priorityBarColor} rounded-t-lg -mx-3 -mt-3 mb-3`} />
                      
                      {/* Task Title */}
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1">{task.title}</h4>
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 ml-2" />
                      </div>
                      
                      {/* Due Date */}
                      <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                      
                      {/* Footer: Responsible Person */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          {getUserAvatar(task.userId) ? (
                            <img
                              src={getUserAvatar(task.userId)}
                              alt={getUserName(task.userId)}
                              className="w-6 h-6 rounded-full border border-gray-200"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium border border-primary-200">
                              {getUserInitials(task.userId)}
                            </div>
                          )}
                          <span className="text-xs text-gray-600">{getUserName(task.userId)}</span>
                        </div>
                        <button
                          onClick={(e) => handleDelete(task, e)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {completedTasks.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">No completed tasks</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* List View - Shows all statuses */
        <Card title="Task List">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {listPagination.currentTasks.length > 0 ? (
                  listPagination.currentTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50 cursor-pointer" onClick={(e) => handleCardClick(task, e)}>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getUserName(task.userId)}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{task.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                          {task.location && (
                            <p className="text-xs text-gray-400 mt-1">{task.location.address}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div>{formatDate(task.dueDate)}</div>
                        <div className="text-xs text-gray-500">{formatTime(task.dueDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeStyle(task.status)}`}>
                          {task.status === 'todo' ? 'Todo' : task.status === 'in-progress' ? 'In Progress' : task.status === 'on-hold' ? 'On Hold' : task.status === 'cancelled' ? 'Cancelled' : task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleDelete(task, e)}
                          className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="px-6 py-8 text-center text-sm text-gray-500">
                      No tasks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {listPagination.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={listPagination.totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredTasksBySearch.length}
              itemsPerPage={itemsPerPage}
              indexOfFirstItem={listPagination.indexOfFirstItem}
              indexOfLastItem={listPagination.indexOfLastItem}
            />
          )}
        </Card>
      )}

      {/* Modals */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <EditTaskModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onStatusChange={() => {
          // Refetch tasks when status changes
          if (user) {
            const filters = {
              status: statusFilter !== 'all' ? statusFilter : undefined,
              startDate: dateFilter !== 'all' ? startDate : undefined,
              endDate: dateFilter !== 'all' ? endDate : undefined,
              employeeId: isAdmin && employeeFilter ? employeeFilter : undefined,
            };
            fetchTasks(user.id, filters);
          }
        }}
      />
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTask(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${selectedTask?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}

export default Tasks;
