import { useEffect, useState } from 'react';
import { CheckCircle, Circle, XCircle, MapPin, Clock } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { activityApi } from '@services/api';
import { formatDate, formatTime } from '@utils/helpers';
import Card from '@components/common/Card';

function ActivityTimeline() {
  const { user } = useAuthStore();
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('today'); // 'today' or 'yesterday'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [user, filter]);

  const loadActivities = async () => {
    setIsLoading(true);
    const response = await activityApi.getByUserId(user.id);
    if (response.success) {
      const filtered = response.data.filter((activity) => {
        const activityDate = new Date(activity.timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (filter === 'today') {
          return activityDate.toDateString() === today.toDateString();
        } else {
          return activityDate.toDateString() === yesterday.toDateString();
        }
      });
      setActivities(filtered);
    }
    setIsLoading(false);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'check-in':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'check-out':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'task':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'visit':
        return <MapPin className="w-5 h-5 text-purple-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'check-in':
        return 'bg-green-100 border-green-200';
      case 'check-out':
        return 'bg-red-100 border-red-200';
      case 'task':
        return 'bg-blue-100 border-blue-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = formatDate(activity.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

  return (
    <Card title="History" className="h-full">
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        <button
          onClick={() => setFilter('today')}
          className={`pb-2 px-4 font-medium transition-colors ${
            filter === 'today'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setFilter('yesterday')}
          className={`pb-2 px-4 font-medium transition-colors ${
            filter === 'yesterday'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Yesterday
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No activities found
          </div>
        ) : (
          Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date}>
              <p className="text-sm font-medium text-gray-700 mb-3">{date}</p>
              <div className="space-y-3">
                {dateActivities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-3">
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`p-2 rounded-lg border ${getActivityColor(
                          activity.type
                        )}`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      {index < dateActivities.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 my-1" />
                      )}
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-gray-900">
                          {activity.description}
                        </p>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                      {activity.details && (
                        <p className="text-sm text-gray-600">{activity.details}</p>
                      )}
                      {activity.location && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {activity.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

export default ActivityTimeline;
