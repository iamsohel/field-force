import { useState, useEffect } from 'react';
import Modal from '@components/common/Modal';

function CustomerModal({ isOpen, onClose, onSave, editingCustomer = null, companies = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    companyId: '',
    address: '',
    phone: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingCustomer) {
        setFormData({
          name: editingCustomer.name || '',
          companyId: editingCustomer.companyId || '',
          address: editingCustomer.address || '',
          phone: editingCustomer.phone || '',
          email: editingCustomer.email || '',
        });
      } else {
        setFormData({
          name: '',
          companyId: '',
          address: '',
          phone: '',
          email: '',
        });
      }
      setError('');
    }
  }, [isOpen, editingCustomer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Customer name is required');
      return;
    }

    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Phone is required');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const customerData = {
        name: formData.name.trim(),
        companyId: formData.companyId || null,
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
      };

      await onSave(customerData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
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
            Customer Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input"
            placeholder="Enter customer name"
          />
        </div>

        <div>
          <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-2">
            Company (Optional)
          </label>
          <select
            id="companyId"
            name="companyId"
            value={formData.companyId}
            onChange={handleChange}
            className="input"
          >
            <option value="">Select a company (optional)</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
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
            placeholder="Enter customer address"
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
              placeholder="+880-1712-345678"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input"
              placeholder="customer@email.com"
            />
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
            {isSubmitting ? 'Saving...' : editingCustomer ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CustomerModal;
