import { useEffect, useState } from 'react';
import { ShoppingCart, Plus, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { ordersApi, productsApi, leadsApi } from '@services/api';
import { formatCurrency, formatDateTime } from '@utils/helpers';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import StatCard from '@components/common/StatCard';

function Sales() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    const ordersResponse = await ordersApi.getByUserId(user.id);
    const productsResponse = await productsApi.getAll();
    const leadsResponse = await leadsApi.getByUserId(user.id);

    if (ordersResponse.success) setOrders(ordersResponse.data);
    if (productsResponse.success) setProducts(productsResponse.data);
    if (leadsResponse.success) setLeads(leadsResponse.data);
  };

  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Sales & Orders</h1>
        <button className="btn btn-primary">
          <Plus className="w-5 h-5 inline mr-2" />
          Create Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={ShoppingCart}
          title="Total Orders"
          value={orders.length}
          color="primary"
        />
        <StatCard
          icon={TrendingUp}
          title="Total Sales"
          value={formatCurrency(totalSales)}
          color="success"
        />
        <StatCard
          icon={TrendingUp}
          title="Active Leads"
          value={leads.filter(l => l.status === 'in-progress').length}
          color="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders */}
        <Card title="Recent Orders">
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">Order #{order.id}</h4>
                    <p className="text-sm text-gray-600">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <Badge status={order.status}>{order.status}</Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span>{order.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-primary-600">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Leads */}
        <Card title="Sales Pipeline">
          <div className="space-y-4">
            {leads.map(lead => (
              <div key={lead.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{lead.name}</h4>
                    <p className="text-sm text-gray-600">{lead.contactPerson}</p>
                  </div>
                  <Badge status={lead.status}>{lead.status}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(lead.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Products */}
      <Card title="Product Catalog">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900">{product.name}</h4>
              <p className="text-xs text-gray-500">{product.sku}</p>
              <p className="text-sm text-gray-600 mt-2">{product.description}</p>
              <div className="flex justify-between items-center mt-3">
                <span className="text-lg font-bold text-primary-600">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-sm text-gray-500">Stock: {product.stock}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default Sales;
