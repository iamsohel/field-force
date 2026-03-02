import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  ClipboardCheck,
  ListTodo,
  MapPin,
  ShoppingCart,
  BarChart3,
  Wallet,
  Map,
  Calendar,
  X,
  UserPlus,
} from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { useUIStore } from '@store/uiStore';

function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, toggleSidebarCollapse } = useUIStore();

  const navItems = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/',
      roles: ['salesperson', 'manager', 'admin'],
    },
    {
      name: 'Team',
      icon: Users,
      path: '/team',
      roles: ['manager', 'admin'],
    },
    {
      name: 'Attendance',
      icon: ClipboardCheck,
      path: '/attendance',
      roles: ['salesperson', 'manager', 'admin'],
    },
    {
      name: 'Tasks',
      icon: ListTodo,
      path: '/tasks',
      roles: ['salesperson', 'manager', 'admin'],
    },
    {
      name: 'Visits',
      icon: MapPin,
      path: '/visits',
      roles: ['salesperson', 'manager', 'admin'],
    },
    {
      name: 'Sales',
      icon: ShoppingCart,
      path: '/sales',
      roles: ['salesperson', 'manager', 'admin'],
    },
    {
      name: 'Reports',
      icon: BarChart3,
      path: '/reports',
      roles: ['salesperson', 'manager', 'admin'],
    },
    {
      name: 'Expenses',
      icon: Wallet,
      path: '/expenses',
      roles: ['salesperson', 'manager', 'admin'],
    },
    {
      name: 'Territory',
      icon: Map,
      path: '/territory',
      roles: ['manager', 'admin'],
    },
    {
      name: 'Leave',
      icon: Calendar,
      path: '/leave',
      roles: ['salesperson', 'manager', 'admin'],
    },
    {
      name: 'Leads',
      icon: UserPlus,
      path: '/leads',
      roles: ['salesperson', 'manager', 'admin'],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static left-0 z-50
        bg-gray-900 flex flex-col
        transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'lg:w-20' : 'w-64'}
        lg:top-0 lg:bottom-0 lg:h-screen
        top-0 bottom-0 h-screen
      `}>
        {/* Logo */}
        <div className="px-3 sm:px-4 lg:px-6 py-3 border-b border-gray-800 flex items-center justify-between h-[72px]">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="lg:block">
                <h1 className="text-white font-bold text-base lg:text-lg">Field Force</h1>
                <p className="text-gray-400 text-xs">Tracking System</p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-4 overflow-y-auto">
          <div className="space-y-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 1024) {
                    toggleSidebar();
                  }
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-colors text-sm lg:text-base ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  } ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}`
                }
                title={sidebarCollapsed ? item.name : ''}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}

export default Sidebar;
