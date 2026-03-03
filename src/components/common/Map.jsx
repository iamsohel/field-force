import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to update map center and zoom
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
}

// Create custom marker icon with employee image
const createEmployeeMarkerIcon = (employee, isActive = true) => {
  const avatar = employee?.avatar;
  const initials = employee?.name ? employee.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  const borderColor = isActive ? '#10b981' : '#9ca3af'; // green-500 or gray-400
  
  return L.divIcon({
    className: 'custom-employee-marker',
    html: `
      <div class="relative" style="cursor: pointer;">
        <div class="w-12 h-12 rounded-full border-3 shadow-lg overflow-hidden bg-white" style="border-color: ${borderColor}; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          ${avatar 
            ? `<img src="${avatar}" alt="${employee?.name || 'Employee'}" class="w-full h-full object-cover" />`
            : `<div class="w-full h-full flex items-center justify-center text-sm font-semibold" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">${initials}</div>`
          }
        </div>
        <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white" style="background-color: ${borderColor}; ${isActive ? 'animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;' : ''}"></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });
};

// Marker component with ref support and custom icon
function MarkerWithRef({ position, popup, markerId, markerRefs, employee, tooltip, onClick }) {
  const markerRef = useRef(null);
  
  useEffect(() => {
    if (markerRefs && markerId && markerRef.current) {
      markerRefs.current[markerId] = markerRef.current;
    }
  }, [markerId, markerRefs]);
  
  // Create custom icon if employee provided
  const icon = employee ? createEmployeeMarkerIcon(employee, true) : undefined;
  
  // Use React-Leaflet's eventHandlers prop - this handles cleanup automatically
  // DO NOT manually add/remove event listeners as it conflicts with Leaflet's cleanup
  const eventHandlers = onClick ? {
    click: () => {
      onClick();
    }
  } : undefined;
  
  return (
    <Marker 
      ref={markerRef} 
      position={position} 
      icon={icon}
      eventHandlers={eventHandlers}
    >
      {tooltip && (
        <Tooltip permanent={false} direction="top" offset={[0, -48]} className="custom-tooltip">
          <div className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px]">
            <div className="font-semibold text-sm text-gray-900 mb-1">
              {tooltip.name}
              {tooltip.lastName && <span className="text-gray-600 ml-1">{tooltip.lastName}</span>}
            </div>
            {tooltip.lastSeen && (
              <div className="text-xs text-gray-600 mb-1">Last seen: {tooltip.lastSeen}</div>
            )}
            {tooltip.activity && (
              <div className="text-xs text-gray-600">Today: {tooltip.activity}</div>
            )}
          </div>
        </Tooltip>
      )}
      {popup && (
        <Popup>
          <div className="p-3 min-w-[200px]">
            <h3 className="font-semibold text-lg mb-2 text-gray-900">{popup.title}</h3>
            {popup.description && (
              <p className="text-sm text-gray-600 mb-2">{popup.description}</p>
            )}
            {popup.activity && (
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Activity:</span> {popup.activity}
              </p>
            )}
            {popup.salespersons && (
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Salespersons:</span> {popup.salespersons}
              </p>
            )}
            {popup.area && (
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Area:</span> {popup.area}
              </p>
            )}
            {popup.customers && (
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Customers:</span> {popup.customers}
              </p>
            )}
            {popup.time && (
              <p className="text-xs text-gray-500 mt-2">{popup.time}</p>
            )}
          </div>
        </Popup>
      )}
    </Marker>
  );
}

function Map({
  center = [28.6139, 77.2090],
  zoom = 12,
  markers = [],
  route = [],
  geofence = null,
  className = '',
  markerRefs = null,
  fitBounds = false,
  onMarkerClick = null,
}) {
  const mapRef = useRef(null);
  const lastFitBoundsState = useRef(null);

  // Fit bounds when fitBounds prop is true
  useEffect(() => {
    if (mapRef.current && markers.length > 0 && fitBounds === true) {
      // Create a unique key based on markers and fitBounds state
      const markersKey = markers.map(m => `${m.lat},${m.lng}`).join('|');
      const currentState = `${fitBounds}-${markersKey}`;
      
      // Only fit bounds if state changed
      if (lastFitBoundsState.current !== currentState) {
        // Use a small delay to ensure map is ready
        const timeoutId = setTimeout(() => {
          if (mapRef.current && markers.length > 0) {
            try {
              const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
              mapRef.current.fitBounds(bounds, { padding: [50, 50] });
              lastFitBoundsState.current = currentState;
            } catch (error) {
              console.warn('Error fitting bounds:', error);
            }
          }
        }, 150);
        
        return () => clearTimeout(timeoutId);
      }
    } else if (fitBounds === false) {
      lastFitBoundsState.current = null;
    }
  }, [markers, fitBounds]);

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
        
        <MapUpdater center={center} zoom={zoom} />

        {/* Markers */}
        {markers.map((marker, index) => (
          <MarkerWithRef
            key={marker.id || index}
            position={[marker.lat, marker.lng]}
            popup={marker.popup}
            markerId={marker.id}
            markerRefs={markerRefs}
            employee={marker.employee}
            tooltip={marker.tooltip}
            onClick={marker.onClick || (onMarkerClick && marker.id ? () => onMarkerClick(marker.id) : undefined)}
          />
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
