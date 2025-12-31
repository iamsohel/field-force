import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Mail, Phone, MapPin } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { usersApi } from '@services/api';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import Modal from '@components/common/Modal';

function TeamManagement() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'salesperson',
    territory: '',
  });

  useEffect(() => {
    loadTeamMembers();
  }, [user]);

  const loadTeamMembers = async () => {
    setLoading(true);
    const response = await usersApi.getTeamMembers(user.id);
    if (response.success) {
      setTeamMembers(response.data);
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const response = await usersApi.create(formData);
    if (response.success) {
      setTeamMembers([...teamMembers, response.data]);
      setShowCreateModal(false);
      resetForm();
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const response = await usersApi.update(selectedMember.id, formData);
    if (response.success) {
      setTeamMembers(teamMembers.map(m => m.id === selectedMember.id ? response.data : m));
      setShowEditModal(false);
      resetForm();
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this team member?')) {
      const response = await usersApi.delete(id);
      if (response.success) {
        setTeamMembers(teamMembers.filter(m => m.id !== id));
      }
    }
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      territory: member.territory,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'salesperson',
      territory: '',
    });
    setSelectedMember(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your field force team members
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map(member => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Member Header */}
              <div className="flex items-start gap-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-16 h-16 rounded-full border-2 border-primary-100"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{member.role}</p>
                  <Badge status={member.status === 'active' ? 'active' : 'inactive'} className="mt-1">
                    {member.status}
                  </Badge>
                </div>
              </div>

              {/* Member Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>+91-{member.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{member.territory}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => navigate(`/team/${member.id}`)}
                  className="flex-1 btn btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => openEditModal(member)}
                  className="flex-1 btn btn-primary text-sm flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="btn btn-secondary text-sm p-2"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No team members found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 btn btn-primary"
            >
              Add Your First Team Member
            </button>
          </div>
        </Card>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Add Team Member"
        footer={
          <>
            <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleCreate} className="btn btn-primary">
              Create Member
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input"
              placeholder="email@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="input"
              placeholder="9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input"
            >
              <option value="salesperson">Salesperson</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Territory *
            </label>
            <select
              name="territory"
              value={formData.territory}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="">Select Territory</option>
              <option value="North Zone">North Zone</option>
              <option value="South Zone">South Zone</option>
              <option value="East Zone">East Zone</option>
              <option value="West Zone">West Zone</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Team Member"
        footer={
          <>
            <button onClick={() => setShowEditModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleEdit} className="btn btn-primary">
              Update Member
            </button>
          </>
        }
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input"
            >
              <option value="salesperson">Salesperson</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Territory *
            </label>
            <select
              name="territory"
              value={formData.territory}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="North Zone">North Zone</option>
              <option value="South Zone">South Zone</option>
              <option value="East Zone">East Zone</option>
              <option value="West Zone">West Zone</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TeamManagement;
