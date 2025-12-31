import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { useAttendanceStore } from '@store/attendanceStore';
import { useLocationStore } from '@store/locationStore';
import { formatDate, formatTime, formatDateTime } from '@utils/helpers';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';

function Attendance() {
  const { user } = useAuthStore();
  const { todayAttendance, attendanceHistory, checkIn, checkOut, fetchAttendanceHistory } = useAttendanceStore();
  const { currentLocation } = useLocationStore();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      fetchAttendanceHistory(user.id, startDate, endDate);
    }
  }, [user]);

  const handleCheckIn = async () => {
    setIsProcessing(true);
    const location = currentLocation || { lat: 28.6139, lng: 77.2090, address: 'Current Location' };
    await checkIn(user.id, location);
    setIsProcessing(false);
  };

  const handleCheckOut = async () => {
    setIsProcessing(true);
    const location = currentLocation || { lat: 28.6139, lng: 77.2090, address: 'Current Location' };
    await checkOut(user.id, location);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
      </div>

      {/* Check-in/out Card */}
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

      {/* Attendance History */}
      <Card title="Attendance History">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
              {attendanceHistory.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatTime(record.checkIn)}
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
      </Card>
    </div>
  );
}

export default Attendance;
