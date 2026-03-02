import { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Modal from '@components/common/Modal';
import { useAuthStore } from '@store/authStore';
import { useTasksStore } from '@store/tasksStore';
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

function EditTaskModal({ isOpen, onClose, task, onStatusChange }) {
  const { user } = useAuthStore();
  const { updateTask } = useTasksStore();
  const [teamMembers, setTeamMembers] = useState([]);
  const [showMap, setShowMap] = useState(false);

  const DEFAULT_LAT = 23.8103; // Dhaka
  const DEFAULT_LNG = 90.4125; // Dhaka

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'visit',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    dueTime: '',
    assignedTo: user?.id,
    location: {
      address: '',
      lat: DEFAULT_LAT,
      lng: DEFAULT_LNG,
    },
  });

  useEffect(() => {
    if (task) {
      const dueDate = new Date(task.dueDate);
      setFormData({
        title: task.title || '',
        description: task.description || '',
        type: task.type || 'visit',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        dueDate: dueDate.toISOString().split('T')[0],
        dueTime: dueDate.toTimeString().slice(0, 5),
        assignedTo: task.userId || user?.id,
        location: task.location || { address: '', lat: DEFAULT_LAT, lng: DEFAULT_LNG },
      });
      setShowMap(false);
    }
  }, [task, user]);

  useEffect(() => {
    if (user?.role === 'admin' && isOpen) {
      loadTeamMembers();
    }
  }, [isOpen, user]);

  const loadTeamMembers = async () => {
    const response = await usersApi.getAll();
    if (response.success) {
      const salespeople = response.data.filter(u => u.role === 'salesperson' || u.role === 'manager');
      setTeamMembers(salespeople);
    }
  };

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [name]: value }
    }));
  };

  const handleMapClick = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        lat: lat,
        lng: lng,
      }
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    if (!formData.dueTime) newErrors.dueTime = 'Due time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    const taskData = {
      userId: formData.assignedTo || user.id,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      priority: formData.priority,
      status: formData.status,
      dueDate: `${formData.dueDate}T${formData.dueTime}:00`,
      location: formData.location.address || formData.location.lat ? {
        address: formData.location.address || `Location (${formData.location.lat.toFixed(4)}, ${formData.location.lng.toFixed(4)})`,
        lat: parseFloat(formData.location.lat) || DEFAULT_LAT,
        lng: parseFloat(formData.location.lng) || DEFAULT_LNG,
      } : null,
    };

    const success = await updateTask(task.id, taskData);

    setIsSubmitting(false);

    if (success) {
      if (onStatusChange) {
        onStatusChange();
      }
      onClose();
    }
  };

  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Task"
      size="lg"
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
            {isSubmitting ? 'Updating...' : 'Update Task'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`input ${errors.title ? 'border-red-500' : ''}`}
            placeholder="Enter task title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Assign To (Admin Only) */}
        {user?.role === 'admin' && teamMembers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign To *
            </label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="input"
            >
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className={`input ${errors.description ? 'border-red-500' : ''}`}
            placeholder="Enter task description"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.description}
            </p>
          )}
        </div>

        {/* Type, Priority, and Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input"
            >
              <option value="visit">Visit</option>
              <option value="meeting">Meeting</option>
              <option value="call">Call</option>
              <option value="administrative">Administrative</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="input"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input"
            >
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Due Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={`input pl-10 ${errors.dueDate ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Time *
            </label>
            <input
              type="time"
              name="dueTime"
              value={formData.dueTime}
              onChange={handleChange}
              className={`input ${errors.dueTime ? 'border-red-500' : ''}`}
            />
            {errors.dueTime && (
              <p className="mt-1 text-sm text-red-600">{errors.dueTime}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">
                Location (Optional)
              </label>
            </div>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {showMap ? 'Hide Map' : 'Select from Map'}
            </button>
          </div>

          {showMap && (
            <div className="mb-4 h-[300px] rounded-lg overflow-hidden border border-gray-300">
              <MapContainer
                center={[formData.location.lat || DEFAULT_LAT, formData.location.lng || DEFAULT_LNG]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {formData.location.lat && formData.location.lng && (
                  <Marker position={[formData.location.lat, formData.location.lng]} />
                )}
                <MapClickHandler onMapClick={handleMapClick} />
              </MapContainer>
            </div>
          )}

          <div className="space-y-3">
            <input
              type="text"
              name="address"
              value={formData.location.address || ''}
              onChange={handleLocationChange}
              className="input"
              placeholder="Enter address"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                <input
                  type="number"
                  name="lat"
                  value={formData.location.lat || ''}
                  onChange={handleLocationChange}
                  step="any"
                  className="input"
                  placeholder="Latitude"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                <input
                  type="number"
                  name="lng"
                  value={formData.location.lng || ''}
                  onChange={handleLocationChange}
                  step="any"
                  className="input"
                  placeholder="Longitude"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default EditTaskModal;
