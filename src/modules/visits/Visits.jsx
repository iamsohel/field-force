import { useEffect, useState } from 'react';
import { MapPin, Plus, Image as ImageIcon, ExternalLink, Navigation, Clock, Route, Users, Activity, Map as MapIcon, PlayCircle, StopCircle } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { visitsApi, customersApi, locationApi } from '@services/api';
import { formatDateTime, formatTime } from '@utils/helpers';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import StatCard from '@components/common/StatCard';
import Map from '@components/common/Map';
import CreateVisitModal from './CreateVisitModal';
import AdminTracking from './AdminTracking';
import { useLocationStore } from '@store/locationStore';

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function Visits() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Show admin tracking view for admins
  if (isAdmin) {
    return <AdminTracking />;
  }
  const [visits, setVisits] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [locationHistory, setLocationHistory] = useState([]);
  const [liveLocations, setLiveLocations] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const { currentLocation, startTracking, stopTracking } = useLocationStore();

  useEffect(() => {
    if (user) {
      loadData();
      if (isAdmin) {
        loadLiveLocations();
        // Refresh live locations every 5 seconds
        const interval = setInterval(loadLiveLocations, 5000);
        return () => clearInterval(interval);
      }
    }
  }, [user, isAdmin]);

  const loadData = async () => {
    const visitsResponse = await visitsApi.getByUserId(user.id);
    const customersResponse = await customersApi.getByUserId(user.id);

    if (visitsResponse.success) {
      setVisits(visitsResponse.data);
    }
    if (customersResponse.success) {
      setCustomers(customersResponse.data);
    }
  };

  const loadLiveLocations = async () => {
    if (isAdmin) {
      const response = await locationApi.getAllLiveLocations();
      if (response.success) {
        setLiveLocations(response.data);
      }
    }
  };

  const handleCreateVisit = async (visitData) => {
    const response = await visitsApi.startVisit(visitData);
    if (response.success) {
      setVisits([response.data, ...visits]);
      return true;
    }
    return false;
  };

  const handleStartTracking = async () => {
    setIsTracking(true);
    await startTracking(user.id);
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    stopTracking();
  };

  const openMapLocation = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  // Calculate total distance traveled for today's visits
  const calculateTodayDistance = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayVisits = visits.filter(v => 
      v.checkIn && v.checkIn.startsWith(today) && v.travelPath && v.travelPath.length > 1
    );
    
    let totalDistance = 0;
    todayVisits.forEach(visit => {
      if (visit.travelPath && visit.travelPath.length > 1) {
        for (let i = 1; i < visit.travelPath.length; i++) {
          const prev = visit.travelPath[i - 1];
          const curr = visit.travelPath[i];
          totalDistance += calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
        }
      }
    });
    return totalDistance.toFixed(2);
  };

  // Get today's visits count
  const todayVisits = visits.filter(v => 
    v.checkIn && v.checkIn.startsWith(new Date().toISOString().split('T')[0])
  ).length;

  // Get active visits
  const activeVisits = visits.filter(v => v.status === 'in-progress').length;

  // Calculate average visit duration
  const avgDuration = visits.length > 0
    ? Math.round(visits.reduce((sum, v) => sum + (v.duration || 0), 0) / visits.length)
    : 0;

  // Prepare map markers and route for selected visit
  const getMapData = () => {
    if (selectedVisit && selectedVisit.travelPath && selectedVisit.travelPath.length > 0) {
      return {
        center: [selectedVisit.travelPath[0].lat, selectedVisit.travelPath[0].lng],
        zoom: 13,
        markers: [
          {
            lat: selectedVisit.travelPath[0].lat,
            lng: selectedVisit.travelPath[0].lng,
            popup: {
              title: 'Start',
              description: `Visit started at ${formatTime(selectedVisit.checkIn)}`,
            },
          },
          ...(selectedVisit.location ? [{
            lat: selectedVisit.location.lat,
            lng: selectedVisit.location.lng,
            popup: {
              title: selectedVisit.customerName || 'Visit Location',
              description: selectedVisit.purpose,
            },
          }] : []),
        ],
        route: selectedVisit.travelPath.map(p => ({ lat: p.lat, lng: p.lng })),
      };
    } else if (selectedVisit && selectedVisit.location) {
      return {
        center: [selectedVisit.location.lat, selectedVisit.location.lng],
        zoom: 15,
        markers: [{
          lat: selectedVisit.location.lat,
          lng: selectedVisit.location.lng,
          popup: {
            title: selectedVisit.customerName || 'Visit Location',
            description: selectedVisit.purpose,
          },
        }],
        route: [],
      };
    }
    return null;
  };

  // For admin: prepare live tracking map
  const getLiveTrackingMapData = () => {
    if (liveLocations.length === 0) {
      return {
        center: [23.8103, 90.4125], // Default to Dhaka
        zoom: 11,
        markers: [],
        route: [],
      };
    }
    
    const markers = liveLocations.map(loc => ({
      lat: loc.lat,
      lng: loc.lng,
      popup: {
        title: loc.userName,
        description: `Last updated: ${formatTime(loc.timestamp)}`,
        time: `Status: ${loc.status || 'Active'}`,
      },
    }));

    return {
      center: [liveLocations[0].lat, liveLocations[0].lng],
      zoom: 12,
      markers,
      route: [],
    };
  };

  const mapData = viewMode === 'map' && selectedVisit 
    ? getMapData() 
    : isAdmin && viewMode === 'map' 
    ? getLiveTrackingMapData() 
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Visit Tracking</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Live GPS tracking & visit management</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {!isAdmin && (
            <button
              onClick={isTracking ? handleStopTracking : handleStartTracking}
              className={`btn flex items-center justify-center gap-2 w-full sm:w-auto ${
                isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              } text-white text-sm sm:text-base`}
            >
              {isTracking ? (
                <>
                  <StopCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Stop Tracking</span>
                  <span className="sm:hidden">Stop</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Start Live Tracking</span>
                  <span className="sm:hidden">Start Tracking</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            className="btn btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
          >
            <MapIcon className="w-4 h-4" />
            {viewMode === 'map' ? 'List View' : 'Map View'}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Start Visit</span>
            <span className="sm:hidden">New Visit</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={MapPin}
          title="Today's Visits"
          value={todayVisits}
          color="primary"
        />
        <StatCard
          icon={Activity}
          title="Active Visits"
          value={activeVisits}
          color="info"
        />
        <StatCard
          icon={Route}
          title="Distance Today"
          value={`${calculateTodayDistance()} km`}
          color="success"
        />
        <StatCard
          icon={Clock}
          title="Avg Duration"
          value={`${avgDuration} min`}
          color="warning"
        />
      </div>

      {/* Main Content */}
      {viewMode === 'map' ? (
        /* Map View */
        <Card title={isAdmin ? "Live Location Tracking" : "Visit Map"} className="h-[400px] sm:h-[500px] lg:h-[600px]">
          <div className="h-full">
            {mapData ? (
              <Map
                center={mapData.center}
                zoom={mapData.zoom}
                markers={mapData.markers}
                route={mapData.route}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 p-4">
                {isAdmin ? (
                  <div className="text-center">
                    <MapIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm sm:text-base">No active tracking data available</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <MapIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm sm:text-base">Select a visit to view on map</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Visits List */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            <Card title="Visit History">
              <div className="space-y-4">
                {visits.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p>No visits recorded yet</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn btn-primary mt-4"
                    >
                      Start Your First Visit
                    </button>
                  </div>
                ) : (
                  visits.map(visit => {
                    const customer = customers.find(c => c.id === visit.customerId);
                    const travelDistance = visit.travelPath && visit.travelPath.length > 1
                      ? (() => {
                          let dist = 0;
                          for (let i = 1; i < visit.travelPath.length; i++) {
                            const prev = visit.travelPath[i - 1];
                            const curr = visit.travelPath[i];
                            dist += calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
                          }
                          return dist.toFixed(2);
                        })()
                      : null;

                    return (
                      <div
                        key={visit.id}
                        onClick={() => {
                          setSelectedVisit({ ...visit, customerName: customer?.name });
                          setViewMode('map');
                        }}
                        className={`p-3 sm:p-5 border-2 rounded-xl transition-all cursor-pointer ${
                          selectedVisit?.id === visit.id
                            ? 'border-primary-500 bg-primary-50 shadow-lg'
                            : 'border-gray-200 hover:border-primary-300 hover:shadow-md bg-white'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                              <h4 className="font-bold text-base sm:text-lg text-gray-900">
                                {customer?.name || 'Unknown Customer'}
                              </h4>
                              <Badge status={visit.status}>{visit.status}</Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 font-medium">{visit.purpose}</p>
                          </div>
                        </div>

                        {/* Visit Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3">
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600 truncate">
                              {formatDateTime(visit.checkIn)}
                            </span>
                          </div>
                          {visit.checkOut && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-600 truncate">
                                {formatDateTime(visit.checkOut)}
                              </span>
                            </div>
                          )}
                          {visit.duration && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-600">{visit.duration} min</span>
                            </div>
                          )}
                          {travelDistance && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <Route className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-600">{travelDistance} km</span>
                            </div>
                          )}
                        </div>

                        {/* Location */}
                        {visit.location && (
                          <div className="mb-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openMapLocation(visit.location.lat, visit.location.lng);
                              }}
                              className="flex items-center gap-2 text-xs sm:text-sm text-primary-600 hover:text-primary-800 font-medium"
                            >
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span>View Location</span>
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </button>
                          </div>
                        )}

                        {/* Feedback */}
                        {visit.feedback && (
                          <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg border-l-4 border-primary-500">
                            <p className="text-xs sm:text-sm text-gray-700">{visit.feedback}</p>
                          </div>
                        )}

                        {/* Photos */}
                        {visit.photos && visit.photos.length > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                              <span className="text-xs text-gray-500 font-medium">
                                {visit.photos.length} photo(s)
                              </span>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {visit.photos.slice(0, 4).map((photo, idx) => (
                                <div
                                  key={idx}
                                  className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg overflow-hidden flex items-center justify-center"
                                >
                                  <ImageIcon className="w-6 h-6 text-primary-400" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-2">
            {/* Customer List */}
            <Card title="My Customers">
              <div className="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                {customers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No customers</p>
                ) : (
                  customers.map(customer => (
                    <div
                      key={customer.id}
                      className="p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">{customer.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{customer.contactPerson}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{customer.address}</span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Live Tracking Status */}
            {!isAdmin && (
              <Card title="Tracking Status">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge status={isTracking ? 'in-progress' : 'completed'}>
                      {isTracking ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {currentLocation && (
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Lat: {currentLocation.lat.toFixed(6)}</p>
                      <p>Lng: {currentLocation.lng.toFixed(6)}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Admin: Live Staff Locations */}
            {isAdmin && liveLocations.length > 0 && (
              <Card title="Live Staff Locations">
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {liveLocations.map((loc, idx) => (
                    <div
                      key={idx}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setViewMode('map');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{loc.userName}</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(loc.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Create Visit Modal */}
      <CreateVisitModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        customers={customers}
        onCreate={handleCreateVisit}
      />
    </div>
  );
}

export default Visits;
