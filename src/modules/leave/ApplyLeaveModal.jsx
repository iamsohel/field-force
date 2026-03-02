import { useState, useEffect } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import Modal from '@components/common/Modal';
import { useAuthStore } from '@store/authStore';
import { useLeaveStore } from '@store/leaveStore';
import { usersApi } from '@services/api';
import { differenceInDays, parseISO } from 'date-fns';

function ApplyLeaveModal({ isOpen, onClose, leave = null }) {
  const { user } = useAuthStore();
  const { createLeaveApplication, updateLeaveStatus, fetchLeaveBalance } = useLeaveStore();
  const [supervisors, setSupervisors] = useState([]);
  const isEditMode = !!leave;
  const isAdmin = user?.role === 'admin';

  const [formData, setFormData] = useState({
    leaveType: 'casual',
    reason: '',
    fromDate: '',
    toDate: '',
    remarks: '',
    supervisorId: '',
    status: 'pending',
  });

  useEffect(() => {
    if (leave) {
      setFormData({
        leaveType: leave.leaveType,
        reason: leave.reason,
        fromDate: leave.fromDate,
        toDate: leave.toDate,
        remarks: leave.remarks || '',
        supervisorId: leave.supervisorId || '',
        status: leave.status || 'pending',
      });
    } else {
      setFormData({
        leaveType: 'casual',
        reason: '',
        fromDate: '',
        toDate: '',
        remarks: '',
        supervisorId: user?.manager || '',
        status: 'pending',
      });
    }
  }, [leave, isOpen, user]);

  const [calculatedDays, setCalculatedDays] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSupervisors();
      // Set default supervisor to user's manager if available
      if (user?.manager) {
        setFormData(prev => ({ ...prev, supervisorId: user.manager }));
      }
    }
  }, [isOpen, user]);

  useEffect(() => {
    // Calculate days when dates change
    if (formData.fromDate && formData.toDate) {
      const from = parseISO(formData.fromDate);
      const to = parseISO(formData.toDate);
      if (to >= from) {
        const days = differenceInDays(to, from) + 1; // +1 to include both start and end dates
        setCalculatedDays(days);
      } else {
        setCalculatedDays(0);
      }
    } else {
      setCalculatedDays(0);
    }
  }, [formData.fromDate, formData.toDate]);

  const loadSupervisors = async () => {
    const response = await usersApi.getAll();
    if (response.success) {
      // Get managers and admins as supervisors
      const supervisorsList = response.data.filter(
        u => (u.role === 'manager' || u.role === 'admin') && u.id !== user?.id
      );
      setSupervisors(supervisorsList);
    }
  };

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
    if (!formData.leaveType) newErrors.leaveType = 'Leave type is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    if (!formData.fromDate) newErrors.fromDate = 'From date is required';
    if (!formData.toDate) newErrors.toDate = 'To date is required';
    if (formData.fromDate && formData.toDate) {
      const from = parseISO(formData.fromDate);
      const to = parseISO(formData.toDate);
      if (to < from) {
        newErrors.toDate = 'To date must be after or equal to from date';
      }
    }
    if (!formData.supervisorId) newErrors.supervisorId = 'Supervisor is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    if (isEditMode && isAdmin) {
      // Admin editing - update status
      const success = await updateLeaveStatus(leave.id, formData.status, user.id);
      setIsSubmitting(false);
      if (success) {
        const currentYear = new Date().getFullYear();
        await fetchLeaveBalance(leave.userId, currentYear);
        onClose();
      }
    } else {
      // Create new leave application
      const leaveData = {
        userId: leave?.userId || user.id,
        leaveType: formData.leaveType,
        reason: formData.reason,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        days: calculatedDays,
        remarks: formData.remarks,
        supervisorId: formData.supervisorId,
      };

      const success = await createLeaveApplication(leaveData);
      setIsSubmitting(false);

      if (success) {
        // Refresh leave balance
        const currentYear = new Date().getFullYear();
        await fetchLeaveBalance(user.id, currentYear);
        
        // Reset form
        setFormData({
          leaveType: 'casual',
          reason: '',
          fromDate: '',
          toDate: '',
          remarks: '',
          supervisorId: user?.manager || '',
          status: 'pending',
        });
        setCalculatedDays(0);
        onClose();
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? (isAdmin ? 'Edit Leave Status' : 'Edit Leave Application') : 'Apply for Leave'}
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
            {isSubmitting ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update Leave' : 'Apply Leave')}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Status Field (Admin only, edit mode only) */}
        {isAdmin && isEditMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`input ${errors.status ? 'border-red-500' : ''}`}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status}</p>
            )}
          </div>
        )}

        {/* Leave Type */}
        {!isEditMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave Type *
            </label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              disabled={isEditMode}
              className={`input ${errors.leaveType ? 'border-red-500' : ''} ${isEditMode ? 'bg-gray-100' : ''}`}
            >
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
            </select>
            {errors.leaveType && (
              <p className="mt-1 text-sm text-red-600">{errors.leaveType}</p>
            )}
          </div>
        )}

        {/* Reason */}
        {!isEditMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Enter reason for leave"
              className={`input ${errors.reason ? 'border-red-500' : ''}`}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>
        )}

        {/* Date Range */}
        {!isEditMode && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`input pl-10 ${errors.fromDate ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.fromDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.fromDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleChange}
                    min={formData.fromDate || new Date().toISOString().split('T')[0]}
                    className={`input pl-10 ${errors.toDate ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.toDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.toDate}</p>
                )}
              </div>
            </div>

            {/* Calculated Days */}
            {calculatedDays > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Total Days: <span className="font-bold">{calculatedDays}</span> day{calculatedDays !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Supervisor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Supervisor *
              </label>
              <select
                name="supervisorId"
                value={formData.supervisorId}
                onChange={handleChange}
                className={`input ${errors.supervisorId ? 'border-red-500' : ''}`}
              >
                <option value="">Select a supervisor</option>
                {supervisors.map(supervisor => (
                  <option key={supervisor.id} value={supervisor.id}>
                    {supervisor.name} ({supervisor.role})
                  </option>
                ))}
              </select>
              {errors.supervisorId && (
                <p className="mt-1 text-sm text-red-600">{errors.supervisorId}</p>
              )}
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks (Optional)
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                placeholder="Additional notes or comments"
                className="input"
              />
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}

export default ApplyLeaveModal;
