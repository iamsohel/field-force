import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { MapPin, Navigation, Battery, Clock } from 'lucide-react';
import L from 'leaflet';
import { formatTime, formatRelativeTime } from '@utils/helpers';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';

// Create custom marker icon with user photo
const createCustomIcon = (user, isActive) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <div class="w-10 h-10 rounded-full border-3 ${isActive ? 'border-green-500 shadow-green-500/50' : 'border-gray-400'} shadow-lg overflow-hidden bg-white">
          <img src="${user.avatar}" alt="${user.name}" class="w-full h-full object-cover" />
        </div>
        <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

function LiveLocationMap({ teamLocations, teamMembers }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [mapCenter] = useState([28.6139, 77.2090]); // Delhi center

  const getStatusColor = (timestamp) => {
    const lastUpdate = new Date(timestamp);
    const now = new Date();
    const diffMinutes = (now - lastUpdate) / (1000 * 60);

    if (diffMinutes < 5) return 'success'; // Active
    if (diffMinutes < 30) return 'warning'; // Idle
    return 'danger'; // Offline
  };

  const getActivityStatus = (timestamp) => {
    const lastUpdate = new Date(timestamp);
    const now = new Date();
    const diffMinutes = (now - lastUpdate) / (1000 * 60);

    if (diffMinutes < 5) return 'Active';
    if (diffMinutes < 30) return 'Idle';
    return 'Offline';
  };

  return (
    <Card
      title="Live Team Location"
      subtitle={`${teamLocations.length} team members tracked`}
      className="h-[600px] lg:h-[700px]"
      action={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Active</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Idle</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Offline</span>
          </div>
        </div>
      }
    >
      <div className="h-full -m-6 mt-0">
        <MapContainer
          center={mapCenter}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {teamLocations.map((location) => {
            const user = location.user || teamMembers.find(m => m.id === location.userId);
            if (!user || !location.location) return null;

            const isActive = getActivityStatus(location.timestamp) === 'Active';
            const statusColor = getStatusColor(location.timestamp);

            return (
              <Marker
                key={location.userId}
                position={[location.location.lat, location.location.lng]}
                icon={createCustomIcon(user, isActive)}
              >
                <Popup>
                  <div className="min-w-[250px] p-2">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{user.name}</h4>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        <Badge status={statusColor} className="mt-1">
                          {getActivityStatus(location.timestamp)}
                        </Badge>
                      </div>
                    </div>

                    {/* Location Details */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-gray-700">Current Activity</p>
                          <p className="text-gray-600">{location.activity || 'No activity'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-gray-700">Last Update</p>
                          <p className="text-gray-600">{formatRelativeTime(location.timestamp)}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Navigation className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-gray-700">Coordinates</p>
                          <p className="text-gray-600 text-xs">
                            {location.location.lat.toFixed(4)}, {location.location.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>

                      {user.territory && (
                        <div className="pt-2 mt-2 border-t">
                          <p className="text-xs text-gray-500">
                            Territory: <span className="font-medium">{user.territory}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <button className="w-full text-xs btn btn-primary py-1.5">
                        View Full Details
                      </button>
                      <button className="w-full text-xs btn btn-secondary py-1.5">
                        Send Message
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </Card>
  );
}

export default LiveLocationMap;
