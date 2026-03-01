import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { userService, leaveService } from "../../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminSidebar from "../../components/admin/AdminSidebar";
import StatsCard from "../../components/common/StatsCard";
import LeaveRequestsTable from "../../components/admin/LeaveRequestsTable";
import EmployeesTable from "../../components/admin/EmployeesTable";
import DepartmentChart from "../../components/admin/DepartmentChart";
import DepartmentDetails from "../../components/admin/DepartmentDetails";
import EmployeeDetails from "../../components/admin/EmployeeDetails";
import ReportsSection from "../../components/admin/ReportsSection";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    departments: 0,
    totalLeaveDays: 0,
  });
  const [allLeaves, setAllLeaves] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(false);
      setLastUpdated(Date.now());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("👁️ Tab became visible, refreshing admin data...");
        fetchDashboardData(false);
        setLastUpdated(Date.now());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      console.log("✨ Window focused, refreshing admin data...");
      fetchDashboardData(false);
      setLastUpdated(Date.now());
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const fetchDashboardData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [usersRes, leavesRes, departmentsRes] = await Promise.all([
        userService.getAllUsers(),
        leaveService.getAllLeaves(),
        userService.getDepartments(),
      ]);

      const employeesOnly = usersRes.filter((u) => u.role === "employee");

      await userService.recalculateAllBalances();

      const updatedUsers = await userService.getAllUsers();
      setEmployees(updatedUsers.filter((u) => u.role === "employee"));

      setAllLeaves(leavesRes);
      setRecentLeaves(leavesRes.slice(0, 5));

      const pendingLeaves = leavesRes.filter(
        (l) => l.status === "pending",
      ).length;
      const approvedLeaves = leavesRes.filter(
        (l) => l.status === "approved",
      ).length;
      const rejectedLeaves = leavesRes.filter(
        (l) => l.status === "rejected",
      ).length;
      const cancelledLeaves = leavesRes.filter(
        (l) => l.status === "cancelled",
      ).length;
      const totalLeaves = leavesRes.length;

      const totalLeaveDays = leavesRes
        .filter((l) => l.status === "approved")
        .reduce((sum, leave) => sum + (leave.days || 1), 0);

      const newStats = {
        totalEmployees: employeesOnly.length,
        totalLeaves,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
        cancelledLeaves,
        departments: departmentsRes.length,
        totalLeaveDays,
      };

      setStats(newStats);

      const deptStats = {};
      employeesOnly.forEach((emp) => {
        if (!deptStats[emp.department]) {
          deptStats[emp.department] = 0;
        }
        deptStats[emp.department]++;
      });

      const chartData = Object.keys(deptStats).map((dept) => ({
        department: dept,
        count: deptStats[dept],
      }));
      setDepartmentData(chartData);
    } catch (error) {
      console.error("❌ Failed to fetch dashboard data:", error);
      if (showLoading) toast.error("Failed to fetch dashboard data");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // You can keep these functions if they're used elsewhere, or remove them completely
  // const syncBalancesWithLeaves = async () => { ... };
  // const resetAllBalances = async () => { ... };

  const handleLeaveAction = async (
    leaveId,
    action,
    userId,
    leaveType,
    days,
  ) => {
    try {
      const status = action === "approve" ? "approved" : "rejected";

      const loadingToast = toast.loading(`Processing leave ${action}...`);

      await leaveService.updateLeaveStatus(
        leaveId,
        status,
        userId,
        leaveType,
        days,
      );

      toast.dismiss(loadingToast);
      toast.success(`Leave ${status} successfully!`);

      await fetchDashboardData();
    } catch (error) {
      console.error("Leave action failed:", error);
      toast.error(`Failed to ${action} leave: ${error.message}`);
    }
  };

  const handleManualRefresh = async () => {
    const loadingToast = toast.loading("Refreshing data...");
    await fetchDashboardData(false);
    toast.dismiss(loadingToast);
    toast.success("Data refreshed!");
    setLastUpdated(Date.now());
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 overflow-auto pt-14 md:pt-0 md:ml-64">
        <header className="hidden md:block bg-white shadow-sm">
          <div className="flex justify-between items-center px-8 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "employees" && "Employee Management"}
                {activeTab === "leaves" && "All Leave Requests"}
                {activeTab === "departments" && "Department Overview"}
                {activeTab === "reports" && "Reports"}
              </h1>
              {/* <p className="text-xs text-green-600 mt-1">
                🔄 Auto-refresh every 2 seconds • Last:{" "}
                {new Date(lastUpdated).toLocaleTimeString()}
              </p> */}
            </div>

            <div className="flex items-center space-x-4">
              {/* <button
                onClick={handleManualRefresh}
                className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
                title="Refresh now"
              >
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button> */}
              
              {/* Removed Sync Balances and Reset Balances buttons */}
              
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome,</p>
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.department}</p>
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

        <div className="p-4 sm:p-6 md:p-8">
          {activeTab === "overview" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatsCard
                  title="Total Employees"
                  value={stats.totalEmployees}
                  icon="👥"
                  color="bg-blue-500"
                  change={`${stats.totalEmployees} active employees`}
                />
                <StatsCard
                  title="Pending Leaves"
                  value={stats.pendingLeaves}
                  icon="⏳"
                  color="bg-yellow-500"
                  change={`${stats.pendingLeaves} requests pending`}
                />
                <StatsCard
                  title="Approved Leaves"
                  value={stats.approvedLeaves}
                  icon="✅"
                  color="bg-green-500"
                  change={`${stats.totalLeaveDays} total days approved`}
                />
                <StatsCard
                  title="Total Leaves"
                  value={stats.totalLeaves}
                  icon="📋"
                  color="bg-purple-500"
                  change={`${stats.rejectedLeaves} rejected, ${stats.cancelledLeaves} cancelled`}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-1">
                  <DepartmentChart data={departmentData} />
                </div>
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">
                        Recent Leave Requests
                      </h2>
                      {/* <span className="text-xs text-green-600">
                        🔄 Auto-refresh
                      </span> */}
                    </div>
                    <LeaveRequestsTable
                      leaves={recentLeaves}
                      onAction={handleLeaveAction}
                      showActions={true}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <button
                  onClick={() => setActiveTab("employees")}
                  className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
                >
                  <div className="text-2xl sm:text-3xl mb-2">➕</div>
                  <h3 className="font-semibold">Add New Employee</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Create employee account
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab("leaves")}
                  className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
                >
                  <div className="text-2xl sm:text-3xl mb-2">📋</div>
                  <h3 className="font-semibold">Review All Leaves</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {stats.pendingLeaves} pending, {stats.totalLeaves} total
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab("reports")}
                  className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left sm:col-span-2 lg:col-span-1"
                >
                  <div className="text-2xl sm:text-3xl mb-2">📊</div>
                  <h3 className="font-semibold">Generate Report</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Monthly leave report
                  </p>
                </button>
              </div>
            </div>
          )}

          {activeTab === "employees" && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 sm:p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">Employee List</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Total: {stats.totalEmployees} employees 
                    </p>
                  </div>
                  
                </div>
              </div>
              <EmployeesTable
                employees={employees}
                onRefresh={fetchDashboardData}
                onEmployeeClick={handleEmployeeClick}
              />
            </div>
          )}

          {activeTab === "leaves" && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 sm:p-6 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      All Leave Requests
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Total: {stats.totalLeaves} leaves 
                    </p>
                  </div>
                  {/* <button
                    onClick={handleManualRefresh}
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    Refresh Now
                  </button> */}
                </div>
              </div>

              <LeaveRequestsTable
                leaves={allLeaves}
                onAction={handleLeaveAction}
                showActions={true}
                showAll={true}
              />
            </div>
          )}

          {activeTab === "departments" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Header with Stats - Responsive */}
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                      Department Overview
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Manage and view all department details
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleManualRefresh}
                      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors w-full sm:w-auto"
                    >
                      <svg
                        className="h-3 w-3 sm:h-4 sm:w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Refresh
                    </button>
                    {/* Removed Add Dept button as requested */}
                  </div>
                </div>

                {/* Department Stats Cards - Responsive Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-blue-600 font-medium">
                          Total Depts
                        </p>
                        <p className="text-xl sm:text-3xl font-bold text-blue-700">
                          {stats.departments}
                        </p>
                      </div>
                      <div className="bg-blue-500 p-2 sm:p-3 rounded-lg">
                        <svg
                          className="h-4 w-4 sm:h-6 sm:w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-blue-500 mt-1 sm:mt-2">
                      Across divisions
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-600 font-medium">
                          Employees
                        </p>
                        <p className="text-xl sm:text-3xl font-bold text-green-700">
                          {stats.totalEmployees}
                        </p>
                      </div>
                      <div className="bg-green-500 p-2 sm:p-3 rounded-lg">
                        <svg
                          className="h-4 w-4 sm:h-6 sm:w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-green-500 mt-1 sm:mt-2">
                      Active
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-purple-600 font-medium">
                          Managers
                        </p>
                        <p className="text-xl sm:text-3xl font-bold text-purple-700">
                          {stats.departments}
                        </p>
                      </div>
                      <div className="bg-purple-500 p-2 sm:p-3 rounded-lg">
                        <svg
                          className="h-4 w-4 sm:h-6 sm:w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-purple-500 mt-1 sm:mt-2">
                      Dept heads
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-orange-600 font-medium">
                          Avg Team
                        </p>
                        <p className="text-xl sm:text-3xl font-bold text-orange-700">
                          {stats.departments > 0
                            ? Math.round(
                                stats.totalEmployees / stats.departments,
                              )
                            : 0}
                        </p>
                      </div>
                      <div className="bg-orange-500 p-2 sm:p-3 rounded-lg">
                        <svg
                          className="h-4 w-4 sm:h-6 sm:w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-orange-500 mt-1 sm:mt-2">
                      Per dept
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Department Grid - Responsive */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Department List - Left Side */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  {/* Department Cards - Responsive */}
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                        All Departments
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {departmentData.map((dept, index) => {
                        const colors = [
                          {
                            bg: "bg-blue-100",
                            text: "text-blue-600",
                            border: "border-blue-200",
                            gradient: "from-blue-500 to-blue-600",
                          },
                          {
                            bg: "bg-green-100",
                            text: "text-green-600",
                            border: "border-green-200",
                            gradient: "from-green-500 to-green-600",
                          },
                          {
                            bg: "bg-purple-100",
                            text: "text-purple-600",
                            border: "border-purple-200",
                            gradient: "from-purple-500 to-purple-600",
                          },
                          {
                            bg: "bg-orange-100",
                            text: "text-orange-600",
                            border: "border-orange-200",
                            gradient: "from-orange-500 to-orange-600",
                          },
                          {
                            bg: "bg-pink-100",
                            text: "text-pink-600",
                            border: "border-pink-200",
                            gradient: "from-pink-500 to-pink-600",
                          },
                        ];
                        const color = colors[index % colors.length];

                        return (
                          <div
                            key={dept.department}
                            className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setSelectedDepartment(dept)}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center space-x-3 sm:space-x-4">
                                <div
                                  className={`w-10 h-10 sm:w-12 sm:h-12 ${color.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
                                >
                                  <span
                                    className={`text-lg sm:text-xl font-bold ${color.text}`}
                                  >
                                    {dept.department.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                                    {dept.department}
                                  </h4>
                                  <p className="text-xs sm:text-sm text-gray-500">
                                    Department
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end sm:space-x-6">
                                <div className="text-right">
                                  <p className="text-xl sm:text-2xl font-bold text-gray-800">
                                    {dept.count}
                                  </p>
                                  <p className="text-xs sm:text-sm text-gray-500">
                                    Employees
                                  </p>
                                </div>
                                <div className="flex gap-2 sm:hidden">
                                  <button className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar - Hidden on mobile, shown on tablet/desktop */}
                            <div className="hidden sm:block mt-4">
                              <div className="flex justify-between text-xs sm:text-sm mb-1">
                                <span className="text-gray-600">
                                  Team Capacity
                                </span>
                                <span className="font-medium text-gray-900">
                                  {Math.round((dept.count / 20) * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`bg-gradient-to-r ${color.gradient} h-2 rounded-full transition-all duration-500`}
                                  style={{
                                    width: `${Math.min((dept.count / 20) * 100, 100)}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            {/* Action Buttons - Responsive */}
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button className="flex-1 sm:flex-none px-3 py-1.5 text-xs bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
                                View Details
                              </button>
                              <button className="flex-1 sm:flex-none px-3 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                Manage Team
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Department Activity Feed - Responsive */}
                  <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                      Recent Department Activity
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg
                            className="h-4 w-4 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm text-gray-800">
                            <span className="font-semibold">Engineering</span>{" "}
                            added 3 new team members
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            2 hours ago
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg
                            className="h-4 w-4 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm text-gray-800">
                            <span className="font-semibold">Marketing</span>{" "}
                            approved 5 leave requests
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            5 hours ago
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg
                            className="h-4 w-4 text-purple-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm text-gray-800">
                            <span className="font-semibold">Sales</span> has 3
                            pending leave requests
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            1 day ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Stats & Analytics - Responsive */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Department Distribution Chart - Responsive */}
                  <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                      Department Distribution
                    </h3>
                    <div className="space-y-4">
                      {departmentData.map((dept, index) => {
                        const colors = [
                          "bg-blue-500",
                          "bg-green-500",
                          "bg-purple-500",
                          "bg-orange-500",
                          "bg-pink-500",
                        ];
                        const percentage = (
                          (dept.count / stats.totalEmployees) *
                          100
                        ).toFixed(1);

                        return (
                          <div key={dept.department}>
                            <div className="flex justify-between text-xs sm:text-sm mb-1">
                              <span className="font-medium text-gray-700 truncate max-w-[120px] sm:max-w-full">
                                {dept.department}
                              </span>
                              <span className="text-gray-600 ml-2">
                                {dept.count} ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                              <div
                                className={`${colors[index % colors.length]} h-1.5 sm:h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Stats Cards - Responsive Grid */}
                  <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                      Department Quick Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Largest Dept</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {departmentData.length > 0
                            ? departmentData.reduce(
                                (max, dept) =>
                                  dept.count > max.count ? dept : max,
                                departmentData[0],
                              ).department
                            : "N/A"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {departmentData.length > 0
                            ? departmentData.reduce(
                                (max, dept) =>
                                  dept.count > max.count ? dept : max,
                                departmentData[0],
                              ).count + " members"
                            : ""}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Smallest Dept</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {departmentData.length > 0
                            ? departmentData.reduce(
                                (min, dept) =>
                                  dept.count < min.count ? dept : min,
                                departmentData[0],
                              ).department
                            : "N/A"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {departmentData.length > 0
                            ? departmentData.reduce(
                                (min, dept) =>
                                  dept.count < min.count ? dept : min,
                                departmentData[0],
                              ).count + " members"
                            : ""}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Avg Team Size</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {stats.departments > 0
                            ? (
                                stats.totalEmployees / stats.departments
                              ).toFixed(1)
                            : 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          per department
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Total Depts</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {stats.departments}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">active</p>
                      </div>
                    </div>
                  </div>

                  {/* Department Managers Card - Responsive */}
                  <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                      Department Managers
                    </h3>
                    <div className="space-y-3">
                      {departmentData.map((dept, index) => (
                        <div
                          key={dept.department}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0
                    ${
                      index % 5 === 0
                        ? "bg-blue-500"
                        : index % 5 === 1
                          ? "bg-green-500"
                          : index % 5 === 2
                            ? "bg-purple-500"
                            : index % 5 === 3
                              ? "bg-orange-500"
                              : "bg-pink-500"
                    }`}
                            >
                              {dept.department.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                                {dept.department}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {dept.count} members
                              </p>
                            </div>
                          </div>
                          <button className="text-primary-600 hover:text-primary-800 flex-shrink-0 ml-2">
                            <svg
                              className="h-4 w-4 sm:h-5 sm:w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* report  */}
          {activeTab === 'reports' && (
  <ReportsSection />
)}
        </div>
      </div>
      {selectedDepartment && (
        <DepartmentDetails
          department={selectedDepartment}
          onClose={() => setSelectedDepartment(null)}
          onRefresh={fetchDashboardData}
        />
      )}

       {selectedEmployee && (
        <EmployeeDetails
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;