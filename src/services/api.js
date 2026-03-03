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
    const user = mockData.users.find(u => u.id === managerId);
    // For admin, return all salespeople and managers
    if (user?.role === 'admin') {
      const teamMembers = mockData.users.filter(u => u.role === 'salesperson' || u.role === 'manager');
      return { success: true, data: teamMembers };
    }
    // For managers, return their direct reports
    const teamMembers = mockData.users.filter(u => u.manager === managerId);
    return { success: true, data: teamMembers };
  },

  update: async (id, data) => {
    await delay();
    return { success: true, data: { ...mockData.users.find(u => u.id === id), ...data } };
  },

  create: async (userData) => {
    await delay();
    const newUser = {
      id: (parseInt(mockData.users[mockData.users.length - 1]?.id || '0') + 1).toString(),
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      status: 'active',
      ...userData,
    };
    return { success: true, data: newUser };
  },

  delete: async (id) => {
    await delay();
    return { success: true, data: { id } };
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
    let records = mockData.attendanceRecords.filter(r => r.userId === userId);
    
    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate).toISOString().split('T')[0];
      const end = new Date(endDate).toISOString().split('T')[0];
      records = records.filter(r => r.date >= start && r.date <= end);
    }
    
    // Sort by date descending
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return { success: true, data: records };
  },

  getAll: async (startDate, endDate, userId = null) => {
    await delay();
    let records = [...mockData.attendanceRecords];
    
    // Filter by user if provided
    if (userId) {
      records = records.filter(r => r.userId === userId);
    }
    
    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate).toISOString().split('T')[0];
      const end = new Date(endDate).toISOString().split('T')[0];
      records = records.filter(r => r.date >= start && r.date <= end);
    }
    
    // Sort by date descending, then by userId
    records.sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      return a.userId.localeCompare(b.userId);
    });
    
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
  getByUserId: async (userId, filters = {}) => {
    await delay();
    const user = mockData.users.find(u => u.id === userId);
    let tasks = [];
    
    // For admin, return all tasks or filter by employee
    if (user?.role === 'admin') {
      tasks = [...mockData.tasks];
      if (filters.employeeId) {
        tasks = tasks.filter(t => t.userId === filters.employeeId);
      }
    } else {
      tasks = mockData.tasks.filter(t => t.userId === userId);
    }
    
    // Filter by status
    if (filters.status && filters.status !== 'all') {
      tasks = tasks.filter(t => t.status === filters.status);
    }
    
    // Filter by date range
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      
      tasks = tasks.filter(t => {
        const dueDate = new Date(t.dueDate);
        return dueDate >= start && dueDate <= end;
      });
    }
    
    // Sort by due date
    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    return { success: true, data: tasks };
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
    const task = mockData.tasks.find(t => t.id === id);
    if (!task) return { success: false, error: 'Task not found' };
    
    const updatedTask = { ...task, ...data };
    
    // Handle status change
    if (data.status && data.status !== task.status) {
      if (data.status === 'completed' && !updatedTask.completedAt) {
        updatedTask.completedAt = new Date().toISOString();
      }
      if (data.status !== 'completed') {
        updatedTask.completedAt = null;
      }
    }
    
    const index = mockData.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      mockData.tasks[index] = updatedTask;
    }
    
    return { success: true, data: updatedTask };
  },

  updateStatus: async (id, status) => {
    await delay();
    const task = mockData.tasks.find(t => t.id === id);
    if (!task) return { success: false, error: 'Task not found' };
    
    const updatedTask = { ...task, status };
    if (status === 'completed' && !task.completedAt) {
      updatedTask.completedAt = new Date().toISOString();
    }
    if (status !== 'completed') {
      updatedTask.completedAt = null;
    }
    
    const index = mockData.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      mockData.tasks[index] = updatedTask;
    }
    
    return { success: true, data: updatedTask };
  },

  delete: async (id) => {
    await delay();
    const index = mockData.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      mockData.tasks.splice(index, 1);
    }
    return { success: true, data: { id } };
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
    let visits = [];
    
    // For admin or 'all', return all visits
    if (user?.role === 'admin' || userId === 'all') {
      visits = [...mockData.visits];
    } else {
      visits = mockData.visits.filter(v => v.userId === userId);
    }
    
    // Add customer names to visits
    visits = visits.map(visit => {
      const customer = mockData.customers.find(c => c.id === visit.customerId);
      return {
        ...visit,
        customerName: customer?.name || 'Unknown Customer',
      };
    });
    
    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      visits = visits.filter(v => {
        if (!v.checkIn) return false;
        const checkInDate = new Date(v.checkIn);
        return checkInDate >= start && checkInDate <= end;
      });
    }
    
    return { success: true, data: visits };
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

  create: async (data) => {
    await delay();
    const newTerritory = {
      id: `ter${Date.now()}`,
      ...data,
      assignedUsers: data.assignedUsers || [],
      customers: data.customers || 0,
    };
    mockData.territories.push(newTerritory);
    return { success: true, data: newTerritory };
  },

  update: async (id, data) => {
    await delay();
    const index = mockData.territories.findIndex(t => t.id === id);
    if (index === -1) {
      return { success: false, error: 'Territory not found' };
    }
    mockData.territories[index] = { ...mockData.territories[index], ...data };
    return { success: true, data: mockData.territories[index] };
  },

  delete: async (id) => {
    await delay();
    const index = mockData.territories.findIndex(t => t.id === id);
    if (index === -1) {
      return { success: false, error: 'Territory not found' };
    }
    mockData.territories.splice(index, 1);
    return { success: true };
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

// Companies API
export const companiesApi = {
  getAll: async () => {
    await delay();
    return { success: true, data: mockData.companies };
  },

  getById: async (id) => {
    await delay();
    const company = mockData.companies.find(c => c.id === id);
    return { success: !!company, data: company };
  },

  create: async (data) => {
    await delay();
    const newCompany = {
      id: `comp${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    mockData.companies.push(newCompany);
    return { success: true, data: newCompany };
  },

  update: async (id, data) => {
    await delay();
    const index = mockData.companies.findIndex(c => c.id === id);
    if (index === -1) {
      return { success: false, error: 'Company not found' };
    }
    mockData.companies[index] = { ...mockData.companies[index], ...data };
    return { success: true, data: mockData.companies[index] };
  },

  delete: async (id) => {
    await delay();
    const index = mockData.companies.findIndex(c => c.id === id);
    if (index === -1) {
      return { success: false, error: 'Company not found' };
    }
    mockData.companies.splice(index, 1);
    return { success: true };
  },
};

// Leads Customers API
export const leadsCustomersApi = {
  getAll: async () => {
    await delay();
    return { success: true, data: mockData.leadsCustomers };
  },

  getById: async (id) => {
    await delay();
    const customer = mockData.leadsCustomers.find(c => c.id === id);
    return { success: !!customer, data: customer };
  },

  create: async (data) => {
    await delay();
    const company = data.companyId ? mockData.companies.find(c => c.id === data.companyId) : null;
    const newCustomer = {
      id: `lead${Date.now()}`,
      ...data,
      companyName: company?.name || null,
      createdAt: new Date().toISOString(),
    };
    mockData.leadsCustomers.push(newCustomer);
    return { success: true, data: newCustomer };
  },

  update: async (id, data) => {
    await delay();
    const index = mockData.leadsCustomers.findIndex(c => c.id === id);
    if (index === -1) {
      return { success: false, error: 'Customer not found' };
    }
    const company = data.companyId ? mockData.companies.find(c => c.id === data.companyId) : null;
    mockData.leadsCustomers[index] = {
      ...mockData.leadsCustomers[index],
      ...data,
      companyName: company?.name || null,
    };
    return { success: true, data: mockData.leadsCustomers[index] };
  },

  delete: async (id) => {
    await delay();
    const index = mockData.leadsCustomers.findIndex(c => c.id === id);
    if (index === -1) {
      return { success: false, error: 'Customer not found' };
    }
    mockData.leadsCustomers.splice(index, 1);
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
    let history = mockData.locationHistory.filter(l => l.userId === userId);
    
    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      history = history.filter(l => {
        const timestamp = new Date(l.timestamp);
        return timestamp >= start && timestamp <= end;
      });
    }
    
    // Sort by timestamp descending
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return { success: true, data: history };
  },

  getCurrentLocation: async (userId) => {
    await delay();
    const latest = mockData.locationHistory
      .filter(l => l.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    return { success: true, data: latest };
  },

  getAllLiveLocations: async () => {
    await delay();
    // Get latest location for each user (simulating live tracking)
    const userLocations = {};
    mockData.locationHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .forEach(loc => {
        if (!userLocations[loc.userId]) {
          const user = mockData.users.find(u => u.id === loc.userId);
          userLocations[loc.userId] = {
            userId: loc.userId,
            userName: user?.name || `User ${loc.userId}`,
            lat: loc.location.lat,
            lng: loc.location.lng,
            timestamp: loc.timestamp,
            status: 'active',
          };
        }
      });
    
    // Return only non-admin users
    return {
      success: true,
      data: Object.values(userLocations).filter(loc => {
        const user = mockData.users.find(u => u.id === loc.userId);
        return user && user.role !== 'admin';
      }),
    };
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

// Leave Management API
export const leaveApi = {
  // Public Holidays
  getPublicHolidays: async () => {
    await delay();
    return { success: true, data: mockData.publicHolidays };
  },

  createPublicHoliday: async (holidayData) => {
    await delay();
    const newHoliday = {
      id: 'ph' + Date.now(),
      ...holidayData,
    };
    return { success: true, data: newHoliday };
  },

  updatePublicHoliday: async (id, holidayData) => {
    await delay();
    return {
      success: true,
      data: { ...mockData.publicHolidays.find(h => h.id === id), ...holidayData },
    };
  },

  deletePublicHoliday: async (id) => {
    await delay();
    return { success: true, data: { id } };
  },

  // Leave Applications
  getLeaveApplications: async (userId) => {
    await delay();
    const user = mockData.users.find(u => u.id === userId);
    // For admin, return all leave applications
    if (user?.role === 'admin') {
      return { success: true, data: mockData.leaveApplications };
    }
    // For employees, return only their applications
    const userLeaves = mockData.leaveApplications.filter(l => l.userId === userId);
    return { success: true, data: userLeaves };
  },

  createLeaveApplication: async (leaveData) => {
    await delay();
    const newLeave = {
      id: 'la' + Date.now(),
      status: 'pending',
      appliedAt: new Date().toISOString(),
      ...leaveData,
    };
    return { success: true, data: newLeave };
  },

  updateLeaveStatus: async (id, status, approvedBy) => {
    await delay();
    const updateData = {
      status,
      ...(status === 'approved' && {
        approvedAt: new Date().toISOString(),
        approvedBy,
      }),
      ...(status === 'cancelled' && {
        cancelledAt: new Date().toISOString(),
      }),
    };
    return {
      success: true,
      data: { ...mockData.leaveApplications.find(l => l.id === id), ...updateData },
    };
  },

  cancelLeaveApplication: async (id) => {
    await delay();
    return {
      success: true,
      data: {
        ...mockData.leaveApplications.find(l => l.id === id),
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
      },
    };
  },

  // Leave Configuration
  getLeaveConfigurations: async () => {
    await delay();
    return { success: true, data: mockData.leaveConfigurations };
  },

  createLeaveConfiguration: async (configData) => {
    await delay();
    const newConfig = {
      id: 'lc' + Date.now(),
      ...configData,
    };
    return { success: true, data: newConfig };
  },

  updateLeaveConfiguration: async (id, configData) => {
    await delay();
    return {
      success: true,
      data: { ...mockData.leaveConfigurations.find(lc => lc.id === id), ...configData },
    };
  },

  // Leave Balance
  getLeaveBalance: async (userId, year) => {
    await delay();
    const user = mockData.users.find(u => u.id === userId);
    const designation = user?.role || 'salesperson';
    const config = mockData.leaveConfigurations.find(
      lc => lc.designation === designation && lc.year === year
    );

    // Calculate used leaves
    const userLeaves = mockData.leaveApplications.filter(
      l => l.userId === userId && l.status === 'approved'
    );
    const casualUsed = userLeaves
      .filter(l => l.leaveType === 'casual')
      .reduce((sum, l) => sum + l.days, 0);
    const sickUsed = userLeaves
      .filter(l => l.leaveType === 'sick')
      .reduce((sum, l) => sum + l.days, 0);

    return {
      success: true,
      data: {
        casualLeave: {
          total: config?.casualLeavePerYear || 12,
          used: casualUsed,
          remaining: (config?.casualLeavePerYear || 12) - casualUsed,
        },
        sickLeave: {
          total: config?.sickLeavePerYear || 10,
          used: sickUsed,
          remaining: (config?.sickLeavePerYear || 10) - sickUsed,
        },
      },
    };
  },
};