import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import Modal from '@components/common/Modal';
import { useLeaveStore } from '@store/leaveStore';

function PublicLeaveModal({ isOpen, onClose, holiday = null }) {
  const { createPublicHoliday, updatePublicHoliday } = useLeaveStore();
  const isEditMode = !!holiday;

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'national',
    description: '',
  });

  useEffect(() => {
    if (holiday) {
      setFormData({
        name: holiday.name,
        date: holiday.date,
        type: holiday.type || 'national',
        description: holiday.description || '',
      });
    } else {
      setFormData({
        name: '',
        date: '',
        type: 'national',
        description: '',
      });
    }
  }, [holiday, isOpen]);

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

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Holiday name is required';
    if (!formData.date) newErrors.date = 'Date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    let success = false;
    if (isEditMode) {
      success = await updatePublicHoliday(holiday.id, formData);
    } else {
      success = await createPublicHoliday(formData);
    }

    setIsSubmitting(false);

    if (success) {
      // Reset form
      setFormData({
        name: '',
        date: '',
        type: 'national',
        description: '',
      });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Public Holiday' : 'Add Public Holiday'}
      size="md"
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
            {isSubmitting ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Holiday' : 'Add Holiday')}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Holiday Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Holiday Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Republic Day"
            className={`input ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`input pl-10 ${errors.date ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="input"
          >
            <option value="national">National Holiday</option>
            <option value="regional">Regional Holiday</option>
            <option value="company">Company Holiday</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Additional information about the holiday"
            className="input"
          />
        </div>
      </form>
    </Modal>
  );
}

export default PublicLeaveModal;
