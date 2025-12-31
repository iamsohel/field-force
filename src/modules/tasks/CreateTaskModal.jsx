import { useState, useEffect } from 'react';
import { Calendar, MapPin, AlertCircle } from 'lucide-react';
import Modal from '@components/common/Modal';
import { useAuthStore } from '@store/authStore';
import { useTasksStore } from '@store/tasksStore';
import { usersApi } from '@services/api';

function CreateTaskModal({ isOpen, onClose, assignToUserId = null }) {
  const { user } = useAuthStore();
  const { createTask } = useTasksStore();
  const [teamMembers, setTeamMembers] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'visit',
    priority: 'medium',
    dueDate: '',
    dueTime: '',
    assignedTo: assignToUserId || user?.id,
    location: {
      address: '',
      lat: '',
      lng: '',
    },
  });

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
    // Clear error for this field
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
      status: 'pending',
      dueDate: `${formData.dueDate}T${formData.dueTime}:00`,
      location: formData.location.address ? {
        address: formData.location.address,
        lat: parseFloat(formData.location.lat) || 28.6139,
        lng: parseFloat(formData.location.lng) || 77.2090,
      } : null,
    };

    const success = await createTask(taskData);

    setIsSubmitting(false);

    if (success) {
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'visit',
        priority: 'medium',
        dueDate: '',
        dueTime: '',
        location: { address: '', lat: '', lng: '' },
      });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
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
            {isSubmitting ? 'Creating...' : 'Create Task'}
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

        {/* Type and Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Location (Optional) */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">
              Location (Optional)
            </label>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              name="address"
              value={formData.location.address}
              onChange={handleLocationChange}
              className="input"
              placeholder="Enter address"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="lat"
                value={formData.location.lat}
                onChange={handleLocationChange}
                className="input"
                placeholder="Latitude"
              />
              <input
                type="text"
                name="lng"
                value={formData.location.lng}
                onChange={handleLocationChange}
                className="input"
                placeholder="Longitude"
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default CreateTaskModal;
