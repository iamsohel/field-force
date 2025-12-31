import { CheckCircle, MapPin, ShoppingCart, Wallet, Clock as ClockIcon, LogIn, LogOut as LogOutIcon } from 'lucide-react';
import { formatRelativeTime, formatTime } from '@utils/helpers';
import Card from '@components/common/Card';

function LiveActivityFeed({ activities }) {
  const getActivityIcon = (type) => {
    const icons = {
      'check-in': LogIn,
      'check-out': LogOutIcon,
      'task': CheckCircle,
      'visit': MapPin,
      'order': ShoppingCart,
      'expense': Wallet,
    };
    return icons[type] || CheckCircle;
  };

  const getActivityColor = (type) => {
    const colors = {
      'check-in': 'bg-green-100 text-green-600',
      'check-out': 'bg-red-100 text-red-600',
      'task': 'bg-blue-100 text-blue-600',
      'visit': 'bg-purple-100 text-purple-600',
      'order': 'bg-yellow-100 text-yellow-600',
      'expense': 'bg-pink-100 text-pink-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  // Sort activities by timestamp (newest first)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <Card
      title="Live Activity Feed"
      subtitle="Real-time team updates"
      className="h-[600px] lg:h-[700px]"
      action={
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600">Live</span>
        </div>
      }
    >
      <div className="space-y-3 overflow-y-auto max-h-[calc(100%-80px)] pr-2 custom-scrollbar">
        {sortedActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ClockIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No activities yet</p>
            <p className="text-sm mt-1">Team activities will appear here in real-time</p>
          </div>
        ) : (
          sortedActivities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);

            return (
              <div
                key={activity.id}
                className={`flex gap-3 p-3 rounded-lg border transition-all hover:shadow-md ${
                  index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                }`}
              >
                {/* Icon */}
                <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  {activity.details && (
                    <p className="text-xs text-gray-600 mt-0.5">
                      {activity.details}
                    </p>
                  )}
                  {activity.location && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{activity.location}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>

                {/* Timestamp */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Auto-refresh indicator */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-center text-gray-500">
          Auto-refreshing every 30 seconds
        </p>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </Card>
  );
}

export default LiveActivityFeed;
