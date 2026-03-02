import { create } from 'zustand';
import { leaveApi } from '@services/api';

export const useLeaveStore = create((set, get) => ({
  publicHolidays: [],
  leaveApplications: [],
  leaveConfigurations: [],
  leaveBalance: null,
  isLoading: false,
  error: null,

  // Public Holidays
  fetchPublicHolidays: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await leaveApi.getPublicHolidays();
      if (response.success) {
        set({ publicHolidays: response.data, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createPublicHoliday: async (holidayData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await leaveApi.createPublicHoliday(holidayData);
      if (response.success) {
        set({
          publicHolidays: [...get().publicHolidays, response.data],
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

  updatePublicHoliday: async (id, holidayData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await leaveApi.updatePublicHoliday(id, holidayData);
      if (response.success) {
        set({
          publicHolidays: get().publicHolidays.map(h => (h.id === id ? response.data : h)),
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

  deletePublicHoliday: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await leaveApi.deletePublicHoliday(id);
      if (response.success) {
        set({
          publicHolidays: get().publicHolidays.filter(h => h.id !== id),
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

  // Leave Applications
  fetchLeaveApplications: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await leaveApi.getLeaveApplications(userId);
      if (response.success) {
        set({ leaveApplications: response.data, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createLeaveApplication: async (leaveData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await leaveApi.createLeaveApplication(leaveData);
      if (response.success) {
        set({
          leaveApplications: [...get().leaveApplications, response.data],
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

  updateLeaveStatus: async (id, status, approvedBy) => {
    set({ isLoading: true, error: null });
    try {
      const response = await leaveApi.updateLeaveStatus(id, status, approvedBy);
      if (response.success) {
        set({
          leaveApplications: get().leaveApplications.map(l =>
            l.id === id ? response.data : l
          ),
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

  cancelLeaveApplication: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await leaveApi.cancelLeaveApplication(id);
      if (response.success) {
        set({
          leaveApplications: get().leaveApplications.map(l =>
            l.id === id ? response.data : l
          ),
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

  // Leave Configurations
  fetchLeaveConfigurations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await leaveApi.getLeaveConfigurations();
      if (response.success) {
        set({ leaveConfigurations: response.data, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createLeaveConfiguration: async (configData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await leaveApi.createLeaveConfiguration(configData);
      if (response.success) {
        set({
          leaveConfigurations: [...get().leaveConfigurations, response.data],
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

  updateLeaveConfiguration: async (id, configData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await leaveApi.updateLeaveConfiguration(id, configData);
      if (response.success) {
        set({
          leaveConfigurations: get().leaveConfigurations.map(lc =>
            lc.id === id ? response.data : lc
          ),
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

  // Leave Balance
  fetchLeaveBalance: async (userId, year) => {
    set({ isLoading: true, error: null });
    try {
      const response = await leaveApi.getLeaveBalance(userId, year);
      if (response.success) {
        set({ leaveBalance: response.data, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
