import { useState, useEffect, useRef } from 'react';
import { Bell, MapPin, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { useUIStore } from '@store/uiStore';
import { useLocationStore } from '@store/locationStore';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '@utils/helpers';
import HamburgerIcon from '@components/common/HamburgerIcon';

function Header() {
  const { user, logout } = useAuthStore();
  const { toggleSidebar, toggleSidebarCollapse, sidebarCollapsed } = useUIStore();
  const { currentLocation } = useLocationStore();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleSidebarToggle = () => {
    // On mobile, toggle sidebar open/close
    // On desktop, toggle sidebar collapse
    if (window.innerWidth < 1024) {
      toggleSidebar();
    } else {
      toggleSidebarCollapse();
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-3 sm:px-4 lg:px-6 py-3 flex items-center h-[72px]">
        <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
          {/* Left Section */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <button
              onClick={handleSidebarToggle}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              <HamburgerIcon className="w-5 h-5 text-gray-700" />
            </button>

            {/* Location - Hidden on small mobile */}
            <div className="hidden sm:flex items-center gap-2 text-gray-600 min-w-0">
              <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0" />
              <span className="text-xs lg:text-sm truncate">
                {currentLocation
                  ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
                  : 'Location unavailable'}
              </span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
            {/* Current Time - Hidden on small mobile */}
            <div className="hidden sm:block text-xs lg:text-sm text-gray-600 whitespace-nowrap">
              {formatTime(currentTime)}
            </div>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Avatar with Dropdown */}
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 lg:gap-3 hover:bg-gray-50 rounded-lg p-1 transition-colors"
              >
                <img
                  src={user?.avatar || 'https://i.pravatar.cc/150?img=1'}
                  alt={user?.name}
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-gray-200"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium truncate max-w-[120px]">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <ChevronDown className={`hidden lg:block w-4 h-4 text-gray-500 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Location Info */}
      <div className="sm:hidden px-3 sm:px-4 lg:px-6 pb-2 flex items-center gap-2 text-gray-600">
        <MapPin className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
        <span className="text-xs truncate">
          {currentLocation
            ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
            : 'Location unavailable'}
        </span>
      </div>
    </header>
  );
}

export default Header;
