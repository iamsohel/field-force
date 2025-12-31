import { useEffect, useState } from 'react';
import { BarChart3, Download, TrendingUp, Users } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { metricsApi } from '@services/api';
import { formatCurrency, formatDistance, formatNumber } from '@utils/helpers';
import Card from '@components/common/Card';
import StatCard from '@components/common/StatCard';

function Reports() {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (user) {
      loadMetrics();
    }
  }, [user]);

  const loadMetrics = async () => {
    const response = await metricsApi.getByUserId(user.id);
    if (response.success) {
      setMetrics(response.data);
    }
  };

  if (!metrics) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <button className="btn btn-primary">
          <Download className="w-5 h-5 inline mr-2" />
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={TrendingUp}
          title="Sales Target"
          value={`${Math.round((metrics.salesValue / metrics.target) * 100)}%`}
          subtitle={`${formatCurrency(metrics.salesValue)} of ${formatCurrency(metrics.target)}`}
          color="primary"
        />
        <StatCard
          icon={BarChart3}
          title="Conversion Rate"
          value={`${(metrics.conversionRate * 100).toFixed(1)}%`}
          subtitle="From leads"
          color="success"
        />
        <StatCard
          icon={Users}
          title="Visits"
          value={`${metrics.visitsCompleted}/${metrics.visitsPlanned}`}
          subtitle={`${Math.round((metrics.visitsCompleted / metrics.visitsPlanned) * 100)}% completed`}
          color="info"
        />
        <StatCard
          icon={TrendingUp}
          title="Distance"
          value={formatDistance(metrics.distanceTraveled)}
          subtitle="This month"
          color="warning"
        />
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Summary */}
        <Card title="Performance Summary" subtitle="Monthly Overview">
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Tasks Completion</span>
                <span className="text-lg font-bold text-primary-600">
                  {Math.round((metrics.tasksCompleted / metrics.tasksTotal) * 100)}%
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${(metrics.tasksCompleted / metrics.tasksTotal) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {metrics.tasksCompleted} of {metrics.tasksTotal} tasks
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Sales Achievement</span>
                <span className="text-lg font-bold text-green-600">
                  {Math.round((metrics.salesValue / metrics.target) * 100)}%
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${Math.min((metrics.salesValue / metrics.target) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {formatCurrency(metrics.salesValue)} of {formatCurrency(metrics.target)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{metrics.visitsCompleted}</p>
                <p className="text-xs text-gray-600">Visits Completed</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{metrics.avgTimePerVisit}</p>
                <p className="text-xs text-gray-600">Avg Time/Visit (min)</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Activity Breakdown */}
        <Card title="Activity Breakdown" subtitle="Time allocation">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Field Visits</span>
                <span className="font-medium">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Meetings</span>
                <span className="font-medium">25%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Travel</span>
                <span className="font-medium">20%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Admin Work</span>
                <span className="font-medium">10%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ROI Metrics */}
      <Card title="ROI & Efficiency Metrics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Cost per Visit</p>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(850)}</p>
            <p className="text-xs text-green-600 mt-1">↓ 12% from last month</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Revenue per Visit</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(6944)}</p>
            <p className="text-xs text-green-600 mt-1">↑ 8% from last month</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Avg Deal Size</p>
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(62500)}</p>
            <p className="text-xs text-green-600 mt-1">↑ 15% from last month</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Reports;
