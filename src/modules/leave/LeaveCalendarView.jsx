import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, getDay } from 'date-fns';
import { useAuthStore } from '@store/authStore';

function LeaveCalendarView({ publicHolidays, leaveApplications, getUserName }) {
  const { user } = useAuthStore();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const months = Array.from({ length: 12 }, (_, i) => i);

  const previousYear = () => {
    setCurrentYear(currentYear - 1);
  };

  const nextYear = () => {
    setCurrentYear(currentYear + 1);
  };

  const getDayColor = (day) => {
    const dayOfWeek = getDay(day);
    const dayStr = format(day, 'yyyy-MM-dd');
    
    // Friday (5) and Saturday (6) are weekends - gray
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      return 'bg-gray-200 text-gray-600';
    }
    
    // Check if it's a public holiday - deep red
    const holiday = publicHolidays.find(h => h.date === dayStr);
    if (holiday) {
      return 'bg-red-600 text-white font-semibold';
    }
    
    return '';
  };

  const getDayEvents = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const events = [];

    // Public holidays
    const holiday = publicHolidays.find(h => h.date === dayStr);
    if (holiday) {
      events.push({ type: 'holiday', label: holiday.name });
    }

    // Leave applications
    const leaves = leaveApplications.filter(l => {
      const from = parseISO(l.fromDate);
      const to = parseISO(l.toDate);
      return day >= from && day <= to;
    });

    leaves.forEach(leave => {
      const isAdmin = user?.role === 'admin';
      const showLeave = isAdmin || leave.userId === user?.id;
      
      if (showLeave) {
        const leaveType = leave.leaveType === 'casual' ? 'Casual' : 'Sick';
        const employeeName = getUserName ? getUserName(leave.userId) : leave.userId;
        events.push({
          type: 'leave',
          label: isAdmin ? `${leaveType} - ${employeeName}` : leaveType,
          leave,
        });
      }
    });

    return events;
  };

  const renderMonth = (monthIndex) => {
    const monthDate = new Date(currentYear, monthIndex, 1);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const firstDayOfWeek = monthStart.getDay();
    const emptyDays = Array(firstDayOfWeek).fill(null);

    return (
      <div key={monthIndex} className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
          {format(monthDate, 'MMMM yyyy')}
        </h3>
        
        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty days at start */}
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Days of month */}
          {daysInMonth.map(day => {
            const events = getDayEvents(day);
            const isToday = isSameDay(day, new Date());
            const dayColor = getDayColor(day);
            const isCurrentMonth = isSameMonth(day, monthDate);

            return (
              <div
                key={day.toISOString()}
                className={`aspect-square border border-gray-200 rounded p-1 text-xs ${
                  isToday ? 'ring-2 ring-blue-500' : ''
                } ${dayColor} ${!isCurrentMonth ? 'opacity-30' : ''}`}
              >
                <div className={`font-medium mb-0.5 ${
                  isToday ? 'text-blue-600' : dayColor ? '' : 'text-gray-700'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  {events.slice(0, 1).map((event, idx) => (
                    <div
                      key={idx}
                      className="text-[10px] px-0.5 py-0 rounded truncate bg-blue-50 text-blue-700"
                      title={event.label}
                    >
                      {event.label.length > 8 ? event.label.substring(0, 8) + '...' : event.label}
                    </div>
                  ))}
                  {events.length > 1 && (
                    <div className="text-[10px] text-gray-500 px-0.5">
                      +{events.length - 1}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousYear}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {currentYear}
        </h2>
        <button
          onClick={nextYear}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Year Calendar - 3 months per row */}
      <div className="space-y-6">
        {/* Row 1: Jan, Feb, Mar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderMonth(0)}
          {renderMonth(1)}
          {renderMonth(2)}
        </div>

        {/* Row 2: Apr, May, Jun */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderMonth(3)}
          {renderMonth(4)}
          {renderMonth(5)}
        </div>

        {/* Row 3: Jul, Aug, Sep */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderMonth(6)}
          {renderMonth(7)}
          {renderMonth(8)}
        </div>

        {/* Row 4: Oct, Nov, Dec */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderMonth(9)}
          {renderMonth(10)}
          {renderMonth(11)}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
            <span>Weekend (Fri/Sat)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 border border-red-700 rounded"></div>
            <span>Public Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded"></div>
            <span>Leave Application</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaveCalendarView;
