import { useState } from 'react';
import { Edit2, Trash2, Calendar as CalendarIcon, List } from 'lucide-react';
import { formatDate } from '@utils/helpers';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import LeaveCalendarView from './LeaveCalendarView';

function PublicHolidaysTab({ 
  publicHolidays, 
  leaveApplications,
  getUserName,
  isAdmin,
  onEditHoliday, 
  onDeleteHoliday 
}) {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  return (
    <div className="space-y-6">
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
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {publicHolidays.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-6 py-4 text-center text-sm text-gray-500">
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
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
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
        </Card>
      )}
    </div>
  );
}

export default PublicHolidaysTab;
