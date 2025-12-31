import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Camera, MapPin, Upload, X } from 'lucide-react';
import Modal from '@components/common/Modal';
import { useAuthStore } from '@store/authStore';
import L from 'leaflet';

function LocationPicker({ onLocationSelect, initialLocation }) {
  const [position, setPosition] = useState(initialLocation || { lat: 28.6139, lng: 77.2090 });

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
        setPosition(newPos);
        onLocationSelect(newPos);
      },
    });

    return position ? <Marker position={[position.lat, position.lng]} /> : null;
  }

  return (
    <MapContainer
      center={[position.lat, position.lng]}
      zoom={13}
      style={{ height: '300px', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
}

function CreateVisitModal({ isOpen, onClose, customers, onCreate }) {
  const { user } = useAuthStore();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    customerId: '',
    purpose: '',
    location: {
      lat: 28.6139,
      lng: 77.2090,
      address: '',
    },
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, ...location },
    }));
  };

  const handleAddressChange = (e) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, address: e.target.value },
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);

    // Limit to 5 images
    if (images.length + files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const visitData = {
      userId: user.id,
      customerId: formData.customerId,
      purpose: formData.purpose,
      checkIn: new Date().toISOString(),
      location: formData.location,
      photos: images.map((_, index) => `visit_photo_${Date.now()}_${index}.jpg`),
      status: 'in-progress',
    };

    const success = await onCreate(visitData);

    setIsSubmitting(false);

    if (success) {
      // Reset form
      setFormData({
        customerId: '',
        purpose: '',
        location: {
          lat: 28.6139,
          lng: 77.2090,
          address: '',
        },
      });
      setImages([]);
      setPreviews([]);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start New Visit"
      size="xl"
      footer={
        <>
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
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Starting Visit...' : 'Start Visit'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Customer *
          </label>
          <select
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Choose a customer...</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.contactPerson}
              </option>
            ))}
          </select>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purpose of Visit *
          </label>
          <select
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Select purpose...</option>
            <option value="Product demonstration">Product Demonstration</option>
            <option value="Follow-up meeting">Follow-up Meeting</option>
            <option value="New client introduction">New Client Introduction</option>
            <option value="Complaint resolution">Complaint Resolution</option>
            <option value="Product training">Product Training</option>
            <option value="Contract discussion">Contract Discussion</option>
            <option value="Inventory check">Inventory Check</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Location Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Visit Location *
          </label>
          <div className="space-y-3">
            <input
              type="text"
              value={formData.location.address}
              onChange={handleAddressChange}
              placeholder="Enter address or click on map"
              className="input"
              required
            />
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              initialLocation={formData.location}
            />
            <p className="text-xs text-gray-500">
              Click on the map to set visit location • Coordinates: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
            </p>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Camera className="w-4 h-4 inline mr-1" />
            Visit Photos (Optional)
          </label>

          {/* Image Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-3">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {images.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload photos ({images.length}/5)
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG up to 5MB each
              </p>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Visit check-in will be recorded with current timestamp and GPS location.
            You can add feedback and end the visit later.
          </p>
        </div>
      </form>
    </Modal>
  );
}

export default CreateVisitModal;
