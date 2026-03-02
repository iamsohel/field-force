import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, Filter, Users } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { useAttendanceStore } from '@store/attendanceStore';
import { useLocationStore } from '@store/locationStore';
import { formatDate, formatTime } from '@utils/helpers';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import { usersApi } from '@services/api';

function Attendance() {
  const { user } = useAuthStore();
  const { 
    todayAttendance, 
    attendanceHistory, 
    allAttendanceHistory,
    checkIn, 
    checkOut, 
    fetchAttendanceHistory,
    fetchAllAttendanceHistory,
    isLoading 
  } = useAttendanceStore();
  const { currentLocation } = useLocationStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterType, setFilterType] = useState('month'); // 'date', 'week', 'month', 'all'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(user?.id || '');
  const [allUsers, setAllUsers] = useState([]);
  const isAdmin = user?.role === 'admin';

  // Fetch all users for admin dropdown
  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        try {
          const response = await usersApi.getAll();
          if (response.success) {
            const employees = response.data.filter(u => u.role !== 'admin');
            setAllUsers(employees);
            if (employees.length > 0 && !selectedUserId) {
              setSelectedUserId(employees[0].id);
            }
          }
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };
      fetchUsers();
    }
  }, [isAdmin]);

  // Set default date range based on filter type
  useEffect(() => {
    const today = new Date();
    let start, end;

    switch (filterType) {
      case 'date':
        start = new Date(today);
        end = new Date(today);
        break;
      case 'week':
        start = new Date(today);
        start.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        end = new Date(start);
        end.setDate(start.getDate() + 6); // End of week
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'all':
        start = new Date(today);
        start.setMonth(today.getMonth() - 2); // 2 months ago
        end = new Date(today);
        break;
      default:
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, [filterType]);

  // Fetch attendance data
  useEffect(() => {
    if (startDate && endDate) {
      if (isAdmin) {
        fetchAllAttendanceHistory(startDate, endDate, selectedUserId || null);
      } else {
        fetchAttendanceHistory(user?.id, startDate, endDate);
      }
    }
  }, [startDate, endDate, selectedUserId, isAdmin, user?.id]);

  const handleCheckIn = async () => {
    setIsProcessing(true);
    const location = currentLocation || { lat: 23.8103, lng: 90.4125, address: 'Current Location' };
    await checkIn(user.id, location);
    setIsProcessing(false);
  };

  const handleCheckOut = async () => {
    setIsProcessing(true);
    const location = currentLocation || { lat: 23.8103, lng: 90.4125, address: 'Current Location' };
    await checkOut(user.id, location);
    setIsProcessing(false);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  const displayRecords = isAdmin ? allAttendanceHistory : attendanceHistory;

  // Get user name helper
  const getUserName = (userId) => {
    const foundUser = allUsers.find(u => u.id === userId);
    return foundUser ? foundUser.name : `User ${userId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
      </div>

      {/* Check-in/out Card - Only for non-admin or admin viewing their own */}
      {(!isAdmin || selectedUserId === user?.id) && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Today's Attendance</h2>
              <p className="text-sm text-gray-600">{formatDate(new Date(), 'EEEE, MMMM dd, yyyy')}</p>
            </div>
            <div className="text-right">
              {todayAttendance ? (
                <div>
                  <Badge status="active" className="mb-2">Checked In</Badge>
                  <p className="text-sm text-gray-600">
                    Check-in: {formatTime(todayAttendance.checkIn)}
                  </p>
                  {todayAttendance.checkOut && (
                    <p className="text-sm text-gray-600">
                      Check-out: {formatTime(todayAttendance.checkOut)}
                    </p>
                  )}
                </div>
              ) : (
                <Badge variant="gray">Not Checked In</Badge>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleCheckIn}
              disabled={isProcessing || todayAttendance}
              className="btn btn-success py-3"
            >
              <CheckCircle className="w-5 h-5 inline mr-2" />
              Check In
            </button>
            <button
              onClick={handleCheckOut}
              disabled={isProcessing || !todayAttendance || todayAttendance?.checkOut}
              className="btn btn-danger py-3"
            >
              <Clock className="w-5 h-5 inline mr-2" />
              Check Out
            </button>
          </div>
        </Card>
      )}

      {/* Filter Section */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Filter By:</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('date')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'date'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleFilterChange('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => handleFilterChange('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Last 2 Months
            </button>
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
          </div>
        </div>

        {/* Employee Selector for Admin */}
        {isAdmin && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Users className="w-4 h-4 inline mr-1" />
              Select Employee
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="input"
            >
              <option value="">All Employees</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
        )}
      </Card>

      {/* Attendance History */}
      <Card title={isAdmin ? "All Attendance History" : "My Attendance History"}>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : displayRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No attendance records found</div>
        ) : (
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
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayRecords.map((record) => (
                  <tr key={record.id}>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getUserName(record.userId)}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {record.checkIn ? formatTime(record.checkIn) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {record.checkOut ? formatTime(record.checkOut) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {record.totalHours ? `${record.totalHours.toFixed(2)} hrs` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge status={record.status}>{record.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default Attendance;
