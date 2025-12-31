import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  ShoppingCart,
  Wallet,
  Navigation,
} from 'lucide-react';
import { usersApi, tasksApi, visitsApi, ordersApi, expensesApi, locationApi } from '@services/api';
import { formatCurrency, formatDistance, formatTime } from '@utils/helpers';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import StatCard from '@components/common/StatCard';
import L from 'leaflet';

function TeamMemberProfile() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [visits, setVisits] = useState([]);
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemberData();
  }, [memberId]);

  const loadMemberData = async () => {
    setLoading(true);

    // Load member details
    const memberResponse = await usersApi.getById(memberId);
    if (memberResponse.success) {
      setMember(memberResponse.data);
    }

    // Load member's tasks
    const tasksResponse = await tasksApi.getByUserId(memberId);
    if (tasksResponse.success) {
      setTasks(tasksResponse.data);
    }

    // Load member's visits
    const visitsResponse = await visitsApi.getByUserId(memberId);
    if (visitsResponse.success) {
      setVisits(visitsResponse.data);
    }

    // Load member's orders
    const ordersResponse = await ordersApi.getByUserId(memberId);
    if (ordersResponse.success) {
      setOrders(ordersResponse.data);
    }

    // Load member's expenses
    const expensesResponse = await expensesApi.getByUserId(memberId);
    if (expensesResponse.success) {
      setExpenses(expensesResponse.data);
    }

    // Load current location
    const locationResponse = await locationApi.getCurrentLocation(memberId);
    if (locationResponse.success && locationResponse.data) {
      setCurrentLocation(locationResponse.data);
    }

    setLoading(false);
  };

  if (loading || !member) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading member profile...</p>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Member Info Card */}
      <Card>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-24 h-24 rounded-full border-4 border-primary-100"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
                <p className="text-gray-600 capitalize mt-1">{member.role}</p>
              </div>
              <Badge status={member.status === 'active' ? 'active' : 'inactive'}>
                {member.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+91-{member.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{member.territory}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CheckCircle}
          title="Tasks Completed"
          value={`${completedTasks}/${tasks.length}`}
          color="primary"
        />
        <StatCard
          icon={MapPin}
          title="Visits"
          value={visits.length}
          color="info"
        />
        <StatCard
          icon={ShoppingCart}
          title="Total Sales"
          value={formatCurrency(totalSales)}
          color="success"
        />
        <StatCard
          icon={Wallet}
          title="Expenses"
          value={formatCurrency(totalExpenses)}
          color="warning"
        />
      </div>

      {/* Current Location Map */}
      {currentLocation && currentLocation.location && (
        <Card title="Current Location" subtitle="Real-time GPS location">
          <div className="h-[400px] -mx-6 -mb-6">
            <MapContainer
              center={[currentLocation.location.lat, currentLocation.location.lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[currentLocation.location.lat, currentLocation.location.lng]}
              />
            </MapContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Last Update</p>
              <p className="font-medium">{formatTime(currentLocation.timestamp)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Activity</p>
              <p className="font-medium">{currentLocation.activity || 'No activity'}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Tasks */}
      <Card title="Recent Tasks" subtitle={`${tasks.length} total tasks`}>
        <div className="space-y-3">
          {tasks.slice(0, 5).map(task => (
            <div key={task.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{task.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge status={
                    task.status === 'completed' ? 'active' :
                    task.status === 'in-progress' ? 'warning' : 'inactive'
                  }>
                    {task.status}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Priority: {task.priority}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-center text-gray-500 py-4">No tasks found</p>
          )}
        </div>
      </Card>

      {/* Recent Visits */}
      <Card title="Recent Visits" subtitle={`${visits.length} total visits`}>
        <div className="space-y-3">
          {visits.slice(0, 5).map(visit => (
            <div key={visit.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{visit.purpose}</h4>
                <p className="text-sm text-gray-600 mt-1">{visit.feedback}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-500">
                    Duration: {visit.duration} mins
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(visit.checkIn)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {visits.length === 0 && (
            <p className="text-center text-gray-500 py-4">No visits found</p>
          )}
        </div>
      </Card>

      {/* Recent Orders */}
      <Card title="Recent Orders" subtitle={`${orders.length} total orders`}>
        <div className="space-y-3">
          {orders.slice(0, 5).map(order => (
            <div key={order.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{order.orderId}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {order.items.length} items • {formatCurrency(order.total)}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge status={
                    order.status === 'delivered' ? 'active' :
                    order.status === 'confirmed' ? 'success' : 'warning'
                  }>
                    {order.status}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatTime(order.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-center text-gray-500 py-4">No orders found</p>
          )}
        </div>
      </Card>
    </div>
  );
}

export default TeamMemberProfile;
