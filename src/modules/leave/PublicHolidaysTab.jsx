import { useState, useEffect } from 'react';
import { Edit2, Trash2, Calendar as CalendarIcon, List, Settings } from 'lucide-react';
import { formatDate } from '@utils/helpers';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import Pagination from '@components/common/Pagination';
import LeaveCalendarView from './LeaveCalendarView';

function PublicHolidaysTab({ 
  publicHolidays, 
  leaveApplications,
  getUserName,
  isAdmin,
  leaveConfigurations,
  onEditHoliday, 
  onDeleteHoliday,
  onEditConfig
}) {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [publicHolidays.length]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHolidays = publicHolidays.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(publicHolidays.length / itemsPerPage);

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex justify-end">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-4 h-4 inline mr-2" />
            List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CalendarIcon className="w-4 h-4 inline mr-2" />
            Calendar
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <LeaveCalendarView
          publicHolidays={publicHolidays}
          leaveApplications={leaveApplications}
          getUserName={getUserName}
        />
      ) : (
        <Card title="Public Holidays">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Holiday Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  {isAdmin && (
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {publicHolidays.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-4 py-3 text-center text-sm text-gray-500">
                      No public holidays found
                    </td>
                  </tr>
                ) : (
                  currentHolidays.map(holiday => (
                    <tr key={holiday.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(holiday.date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {holiday.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        <Badge className="bg-red-600 text-white capitalize">
                          {holiday.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {holiday.description || '-'}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
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
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
          </table>
        </div>
        {viewMode === 'list' && publicHolidays.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={publicHolidays.length}
            itemsPerPage={itemsPerPage}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
          />
        )}
      </Card>
      )}

      {/* Leave Configurations (Admin only) */}
      {isAdmin && leaveConfigurations && leaveConfigurations.length > 0 && (
        <Card title="Leave Configurations">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Casual Leave
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sick Leave
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveConfigurations.map(config => (
                  <tr key={config.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                      {config.designation}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {config.year}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {config.casualLeavePerYear} days
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {config.sickLeavePerYear} days
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {onEditConfig && (
                        <button
                          onClick={() => onEditConfig(config)}
                          className="text-primary-600 hover:text-primary-800 font-medium"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default PublicHolidaysTab;
