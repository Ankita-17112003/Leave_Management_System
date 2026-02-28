import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import LoadingSpinner from './components/common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && !hasRole(allowedRole)) {
    const { user } = useAuth();
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'employee') {
      return <Navigate to="/employee/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated()) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'employee') {
      return <Navigate to="/employee/dashboard" replace />;
    }
  }

  return children;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/employees" element={
          <ProtectedRoute allowedRole="admin">
            <div className="p-4 sm:p-8">Employee Management Page (Coming Soon)</div>
          </ProtectedRoute>
        } />
        <Route path="/admin/leaves" element={
          <ProtectedRoute allowedRole="admin">
            <div className="p-4 sm:p-8">Leave Management Page (Coming Soon)</div>
          </ProtectedRoute>
        } />
        <Route path="/admin/departments" element={
          <ProtectedRoute allowedRole="admin">
            <div className="p-4 sm:p-8">Department Management Page (Coming Soon)</div>
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRole="admin">
            <div className="p-4 sm:p-8">Reports Page (Coming Soon)</div>
          </ProtectedRoute>
        } />

        <Route path="/employee/dashboard" element={
          <ProtectedRoute allowedRole="employee">
            <EmployeeDashboard />
          </ProtectedRoute>
        } />
        <Route path="/employee/apply-leave" element={
          <ProtectedRoute allowedRole="employee">
            <div className="p-4 sm:p-8">Apply Leave Page (Coming Soon)</div>
          </ProtectedRoute>
        } />
        <Route path="/employee/my-leaves" element={
          <ProtectedRoute allowedRole="employee">
            <div className="p-4 sm:p-8">My Leaves Page (Coming Soon)</div>
          </ProtectedRoute>
        } />
        <Route path="/employee/profile" element={
          <ProtectedRoute allowedRole="employee">
            <div className="p-4 sm:p-8">Profile Page (Coming Soon)</div>
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={
          <div className="p-4 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold">404 - Page Not Found</h2>
          </div>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;