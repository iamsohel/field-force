import { useEffect, useState } from 'react';
import { Plus, CheckCircle, Clock, AlertCircle, Filter } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { useTasksStore } from '@store/tasksStore';
import { formatDate, formatTime } from '@utils/helpers';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import StatCard from '@components/common/StatCard';
import CreateTaskModal from './CreateTaskModal';

function Tasks() {
  const { user } = useAuthStore();
  const { tasks, fetchTasks, updateTaskStatus } = useTasksStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, today, week, overdue

  useEffect(() => {
    if (user) {
      fetchTasks(user.id);
    }
  }, [user]);

  const filterTasks = (taskList, status) => {
    let filtered = taskList.filter(t => t.status === status);

    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));
    const weekEnd = new Date(today.setDate(today.getDate() + 7));

    switch (filter) {
      case 'today':
        filtered = filtered.filter(t => {
          const dueDate = new Date(t.dueDate);
          return dueDate >= todayStart && dueDate <= todayEnd;
        });
        break;
      case 'week':
        filtered = filtered.filter(t => {
          const dueDate = new Date(t.dueDate);
          return dueDate >= todayStart && dueDate <= weekEnd;
        });
        break;
      case 'overdue':
        filtered = filtered.filter(t => {
          const dueDate = new Date(t.dueDate);
          return dueDate < todayStart;
        });
        break;
      default:
        break;
    }

    return filtered;
  };

  const pendingTasks = filterTasks(tasks, 'pending');
  const inProgressTasks = filterTasks(tasks, 'in-progress');
  const completedTasks = filterTasks(tasks, 'completed');

  const handleUpdateStatus = async (taskId, newStatus) => {
    await updateTaskStatus(taskId, newStatus);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600 bg-red-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-blue-600 bg-blue-100',
    };
    return colors[priority] || colors.low;
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Tasks</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input text-sm py-2"
          >
            <option value="all">All Tasks</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="overdue">Overdue</option>
          </select>

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <StatCard
          icon={AlertCircle}
          title="Pending"
          value={pendingTasks.length}
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

      {/* Task Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Pending */}
        <Card title="Pending" subtitle={`${pendingTasks.length} tasks`}>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {pendingTasks.map(task => (
              <div key={task.id} className="p-3 lg:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm lg:text-base">{task.title}</h4>
                  <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                </div>
                <p className="text-xs lg:text-sm text-gray-600 mb-3">{task.description}</p>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-gray-500 mb-3">
                  <span>{formatDate(task.dueDate)}</span>
                  <span>{formatTime(task.dueDate)}</span>
                </div>
                {task.location && (
                  <p className="text-xs text-gray-500 mb-3 truncate">{task.location.address}</p>
                )}
                <button
                  onClick={() => handleUpdateStatus(task.id, 'in-progress')}
                  className="w-full btn btn-primary text-xs lg:text-sm py-2"
                >
                  Start Task
                </button>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No pending tasks</p>
            )}
          </div>
        </Card>

        {/* In Progress */}
        <Card title="In Progress" subtitle={`${inProgressTasks.length} tasks`}>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {inProgressTasks.map(task => (
              <div key={task.id} className="p-3 lg:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm lg:text-base">{task.title}</h4>
                  <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                </div>
                <p className="text-xs lg:text-sm text-gray-600 mb-3">{task.description}</p>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-gray-500 mb-3">
                  <span>{formatDate(task.dueDate)}</span>
                  <span>{formatTime(task.dueDate)}</span>
                </div>
                {task.location && (
                  <p className="text-xs text-gray-500 mb-3 truncate">{task.location.address}</p>
                )}
                <button
                  onClick={() => handleUpdateStatus(task.id, 'completed')}
                  className="w-full btn btn-success text-xs lg:text-sm py-2"
                >
                  Complete Task
                </button>
              </div>
            ))}
            {inProgressTasks.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No tasks in progress</p>
            )}
          </div>
        </Card>

        {/* Completed */}
        <Card title="Completed" subtitle={`${completedTasks.length} tasks`}>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {completedTasks.map(task => (
              <div key={task.id} className="p-3 lg:p-4 bg-green-50 border border-green-200 rounded-lg opacity-75">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm lg:text-base">{task.title}</h4>
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                </div>
                <p className="text-xs lg:text-sm text-gray-600 mb-2">{task.description}</p>
                {task.completedAt && (
                  <p className="text-xs text-gray-500">
                    Completed: {formatDate(task.completedAt)} at {formatTime(task.completedAt)}
                  </p>
                )}
              </div>
            ))}
            {completedTasks.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No completed tasks</p>
            )}
          </div>
        </Card>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}

export default Tasks;
