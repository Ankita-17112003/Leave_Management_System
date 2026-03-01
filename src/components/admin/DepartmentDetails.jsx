import React, { useState, useEffect } from 'react';
import { userService, leaveService } from '../../services/api';
import toast from 'react-hot-toast';

const DepartmentDetails = ({ department, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [departmentData, setDepartmentData] = useState({
    employees: [],
    leaves: [],
    details: {},
    stats: {
      totalEmployees: 0,
      presentToday: 0,
      onLeave: 0,
      pendingLeaves: 0,
      approvedLeaves: 0,
      rejectedLeaves: 0,
      cancelledLeaves: 0,
      totalLeaveDays: 0,
      totalLeaveRequests: 0
    }
  });

  const departmentName = department?.name || department?.department || 'Unknown Department';
  const departmentId = department?.id || department?.name || 'unknown';

  useEffect(() => {
    if (department) {
      fetchDepartmentDetails();
    }
  }, [department]);

  const fetchDepartmentDetails = async () => {
    setLoading(true);
    try {
      // Fetch department details from departments collection
      const allDepts = await userService.getDepartments();
      const deptDetails = allDepts.find(d => d.name === departmentName) || {};

      // Fetch all users and filter by department
      const allUsers = await userService.getAllUsers();
      const deptEmployees = allUsers.filter(u => 
        u.department === departmentName && u.role === 'employee'
      );

      // Fetch all leaves and filter by department
      const allLeaves = await leaveService.getAllLeaves();
      const deptLeaves = allLeaves.filter(l => l.department === departmentName);

      // Calculate today's date for presence tracking
      const today = new Date().toISOString().split('T')[0];

      // Calculate detailed stats
      const pendingLeaves = deptLeaves.filter(l => l.status === 'pending').length;
      const approvedLeaves = deptLeaves.filter(l => l.status === 'approved').length;
      const rejectedLeaves = deptLeaves.filter(l => l.status === 'rejected').length;
      const cancelledLeaves = deptLeaves.filter(l => l.status === 'cancelled').length;
      
      // Employees on leave today
      const onLeaveToday = deptLeaves.filter(l => 
        l.status === 'approved' && 
        l.fromDate <= today && 
        l.toDate >= today
      ).length;

      // Total leave days used (only approved)
      const totalLeaveDays = deptLeaves
        .filter(l => l.status === 'approved')
        .reduce((sum, l) => sum + (l.days || 1), 0);

      // Calculate leave balance summary
      const totalSickBalance = deptEmployees.reduce((sum, emp) => sum + (emp.leaveBalance?.sickLeave || 0), 0);
      const totalCasualBalance = deptEmployees.reduce((sum, emp) => sum + (emp.leaveBalance?.casualLeave || 0), 0);
      const totalEarnedBalance = deptEmployees.reduce((sum, emp) => sum + (emp.leaveBalance?.earnedLeave || 0), 0);

      setDepartmentData({
        employees: deptEmployees,
        leaves: deptLeaves,
        details: deptDetails,
        stats: {
          totalEmployees: deptEmployees.length,
          presentToday: deptEmployees.length - onLeaveToday,
          onLeave: onLeaveToday,
          pendingLeaves,
          approvedLeaves,
          rejectedLeaves,
          cancelledLeaves,
          totalLeaveDays,
          totalLeaveRequests: deptLeaves.length,
          totalSickBalance,
          totalCasualBalance,
          totalEarnedBalance
        }
      });

    } catch (error) {
      console.error('Error fetching department details:', error);
      toast.error('Failed to fetch department details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="p-6 flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const manager = departmentData.details.manager || 'Not Assigned';
  const employeeCount = departmentData.details.employeeCount || departmentData.employees.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-bold text-white">
                {departmentName ? departmentName.charAt(0).toUpperCase() : '?'}
              </span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{departmentName}</h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Manager: {manager} • {departmentData.stats.totalEmployees} employee
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-xl">
              <p className="text-xs text-blue-600 font-medium">Total Employees</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-700">{departmentData.stats.totalEmployees}</p>
              <p className="text-xs text-blue-500 mt-1">Team members</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 rounded-xl">
              <p className="text-xs text-green-600 font-medium">Present Today</p>
              <p className="text-xl sm:text-2xl font-bold text-green-700">{departmentData.stats.presentToday}</p>
              <p className="text-xs text-green-500 mt-1">{departmentData.stats.onLeave} on leave</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 sm:p-4 rounded-xl">
              <p className="text-xs text-yellow-600 font-medium">Leave Requests</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-700">{departmentData.stats.totalLeaveRequests}</p>
              <p className="text-xs text-yellow-500 mt-1">{departmentData.stats.pendingLeaves} pending</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 rounded-xl">
              <p className="text-xs text-purple-600 font-medium">Days Used</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-700">{departmentData.stats.totalLeaveDays}</p>
              <p className="text-xs text-purple-500 mt-1">Approved leaves</p>
            </div>
          </div>

          {/* Department Overview Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {/* Department Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Department Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Department Name</span>
                  <span className="text-sm font-semibold text-gray-800">{departmentName}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Manager</span>
                  <span className="text-sm font-semibold text-gray-800">{manager}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Employees</span>
                  <span className="text-sm font-semibold text-gray-800">{departmentData.stats.totalEmployees}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Department ID</span>
                  <span className="text-sm font-semibold text-gray-800">{departmentId}</span>
                </div>
              </div>
            </div>

            {/* Leave Statistics Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Leave Statistics
              </h3>
              <div className="space-y-4">
                {/* Status Distribution */}
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-gray-600">Approved</span>
                    <span className="font-medium text-green-600">{departmentData.stats.approvedLeaves}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(departmentData.stats.approvedLeaves / (departmentData.stats.totalLeaveRequests || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-medium text-yellow-600">{departmentData.stats.pendingLeaves}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${(departmentData.stats.pendingLeaves / (departmentData.stats.totalLeaveRequests || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-gray-600">Rejected</span>
                    <span className="font-medium text-red-600">{departmentData.stats.rejectedLeaves}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(departmentData.stats.rejectedLeaves / (departmentData.stats.totalLeaveRequests || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-500">Sick Left</p>
                    <p className="text-sm font-bold text-blue-600">{departmentData.stats.totalSickBalance}</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-500">Casual Left</p>
                    <p className="text-sm font-bold text-green-600">{departmentData.stats.totalCasualBalance}</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-500">Earned Left</p>
                    <p className="text-sm font-bold text-purple-600">{departmentData.stats.totalEarnedBalance}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Employees List */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Team Members ({departmentData.stats.totalEmployees})
            </h3>
            
            {departmentData.employees.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No employees in this department</p>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Balance</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {departmentData.employees.map((emp) => {
                        const onLeave = departmentData.leaves.some(l => 
                          l.userId === emp.id && 
                          l.status === 'approved' &&
                          l.fromDate <= new Date().toISOString().split('T')[0] &&
                          l.toDate >= new Date().toISOString().split('T')[0]
                        );
                        
                        return (
                          <tr key={emp.id} className="hover:bg-gray-50">
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-sm font-bold text-white">
                                    {emp.name ? emp.name.charAt(0).toUpperCase() : '?'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                                  <p className="text-xs text-gray-500">Joined {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : 'N/A'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.email}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">S:{emp.leaveBalance?.sickLeave || 0}</span>
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">C:{emp.leaveBalance?.casualLeave || 0}</span>
                                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full">E:{emp.leaveBalance?.earnedLeave || 0}</span>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              {onLeave ? (
                                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded-full">On Leave</span>
                              ) : (
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">Present</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Recent Leave Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Leave Activity
            </h3>
            
            {departmentData.leaves.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No leave requests found</p>
            ) : (
              <div className="space-y-4">
                {departmentData.leaves.slice(0, 5).map((leave) => (
                  <div key={leave.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${leave.status === 'approved' ? 'bg-green-100' : 
                        leave.status === 'pending' ? 'bg-yellow-100' : 
                        leave.status === 'rejected' ? 'bg-red-100' : 'bg-gray-100'}`}>
                      <svg className={`h-4 w-4 
                        ${leave.status === 'approved' ? 'text-green-600' : 
                          leave.status === 'pending' ? 'text-yellow-600' : 
                          leave.status === 'rejected' ? 'text-red-600' : 'text-gray-600'}`} 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {leave.status === 'approved' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : leave.status === 'pending' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : leave.status === 'rejected' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">{leave.userName}</span> - {leave.leaveType?.replace(/([A-Z])/g, ' $1').trim() || 'Leave'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {leave.fromDate ? new Date(leave.fromDate).toLocaleDateString() : ''} to {leave.toDate ? new Date(leave.toDate).toLocaleDateString() : ''} • {leave.days || 1} days
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{leave.reason}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap
                      ${leave.status === 'approved' ? 'bg-green-100 text-green-600' : 
                        leave.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 
                        leave.status === 'rejected' ? 'bg-red-100 text-red-600' : 
                        'bg-gray-100 text-gray-600'}`}>
                      {leave.status?.charAt(0).toUpperCase() + leave.status?.slice(1) || 'Unknown'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetails;