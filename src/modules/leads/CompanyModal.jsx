import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Modal from '@components/common/Modal';

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

function CompanyModal({ isOpen, onClose, onSave, editingCompany = null }) {
  const [formData, setFormData] = useState({
    name: '',
    logo: null,
    logoPreview: '',
    address: '',
    phone: '',
    lat: 23.8103,
    lng: 90.4125,
    status: 'active',
  });
  const [showMap, setShowMap] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingCompany) {
        setFormData({
          name: editingCompany.name || '',
          logo: null,
          logoPreview: editingCompany.logo || '',
          address: editingCompany.address || '',
          phone: editingCompany.phone || '',
          lat: editingCompany.lat || 23.8103,
          lng: editingCompany.lng || 90.4125,
          status: editingCompany.status || 'active',
        });
      } else {
        setFormData({
          name: '',
          logo: null,
          logoPreview: '',
          address: '',
          phone: '',
          lat: 23.8103,
          lng: 90.4125,
          status: 'active',
        });
      }
      setShowMap(false);
      setError('');
    }
  }, [isOpen, editingCompany]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'logo' && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo: file,
          logoPreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMapClick = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      lat,
      lng,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Company name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      // If logo is a file, convert to data URL or use preview
      let logoUrl = formData.logoPreview;
      if (formData.logo && formData.logoPreview && formData.logoPreview.startsWith('data:')) {
        logoUrl = formData.logoPreview;
      } else if (!logoUrl) {
        logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=3B82F6&color=fff`;
      }

      const companyData = {
        name: formData.name.trim(),
        logo: logoUrl,
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        lat: parseFloat(formData.lat) || 23.8103,
        lng: parseFloat(formData.lng) || 90.4125,
        status: formData.status,
      };

      await onSave(companyData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save company');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCompany ? 'Edit Company' : 'Add New Company'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input"
            placeholder="Enter company name"
          />
        </div>

        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
            Logo
          </label>
          <input
            type="file"
            id="logo"
            name="logo"
            accept="image/*"
            onChange={handleChange}
            className="input"
          />
          {formData.logoPreview && (
            <div className="mt-2">
              <img
                src={formData.logoPreview}
                alt="Logo preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
              />
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Upload company logo. Leave empty to auto-generate from company name.
          </p>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Address *
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            rows={3}
            className="input"
            placeholder="Enter company address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="input"
              placeholder="+880-2-1234567"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Location (Latitude & Longitude) *
            </label>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {showMap ? 'Hide Map' : 'Select from Map'}
            </button>
          </div>
          
          {showMap && (
            <div className="mb-4 border border-gray-300 rounded-lg overflow-hidden" style={{ height: '400px' }}>
              <div className="relative h-full" style={{ zIndex: 1 }}>
                <MapContainer
                  center={[formData.lat, formData.lng]}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapClickHandler onMapClick={handleMapClick} />
                  <MapCenterUpdater center={[formData.lat, formData.lng]} />
                  <Marker position={[formData.lat, formData.lng]} />
                </MapContainer>
              </div>
              <p className="text-xs text-gray-500 mt-1 px-2 pb-2">
                Click anywhere on the map to set the location coordinates
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-2">
                Latitude *
              </label>
              <input
                type="number"
                id="lat"
                name="lat"
                value={formData.lat}
                onChange={handleChange}
                step="any"
                required
                className="input"
                placeholder="23.8103"
              />
            </div>

            <div>
              <label htmlFor="lng" className="block text-sm font-medium text-gray-700 mb-2">
                Longitude *
              </label>
              <input
                type="number"
                id="lng"
                name="lng"
                value={formData.lng}
                onChange={handleChange}
                step="any"
                required
                className="input"
                placeholder="90.4125"
              />
            </div>
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
            {isSubmitting ? 'Saving...' : editingCompany ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CompanyModal;
