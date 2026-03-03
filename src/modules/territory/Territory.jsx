import { useEffect, useState, useRef } from 'react';
import { Map as MapIcon, Users, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { territoriesApi } from '@services/api';
import Card from '@components/common/Card';
import Map from '@components/common/Map';
import TerritoryModal from './TerritoryModal';
import ConfirmModal from '@components/common/ConfirmModal';

function Territory() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [territories, setTerritories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTerritory, setEditingTerritory] = useState(null);
  const [deleteTerritory, setDeleteTerritory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [mapCenter, setMapCenter] = useState([23.8103, 90.4125]); // Default to Dhaka
  const [mapZoom, setMapZoom] = useState(11);
  const markerRefs = useRef({});

  useEffect(() => {
    if (user) {
      loadTerritories();
    }
  }, [user]);

  const loadTerritories = async () => {
    const response = await territoriesApi.getAll();
    if (response.success) {
      setTerritories(response.data);
    }
  };

  const handleAdd = () => {
    setEditingTerritory(null);
    setShowModal(true);
  };

  const handleEdit = (territory) => {
    setEditingTerritory(territory);
    setShowModal(true);
  };

  const handleDelete = (territory) => {
    setDeleteTerritory(territory);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTerritory) return;
    
    const response = await territoriesApi.delete(deleteTerritory.id);
    if (response.success) {
      await loadTerritories();
      setDeleteTerritory(null);
      setShowDeleteModal(false);
    }
  };

  const handleSave = async (territoryData) => {
    if (editingTerritory) {
      const response = await territoriesApi.update(editingTerritory.id, territoryData);
      if (response.success) {
        await loadTerritories();
        setShowModal(false);
        setEditingTerritory(null);
      }
    } else {
      const response = await territoriesApi.create(territoryData);
      if (response.success) {
        await loadTerritories();
        setShowModal(false);
      }
    }
  };

  const handleTerritoryClick = (territory) => {
    setSelectedTerritory(territory);
    // Center map on territory location
    setMapCenter([territory.centerLat, territory.centerLng]);
    setMapZoom(12);
    
    // Open popup after a short delay to ensure map has updated
    setTimeout(() => {
      const markerRef = markerRefs.current[territory.id];
      if (markerRef && markerRef.openPopup) {
        markerRef.openPopup();
      }
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Territory Management</h1>
        {isAdmin && (
          <button
            onClick={handleAdd}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Territory
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Territory List */}
        <div className="lg:col-span-1">
          <Card title="Territories">
            <div className="space-y-3">
              {territories.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No territories found</p>
              ) : (
                territories.map(territory => (
                  <div
                    key={territory.id}
                    onClick={(e) => {
                      // Don't trigger if clicking on buttons
                      if (!e.target.closest('button')) {
                        handleTerritoryClick(territory);
                      }
                    }}
                    className={`p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all ${
                      selectedTerritory?.id === territory.id ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{territory.name}</h4>
                        <p className="text-sm text-gray-600">{territory.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: territory.color }}
                        />
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(territory);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit territory"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(territory);
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete territory"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                      <Users className="w-4 h-4" />
                      <span>{territory.assignedUsers.length} salesperson(s)</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Territory Stats */}
          <Card title="Coverage Stats" className="mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Territories</span>
                <span className="text-lg font-bold text-primary-600">{territories.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Salespeople</span>
                <span className="text-lg font-bold text-green-600">
                  {new Set(territories.flatMap(t => t.assignedUsers)).size}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Coverage</span>
                <span className="text-lg font-bold text-blue-600">95%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Map View */}
        <div className="lg:col-span-2">
          <Card title="Territory Map" className="h-[700px]">
            <div className="h-full">
              <Map
                center={mapCenter}
                zoom={mapZoom}
                markers={territories.map(t => ({
                  id: t.id,
                  lat: t.centerLat || t.coordinates?.[0]?.[0] || 23.8103,
                  lng: t.centerLng || t.coordinates?.[0]?.[1] || 90.4125,
                  popup: {
                    title: t.name,
                    description: t.description,
                    salespersons: `${t.assignedUsers.length} salesperson(s)`,
                    area: t.area,
                    customers: t.customers ? `${t.customers} customers` : null,
                  },
                }))}
                markerRefs={markerRefs}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <TerritoryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTerritory(null);
        }}
        onSave={handleSave}
        editingTerritory={editingTerritory}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTerritory(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Territory"
        message={`Are you sure you want to delete "${deleteTerritory?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}

export default Territory;
