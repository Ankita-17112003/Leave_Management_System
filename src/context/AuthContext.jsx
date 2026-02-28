import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, userService } from '../services/api';
import toast from 'react-hot-toast';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const loadUser = () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await authService.login(email, password);
      setUser(userData);
      
      toast.success(`Welcome back, ${userData.name}!`);
      return { success: true, role: userData.role };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Logged out successfully');
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Check if user is employee
  const isEmployee = () => {
    return user?.role === 'employee';
  };

  // Refresh user data from server
  const refreshUser = async () => {
    if (!user?.id) return;
    
    try {
      const updatedUser = await userService.getUserById(user.id);
      setUser(updatedUser);
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  // Get user's full name
  const getUserName = () => {
    return user?.name || 'User';
  };

  // Get user's department
  const getUserDepartment = () => {
    return user?.department || 'Not Assigned';
  };

  // Get user's leave balance
  const getLeaveBalance = () => {
    return user?.leaveBalance || {
      sickLeave: 0,
      casualLeave: 0,
      earnedLeave: 0
    };
  };

  // Format leave balance for display
  const getFormattedLeaveBalance = () => {
    const balance = getLeaveBalance();
    return {
      'Sick Leave': balance.sickLeave,
      'Casual Leave': balance.casualLeave,
      'Earned Leave': balance.earnedLeave
    };
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Value object to be provided to consumers
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    hasRole,
    isAdmin,
    isEmployee,
    refreshUser,
    getUserName,
    getUserDepartment,
    getLeaveBalance,
    getFormattedLeaveBalance,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;