import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Modal from '@components/common/Modal';
import { usersApi } from '@services/api';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
  });
  return null;
}

// Component to update map view when center changes
function MapCenterUpdater({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
}

function TerritoryModal({ isOpen, onClose, onSave, editingTerritory = null }) {
  // Dhaka, Bangladesh coordinates
  const DEFAULT_LAT = 23.8103;
  const DEFAULT_LNG = 90.4125;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    centerLat: DEFAULT_LAT,
    centerLng: DEFAULT_LNG,
    color: '#FF6B6B',
    area: '',
    assignedUsers: [],
  });
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      if (editingTerritory) {
        setFormData({
          name: editingTerritory.name || '',
          description: editingTerritory.description || '',
          centerLat: editingTerritory.centerLat || editingTerritory.coordinates?.[0]?.[0] || DEFAULT_LAT,
          centerLng: editingTerritory.centerLng || editingTerritory.coordinates?.[0]?.[1] || DEFAULT_LNG,
          color: editingTerritory.color || '#FF6B6B',
          area: editingTerritory.area || '',
          assignedUsers: editingTerritory.assignedUsers || [],
        });
      } else {
        setFormData({
          name: '',
          description: '',
          centerLat: DEFAULT_LAT,
          centerLng: DEFAULT_LNG,
          color: '#FF6B6B',
          area: '',
          assignedUsers: [],
        });
      }
      setError('');
    }
  }, [isOpen, editingTerritory]);

  const loadUsers = async () => {
    const response = await usersApi.getAll();
    if (response.success) {
      setUsers(response.data.filter(u => u.role !== 'admin'));
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = e.target.checked;
      setFormData(prev => ({
        ...prev,
        assignedUsers: checked
          ? [...prev.assignedUsers, value]
          : prev.assignedUsers.filter(id => id !== value),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMapClick = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      centerLat: lat,
      centerLng: lng,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Territory name is required');
      return;
    }

    if (!formData.centerLat || !formData.centerLng) {
      setError('Please click on the map to set the territory center');
      return;
    }

    setIsSubmitting(true);
    try {
      const territoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        centerLat: formData.centerLat,
        centerLng: formData.centerLng,
        coordinates: [
          [formData.centerLat, formData.centerLng],
          [formData.centerLat + 0.05, formData.centerLng + 0.05],
          [formData.centerLat - 0.05, formData.centerLng - 0.05],
        ],
        color: formData.color,
        area: formData.area.trim(),
        assignedUsers: formData.assignedUsers,
        customers: editingTerritory?.customers || 0,
      };

      await onSave(territoryData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save territory');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTerritory ? 'Edit Territory' : 'Add New Territory'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Territory Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input"
              placeholder="e.g., North Zone"
            />
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
              Color *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="input flex-1"
                placeholder="#FF6B6B"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="input"
            placeholder="Territory description..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="centerLat" className="block text-sm font-medium text-gray-700 mb-2">
              Center Latitude *
            </label>
            <input
              type="number"
              id="centerLat"
              name="centerLat"
              value={formData.centerLat}
              onChange={handleChange}
              step="any"
              required
              className="input"
              placeholder="23.8103"
            />
          </div>

          <div>
            <label htmlFor="centerLng" className="block text-sm font-medium text-gray-700 mb-2">
              Center Longitude *
            </label>
            <input
              type="number"
              id="centerLng"
              name="centerLng"
              value={formData.centerLng}
              onChange={handleChange}
              step="any"
              required
              className="input"
              placeholder="90.4125"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Click on the map to set territory center
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden relative isolate" style={{ height: '400px' }}>
            <div style={{ position: 'relative', height: '100%', width: '100%', zIndex: 1 }}>
              <MapContainer
                center={[formData.centerLat, formData.centerLng]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
                <MapClickHandler onMapClick={handleMapClick} />
                <MapCenterUpdater center={[formData.centerLat, formData.centerLng]} />
                <Marker position={[formData.centerLat, formData.centerLng]} />
              </MapContainer>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Click anywhere on the map to set the center coordinates
          </p>
        </div>

        <div>
          <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
            Area
          </label>
          <input
            type="text"
            id="area"
            name="area"
            value={formData.area}
            onChange={handleChange}
            className="input"
            placeholder="e.g., 450 sq km"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign Users
          </label>
          <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
            {users.length === 0 ? (
              <p className="text-sm text-gray-500">No users available</p>
            ) : (
              <div className="space-y-2">
                {users.map(user => (
                  <label key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      value={user.id}
                      checked={formData.assignedUsers.includes(user.id)}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      {user.name} ({user.role})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : editingTerritory ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default TerritoryModal;
