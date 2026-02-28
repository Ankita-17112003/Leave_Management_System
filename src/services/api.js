import axios from 'axios';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if exists
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.id) {
      // We'll use user id for authorization simulation
      config.headers['X-User-Id'] = user.id;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  // Login user
  login: async (email, password) => {
    try {
      // Find user by email
      const response = await api.get(`/users?email=${email}`);
      const users = response.data;
      
      if (users.length === 0) {
        throw new Error('User not found. Please contact admin.');
      }
      
      const user = users[0];
      
      // Check password (in real app, this would be hashed)
      if (user.password !== password) {
        throw new Error('Invalid password');
      }
      
      // Remove password before storing in localStorage
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return localStorage.getItem('user') !== null;
  },

  // Check user role
  hasRole: (role) => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role === role;
  },
};

// User Services
export const userService = {
  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      // Remove passwords from response
      return response.data.map(({ password, ...user }) => user);
    } catch (error) {
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      const { password, ...userWithoutPassword } = response.data;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  },

  // Get users by department
  getUsersByDepartment: async (department) => {
    try {
      const response = await api.get(`/users?department=${department}`);
      return response.data.map(({ password, ...user }) => user);
    } catch (error) {
      throw error;
    }
  },

  // Add new employee (admin only)
  addEmployee: async (userData) => {
    try {
      // Check if email already exists
      const checkEmail = await api.get(`/users?email=${userData.email}`);
      if (checkEmail.data.length > 0) {
        throw new Error('Email already exists');
      }

      // Set default leave balance for new employee
      const newUser = {
        ...userData,
        role: 'employee',
        joinDate: new Date().toISOString().split('T')[0],
        leaveBalance: {
          sickLeave: 12,
          casualLeave: 10,
          earnedLeave: 15
        }
      };

      const response = await api.post('/users', newUser);
      const { password, ...userWithoutPassword } = response.data;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await api.patch(`/users/${id}`, userData);
      const { password, ...userWithoutPassword } = response.data;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  },

  // Delete user (admin only)
  deleteUser: async (id) => {
    try {
      await api.delete(`/users/${id}`);
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Get all departments
  getDepartments: async () => {
    try {
      const response = await api.get('/departments');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get employee leave balance
  getLeaveBalance: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data.leaveBalance;
    } catch (error) {
      throw error;
    }
  },

  // Update leave balance (when leave is approved/rejected)
  updateLeaveBalance: async (userId, leaveType, days, action) => {
    try {
      const user = await api.get(`/users/${userId}`);
      const currentBalance = user.data.leaveBalance;
      
      let updatedBalance;
      if (action === 'approve') {
        // Deduct leaves when approved
        updatedBalance = {
          ...currentBalance,
          [leaveType]: currentBalance[leaveType] - days
        };
      } else if (action === 'reject' || action === 'cancel') {
        // Add back leaves when rejected/cancelled
        updatedBalance = {
          ...currentBalance,
          [leaveType]: currentBalance[leaveType] + days
        };
      } else {
        updatedBalance = currentBalance;
      }

      const response = await api.patch(`/users/${userId}`, {
        leaveBalance: updatedBalance
      });
      return response.data.leaveBalance;
    } catch (error) {
      throw error;
    }
  },
};

// Leave Services
export const leaveService = {
  // Get all leave applications
  getAllLeaves: async () => {
    try {
      const response = await api.get('/leaves?_sort=appliedDate&_order=desc');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get leaves by user ID
  getLeavesByUser: async (userId) => {
    try {
      const response = await api.get(`/leaves?userId=${userId}&_sort=appliedDate&_order=desc`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get leaves by department
  getLeavesByDepartment: async (department) => {
    try {
      const response = await api.get(`/leaves?department=${department}&_sort=appliedDate&_order=desc`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get leaves by status
  getLeavesByStatus: async (status) => {
    try {
      const response = await api.get(`/leaves?status=${status}&_sort=appliedDate&_order=desc`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Apply for leave
  applyLeave: async (leaveData) => {
    try {
      // Calculate number of days
      const fromDate = new Date(leaveData.fromDate);
      const toDate = new Date(leaveData.toDate);
      const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

      // Get user's current leave balance
      const user = await api.get(`/users/${leaveData.userId}`);
      const balance = user.data.leaveBalance;

      // Check if sufficient leave balance
      if (balance[leaveData.leaveType] < days) {
        throw new Error(`Insufficient ${leaveData.leaveType} balance`);
      }

      // Create leave application
      const newLeave = {
        ...leaveData,
        status: 'pending',
        appliedDate: new Date().toISOString().split('T')[0],
        days: days
      };

      const response = await api.post('/leaves', newLeave);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update leave status (approve/reject)
  updateLeaveStatus: async (leaveId, status, userId, leaveType, days) => {
    try {
      // Update leave status
      const response = await api.patch(`/leaves/${leaveId}`, { status });
      
      // Update user's leave balance
      if (status === 'approved') {
        await userService.updateLeaveBalance(userId, leaveType, days, 'approve');
      } else if (status === 'rejected') {
        await userService.updateLeaveBalance(userId, leaveType, days, 'reject');
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cancel leave application (employee only for pending leaves)
  cancelLeave: async (leaveId, userId, leaveType, days) => {
    try {
      const response = await api.patch(`/leaves/${leaveId}`, { status: 'cancelled' });
      await userService.updateLeaveBalance(userId, leaveType, days, 'cancel');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get leave statistics
  getLeaveStatistics: async () => {
    try {
      const leaves = await api.get('/leaves');
      const data = leaves.data;
      
      const statistics = {
        total: data.length,
        pending: data.filter(l => l.status === 'pending').length,
        approved: data.filter(l => l.status === 'approved').length,
        rejected: data.filter(l => l.status === 'rejected').length,
        byDepartment: {},
        byType: {
          sickLeave: data.filter(l => l.leaveType === 'sickLeave').length,
          casualLeave: data.filter(l => l.leaveType === 'casualLeave').length,
          earnedLeave: data.filter(l => l.leaveType === 'earnedLeave').length
        }
      };

      // Group by department
      data.forEach(leave => {
        if (!statistics.byDepartment[leave.department]) {
          statistics.byDepartment[leave.department] = {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0
          };
        }
        statistics.byDepartment[leave.department].total++;
        statistics.byDepartment[leave.department][leave.status]++;
      });

      return statistics;
    } catch (error) {
      throw error;
    }
  },
};

export default api;