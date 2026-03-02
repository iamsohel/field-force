import { useState, useEffect } from 'react';
import Modal from '@components/common/Modal';
import { useLeaveStore } from '@store/leaveStore';

function LeaveConfigModal({ isOpen, onClose, config = null }) {
  const { createLeaveConfiguration, updateLeaveConfiguration } = useLeaveStore();
  const isEditMode = !!config;

  const [formData, setFormData] = useState({
    designation: '',
    casualLeavePerYear: '',
    sickLeavePerYear: '',
    year: new Date().getFullYear(),
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData({
        designation: config.designation,
        casualLeavePerYear: config.casualLeavePerYear.toString(),
        sickLeavePerYear: config.sickLeavePerYear.toString(),
        year: config.year,
      });
    } else {
      setFormData({
        designation: '',
        casualLeavePerYear: '',
        sickLeavePerYear: '',
        year: new Date().getFullYear(),
      });
    }
  }, [config, isOpen]);

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
    if (!formData.designation) newErrors.designation = 'Designation is required';
    if (!formData.casualLeavePerYear || parseInt(formData.casualLeavePerYear) < 0) {
      newErrors.casualLeavePerYear = 'Casual leave must be a valid number';
    }
    if (!formData.sickLeavePerYear || parseInt(formData.sickLeavePerYear) < 0) {
      newErrors.sickLeavePerYear = 'Sick leave must be a valid number';
    }
    if (!formData.year || parseInt(formData.year) < 2020) {
      newErrors.year = 'Year must be valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    const configData = {
      designation: formData.designation,
      casualLeavePerYear: parseInt(formData.casualLeavePerYear),
      sickLeavePerYear: parseInt(formData.sickLeavePerYear),
      year: parseInt(formData.year),
    };

    let success = false;
    if (isEditMode) {
      success = await updateLeaveConfiguration(config.id, configData);
    } else {
      success = await createLeaveConfiguration(configData);
    }

    setIsSubmitting(false);

    if (success) {
      // Reset form
      setFormData({
        designation: '',
        casualLeavePerYear: '',
        sickLeavePerYear: '',
        year: new Date().getFullYear(),
      });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Leave Configuration' : 'Add Leave Configuration'}
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
            {isSubmitting ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update' : 'Add Configuration')}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Designation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Designation *
          </label>
          <select
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            disabled={isEditMode}
            className={`input ${errors.designation ? 'border-red-500' : ''} ${isEditMode ? 'bg-gray-100' : ''}`}
          >
            <option value="">Select designation</option>
            <option value="salesperson">Salesperson</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          {errors.designation && (
            <p className="mt-1 text-sm text-red-600">{errors.designation}</p>
          )}
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year *
          </label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            min="2020"
            max="2100"
            className={`input ${errors.year ? 'border-red-500' : ''}`}
          />
          {errors.year && (
            <p className="mt-1 text-sm text-red-600">{errors.year}</p>
          )}
        </div>

        {/* Casual Leave */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Casual Leave per Year *
          </label>
          <input
            type="number"
            name="casualLeavePerYear"
            value={formData.casualLeavePerYear}
            onChange={handleChange}
            min="0"
            max="365"
            placeholder="e.g., 12"
            className={`input ${errors.casualLeavePerYear ? 'border-red-500' : ''}`}
          />
          {errors.casualLeavePerYear && (
            <p className="mt-1 text-sm text-red-600">{errors.casualLeavePerYear}</p>
          )}
        </div>

        {/* Sick Leave */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sick Leave per Year *
          </label>
          <input
            type="number"
            name="sickLeavePerYear"
            value={formData.sickLeavePerYear}
            onChange={handleChange}
            min="0"
            max="365"
            placeholder="e.g., 10"
            className={`input ${errors.sickLeavePerYear ? 'border-red-500' : ''}`}
          />
          {errors.sickLeavePerYear && (
            <p className="mt-1 text-sm text-red-600">{errors.sickLeavePerYear}</p>
          )}
        </div>
      </form>
    </Modal>
  );
}

export default LeaveConfigModal;
