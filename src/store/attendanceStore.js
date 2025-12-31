import { create } from 'zustand';
import { attendanceApi } from '@services/api';

export const useAttendanceStore = create((set, get) => ({
  todayAttendance: null,
  attendanceHistory: [],
  isLoading: false,
  error: null,

  fetchTodayAttendance: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await attendanceApi.getTodayAttendance(userId);
      if (response.success) {
        set({ todayAttendance: response.data, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  checkIn: async (userId, location) => {
    set({ isLoading: true, error: null });
    try {
      const response = await attendanceApi.checkIn(userId, location);
      if (response.success) {
        set({ todayAttendance: response.data, isLoading: false });
        return true;
      }
      return false;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  checkOut: async (userId, location) => {
    set({ isLoading: true, error: null });
    try {
      const response = await attendanceApi.checkOut(userId, location);
      if (response.success) {
        set({
          todayAttendance: { ...get().todayAttendance, ...response.data },
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  fetchAttendanceHistory: async (userId, startDate, endDate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await attendanceApi.getByUserId(userId, startDate, endDate);
      if (response.success) {
        set({ attendanceHistory: response.data, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
