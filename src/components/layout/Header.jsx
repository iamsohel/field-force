import { useState, useEffect } from 'react';
import { Menu, Bell, Search, MapPin, X } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { useUIStore } from '@store/uiStore';
import { useLocationStore } from '@store/locationStore';
import { formatTime } from '@utils/helpers';

function Header() {
  const { user } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const { currentLocation } = useLocationStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-3 sm:px-4 lg:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
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

          {/* Center Section - Search (Desktop) */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle search"
            >
              {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            {/* Current Time - Hidden on small mobile */}
            <div className="hidden sm:block text-xs lg:text-sm text-gray-600 whitespace-nowrap">
              {formatTime(currentTime)}
            </div>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Avatar - Simplified on mobile */}
            <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
              <img
                src={user?.avatar || 'https://i.pravatar.cc/150?img=1'}
                alt={user?.name}
                className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-gray-200"
              />
              <div className="hidden lg:block">
                <p className="text-sm font-medium truncate max-w-[120px]">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="md:hidden mt-3 pb-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Location Info */}
        <div className="sm:hidden mt-2 flex items-center gap-2 text-gray-600">
          <MapPin className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
          <span className="text-xs truncate">
            {currentLocation
              ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
              : 'Location unavailable'}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
