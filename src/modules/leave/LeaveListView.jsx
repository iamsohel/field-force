import { Edit2, Trash2 } from 'lucide-react';
import { formatDate } from '@utils/helpers';
import Badge from '@components/common/Badge';
import Card from '@components/common/Card';

function LeaveListView({ 
  publicHolidays, 
  leaveApplications, 
  user, 
  getUserName,
  onEditHoliday,
  onDeleteHoliday,
  onEditLeave,
  onDeleteLeave 
}) {
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Public Holidays */}
      <Card title="Public Holidays">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Holiday Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {publicHolidays.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No public holidays found
                  </td>
                </tr>
              ) : (
                publicHolidays.map(holiday => (
                  <tr key={holiday.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(holiday.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {holiday.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <Badge className="bg-red-600 text-white capitalize">
                        {holiday.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {holiday.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {isAdmin && (
                        <div className="flex gap-2">
                          {onEditHoliday && (
                            <button
                              onClick={() => onEditHoliday(holiday)}
                              className="text-primary-600 hover:text-primary-800"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {onDeleteHoliday && (
                            <button
                              onClick={() => onDeleteHoliday(holiday.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                      {!isAdmin && <span className="text-gray-400">-</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Leave Applications */}
      <Card title={isAdmin ? "All Leave Applications" : "My Leave Applications"}>
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
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remarks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaveApplications.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No leave applications found
                  </td>
                </tr>
              ) : (
                leaveApplications.map(leave => (
                  <tr key={leave.id}>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getUserName ? getUserName(leave.userId) : leave.userId}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Badge className="bg-blue-100 text-blue-800 capitalize">
                        {leave.leaveType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(leave.fromDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(leave.toDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {leave.days} day{leave.days !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          leave.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : leave.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {leave.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {leave.remarks || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {onEditLeave && (
                          <button
                            onClick={() => onEditLeave(leave)}
                            className="text-primary-600 hover:text-primary-800"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDeleteLeave && (
                          <button
                            onClick={() => onDeleteLeave(leave.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default LeaveListView;
