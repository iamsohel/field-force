import { tasksApi } from '@services/api';
import { create } from 'zustand';

export const useTasksStore = create((set, get) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,

  fetchTasks: async (userId, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksApi.getByUserId(userId, filters);
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

  updateTaskStatus: async (taskId, status, optimistic = false) => {
    const currentTasks = get().tasks;
    const task = currentTasks.find(t => t.id === taskId);
    
    if (!task) return false;

    // Optimistic update - update UI immediately
    const updatedTask = {
      ...task,
      status,
      completedAt: status === 'completed' && !task.completedAt ? new Date().toISOString() : (status !== 'completed' ? null : task.completedAt),
    };

    if (optimistic) {
      set({
        tasks: currentTasks.map(t => (t.id === taskId ? updatedTask : t)),
      });
    } else {
      set({ isLoading: true, error: null });
    }

    try {
      const response = await tasksApi.updateStatus(taskId, status);
      if (response.success) {
        set({
          tasks: get().tasks.map(t => (t.id === taskId ? response.data : t)),
          isLoading: false,
        });
        return true;
      }
      // If API call fails and we did optimistic update, revert
      if (optimistic) {
        set({ tasks: currentTasks });
      }
      return false;
    } catch (error) {
      // Revert optimistic update on error
      if (optimistic) {
        set({ tasks: currentTasks });
      }
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  getTodoTasks: () => {
    return get().tasks.filter(t => t.status === 'todo');
  },

  getCompletedTasks: () => {
    return get().tasks.filter(t => t.status === 'completed');
  },

  getInProgressTasks: () => {
    return get().tasks.filter(t => t.status === 'in-progress');
  },

  updateTask: async (taskId, taskData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksApi.update(taskId, taskData);
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

  deleteTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksApi.delete(taskId);
      if (response.success) {
        set({
          tasks: get().tasks.filter(t => t.id !== taskId),
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
}));
