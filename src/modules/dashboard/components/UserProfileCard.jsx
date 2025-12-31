import { Phone, MapPin, Briefcase } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { useAttendanceStore } from '@store/attendanceStore';
import { useTasksStore } from '@store/tasksStore';
import { formatDate } from '@utils/helpers';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';

function UserProfileCard() {
  const { user } = useAuthStore();
  const { todayAttendance } = useAttendanceStore();
  const { tasks } = useTasksStore();

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;

  return (
    <Card className="sticky top-0">
      {/* User Info */}
      <div className="text-center mb-6">
        <img
          src={user?.avatar || 'https://i.pravatar.cc/150?img=1'}
          alt={user?.name}
          className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-primary-100"
        />
        <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
        <p className="text-gray-500">{user?.phone}</p>
        <Badge variant="primary" className="mt-2 capitalize">
          {user?.role}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="space-y-4">
        {/* Today's Date */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Today</span>
          <span className="font-medium">{formatDate(new Date(), 'EEEE')}</span>
        </div>

        {/* Tasks Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <Briefcase className="w-4 h-4 text-primary-600" />
              Tasks
            </span>
            <span className="font-medium">
              {completedTasks}/{totalTasks}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${totalTasks ? (completedTasks / totalTasks) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Distance */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Distance</span>
          <span className="font-medium text-primary-600">49.58km</span>
        </div>

        {/* Attendance Status */}
        {todayAttendance && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-900">Active</span>
            </div>
            <p className="text-xs text-green-700">
              Checked in at {new Date(todayAttendance.checkIn).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 grid grid-cols-2 gap-2">
        <button className="btn btn-primary text-sm">
          Check In
        </button>
        <button className="btn btn-secondary text-sm">
          View Profile
        </button>
      </div>
    </Card>
  );
}

export default UserProfileCard;
