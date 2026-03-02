import { useEffect, useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { useLeaveStore } from '@store/leaveStore';
import { usersApi } from '@services/api';
import ConfirmModal from '@components/common/ConfirmModal';
import ApplyLeaveModal from './ApplyLeaveModal';
import PublicLeaveModal from './PublicLeaveModal';
import LeaveConfigModal from './LeaveConfigModal';
import MyLeaveTab from './MyLeaveTab';
import PublicHolidaysTab from './PublicHolidaysTab';
import EmployeeLeaveApplicationsTab from './EmployeeLeaveApplicationsTab';

function Leave() {
  const { user } = useAuthStore();
  const {
    publicHolidays,
    leaveApplications,
    leaveConfigurations,
    leaveBalance,
    fetchPublicHolidays,
    fetchLeaveApplications,
    fetchLeaveConfigurations,
    fetchLeaveBalance,
    deletePublicHoliday,
    cancelLeaveApplication,
  } = useLeaveStore();

  const [activeTab, setActiveTab] = useState('myLeave'); // 'myLeave', 'publicHolidays', 'employeeLeaves'
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showPublicHolidayModal, setShowPublicHolidayModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [editingLeave, setEditingLeave] = useState(null);
  const [users, setUsers] = useState([]);
  const [showDeleteHolidayConfirm, setShowDeleteHolidayConfirm] = useState(false);
  const [showDeleteLeaveConfirm, setShowDeleteLeaveConfirm] = useState(false);
  const [deleteHolidayId, setDeleteHolidayId] = useState(null);
  const [deleteLeaveId, setDeleteLeaveId] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchPublicHolidays();
    fetchLeaveApplications(user?.id);
    if (isAdmin) {
      fetchLeaveConfigurations();
      loadUsers();
    }
    const currentYear = new Date().getFullYear();
    fetchLeaveBalance(user?.id, currentYear);
  }, [user]);

  const loadUsers = async () => {
    const response = await usersApi.getAll();
    if (response.success) {
      setUsers(response.data);
    }
  };

  const getUserName = (userId) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser?.name || userId;
  };

  // Filter leave applications
  const myLeaves = leaveApplications.filter(l => l.userId === user?.id);
  const allEmployeeLeaves = isAdmin ? leaveApplications : [];

  const handleEditHoliday = (holiday) => {
    setEditingHoliday(holiday);
    setShowPublicHolidayModal(true);
  };

  const handleDeleteHolidayClick = (id) => {
    setDeleteHolidayId(id);
    setShowDeleteHolidayConfirm(true);
  };

  const handleDeleteHolidayConfirm = async () => {
    if (deleteHolidayId) {
      await deletePublicHoliday(deleteHolidayId);
      fetchPublicHolidays();
      setDeleteHolidayId(null);
    }
  };

  const handleEditLeave = (leave) => {
    setEditingLeave(leave);
    setShowApplyModal(true);
  };

  const handleDeleteLeaveClick = (id) => {
    setDeleteLeaveId(id);
    setShowDeleteLeaveConfirm(true);
  };

  const handleDeleteLeaveConfirm = async () => {
    if (deleteLeaveId) {
      await cancelLeaveApplication(deleteLeaveId);
      fetchLeaveApplications(user?.id);
      const currentYear = new Date().getFullYear();
      fetchLeaveBalance(user?.id, currentYear);
      setDeleteLeaveId(null);
    }
  };

  const tabs = isAdmin
    ? [
        { id: 'myLeave', label: 'My Leave' },
        { id: 'publicHolidays', label: 'Public Holidays' },
        { id: 'employeeLeaves', label: 'Employee Leave Applications' },
      ]
    : [
        { id: 'myLeave', label: 'My Leave' },
        { id: 'publicHolidays', label: 'Public Holidays' },
      ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Leave Management</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {isAdmin && activeTab === 'publicHolidays' && (
            <button
              onClick={() => {
                setEditingHoliday(null);
                setShowPublicHolidayModal(true);
              }}
              className="btn btn-secondary text-sm lg:text-base whitespace-nowrap"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5 inline mr-2" />
              Add Holiday
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => {
                setEditingConfig(null);
                setShowConfigModal(true);
              }}
              className="btn btn-secondary text-sm lg:text-base whitespace-nowrap"
            >
              <Settings className="w-4 h-4 lg:w-5 lg:h-5 inline mr-2" />
              Configure
            </button>
          )}
          {!isAdmin && activeTab === 'myLeave' && (
            <button
              onClick={() => setShowApplyModal(true)}
              className="btn btn-primary text-sm lg:text-base whitespace-nowrap"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5 inline mr-2" />
              Apply Leave
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'myLeave' && (
          <MyLeaveTab
            leaveApplications={myLeaves}
            leaveBalance={leaveBalance}
            onEditLeave={handleEditLeave}
            onDeleteLeave={handleDeleteLeaveClick}
          />
        )}

        {activeTab === 'publicHolidays' && (
          <PublicHolidaysTab
            publicHolidays={publicHolidays}
            leaveApplications={myLeaves}
            getUserName={getUserName}
            isAdmin={isAdmin}
            onEditHoliday={handleEditHoliday}
            onDeleteHoliday={handleDeleteHolidayClick}
          />
        )}

        {isAdmin && activeTab === 'employeeLeaves' && (
          <EmployeeLeaveApplicationsTab
            leaveApplications={allEmployeeLeaves}
            getUserName={getUserName}
            onEditLeave={handleEditLeave}
            onDeleteLeave={handleDeleteLeaveClick}
          />
        )}
      </div>

      {/* Leave Configurations (Admin only) */}
      {isAdmin && leaveConfigurations.length > 0 && (
        <div className="mt-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Configurations</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Designation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Casual Leave
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sick Leave
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaveConfigurations.map(config => (
                    <tr key={config.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                        {config.designation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {config.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {config.casualLeavePerYear} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {config.sickLeavePerYear} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setEditingConfig(config);
                            setShowConfigModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-800 font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ApplyLeaveModal
        isOpen={showApplyModal}
        onClose={() => {
          setShowApplyModal(false);
          setEditingLeave(null);
          fetchLeaveApplications(user?.id);
          const currentYear = new Date().getFullYear();
          fetchLeaveBalance(user?.id, currentYear);
        }}
        leave={editingLeave}
      />
      <PublicLeaveModal
        isOpen={showPublicHolidayModal}
        onClose={() => {
          setShowPublicHolidayModal(false);
          setEditingHoliday(null);
          fetchPublicHolidays();
        }}
        holiday={editingHoliday}
      />
      <ConfirmModal
        isOpen={showDeleteHolidayConfirm}
        onClose={() => {
          setShowDeleteHolidayConfirm(false);
          setDeleteHolidayId(null);
        }}
        onConfirm={handleDeleteHolidayConfirm}
        title="Delete Public Holiday"
        message="Are you sure you want to delete this public holiday? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
      <ConfirmModal
        isOpen={showDeleteLeaveConfirm}
        onClose={() => {
          setShowDeleteLeaveConfirm(false);
          setDeleteLeaveId(null);
        }}
        onConfirm={handleDeleteLeaveConfirm}
        title="Delete Leave Application"
        message="Are you sure you want to delete this leave application? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
      <LeaveConfigModal
        isOpen={showConfigModal}
        onClose={() => {
          setShowConfigModal(false);
          setEditingConfig(null);
          fetchLeaveConfigurations();
        }}
        config={editingConfig}
      />
    </div>
  );
}

export default Leave;
