// API service layer - returns mock data for now, can be replaced with real API calls

import * as mockData from './mockData';

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication API
export const authApi = {
  login: async (email, password) => {
    await delay(800);
    const user = mockData.users.find(u => u.email === email);
    if (user && password) {
      return {
        success: true,
        data: {
          user,
          token: 'mock_jwt_token_' + user.id,
        },
      };
    }
    return { success: false, error: 'Invalid credentials' };
  },

  verifyOTP: async (phone, otp) => {
    await delay(500);
    if (otp === '123456') {
      const user = mockData.users.find(u => u.phone === phone);
      return {
        success: true,
        data: { user, token: 'mock_jwt_token_' + user.id },
      };
    }
    return { success: false, error: 'Invalid OTP' };
  },

  logout: async () => {
    await delay(300);
    return { success: true };
  },

  getCurrentUser: async () => {
    await delay(300);
    return { success: true, data: mockData.users[0] };
  },
};

// Users API
export const usersApi = {
  getAll: async () => {
    await delay();
    return { success: true, data: mockData.users };
  },

  getById: async (id) => {
    await delay();
    const user = mockData.users.find(u => u.id === id);
    return { success: true, data: user };
  },

  getTeamMembers: async (managerId) => {
    await delay();
    const teamMembers = mockData.users.filter(u => u.manager === managerId);
    return { success: true, data: teamMembers };
  },

  update: async (id, data) => {
    await delay();
    return { success: true, data: { ...mockData.users.find(u => u.id === id), ...data } };
  },
};

// Attendance API
export const attendanceApi = {
  checkIn: async (userId, location) => {
    await delay();
    const record = {
      id: 'a' + Date.now(),
      userId,
      date: new Date().toISOString().split('T')[0],
      checkIn: new Date().toISOString(),
      checkInLocation: location,
      mode: 'field',
      status: 'present',
    };
    return { success: true, data: record };
  },

  checkOut: async (userId, location) => {
    await delay();
    return {
      success: true,
      data: {
        checkOut: new Date().toISOString(),
        checkOutLocation: location,
      },
    };
  },

  getByUserId: async (userId, startDate, endDate) => {
    await delay();
    const records = mockData.attendanceRecords.filter(r => r.userId === userId);
    return { success: true, data: records };
  },

  getTodayAttendance: async (userId) => {
    await delay();
    const today = new Date().toISOString().split('T')[0];
    const record = mockData.attendanceRecords.find(
      r => r.userId === userId && r.date === today
    );
    return { success: true, data: record };
  },
};

// Tasks API
export const tasksApi = {
  getByUserId: async (userId) => {
    await delay();
    const user = mockData.users.find(u => u.id === userId);
    // For admin, return all tasks
    if (user?.role === 'admin') {
      return { success: true, data: mockData.tasks };
    }
    const userTasks = mockData.tasks.filter(t => t.userId === userId);
    return { success: true, data: userTasks };
  },

  getById: async (id) => {
    await delay();
    const task = mockData.tasks.find(t => t.id === id);
    return { success: true, data: task };
  },

  create: async (taskData) => {
    await delay();
    const newTask = {
      id: 't' + Date.now(),
      ...taskData,
    };
    return { success: true, data: newTask };
  },

  update: async (id, data) => {
    await delay();
    return { success: true, data: { ...mockData.tasks.find(t => t.id === id), ...data } };
  },

  updateStatus: async (id, status) => {
    await delay();
    return { success: true, data: { ...mockData.tasks.find(t => t.id === id), status } };
  },
};

// Visits API
export const visitsApi = {
  startVisit: async (visitData) => {
    await delay();
    const newVisit = {
      id: 'v' + Date.now(),
      checkIn: new Date().toISOString(),
      status: 'in-progress',
      ...visitData,
    };
    return { success: true, data: newVisit };
  },

  endVisit: async (id, data) => {
    await delay();
    return {
      success: true,
      data: {
        ...mockData.visits.find(v => v.id === id),
        checkOut: new Date().toISOString(),
        status: 'completed',
        ...data,
      },
    };
  },

  getByUserId: async (userId, startDate, endDate) => {
    await delay();
    const user = mockData.users.find(u => u.id === userId);
    // For admin, return all visits
    if (user?.role === 'admin') {
      return { success: true, data: mockData.visits };
    }
    const userVisits = mockData.visits.filter(v => v.userId === userId);
    return { success: true, data: userVisits };
  },
};

// Customers API
export const customersApi = {
  getAll: async () => {
    await delay();
    return { success: true, data: mockData.customers };
  },

  getByUserId: async (userId) => {
    await delay();
    const userCustomers = mockData.customers.filter(c => c.assignedTo === userId);
    return { success: true, data: userCustomers };
  },

  getById: async (id) => {
    await delay();
    const customer = mockData.customers.find(c => c.id === id);
    return { success: true, data: customer };
  },

  create: async (customerData) => {
    await delay();
    const newCustomer = {
      id: 'c' + Date.now(),
      ...customerData,
    };
    return { success: true, data: newCustomer };
  },
};

// Leads API
export const leadsApi = {
  getAll: async () => {
    await delay();
    return { success: true, data: mockData.leads };
  },

  getByUserId: async (userId) => {
    await delay();
    const userLeads = mockData.leads.filter(l => l.assignedTo === userId);
    return { success: true, data: userLeads };
  },

  create: async (leadData) => {
    await delay();
    const newLead = {
      id: 'l' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'new',
      ...leadData,
    };
    return { success: true, data: newLead };
  },

  updateStatus: async (id, status) => {
    await delay();
    return { success: true, data: { ...mockData.leads.find(l => l.id === id), status } };
  },
};

// Orders API
export const ordersApi = {
  getAll: async () => {
    await delay();
    return { success: true, data: mockData.orders };
  },

  getByUserId: async (userId) => {
    await delay();
    const user = mockData.users.find(u => u.id === userId);
    // For admin, return all orders
    if (user?.role === 'admin') {
      return { success: true, data: mockData.orders };
    }
    const userOrders = mockData.orders.filter(o => o.userId === userId);
    return { success: true, data: userOrders };
  },

  create: async (orderData) => {
    await delay();
    const newOrder = {
      id: 'o' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...orderData,
    };
    return { success: true, data: newOrder };
  },
};

// Products API
export const productsApi = {
  getAll: async () => {
    await delay();
    return { success: true, data: mockData.products };
  },

  getById: async (id) => {
    await delay();
    const product = mockData.products.find(p => p.id === id);
    return { success: true, data: product };
  },
};

// Expenses API
export const expensesApi = {
  getByUserId: async (userId) => {
    await delay();
    const user = mockData.users.find(u => u.id === userId);
    // For admin, return all expenses
    if (user?.role === 'admin') {
      return { success: true, data: mockData.expenses };
    }
    const userExpenses = mockData.expenses.filter(e => e.userId === userId);
    return { success: true, data: userExpenses };
  },

  create: async (expenseData) => {
    await delay();
    const newExpense = {
      id: 'e' + Date.now(),
      status: 'pending',
      ...expenseData,
    };
    return { success: true, data: newExpense };
  },

  updateStatus: async (id, status, approvedBy) => {
    await delay();
    return {
      success: true,
      data: { ...mockData.expenses.find(e => e.id === id), status, approvedBy },
    };
  },
};

// Territories API
export const territoriesApi = {
  getAll: async () => {
    await delay();
    return { success: true, data: mockData.territories };
  },

  getByUserId: async (userId) => {
    await delay();
    const userTerritories = mockData.territories.filter(t =>
      t.assignedUsers.includes(userId)
    );
    return { success: true, data: userTerritories };
  },
};

// Notifications API
export const notificationsApi = {
  getByUserId: async (userId) => {
    await delay();
    const userNotifications = mockData.notifications.filter(n => n.userId === userId);
    return { success: true, data: userNotifications };
  },

  markAsRead: async (id) => {
    await delay();
    return { success: true };
  },
};

// Location API
export const locationApi = {
  trackLocation: async (userId, location) => {
    await delay(100);
    return { success: true, data: { userId, location, timestamp: new Date().toISOString() } };
  },

  getLocationHistory: async (userId, startDate, endDate) => {
    await delay();
    const history = mockData.locationHistory.filter(l => l.userId === userId);
    return { success: true, data: history };
  },

  getCurrentLocation: async (userId) => {
    await delay();
    const latest = mockData.locationHistory
      .filter(l => l.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    return { success: true, data: latest };
  },
};

// Activity Timeline API
export const activityApi = {
  getByUserId: async (userId) => {
    await delay();
    // For admin (userId = '4'), return all activities
    const user = mockData.users.find(u => u.id === userId);
    if (user?.role === 'admin') {
      return { success: true, data: mockData.activityTimeline };
    }
    // For other users, return only their activities
    const activities = mockData.activityTimeline.filter(a => a.userId === userId);
    return { success: true, data: activities };
  },

  getAll: async () => {
    await delay();
    return { success: true, data: mockData.activityTimeline };
  },
};

// Performance Metrics API
export const metricsApi = {
  getByUserId: async (userId, period = 'monthly') => {
    await delay();
    return { success: true, data: mockData.performanceMetrics[userId] };
  },

  getTeamMetrics: async (managerId) => {
    await delay();
    return { success: true, data: Object.values(mockData.performanceMetrics) };
  },
};

// Routes API
export const routesApi = {
  getByUserId: async (userId, date) => {
    await delay();
    const userRoutes = mockData.routes.filter(r => r.userId === userId);
    return { success: true, data: userRoutes };
  },

  createPlannedRoute: async (routeData) => {
    await delay();
    const newRoute = {
      id: 'r' + Date.now(),
      ...routeData,
    };
    return { success: true, data: newRoute };
  },
};
