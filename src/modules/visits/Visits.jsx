import { useEffect, useState } from 'react';
import { MapPin, Plus, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { visitsApi, customersApi } from '@services/api';
import { formatDateTime } from '@utils/helpers';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import CreateVisitModal from './CreateVisitModal';

function Visits() {
  const { user } = useAuthStore();
  const [visits, setVisits] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    const visitsResponse = await visitsApi.getByUserId(user.id);
    const customersResponse = await customersApi.getByUserId(user.id);

    if (visitsResponse.success) setVisits(visitsResponse.data);
    if (customersResponse.success) setCustomers(customersResponse.data);
  };

  const handleCreateVisit = async (visitData) => {
    const response = await visitsApi.startVisit(visitData);
    if (response.success) {
      setVisits([response.data, ...visits]);
      return true;
    }
    return false;
  };

  const openMapLocation = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Visits</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5 inline mr-2" />
          Start Visit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visits List */}
        <div className="lg:col-span-2">
          <Card title="Visit History">
            <div className="space-y-4">
              {visits.map(visit => {
                const customer = customers.find(c => c.id === visit.customerId);
                return (
                  <div key={visit.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{customer?.name || 'Unknown Customer'}</h4>
                        <p className="text-sm text-gray-600">{visit.purpose}</p>
                      </div>
                      <Badge status={visit.status}>{visit.status}</Badge>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Check-in: {formatDateTime(visit.checkIn)}</p>
                      {visit.checkOut && <p>Check-out: {formatDateTime(visit.checkOut)}</p>}
                      {visit.duration && <p>Duration: {visit.duration} minutes</p>}
                    </div>
                    {visit.feedback && (
                      <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                        {visit.feedback}
                      </p>
                    )}

                    {/* Location Link */}
                    {visit.location && (
                      <button
                        onClick={() => openMapLocation(visit.location.lat, visit.location.lng)}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <MapPin className="w-4 h-4" />
                        View on Map
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}

                    {/* Visit Photos */}
                    {visit.photos && visit.photos.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          {visit.photos.length} photo(s)
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {visit.photos.slice(0, 3).map((photo, idx) => (
                            <div key={idx} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Customer List */}
        <div>
          <Card title="My Customers">
            <div className="space-y-3">
              {customers.map(customer => (
                <div key={customer.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                  <p className="text-sm text-gray-600">{customer.contactPerson}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {customer.address}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Create Visit Modal */}
      <CreateVisitModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        customers={customers}
        onCreate={handleCreateVisit}
      />
    </div>
  );
}

export default Visits;
