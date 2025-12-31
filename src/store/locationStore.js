import { create } from 'zustand';
import { locationApi } from '@services/api';

export const useLocationStore = create((set, get) => ({
  currentLocation: null,
  locationHistory: [],
  isTracking: false,
  error: null,

  setCurrentLocation: (location) => {
    set({ currentLocation: location });
  },

  startTracking: async (userId) => {
    set({ isTracking: true });

    // Get current position
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          set({ currentLocation: location });

          // Track location on server
          await locationApi.trackLocation(userId, location);
        },
        (error) => {
          set({ error: error.message, isTracking: false });
        },
        {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 27000,
        }
      );
    }
  },

  stopTracking: () => {
    set({ isTracking: false });
  },

  fetchLocationHistory: async (userId, startDate, endDate) => {
    try {
      const response = await locationApi.getLocationHistory(userId, startDate, endDate);
      if (response.success) {
        set({ locationHistory: response.data });
      }
    } catch (error) {
      set({ error: error.message });
    }
  },
}));
