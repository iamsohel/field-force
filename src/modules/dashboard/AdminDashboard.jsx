import { useEffect, useState } from 'react';
import {
  Users,
  MapPin,
  TrendingUp,
  CheckCircle,
  Activity,
  DollarSign,
  Clock,
  Target
} from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { usersApi, metricsApi, locationApi, activityApi } from '@services/api';
import { formatCurrency, formatDistance } from '@utils/helpers';
import StatCard from '@components/common/StatCard';
import Card from '@components/common/Card';
import LiveLocationMap from './components/LiveLocationMap';
import LiveActivityFeed from './components/LiveActivityFeed';
import TeamPerformanceTable from './components/TeamPerformanceTable';

function AdminDashboard() {
  const { user } = useAuthStore();
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamMetrics, setTeamMetrics] = useState([]);
  const [teamLocations, setTeamLocations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);

    // Load all team members
    const membersResponse = await usersApi.getAll();
    if (membersResponse.success) {
      const salespeople = membersResponse.data.filter(u =>
        u.role === 'salesperson' || u.role === 'manager'
      );
      setTeamMembers(salespeople);

      // Load locations for each team member
      const locations = [];
      for (const member of salespeople) {
        const locResponse = await locationApi.getCurrentLocation(member.id);
        if (locResponse.success && locResponse.data) {
          locations.push({
            userId: member.id,
            user: member,
            ...locResponse.data,
          });
        }
      }
      setTeamLocations(locations);
    }

    // Load team metrics
    const metricsResponse = await metricsApi.getTeamMetrics(user.id);
    if (metricsResponse.success) {
      setTeamMetrics(metricsResponse.data);
    }

    // Load recent activities
    const activitiesResponse = await activityApi.getByUserId(user.id);
    if (activitiesResponse.success) {
      setActivities(activitiesResponse.data);
    }

    setLoading(false);
  };

  // Calculate aggregate stats
  const activeTeamMembers = teamLocations.filter(loc => {
    const lastUpdate = new Date(loc.timestamp);
    const now = new Date();
    const diffMinutes = (now - lastUpdate) / (1000 * 60);
    return diffMinutes < 30; // Active if updated in last 30 minutes
  }).length;

  const totalSales = teamMetrics.reduce((sum, m) => sum + m.salesValue, 0);
  const totalDistance = teamMetrics.reduce((sum, m) => sum + m.distanceTraveled, 0);
  const totalVisits = teamMetrics.reduce((sum, m) => sum + m.visitsCompleted, 0);
  const totalTarget = teamMetrics.reduce((sum, m) => sum + m.target, 0);
  const achievementPercent = totalTarget > 0 ? Math.round((totalSales / totalTarget) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Real-time field force monitoring and control
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live Updates</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          icon={Users}
          title="Team Members"
          value={teamMembers.length}
          subtitle={`${activeTeamMembers} active in field`}
          color="primary"
          trend={{
            value: activeTeamMembers > 0 ? Math.round((activeTeamMembers / teamMembers.length) * 100) : 0,
            label: 'active now'
          }}
        />
        <StatCard
          icon={DollarSign}
          title="Today's Sales"
          value={formatCurrency(totalSales)}
          subtitle={`Target: ${formatCurrency(totalTarget)}`}
          color="success"
          trend={{
            value: achievementPercent - 100,
            label: 'vs target'
          }}
        />
        <StatCard
          icon={CheckCircle}
          title="Visits Completed"
          value={totalVisits}
          subtitle="Today"
          color="info"
        />
        <StatCard
          icon={Target}
          title="Target Achievement"
          value={`${achievementPercent}%`}
          subtitle={`${formatDistance(totalDistance)} traveled`}
          color={achievementPercent >= 80 ? 'success' : achievementPercent >= 60 ? 'warning' : 'danger'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Live Location Map - Takes 2 columns */}
        <div className="lg:col-span-2">
          <LiveLocationMap
            teamLocations={teamLocations}
            teamMembers={teamMembers}
          />
        </div>

        {/* Live Activity Feed - Takes 1 column */}
        <div className="lg:col-span-1">
          <LiveActivityFeed activities={activities} />
        </div>
      </div>

      {/* Team Performance Table */}
      <TeamPerformanceTable
        teamMembers={teamMembers}
        teamMetrics={teamMetrics}
      />
    </div>
  );
}

export default AdminDashboard;
