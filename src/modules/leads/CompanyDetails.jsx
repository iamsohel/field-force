import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Building2, CheckCircle, XCircle } from 'lucide-react';
import { companiesApi } from '@services/api';
import Card from '@components/common/Card';
import Map from '@components/common/Map';

function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompany();
  }, [id]);

  const loadCompany = async () => {
    setLoading(true);
    const response = await companiesApi.getById(id);
    if (response.success) {
      setCompany(response.data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-red-500">Company not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/leads')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to Leads"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Company Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-start gap-4">
              <img
                src={company.logo}
                alt={company.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=3B82F6&color=fff`;
                }}
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{company.name}</h2>
                <div className="flex items-center gap-2 mb-4">
                  {company.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      <XCircle className="w-3 h-3" />
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Contact Information">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-sm text-gray-900">{company.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{company.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Location Coordinates</p>
                  <p className="text-sm text-gray-900">
                    Latitude: {company.lat?.toFixed(6)}, Longitude: {company.lng?.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Map */}
        <div className="lg:col-span-1">
          <Card title="Location Map" className="h-[400px]">
            <div className="h-full" style={{ isolation: 'isolate' }}>
              <Map
                center={[company.lat || 23.8103, company.lng || 90.4125]}
                zoom={15}
                markers={[
                  {
                    lat: company.lat || 23.8103,
                    lng: company.lng || 90.4125,
                    popup: {
                      title: company.name,
                      description: company.address,
                    },
                  },
                ]}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetails;
