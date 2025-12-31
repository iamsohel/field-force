import { useEffect, useState } from 'react';
import { ListTodo, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { useAttendanceStore } from '@store/attendanceStore';
import { useTasksStore } from '@store/tasksStore';
import { locationApi, metricsApi } from '@services/api';
import { formatNumber, formatCurrency, formatDistance } from '@utils/helpers';
import StatCard from '@components/common/StatCard';
import Card from '@components/common/Card';
import Map from '@components/common/Map';
import UserProfileCard from './components/UserProfileCard';
import ActivityTimeline from './components/ActivityTimeline';

function Dashboard() {
  const { user } = useAuthStore();
  const { todayAttendance, fetchTodayAttendance } = useAttendanceStore();
  const { tasks, fetchTasks } = useTasksStore();
  const [metrics, setMetrics] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);

  useEffect(() => {
    if (user) {
      fetchTodayAttendance(user.id);
      fetchTasks(user.id);
      loadMetrics();
      loadLocationHistory();
    }
  }, [user]);

  const loadMetrics = async () => {
    const response = await metricsApi.getByUserId(user.id);
    if (response.success) {
      setMetrics(response.data);
    }
  };

  const loadLocationHistory = async () => {
    const response = await locationApi.getLocationHistory(user.id);
    if (response.success) {
      setLocationHistory(response.data);
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;

  // Prepare map data
  const mapMarkers = locationHistory.map((loc, index) => ({
    lat: loc.location.lat,
    lng: loc.location.lng,
    popup: {
      title: loc.activity,
      time: new Date(loc.timestamp).toLocaleTimeString(),
    },
  }));

  const mapRoute = locationHistory.map(loc => ({
    lat: loc.location.lat,
    lng: loc.location.lng,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={ListTodo}
          title="Total Tasks"
          value={tasks.length}
          subtitle={`${pendingTasks} pending`}
          color="primary"
        />
        <StatCard
          icon={CheckCircle}
          title="Completed"
          value={completedTasks}
          subtitle={`${metrics ? Math.round((completedTasks / tasks.length) * 100) : 0}% completion rate`}
          color="success"
        />
        <StatCard
          icon={Clock}
          title="In Progress"
          value={inProgressTasks}
          subtitle="Active tasks"
          color="warning"
        />
        <StatCard
          icon={TrendingUp}
          title="Distance"
          value={metrics ? formatDistance(metrics.distanceTraveled) : '0 km'}
          subtitle="This month"
          color="info"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - User Profile */}
        <div className="lg:col-span-1">
          <UserProfileCard />
          <div className="mt-6">
            <ActivityTimeline />
          </div>
        </div>

        {/* Center - Map and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Task Card */}
          {inProgressTasks > 0 && (
            <Card title="Current Task" className="bg-gradient-to-r from-primary-50 to-blue-50">
              <div className="space-y-3">
                {tasks
                  .filter(t => t.status === 'in-progress')
                  .map(task => (
                    <div key={task.id}>
                      <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      {task.location && (
                        <p className="text-xs text-gray-500 mt-2">
                          {task.location.address}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* Map */}
          <Card title="Location Tracking" className="h-[500px]">
            <div className="h-full">
              <Map
                center={[28.6139, 77.2090]}
                zoom={12}
                markers={mapMarkers}
                route={mapRoute}
              />
            </div>
          </Card>

          {/* Task Reports Section */}
          <Card title="Task Statistics">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{pendingTasks}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar - Performance Metrics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Performance Card */}
          {metrics && (
            <Card title="Performance" subtitle="This month">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Target Achievement</span>
                    <span className="font-medium">
                      {Math.round((metrics.salesValue / metrics.target) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((metrics.salesValue / metrics.target) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatCurrency(metrics.salesValue)}</span>
                    <span>{formatCurrency(metrics.target)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Visits Completed</span>
                    <span className="font-medium">
                      {metrics.visitsCompleted}/{metrics.visitsPlanned}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Conversion Rate</span>
                    <span className="font-medium text-green-600">
                      {(metrics.conversionRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Time/Visit</span>
                    <span className="font-medium">{metrics.avgTimePerVisit} min</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="space-y-2">
              <button className="w-full btn btn-primary">
                Start New Visit
              </button>
              <button className="w-full btn btn-secondary">
                Add Task
              </button>
              <button className="w-full btn btn-secondary">
                Create Order
              </button>
              <button className="w-full btn btn-secondary">
                Log Expense
              </button>
            </div>
          </Card>

          {/* Today's Schedule */}
          <Card title="Today's Schedule">
            <div className="space-y-3">
              {tasks
                .filter(t => {
                  const taskDate = new Date(t.dueDate);
                  const today = new Date();
                  return taskDate.toDateString() === today.toDateString();
                })
                .slice(0, 5)
                .map(task => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        task.status === 'completed'
                          ? 'bg-green-500'
                          : task.status === 'in-progress'
                          ? 'bg-blue-500'
                          : 'bg-gray-300'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(task.dueDate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              {tasks.filter(t => {
                const taskDate = new Date(t.dueDate);
                const today = new Date();
                return taskDate.toDateString() === today.toDateString();
              }).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No tasks scheduled for today
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
