import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


function Map({
  center = [28.6139, 77.2090],
  zoom = 12,
  markers = [],
  route = [],
  geofence = null,
  className = '',
}) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers]);

  // Ensure Leaflet elements don't exceed sidebar z-index on mobile
  useEffect(() => {
    const setLeafletZIndex = () => {
      if (window.innerWidth < 1024 && mapRef.current) {
        const container = mapRef.current.getContainer();
        if (container) {
          // Set z-index on all Leaflet panes
          const panes = container.querySelectorAll('.leaflet-pane');
          panes.forEach((pane) => {
            pane.style.zIndex = '0';
          });
          
          // Set z-index on controls
          const controls = container.querySelectorAll('.leaflet-control-container, .leaflet-top, .leaflet-bottom');
          controls.forEach((control) => {
            control.style.zIndex = '1';
          });
          
          // Set z-index on popups
          const popups = container.querySelectorAll('.leaflet-popup');
          popups.forEach((popup) => {
            popup.style.zIndex = '40';
          });
        }
      }
    };

    // Set z-index after a short delay to ensure Leaflet has rendered
    const timer = setTimeout(setLeafletZIndex, 100);
    
    // Also set on window resize and when map is ready
    window.addEventListener('resize', setLeafletZIndex);
    if (mapRef.current) {
      mapRef.current.whenReady(setLeafletZIndex);
    }
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', setLeafletZIndex);
    };
  }, []);

  return (
    <div className={className} style={{ height: '100%', minHeight: '400px', position: 'relative', isolation: 'isolate' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', position: 'relative' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Markers */}
        {markers.map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lng]}>
            {marker.popup && (
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold mb-1">{marker.popup.title}</h3>
                  {marker.popup.description && (
                    <p className="text-sm text-gray-600">{marker.popup.description}</p>
                  )}
                  {marker.popup.time && (
                    <p className="text-xs text-gray-500 mt-1">{marker.popup.time}</p>
                  )}
                </div>
              </Popup>
            )}
          </Marker>
        ))}

        {/* Route polyline */}
        {route.length > 0 && (
          <Polyline
            positions={route.map(r => [r.lat, r.lng])}
            color="#3B82F6"
            weight={3}
            opacity={0.7}
          />
        )}

        {/* Geofence circle */}
        {geofence && (
          <Circle
            center={[geofence.lat, geofence.lng]}
            radius={geofence.radius * 1000} // Convert km to meters
            pathOptions={{
              color: geofence.color || '#EF4444',
              fillColor: geofence.color || '#EF4444',
              fillOpacity: 0.1,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default Map;
