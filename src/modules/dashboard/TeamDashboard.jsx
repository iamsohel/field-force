import { useEffect, useState } from 'react';
import { MapPin, TrendingUp, Users as UsersIcon } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { usersApi, metricsApi, locationApi } from '@services/api';
import { formatDistance, formatCurrency } from '@utils/helpers';
import Card from '@components/common/Card';
import StatCard from '@components/common/StatCard';
import Map from '@components/common/Map';
import Badge from '@components/common/Badge';

function TeamDashboard() {
  const { user } = useAuthStore();
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamMetrics, setTeamMetrics] = useState([]);
  const [teamLocations, setTeamLocations] = useState([]);

  useEffect(() => {
    if (user) {
      loadTeamData();
    }
  }, [user]);

  const loadTeamData = async () => {
    const membersResponse = await usersApi.getTeamMembers(user.id);
    const metricsResponse = await metricsApi.getTeamMetrics(user.id);

    if (membersResponse.success) {
      setTeamMembers(membersResponse.data);

      // Load locations for each team member
      const locations = [];
      for (const member of membersResponse.data) {
        const locResponse = await locationApi.getCurrentLocation(member.id);
        if (locResponse.success && locResponse.data) {
          locations.push({
            userId: member.id,
            ...locResponse.data,
          });
        }
      }
      setTeamLocations(locations);
    }

    if (metricsResponse.success) {
      setTeamMetrics(metricsResponse.data);
    }
  };

  const totalSales = teamMetrics.reduce((sum, m) => sum + m.salesValue, 0);
  const totalDistance = teamMetrics.reduce((sum, m) => sum + m.distanceTraveled, 0);
  const totalVisits = teamMetrics.reduce((sum, m) => sum + m.visitsCompleted, 0);

  const mapMarkers = teamLocations.map(loc => {
    const member = teamMembers.find(m => m.id === loc.userId);
    return {
      lat: loc.location.lat,
      lng: loc.location.lng,
      popup: {
        title: member?.name || 'Team Member',
        description: loc.activity,
        time: new Date(loc.timestamp).toLocaleTimeString(),
      },
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
          <p className="text-gray-600">Manage and monitor your field team</p>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={UsersIcon}
          title="Team Size"
          value={teamMembers.length}
          subtitle="Active members"
          color="primary"
        />
        <StatCard
          icon={TrendingUp}
          title="Total Sales"
          value={formatCurrency(totalSales)}
          subtitle="This month"
          color="success"
        />
        <StatCard
          icon={MapPin}
          title="Total Visits"
          value={totalVisits}
          subtitle="This month"
          color="info"
        />
        <StatCard
          icon={MapPin}
          title="Distance Covered"
          value={formatDistance(totalDistance)}
          subtitle="This month"
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members List */}
        <div className="lg:col-span-1">
          <Card title="Team Members">
            <div className="space-y-3">
              {teamMembers.map(member => {
                const memberMetric = teamMetrics.find(m => m.userId === member.id);
                const isActive = teamLocations.some(l => l.userId === member.id);

                return (
                  <div
                    key={member.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-gray-900">{member.name}</h4>
                          <Badge status={isActive ? 'active' : 'inactive'}>
                            {isActive ? 'Active' : 'Offline'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{member.territory}</p>

                        {memberMetric && (
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-gray-500">Sales</p>
                              <p className="font-semibold text-green-600">
                                {formatCurrency(memberMetric.salesValue)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Visits</p>
                              <p className="font-semibold text-blue-600">
                                {memberMetric.visitsCompleted}/{memberMetric.visitsPlanned}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Live Map */}
        <div className="lg:col-span-2">
          <Card title="Live Team Location" className="h-[600px]">
            <div className="h-full">
              <Map
                center={[28.6139, 77.2090]}
                zoom={12}
                markers={mapMarkers}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Performance Comparison */}
      <Card title="Team Performance Comparison">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tasks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Visits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Achievement
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers.map(member => {
                const metric = teamMetrics.find(m => m.userId === member.id);
                if (!metric) return null;

                const achievement = Math.round((metric.salesValue / metric.target) * 100);

                return (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm font-medium text-gray-900">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {metric.tasksCompleted}/{metric.tasksTotal}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {metric.visitsCompleted}/{metric.visitsPlanned}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(metric.salesValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatCurrency(metric.target)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className={`h-2 rounded-full ${
                              achievement >= 100
                                ? 'bg-green-600'
                                : achievement >= 75
                                ? 'bg-blue-600'
                                : 'bg-yellow-600'
                            }`}
                            style={{ width: `${Math.min(achievement, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{achievement}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default TeamDashboard;
