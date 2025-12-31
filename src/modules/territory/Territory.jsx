import { useEffect, useState } from 'react';
import { Map as MapIcon, Users } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { territoriesApi } from '@services/api';
import Card from '@components/common/Card';
import Map from '@components/common/Map';

function Territory() {
  const { user } = useAuthStore();
  const [territories, setTerritories] = useState([]);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Territory Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Territory List */}
        <div className="lg:col-span-1">
          <Card title="Territories">
            <div className="space-y-3">
              {territories.map(territory => (
                <div
                  key={territory.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{territory.name}</h4>
                      <p className="text-sm text-gray-600">{territory.description}</p>
                    </div>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: territory.color }}
                    />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                    <Users className="w-4 h-4" />
                    <span>{territory.assignedUsers.length} salesperson(s)</span>
                  </div>
                </div>
              ))}
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
                center={[28.6139, 77.2090]}
                zoom={11}
                markers={territories.map(t => ({
                  lat: t.coordinates[0][0],
                  lng: t.coordinates[0][1],
                  popup: {
                    title: t.name,
                    description: t.description,
                  },
                }))}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Territory;
