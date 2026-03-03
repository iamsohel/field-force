import { useEffect, useState } from 'react';
import { Search, MapPin, Clock, Route, Activity, Users, Calendar, Navigation, PlayCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { locationApi, visitsApi } from '@services/api';
import { usersApi } from '@services/api';
import { formatDateTime, formatTime } from '@utils/helpers';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import Map from '@components/common/Map';
import { getUserInitials, getUserAvatar } from '@utils/helpers';

// Calculate distance between coordinates
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function AdminTracking() {
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState([]);
  const [liveLocations, setLiveLocations] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('live'); // 'live' or 'past'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const [employeeVisits, setEmployeeVisits] = useState([]);
  const [allVisits, setAllVisits] = useState([]); // Store all visits for activity calculation
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadEmployees();
    loadLiveLocations();
    loadAllVisits();
    
    // Auto-refresh live locations every 5 seconds
    const interval = setInterval(() => {
      if (activeTab === 'live') {
        loadLiveLocations();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const loadAllVisits = async () => {
    // Load all visits for activity calculation
    const today = new Date().toISOString().split('T')[0];
    const response = await visitsApi.getByUserId('all', `${today}T00:00:00`, `${today}T23:59:59`);
    if (response.success) {
      setAllVisits(response.data);
    }
  };

  useEffect(() => {
    if (selectedEmployee && activeTab === 'past') {
      loadEmployeeHistory();
      loadEmployeeVisits();
    }
  }, [selectedEmployee, selectedDate, activeTab]);

  const loadEmployees = async () => {
    const response = await usersApi.getAll();
    if (response.success) {
      const salespersons = response.data.filter(u => u.role !== 'admin');
      setEmployees(salespersons);
    }
  };

  const loadLiveLocations = async () => {
    setIsRefreshing(true);
    const response = await locationApi.getAllLiveLocations();
    if (response.success) {
      setLiveLocations(response.data);
    }
    setIsRefreshing(false);
  };

  const loadEmployeeHistory = async () => {
    if (!selectedEmployee) return;
    const response = await locationApi.getLocationHistory(
      selectedEmployee.id,
      `${selectedDate}T00:00:00`,
      `${selectedDate}T23:59:59`
    );
    if (response.success) {
      setEmployeeHistory(response.data);
    }
  };

  const loadEmployeeVisits = async () => {
    if (!selectedEmployee) return;
    const response = await visitsApi.getByUserId(selectedEmployee.id);
    if (response.success) {
      const dayVisits = response.data.filter(v => 
        v.checkIn && v.checkIn.startsWith(selectedDate)
      );
      setEmployeeVisits(dayVisits);
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'live') {
      loadLiveLocations();
    } else if (selectedEmployee) {
      loadEmployeeHistory();
      loadEmployeeVisits();
    }
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    if (activeTab === 'past') {
      loadEmployeeHistory();
      loadEmployeeVisits();
    }
    // In live tab, focus on selected employee on map
  };

  const handleMarkerClick = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      if (activeTab === 'past') {
        loadEmployeeHistory();
        loadEmployeeVisits();
      }
    }
  };

  // Filter employees by search query
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get live location for selected employee
  const selectedEmployeeLiveLocation = liveLocations.find(
    loc => loc.userId === selectedEmployee?.id
  );

  // Prepare map data for live view
  const getLiveMapData = () => {
    if (liveLocations.length === 0) {
      return {
        center: [23.8103, 90.4125], // Default to Dhaka
        zoom: 11,
        markers: [],
        route: [],
        fitBounds: false,
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const markers = liveLocations.map(loc => {
      const employee = employees.find(e => e.id === loc.userId);
      // Get today's visits count for this employee
      const todayVisits = allVisits.filter(v => 
        v.userId === loc.userId && v.checkIn && v.checkIn.startsWith(today)
      ).length;
      
      // Get employee's name parts
      const nameParts = employee?.name ? employee.name.split(' ') : [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      return {
        id: loc.userId,
        lat: loc.lat,
        lng: loc.lng,
        popup: {
          title: loc.userName,
          description: `Last seen: ${formatTime(loc.timestamp)}`,
          time: `Status: ${loc.status || 'Active'}`,
          activity: `${todayVisits} visit${todayVisits !== 1 ? 's' : ''} today`,
        },
        tooltip: {
          name: firstName,
          lastName: lastName,
          lastSeen: formatTime(loc.timestamp),
          activity: `${todayVisits} visit${todayVisits !== 1 ? 's' : ''} today`,
        },
        employee: employee,
        onClick: () => handleMarkerClick(loc.userId),
      };
    });

    // If employee is selected, center on them, otherwise fit bounds to show all
    if (selectedEmployee && selectedEmployeeLiveLocation) {
      return {
        center: [selectedEmployeeLiveLocation.lat, selectedEmployeeLiveLocation.lng],
        zoom: 14,
        markers,
        route: [],
        fitBounds: false,
      };
    }

    // Default: fit bounds to show all employees (always fit bounds when no selection)
    return {
      center: liveLocations[0] ? [liveLocations[0].lat, liveLocations[0].lng] : [23.8103, 90.4125],
      zoom: 11,
      markers,
      route: [],
      fitBounds: true, // Always fit bounds to show all employees
    };
  };

  // Prepare map data for past view
  const getPastMapData = () => {
    if (!selectedEmployee) {
      // Show default view when no employee selected
      return {
        center: [23.8103, 90.4125],
        zoom: 11,
        markers: [],
        route: [],
        fitBounds: false,
        hasData: false,
      };
    }

    // Always return map data, even if no history/visits
    if (employeeHistory.length === 0 && employeeVisits.length === 0) {
      // Show employee's current location or default location
      const employeeLiveLoc = liveLocations.find(loc => loc.userId === selectedEmployee.id);
      const center = employeeLiveLoc 
        ? [employeeLiveLoc.lat, employeeLiveLoc.lng]
        : [23.8103, 90.4125];
      
      return {
        center,
        zoom: employeeLiveLoc ? 13 : 11,
        markers: employeeLiveLoc ? [{
          lat: employeeLiveLoc.lat,
          lng: employeeLiveLoc.lng,
          popup: {
            title: selectedEmployee.name,
            description: 'No activity data for selected date',
          },
          employee: selectedEmployee,
        }] : [],
        route: [],
        fitBounds: false,
        hasData: false,
      };
    }

    // Get all unique locations from history
    const locations = employeeHistory.map(h => ({
      lat: h.location.lat,
      lng: h.location.lng,
      timestamp: h.timestamp,
      activity: h.activity,
    }));

    // Create route from locations
    const route = locations.map(l => ({ lat: l.lat, lng: l.lng }));

    // Get visit locations
    const visitMarkers = employeeVisits
      .filter(v => v.location)
      .map(v => ({
        id: `visit-${v.id}`,
        lat: v.location.lat,
        lng: v.location.lng,
        popup: {
          title: v.customerName || 'Visit Location',
          description: v.purpose,
          time: `Duration: ${v.duration || 0} min`,
        },
      }));

    // Add start marker
    const startMarker = locations.length > 0 ? {
      id: 'start-marker',
      lat: locations[0].lat,
      lng: locations[0].lng,
      popup: {
        title: 'Start',
        description: `Started at ${formatTime(locations[0].timestamp)}`,
      },
    } : null;

    // Add end marker
    const endMarker = locations.length > 0 ? {
      id: 'end-marker',
      lat: locations[locations.length - 1].lat,
      lng: locations[locations.length - 1].lng,
      popup: {
        title: 'End',
        description: `Last update at ${formatTime(locations[locations.length - 1].timestamp)}`,
      },
    } : null;

    const markers = [
      startMarker,
      ...visitMarkers,
      endMarker,
    ].filter(Boolean);

    // Calculate total distance
    let totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
      totalDistance += calculateDistance(
        locations[i - 1].lat,
        locations[i - 1].lng,
        locations[i].lat,
        locations[i].lng
      );
    }

    return {
      center: locations.length > 0 
        ? [locations[0].lat, locations[0].lng]
        : [23.8103, 90.4125],
      zoom: 13,
      markers,
      route,
      totalDistance: totalDistance.toFixed(2),
      fitBounds: locations.length > 0,
      hasData: true,
    };
  };

  const mapData = activeTab === 'live' 
    ? getLiveMapData()
    : getPastMapData();

  // Ensure mapData is never null/undefined
  const safeMapData = mapData || {
    center: [23.8103, 90.4125],
    zoom: 11,
    markers: [],
    route: [],
    fitBounds: false,
    hasData: false,
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Track Your Salesmen</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Real-time location tracking & activity monitoring</p>
          </div>
          <button
            onClick={() => {
              handleRefresh();
              // Reset selected employee to show all on map
              setSelectedEmployee(null);
            }}
            disabled={isRefreshing}
            className="btn btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left Sidebar - Employee List */}
        <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col flex-shrink-0 max-h-[50vh] lg:max-h-none">
          <div className="flex flex-col overflow-hidden h-full lg:h-auto">
          {/* Search */}
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search salesperson..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('live');
                setSelectedEmployee(null);
              }}
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'live'
                  ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
              Live
            </button>
            <button
              onClick={() => {
                setActiveTab('past');
                setSelectedEmployee(null);
              }}
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'past'
                  ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
              Past Data
            </button>
          </div>

          {/* Date Picker for Past Data */}
          {activeTab === 'past' && (
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Employee List */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700">
                  Salesperson ({filteredEmployees.length})
                </h3>
              </div>
              <div className="space-y-2">
                {filteredEmployees.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No salespersons found</p>
                ) : (
                  filteredEmployees.map(employee => {
                    const liveLocation = liveLocations.find(loc => loc.userId === employee.id);
                    const isSelected = selectedEmployee?.id === employee.id;
                    const avatar = getUserAvatar(employee);
                    const initials = getUserInitials(employee);

                    return (
                      <div
                        key={employee.id}
                        onClick={() => handleEmployeeClick(employee)}
                        className={`p-2 sm:p-3 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary-50 border-2 border-primary-500 shadow-md'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          {/* Avatar */}
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={employee.name}
                              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm border-2 border-white shadow-sm flex-shrink-0">
                              {initials}
                            </div>
                          )}
                          
                          {/* Employee Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                              {employee.name}
                            </h4>
                            {activeTab === 'live' ? (
                              liveLocation ? (
                                <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                                  <span className="text-xs text-gray-600 truncate">
                                    {formatTime(liveLocation.timestamp)}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full flex-shrink-0" />
                                  <span className="text-xs text-gray-500">Offline</span>
                                </div>
                              )
                            ) : (
                              <span className="text-xs text-gray-500 mt-0.5 sm:mt-1 block truncate">
                                {employee.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Right Side - Map and Details */}
        <div className="flex-1 flex flex-col min-h-0 flex-shrink">
          {/* Map */}
          <div className="flex-1 relative min-h-0">
            <Map
              center={safeMapData.center || [23.8103, 90.4125]}
              zoom={safeMapData.zoom || 11}
              markers={safeMapData.markers || []}
              route={safeMapData.route || []}
              fitBounds={safeMapData.fitBounds}
              onMarkerClick={handleMarkerClick}
            />
            {/* Show "No Data" overlay when employee selected but no data */}
            {activeTab === 'past' && selectedEmployee && safeMapData.hasData === false && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
                <div className="text-center p-4 sm:p-6">
                  <MapPin className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-400" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    No Data Available
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 px-2">
                    No activity data found for {selectedEmployee.name} on {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
            {/* Show placeholder when no employee selected */}
            {!selectedEmployee && activeTab === 'past' && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80 z-40">
                <div className="text-center p-4">
                  <MapPin className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-400" />
                  <p className="text-sm sm:text-base text-gray-500">
                    Select an employee and date to view route
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Panel - Activity & Details */}
          {selectedEmployee && (
            <div className="bg-white border-t border-gray-200 p-3 sm:p-4 max-h-32 sm:max-h-48 lg:max-h-64 overflow-y-auto flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {selectedEmployee.name} - {activeTab === 'live' ? 'Live Tracking' : 'Activity'}
                </h3>
                {activeTab === 'past' && safeMapData?.totalDistance && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <Route className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="font-medium">Total: {safeMapData.totalDistance} km</span>
                  </div>
                )}
              </div>

              {activeTab === 'live' ? (
                /* Live Activity */
                <div className="space-y-3">
                  {selectedEmployeeLiveLocation ? (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-gray-700">Currently Active</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Last Updated:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {formatTime(selectedEmployeeLiveLocation.timestamp)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {selectedEmployeeLiveLocation.lat.toFixed(6)}, {selectedEmployeeLiveLocation.lng.toFixed(6)}
                          </span>
                        </div>
                      </div>
                      {/* Today's Activity */}
                      {(() => {
                        const today = new Date().toISOString().split('T')[0];
                        const todayVisits = allVisits.filter(v => 
                          v.userId === selectedEmployee.id && v.checkIn && v.checkIn.startsWith(today)
                        );
                        return todayVisits.length > 0 ? (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <Activity className="w-4 h-4" />
                              Today's Activity ({todayVisits.length} visits)
                            </h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {todayVisits.map(visit => (
                                <div key={visit.id} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                                  <span className="font-medium">{visit.customerName || 'Customer'}</span> - {visit.purpose}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mx-auto mb-2" />
                      <p>No live tracking data available</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Past Activity */
                <div className="space-y-3 sm:space-y-4">
                  {/* Show "No Data" message if no visits and no history */}
                  {employeeVisits.length === 0 && employeeHistory.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <MapPin className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm sm:text-base text-gray-600 font-medium">No activity data found</p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 px-2">
                        No visits or location history for {selectedEmployee.name} on {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Visits */}
                      {employeeVisits.length > 0 && (
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Activity className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            Visits ({employeeVisits.length})
                          </h4>
                          <div className="space-y-2">
                            {employeeVisits.map(visit => (
                              <div
                                key={visit.id}
                                className="p-2 sm:p-3 bg-gray-50 rounded-lg border-l-4 border-primary-500"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-xs sm:text-sm text-gray-900 truncate">
                                      {visit.customerName || 'Customer Visit'}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{visit.purpose}</p>
                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 flex-shrink-0" />
                                        {formatTime(visit.checkIn)}
                                      </span>
                                      {visit.duration && (
                                        <span className="flex items-center gap-1">
                                          <Activity className="w-3 h-3 flex-shrink-0" />
                                          {visit.duration} min
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <Badge status={visit.status} className="flex-shrink-0">{visit.status}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Location History */}
                      {employeeHistory.length > 0 && (
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Route className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            Location Points ({employeeHistory.length})
                          </h4>
                          <div className="space-y-1 max-h-24 sm:max-h-32 overflow-y-auto">
                            {employeeHistory.slice(0, 10).map((point, idx) => (
                              <div
                                key={point.id || idx}
                                className="flex items-center gap-2 text-xs text-gray-600 py-1"
                              >
                                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0" />
                                <span className="truncate">{formatTime(point.timestamp)}</span>
                                <span className="text-gray-400 flex-shrink-0">•</span>
                                <span className="capitalize truncate">{point.activity || 'tracking'}</span>
                              </div>
                            ))}
                            {employeeHistory.length > 10 && (
                              <p className="text-xs text-gray-500 text-center py-1">
                                +{employeeHistory.length - 10} more points
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminTracking;
