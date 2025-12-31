import { create } from 'zustand';
import { tasksApi } from '@services/api';

export const useTasksStore = create((set, get) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,

  fetchTasks: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksApi.getByUserId(userId);
      if (response.success) {
        set({ tasks: response.data, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksApi.create(taskData);
      if (response.success) {
        set({ tasks: [...get().tasks, response.data], isLoading: false });
        return true;
      }
      return false;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  updateTaskStatus: async (taskId, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksApi.updateStatus(taskId, status);
      if (response.success) {
        set({
          tasks: get().tasks.map(t => (t.id === taskId ? response.data : t)),
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

  getPendingTasks: () => {
    return get().tasks.filter(t => t.status === 'pending');
  },

  getCompletedTasks: () => {
    return get().tasks.filter(t => t.status === 'completed');
  },

  getInProgressTasks: () => {
    return get().tasks.filter(t => t.status === 'in-progress');
  },
}));
