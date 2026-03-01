import React, { useState, useEffect } from 'react';
import { userService, leaveService } from '../../services/api';
import toast from 'react-hot-toast';

const ReportsSection = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [customDate, setCustomDate] = useState({ from: '', to: '' });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedChart, setSelectedChart] = useState('trends');
  const [reportData, setReportData] = useState({
    summary: {
      totalLeaves: 0,
      approvedLeaves: 0,
      rejectedLeaves: 0,
      pendingLeaves: 0,
      approvalRate: 0,
      avgDaysPerEmployee: 0,
      totalEmployees: 0
    },
    departmentStats: [],
    leaveTypeStats: [],
    employeeStats: [],
    monthlyTrends: []
  });

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, [dateRange, selectedDepartment]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Fetch all necessary data
      const [users, leaves, depts] = await Promise.all([
        userService.getAllUsers(),
        leaveService.getAllLeaves(),
        userService.getDepartments()
      ]);

      const employees = users.filter(u => u.role === 'employee');
      const deptList = depts.map(d => d.name);
      setDepartments(['all', ...deptList]);

      // Filter leaves based on date range
      const filteredLeaves = filterLeavesByDate(leaves);
      
      // Filter by department if needed
      const deptFilteredLeaves = selectedDepartment === 'all' 
        ? filteredLeaves 
        : filteredLeaves.filter(l => l.department === selectedDepartment);

      // Calculate summary statistics
      const approved = deptFilteredLeaves.filter(l => l.status === 'approved').length;
      const rejected = deptFilteredLeaves.filter(l => l.status === 'rejected').length;
      const pending = deptFilteredLeaves.filter(l => l.status === 'pending').length;
      const total = deptFilteredLeaves.length;
      
      const totalDaysUsed = deptFilteredLeaves
        .filter(l => l.status === 'approved')
        .reduce((sum, l) => sum + (l.days || 1), 0);

      // Department-wise stats
      const deptStats = {};
      deptList.forEach(dept => {
        const deptLeaves = deptFilteredLeaves.filter(l => l.department === dept);
        const deptApproved = deptLeaves.filter(l => l.status === 'approved').length;
        deptStats[dept] = {
          total: deptLeaves.length,
          approved: deptApproved,
          rejected: deptLeaves.filter(l => l.status === 'rejected').length,
          pending: deptLeaves.filter(l => l.status === 'pending').length,
          days: deptLeaves
            .filter(l => l.status === 'approved')
            .reduce((sum, l) => sum + (l.days || 1), 0)
        };
      });

      // Leave type statistics
      const typeStats = {
        sickLeave: deptFilteredLeaves.filter(l => l.leaveType === 'sickLeave').length,
        casualLeave: deptFilteredLeaves.filter(l => l.leaveType === 'casualLeave').length,
        earnedLeave: deptFilteredLeaves.filter(l => l.leaveType === 'earnedLeave').length
      };

      // Employee-wise stats
      const empStats = employees.map(emp => {
        const empLeaves = deptFilteredLeaves.filter(l => l.userId === emp.id);
        const empApproved = empLeaves.filter(l => l.status === 'approved');
        return {
          name: emp.name,
          department: emp.department,
          total: empLeaves.length,
          approved: empApproved.length,
          rejected: empLeaves.filter(l => l.status === 'rejected').length,
          pending: empLeaves.filter(l => l.status === 'pending').length,
          daysUsed: empApproved.reduce((sum, l) => sum + (l.days || 1), 0),
          balance: emp.leaveBalance
        };
      }).sort((a, b) => b.daysUsed - a.daysUsed);

      // Monthly trends
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const trends = months.map(month => ({
        month,
        count: deptFilteredLeaves.filter(l => {
          const date = new Date(l.appliedDate);
          return months[date.getMonth()] === month;
        }).length
      }));

      setReportData({
        summary: {
          totalLeaves: total,
          approvedLeaves: approved,
          rejectedLeaves: rejected,
          pendingLeaves: pending,
          approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
          avgDaysPerEmployee: employees.length > 0 ? (totalDaysUsed / employees.length).toFixed(1) : 0,
          totalEmployees: employees.length
        },
        departmentStats: Object.entries(deptStats).map(([name, data]) => ({ name, ...data })),
        leaveTypeStats: Object.entries(typeStats).map(([type, count]) => ({ type, count })),
        employeeStats: empStats.slice(0, 10), // Top 10 employees
        monthlyTrends: trends
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const filterLeavesByDate = (leaves) => {
    const now = new Date();
    let cutoffDate = new Date();

    switch(dateRange) {
      case '7days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '12months':
        cutoffDate.setMonth(now.getMonth() - 12);
        break;
      case 'custom':
        if (customDate.from && customDate.to) {
          return leaves.filter(l => 
            new Date(l.appliedDate) >= new Date(customDate.from) &&
            new Date(l.appliedDate) <= new Date(customDate.to)
          );
        }
        return leaves;
      default:
        return leaves;
    }

    return leaves.filter(l => new Date(l.appliedDate) >= cutoffDate);
  };

  const exportToPDF = () => {
    toast.success('PDF export started');
    // Implement PDF export logic
  };

  const exportToExcel = () => {
    toast.success('Excel export started');
    // Implement Excel export logic
  };

  const exportToCSV = () => {
    toast.success('CSV export started');
    // Implement CSV export logic
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Actions */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Reports & Analytics</h2>
            <p className="text-sm text-gray-500 mt-1">Comprehensive insights and statistics</p>
          </div>
          
          {/* Export Buttons */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={exportToPDF}
              className="flex-1 sm:flex-none px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF
            </button>
            <button
              onClick={exportToExcel}
              className="flex-1 sm:flex-none px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
            <button
              onClick={exportToCSV}
              className="flex-1 sm:flex-none px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Range */}
        {dateRange === 'custom' && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="date"
                value={customDate.from}
                onChange={(e) => setCustomDate({ ...customDate, from: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                value={customDate.to}
                onChange={(e) => setCustomDate({ ...customDate, to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="Total Leaves"
          value={reportData.summary.totalLeaves}
          icon="📊"
          color="bg-blue-500"
          trend="total"
        />
        <SummaryCard
          title="Approved"
          value={reportData.summary.approvedLeaves}
          icon="✅"
          color="bg-green-500"
          trend="approved"
        />
        <SummaryCard
          title="Rejected"
          value={reportData.summary.rejectedLeaves}
          icon="❌"
          color="bg-red-500"
          trend="rejected"
        />
        <SummaryCard
          title="Pending"
          value={reportData.summary.pendingLeaves}
          icon="⏳"
          color="bg-yellow-500"
          trend="pending"
        />
        <SummaryCard
          title="Approval Rate"
          value={`${reportData.summary.approvalRate}%`}
          icon="📈"
          color="bg-purple-500"
          trend="rate"
        />
      </div>

      {/* Chart Type Selector */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap gap-2">
          {['trends', 'departments', 'types', 'employees'].map((chart) => (
            <button
              key={chart}
              onClick={() => setSelectedChart(chart)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                selectedChart === chart
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {chart} {chart === 'trends' ? '📈' : chart === 'departments' ? '🏢' : chart === 'types' ? '📊' : '👥'}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Area */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        {selectedChart === 'trends' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Leave Trends (Last 12 Months)</h3>
            <div className="h-64 flex items-end justify-between gap-1">
              {reportData.monthlyTrends.map((item, index) => {
                const maxCount = Math.max(...reportData.monthlyTrends.map(t => t.count));
                const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center group">
                    <div className="relative w-full flex justify-center">
                      <div 
                        className="w-full max-w-[30px] bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg group-hover:from-primary-600 transition-all cursor-pointer"
                        style={{ height: `${height}%`, minHeight: '4px' }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {item.count} leaves
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 mt-2">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedChart === 'departments' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Department-wise Leave Distribution</h3>
            <div className="space-y-4">
              {reportData.departmentStats.map((dept) => (
                <div key={dept.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{dept.name}</span>
                    <span className="text-gray-600">{dept.total} leaves ({dept.days} days)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(dept.total / reportData.summary.totalLeaves) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex gap-2 mt-1 text-xs">
                    <span className="text-green-600">✓ {dept.approved}</span>
                    <span className="text-red-600">✗ {dept.rejected}</span>
                    <span className="text-yellow-600">⏳ {dept.pending}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedChart === 'types' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Leave Type Analysis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {reportData.leaveTypeStats.map((item) => (
                <div key={item.type} className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${
                    item.type === 'sickLeave' ? 'bg-blue-100' :
                    item.type === 'casualLeave' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    <span className={`text-xl ${
                      item.type === 'sickLeave' ? 'text-blue-600' :
                      item.type === 'casualLeave' ? 'text-green-600' : 'text-purple-600'
                    }`}>
                      {item.type === 'sickLeave' ? '🤒' : item.type === 'casualLeave' ? '🎉' : '⭐'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-800 capitalize">
                    {item.type.replace('Leave', ' Leave')}
                  </h4>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{item.count}</p>
                  <p className="text-sm text-gray-500">
                    {((item.count / reportData.summary.totalLeaves) * 100).toFixed(1)}% of total
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedChart === 'employees' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Employees by Leave Usage</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Used</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.employeeStats.map((emp, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{emp.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{emp.department}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{emp.total}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{emp.daysUsed}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          {emp.balance?.sickLeave || 0}S, {emp.balance?.casualLeave || 0}C, {emp.balance?.earnedLeave || 0}E
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Key Metrics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              label="Avg Days/Employee"
              value={reportData.summary.avgDaysPerEmployee}
              unit="days"
              color="blue"
            />
            <MetricCard
              label="Approval Rate"
              value={reportData.summary.approvalRate}
              unit="%"
              color="green"
            />
            <MetricCard
              label="Total Employees"
              value={reportData.summary.totalEmployees}
              unit=""
              color="purple"
            />
            <MetricCard
              label="Pending Ratio"
              value={reportData.summary.totalLeaves > 0 
                ? ((reportData.summary.pendingLeaves / reportData.summary.totalLeaves) * 100).toFixed(1)
                : 0}
              unit="%"
              color="yellow"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Insights
          </h3>
          <div className="space-y-3">
            <InsightItem
              icon="📈"
              text={`Highest leave month: ${reportData.monthlyTrends.reduce((max, curr) => 
                curr.count > max.count ? curr : max, reportData.monthlyTrends[0]).month
              }`}
            />
            <InsightItem
              icon="🏢"
              text={`Most active department: ${reportData.departmentStats.reduce((max, curr) => 
                curr.total > max.total ? curr : max, reportData.departmentStats[0])?.name || 'N/A'
              }`}
            />
            <InsightItem
              icon="📊"
              text={`Most used leave type: ${
                Object.entries(reportData.leaveTypeStats).reduce((max, curr) => 
                  curr[1]?.count > (max[1]?.count || 0) ? curr : max, ['N/A'])[0]
              }`}
            />
            <InsightItem
              icon="👤"
              text={`Top leave taker: ${reportData.employeeStats[0]?.name || 'N/A'} (${reportData.employeeStats[0]?.daysUsed || 0} days)`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const SummaryCard = ({ title, value, icon, color, trend }) => (
  <div className="bg-white rounded-xl shadow-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-2xl">{icon}</span>
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
        trend === 'total' ? 'bg-blue-100 text-blue-600' :
        trend === 'approved' ? 'bg-green-100 text-green-600' :
        trend === 'rejected' ? 'bg-red-100 text-red-600' :
        trend === 'pending' ? 'bg-yellow-100 text-yellow-600' :
        'bg-purple-100 text-purple-600'
      }`}>
        {trend}
      </span>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-600 mt-1">{title}</p>
  </div>
);

const MetricCard = ({ label, value, unit, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    yellow: 'bg-yellow-50 text-yellow-700'
  };

  return (
    <div className={`${colors[color]} rounded-lg p-3`}>
      <p className="text-xs opacity-75">{label}</p>
      <p className="text-xl font-bold">{value}{unit}</p>
    </div>
  );
};

const InsightItem = ({ icon, text }) => (
  <div className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg">
    <span className="text-lg">{icon}</span>
    <p className="text-sm text-gray-700 flex-1">{text}</p>
  </div>
);

export default ReportsSection;