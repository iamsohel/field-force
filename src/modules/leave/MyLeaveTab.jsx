import { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { formatDate } from '@utils/helpers';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import StatCard from '@components/common/StatCard';
import Pagination from '@components/common/Pagination';
import { Calendar as CalendarIcon } from 'lucide-react';

function MyLeaveTab({ 
  leaveApplications, 
  leaveBalance, 
  onEditLeave, 
  onDeleteLeave 
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [leaveApplications.length]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeaves = leaveApplications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(leaveApplications.length / itemsPerPage);
  return (
    <div className="space-y-4">
      {/* Leave Balance Cards */}
      {leaveBalance && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatCard
            icon={CalendarIcon}
            title="Casual Leave"
            value={`${leaveBalance.casualLeave.remaining} / ${leaveBalance.casualLeave.total}`}
            subtitle={`${leaveBalance.casualLeave.used} used`}
            color="info"
          />
          <StatCard
            icon={CalendarIcon}
            title="Sick Leave"
            value={`${leaveBalance.sickLeave.remaining} / ${leaveBalance.sickLeave.total}`}
            subtitle={`${leaveBalance.sickLeave.used} used`}
            color="warning"
          />
        </div>
      )}

      {/* My Leave Applications */}
      <Card title="My Leave Applications">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remarks
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaveApplications.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-3 text-center text-sm text-gray-500">
                    No leave applications found
                  </td>
                </tr>
              ) : (
                currentLeaves.map(leave => (
                  <tr key={leave.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <Badge className="bg-blue-100 text-blue-800 capitalize">
                        {leave.leaveType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {leave.reason}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(leave.fromDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(leave.toDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {leave.days} day{leave.days !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
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
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {leave.remarks || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
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

      {/* Pagination */}
      {leaveApplications.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={leaveApplications.length}
          itemsPerPage={itemsPerPage}
          indexOfFirstItem={indexOfFirstItem}
          indexOfLastItem={indexOfLastItem}
        />
      )}
    </div>
  );
}

export default MyLeaveTab;
