import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown, Eye, MessageCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatDistance } from '@utils/helpers';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';

function TeamPerformanceTable({ teamMembers, teamMetrics }) {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: 'salesValue', direction: 'desc' });

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const getSortedData = () => {
    const membersWithMetrics = teamMembers.map(member => {
      const metrics = teamMetrics.find(m => m.userId === member.id) || {
        tasksCompleted: 0,
        tasksTotal: 0,
        visitsCompleted: 0,
        salesValue: 0,
        target: 0,
        distanceTraveled: 0,
      };

      return {
        ...member,
        ...metrics,
        achievement: metrics.target > 0 ? (metrics.salesValue / metrics.target) * 100 : 0,
      };
    });

    return membersWithMetrics.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (sortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
  };

  const sortedData = getSortedData();

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 inline ml-1" />
    );
  };

  return (
    <Card title="Team Performance" subtitle="Real-time performance metrics">
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team Member
              </th>
              <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th
                className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('tasksCompleted')}
              >
                Tasks <SortIcon columnKey="tasksCompleted" />
              </th>
              <th
                className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('visitsCompleted')}
              >
                Visits <SortIcon columnKey="visitsCompleted" />
              </th>
              <th
                className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('salesValue')}
              >
                Sales <SortIcon columnKey="salesValue" />
              </th>
              <th
                className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('distanceTraveled')}
              >
                Distance <SortIcon columnKey="distanceTraveled" />
              </th>
              <th
                className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('achievement')}
              >
                Target % <SortIcon columnKey="achievement" />
              </th>
              <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((member, index) => {
              const isTopPerformer = index === 0;
              const achievement = member.achievement;
              const achievementColor =
                achievement >= 80 ? 'text-green-600' : achievement >= 60 ? 'text-yellow-600' : 'text-red-600';

              return (
                <tr
                  key={member.id}
                  className={`hover:bg-gray-50 transition-colors ${isTopPerformer ? 'bg-green-50' : ''}`}
                >
                  {/* Team Member */}
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-gray-200"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.name}
                          {isTopPerformer && (
                            <span className="ml-2 text-yellow-500">🏆</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{member.territory}</p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-3 lg:px-4 py-4 whitespace-nowrap">
                    <Badge status={member.status === 'active' ? 'active' : 'inactive'}>
                      {member.status}
                    </Badge>
                  </td>

                  {/* Tasks */}
                  <td className="px-3 lg:px-4 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <span className="font-semibold text-gray-900">
                        {member.tasksCompleted}
                      </span>
                      <span className="text-gray-500">/{member.tasksTotal}</span>
                    </div>
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{
                          width: `${member.tasksTotal > 0 ? (member.tasksCompleted / member.tasksTotal) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </td>

                  {/* Visits */}
                  <td className="px-3 lg:px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.visitsCompleted}
                  </td>

                  {/* Sales */}
                  <td className="px-3 lg:px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(member.salesValue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      of {formatCurrency(member.target)}
                    </div>
                  </td>

                  {/* Distance */}
                  <td className="px-3 lg:px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDistance(member.distanceTraveled)}
                  </td>

                  {/* Achievement % */}
                  <td className="px-3 lg:px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${achievementColor}`}>
                        {achievement.toFixed(0)}%
                      </span>
                      {achievement >= 80 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${
                          achievement >= 80
                            ? 'bg-green-600'
                            : achievement >= 60
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        }`}
                        style={{ width: `${Math.min(achievement, 100)}%` }}
                      />
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/team/${member.id}`)}
                        className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Send Message"
                      >
                        <MessageCircle className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Total Team</p>
            <p className="text-lg font-bold text-gray-900">{teamMembers.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Avg Achievement</p>
            <p className="text-lg font-bold text-primary-600">
              {sortedData.length > 0
                ? Math.round(sortedData.reduce((sum, m) => sum + m.achievement, 0) / sortedData.length)
                : 0}
              %
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Sales</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(sortedData.reduce((sum, m) => sum + m.salesValue, 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Distance</p>
            <p className="text-lg font-bold text-blue-600">
              {formatDistance(sortedData.reduce((sum, m) => sum + m.distanceTraveled, 0))}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default TeamPerformanceTable;
