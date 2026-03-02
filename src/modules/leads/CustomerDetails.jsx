import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Building2 } from 'lucide-react';
import { leadsCustomersApi, companiesApi } from '@services/api';
import Card from '@components/common/Card';

function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    setLoading(true);
    const response = await leadsCustomersApi.getById(id);
    if (response.success) {
      setCustomer(response.data);
      if (response.data.companyId) {
        const companyRes = await companiesApi.getById(response.data.companyId);
        if (companyRes.success) {
          setCompany(companyRes.data);
        }
      }
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

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-red-500">Customer not found</div>
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
        <h1 className="text-2xl font-bold text-gray-900">Customer Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Customer Information">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{customer.name}</p>
            </div>
            {customer.companyName && (
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Company</p>
                  <p className="text-sm text-gray-900">{customer.companyName}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-sm text-gray-900">{customer.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-sm text-gray-900">{customer.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{customer.email}</p>
              </div>
            </div>
          </div>
        </Card>

        {company && (
          <Card title="Company Information">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=3B82F6&color=fff`;
                  }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Company Name</p>
                  <p className="text-sm font-semibold text-gray-900">{company.name}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-sm text-gray-900">{company.address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-sm text-gray-900">{company.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    company.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {company.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default CustomerDetails;
