import axios from 'axios';

const API_URL = 'http://localhost:3000';

console.log('🔌 Connecting to JSON Server at:', API_URL);

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
  login: async (email, password) => {
    try {
      const response = await api.get(`/users?email=${email}`);
      const users = response.data;
      
      if (users.length === 0) {
        throw new Error('User not found. Please contact admin.');
      }
      
      const user = users[0];
      
      if (user.password !== password) {
        throw new Error('Invalid password');
      }
      
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return localStorage.getItem('user') !== null;
  },

  hasRole: (role) => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role === role;
  },
};

// User Services
export const userService = {
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data.map(({ password, ...user }) => user);
    } catch (error) {
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      const { password, ...userWithoutPassword } = response.data;
      
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.id === id) {
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      }
      
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  },

  getUsersByDepartment: async (department) => {
    try {
      const response = await api.get(`/users?department=${department}`);
      return response.data.map(({ password, ...user }) => user);
    } catch (error) {
      throw error;
    }
  },

  addEmployee: async (userData) => {
    try {
      const checkEmail = await api.get(`/users?email=${userData.email}`);
      if (checkEmail.data.length > 0) {
        throw new Error('Email already exists');
      }

      const allUsers = await api.get('/users');
      const users = allUsers.data;
      
      let maxId = 0;
      users.forEach(user => {
        const idNum = parseInt(user.id);
        if (!isNaN(idNum) && idNum > maxId) {
          maxId = idNum;
        }
      });
      
      const nextId = (maxId + 1).toString();

      const newUser = {
        ...userData,
        id: nextId,
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

  updateUser: async (id, userData) => {
    try {
      const response = await api.patch(`/users/${id}`, userData);
      const { password, ...userWithoutPassword } = response.data;
      
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.id === id) {
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      }
      
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      await api.delete(`/users/${id}`);
      return true;
    } catch (error) {
      throw error;
    }
  },

  getDepartments: async () => {
    try {
      const response = await api.get('/departments');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getLeaveBalance: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data.leaveBalance;
    } catch (error) {
      throw error;
    }
  },

  recalculateUserBalance: async (userId) => {
    try {
      const leavesResponse = await api.get(`/leaves?userId=${userId}&status=approved`);
      const approvedLeaves = leavesResponse.data;
      
      const usedSick = approvedLeaves
        .filter(l => l.leaveType === 'sickLeave')
        .reduce((sum, l) => sum + (l.days || 1), 0);
      
      const usedCasual = approvedLeaves
        .filter(l => l.leaveType === 'casualLeave')
        .reduce((sum, l) => sum + (l.days || 1), 0);
      
      const usedEarned = approvedLeaves
        .filter(l => l.leaveType === 'earnedLeave')
        .reduce((sum, l) => sum + (l.days || 1), 0);

      const correctBalance = {
        sickLeave: Math.max(0, 12 - usedSick),
        casualLeave: Math.max(0, 10 - usedCasual),
        earnedLeave: Math.max(0, 15 - usedEarned)
      };

      const response = await api.patch(`/users/${userId}`, {
        leaveBalance: correctBalance
      });

      
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        currentUser.leaveBalance = correctBalance;
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
      
      return correctBalance;
    } catch (error) {
      console.error('Error recalculating balance:', error);
      throw error;
    }
  },

  recalculateAllBalances: async () => {
    try {
     
      const usersResponse = await api.get('/users');
      const users = usersResponse.data;
      const employees = users.filter(u => u.role === 'employee');
      
      for (const emp of employees) {
        await userService.recalculateUserBalance(emp.id);
      }
      
      return true;
    } catch (error) {
      console.error('Error recalculating balances:', error);
      throw error;
    }
  },

  updateLeaveBalance: async (userId, leaveType, days, action) => {
    try {
      const userResponse = await api.get(`/users/${userId}`);
      const user = userResponse.data;
      const currentBalance = user.leaveBalance;
      
      let updatedBalance;
      
      if (action === 'approve') {
        updatedBalance = {
          ...currentBalance,
          [leaveType]: Math.max(0, currentBalance[leaveType] - days)
        };
        console.log(`✅ Approved: Deducted ${days} days from ${leaveType}`);
      } 
      else if (action === 'reject' || action === 'cancel') {
        updatedBalance = {
          ...currentBalance,
          [leaveType]: currentBalance[leaveType] + days
        };
        console.log(`🔄 Rejected/Cancelled: Added back ${days} days to ${leaveType}`);
      } 
      else {
        updatedBalance = currentBalance;
      }

      const response = await api.patch(`/users/${userId}`, {
        leaveBalance: updatedBalance
      });
      
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        currentUser.leaveBalance = updatedBalance;
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
      
      return response.data.leaveBalance;
    } catch (error) {
      console.error('Error updating leave balance:', error);
      throw error;
    }
  },
};

// Leave Services
export const leaveService = {
  getAllLeaves: async () => {
    try {
      const response = await api.get('/leaves?_sort=appliedDate&_order=desc');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getLeavesByUser: async (userId) => {
    try {
      const response = await api.get(`/leaves?userId=${userId}&_sort=appliedDate&_order=desc`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getLeavesByDepartment: async (department) => {
    try {
      const response = await api.get(`/leaves?department=${department}&_sort=appliedDate&_order=desc`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getLeavesByStatus: async (status) => {
    try {
      const response = await api.get(`/leaves?status=${status}&_sort=appliedDate&_order=desc`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  applyLeave: async (leaveData) => {
    try {
      const fromDate = new Date(leaveData.fromDate);
      const toDate = new Date(leaveData.toDate);
      const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

      const userResponse = await api.get(`/users/${leaveData.userId}`);
      const user = userResponse.data;
      const balance = user.leaveBalance;

      if (balance[leaveData.leaveType] < days) {
        throw new Error(`Insufficient ${leaveData.leaveType} balance. Available: ${balance[leaveData.leaveType]}, Required: ${days}`);
      }

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

  updateLeaveStatus: async (leaveId, status, userId, leaveType, days) => {
    try {
      const currentLeaveResponse = await api.get(`/leaves/${leaveId}`);
      const currentLeave = currentLeaveResponse.data;
      const previousStatus = currentLeave.status;
      
      console.log(`Updating leave ${leaveId} from ${previousStatus} to ${status}`);

      const response = await api.patch(`/leaves/${leaveId}`, { status });
      
      if (status === 'approved' && previousStatus !== 'approved') {
        await userService.updateLeaveBalance(userId, leaveType, days, 'approve');
      }
      else if (status === 'rejected' && previousStatus === 'approved') {
        await userService.updateLeaveBalance(userId, leaveType, days, 'reject');
      }
      else if (status === 'cancelled' && previousStatus === 'approved') {
        await userService.updateLeaveBalance(userId, leaveType, days, 'cancel');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating leave status:', error);
      throw error;
    }
  },

  cancelLeave: async (leaveId, userId, leaveType, days) => {
    try {
      const currentLeaveResponse = await api.get(`/leaves/${leaveId}`);
      const currentLeave = currentLeaveResponse.data;
      
      const response = await api.patch(`/leaves/${leaveId}`, { status: 'cancelled' });
      
      if (currentLeave.status === 'approved') {
        await userService.updateLeaveBalance(userId, leaveType, days, 'cancel');
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteLeave: async (leaveId) => {
    try {
      const leaveResponse = await api.get(`/leaves/${leaveId}`);
      const leave = leaveResponse.data;
      
      await api.delete(`/leaves/${leaveId}`);
      
      if (leave.status === 'approved') {
        await userService.recalculateUserBalance(leave.userId);
        console.log(`✅ Recalculated balance for user ${leave.userId} after leave deletion`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting leave:', error);
      throw error;
    }
  },

  syncBalancesWithLeaves: async () => {
    try {
      console.log('🔄 Syncing all balances with leaves...');
      await userService.recalculateAllBalances();
      return true;
    } catch (error) {
      console.error('Error syncing balances:', error);
      throw error;
    }
  },

  getLeaveStatistics: async () => {
    try {
      const leavesResponse = await api.get('/leaves');
      const usersResponse = await api.get('/users');
      
      const leaves = leavesResponse.data;
      const users = usersResponse.data.filter(u => u.role === 'employee');
      
      const statistics = {
        total: leaves.length,
        pending: leaves.filter(l => l.status === 'pending').length,
        approved: leaves.filter(l => l.status === 'approved').length,
        rejected: leaves.filter(l => l.status === 'rejected').length,
        cancelled: leaves.filter(l => l.status === 'cancelled').length,
        byDepartment: {},
        byType: {
          sickLeave: leaves.filter(l => l.leaveType === 'sickLeave').length,
          casualLeave: leaves.filter(l => l.leaveType === 'casualLeave').length,
          earnedLeave: leaves.filter(l => l.leaveType === 'earnedLeave').length
        },
        totalEmployees: users.length
      };

      leaves.forEach(leave => {
        if (!statistics.byDepartment[leave.department]) {
          statistics.byDepartment[leave.department] = {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            cancelled: 0
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