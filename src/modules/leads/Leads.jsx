import { useState } from 'react';
import CompaniesTab from './CompaniesTab';
import CustomersTab from './CustomersTab';

function Leads() {
  const [activeTab, setActiveTab] = useState('customers'); // 'customers' or 'companies'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          <button
            onClick={() => setActiveTab('customers')}
            className={`py-2.5 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'customers'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`py-2.5 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'companies'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Companies
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'customers' && <CustomersTab />}
        {activeTab === 'companies' && <CompaniesTab />}
      </div>
    </div>
  );
}

export default Leads;
