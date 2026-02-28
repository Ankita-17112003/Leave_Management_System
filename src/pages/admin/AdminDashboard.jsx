import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService, leaveService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatsCard from '../../components/common/StatsCard';
import LeaveRequestsTable from '../../components/admin/LeaveRequestsTable';
import EmployeesTable from '../../components/admin/EmployeesTable';
import DepartmentChart from '../../components/admin/DepartmentChart';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    departments: 0
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, leavesRes, departmentsRes] = await Promise.all([
        userService.getAllUsers(),
        leaveService.getAllLeaves(),
        userService.getDepartments()
      ]);

      const employeesOnly = usersRes.filter(u => u.role === 'employee');
      setEmployees(employeesOnly);

      const pendingLeaves = leavesRes.filter(l => l.status === 'pending').length;
      const approvedLeaves = leavesRes.filter(l => l.status === 'approved').length;
      const rejectedLeaves = leavesRes.filter(l => l.status === 'rejected').length;

      setStats({
        totalEmployees: employeesOnly.length,
        totalLeaves: leavesRes.length,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
        departments: departmentsRes.length
      });

      setRecentLeaves(leavesRes.slice(0, 5));

      const deptStats = {};
      employeesOnly.forEach(emp => {
        if (!deptStats[emp.department]) {
          deptStats[emp.department] = 0;
        }
        deptStats[emp.department]++;
      });

      const chartData = Object.keys(deptStats).map(dept => ({
        department: dept,
        count: deptStats[dept]
      }));
      setDepartmentData(chartData);

    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (leaveId, action, userId, leaveType, days) => {
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      await leaveService.updateLeaveStatus(leaveId, status, userId, leaveType, days);
      toast.success(`Leave ${status} successfully!`);
      fetchDashboardData();
    } catch (error) {
      toast.error(`Failed to ${action} leave`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex items-center justify-center pt-14 md:pt-0">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-14 md:pt-0 md:ml-64"> {/* Added md:ml-64 */}
      {/* Desktop Header */}
      <header className="hidden md:block bg-white shadow-sm">
        <div className="flex justify-between items-center px-8 py-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'employees' && 'Employee Management'}
            {activeTab === 'leaves' && 'Leave Requests'}
            {activeTab === 'departments' && 'Department Overview'}
            {activeTab === 'reports' && 'Reports'}
          </h1>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome,</p>
              <p className="text-sm font-semibold">{user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

        {/* Content Area */}
        <div className="p-4 sm:p-6 md:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatsCard
                  title="Total Employees"
                  value={stats.totalEmployees}
                  icon="👥"
                  color="bg-blue-500"
                  change="+12% from last month"
                />
                <StatsCard
                  title="Pending Leaves"
                  value={stats.pendingLeaves}
                  icon="⏳"
                  color="bg-yellow-500"
                  change={`${stats.pendingLeaves} need review`}
                />
                <StatsCard
                  title="Approved Leaves"
                  value={stats.approvedLeaves}
                  icon="✅"
                  color="bg-green-500"
                  change="This month"
                />
                <StatsCard
                  title="Departments"
                  value={stats.departments}
                  icon="🏢"
                  color="bg-purple-500"
                  change="Active departments"
                />
              </div>

              {/* Charts and Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-1">
                  <DepartmentChart data={departmentData} />
                </div>
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <h2 className="text-lg font-semibold mb-4">Recent Leave Requests</h2>
                    <LeaveRequestsTable 
                      leaves={recentLeaves}
                      onAction={handleLeaveAction}
                      showActions={true}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <button 
                  onClick={() => setActiveTab('employees')}
                  className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
                >
                  <div className="text-2xl sm:text-3xl mb-2">➕</div>
                  <h3 className="font-semibold">Add New Employee</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Create employee account</p>
                </button>

                <button 
                  onClick={() => setActiveTab('leaves')}
                  className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
                >
                  <div className="text-2xl sm:text-3xl mb-2">📋</div>
                  <h3 className="font-semibold">Review Leaves</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{stats.pendingLeaves} pending requests</p>
                </button>

                <button 
                  onClick={() => setActiveTab('reports')}
                  className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left sm:col-span-2 lg:col-span-1"
                >
                  <div className="text-2xl sm:text-3xl mb-2">📊</div>
                  <h3 className="font-semibold">Generate Report</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Monthly leave report</p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 sm:p-6 border-b">
                <h2 className="text-xl font-semibold">Employee List</h2>
              </div>
              <EmployeesTable 
                employees={employees}
                onRefresh={fetchDashboardData}
              />
            </div>
          )}

          {activeTab === 'leaves' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 sm:p-6 border-b">
                <h2 className="text-xl font-semibold">All Leave Requests</h2>
              </div>
              <LeaveRequestsTable 
                leaves={recentLeaves}
                onAction={handleLeaveAction}
                showActions={true}
                showAll={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;