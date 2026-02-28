import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { leaveService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import EmployeeSidebar from '../../components/employee/EmployeeSidebar';
import LeaveBalanceCard from '../../components/employee/LeaveBalanceCard';
import MyLeavesTable from '../../components/employee/MyLeavesTable';
import ApplyLeaveModal from '../../components/employee/ApplyLeaveModal';

const EmployeeDashboard = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [myLeaves, setMyLeaves] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [stats, setStats] = useState({
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0
  });

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    setLoading(true);
    try {
      const leaves = await leaveService.getLeavesByUser(user.id);
      setMyLeaves(leaves);

      setStats({
        totalLeaves: leaves.length,
        pendingLeaves: leaves.filter(l => l.status === 'pending').length,
        approvedLeaves: leaves.filter(l => l.status === 'approved').length,
        rejectedLeaves: leaves.filter(l => l.status === 'rejected').length
      });

    } catch (error) {
      toast.error('Failed to fetch your leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (leaveData) => {
    try {
      await leaveService.applyLeave({
        ...leaveData,
        userId: user.id,
        userName: user.name,
        department: user.department
      });
      
      toast.success('Leave applied successfully!');
      await refreshUser();
      fetchMyLeaves();
      setShowApplyModal(false);
    } catch (error) {
      toast.error(error.message || 'Failed to apply leave');
    }
  };

  const handleCancelLeave = async (leaveId, leaveType, days) => {
    if (window.confirm('Are you sure you want to cancel this leave request?')) {
      try {
        await leaveService.cancelLeave(leaveId, user.id, leaveType, days);
        toast.success('Leave cancelled successfully');
        await refreshUser();
        fetchMyLeaves();
      } catch (error) {
        toast.error('Failed to cancel leave');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <EmployeeSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex items-center justify-center pt-14 md:pt-0">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <EmployeeSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-14 md:pt-0 md:ml-64">
        {/* Desktop Header */}
        <header className="hidden md:block bg-white shadow-sm">
          <div className="flex justify-between items-center px-8 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'my-leaves' && 'My Leave Requests'}
              {activeTab === 'profile' && 'My Profile'}
            </h1>
            
            <div className="flex items-center space-x-4">
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

        {/* Content Area */}
        <div className="p-4 sm:p-6 md:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Leave Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <LeaveBalanceCard
                  type="Sick Leave"
                  used={12 - user?.leaveBalance?.sickLeave}
                  total={12}
                  color="bg-blue-500"
                />
                <LeaveBalanceCard
                  type="Casual Leave"
                  used={10 - user?.leaveBalance?.casualLeave}
                  total={10}
                  color="bg-green-500"
                />
                <LeaveBalanceCard
                  type="Earned Leave"
                  used={15 - user?.leaveBalance?.earnedLeave}
                  total={15}
                  color="bg-purple-500"
                />
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                  <p className="text-xs sm:text-sm text-gray-600">Total Leaves</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-800">{stats.totalLeaves}</p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                  <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                  <p className="text-xl sm:text-3xl font-bold text-yellow-600">{stats.pendingLeaves}</p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                  <p className="text-xs sm:text-sm text-gray-600">Approved</p>
                  <p className="text-xl sm:text-3xl font-bold text-green-600">{stats.approvedLeaves}</p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                  <p className="text-xs sm:text-sm text-gray-600">Rejected</p>
                  <p className="text-xl sm:text-3xl font-bold text-red-600">{stats.rejectedLeaves}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="bg-white p-6 sm:p-8 rounded-lg shadow hover:shadow-lg transition-shadow text-center border-2 border-dashed border-primary-300 hover:border-primary-500"
                >
                  <div className="text-3xl sm:text-5xl mb-4">📝</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Apply for Leave</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">Submit a new leave request</p>
                </button>

                <button
                  onClick={() => setActiveTab('my-leaves')}
                  className="bg-white p-6 sm:p-8 rounded-lg shadow hover:shadow-lg transition-shadow text-center border-2 border-dashed border-gray-300 hover:border-gray-500"
                >
                  <div className="text-3xl sm:text-5xl mb-4">📋</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">View My Leaves</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">Check status of your requests</p>
                </button>
              </div>

              {/* Recent Leaves */}
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Leave Requests</h2>
                <MyLeavesTable 
                  leaves={myLeaves.slice(0, 5)}
                  onCancel={handleCancelLeave}
                  showCancel={true}
                />
              </div>
            </div>
          )}

          {activeTab === 'my-leaves' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold">My Leave History</h2>
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="btn-primary w-full sm:w-auto"
                >
                  + Apply New Leave
                </button>
              </div>
              <MyLeavesTable 
                leaves={myLeaves}
                onCancel={handleCancelLeave}
                showCancel={true}
                showAll={true}
              />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-xl font-semibold mb-6">My Profile</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="w-32 text-gray-600 font-medium">Name:</div>
                  <div className="font-semibold">{user?.name}</div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="w-32 text-gray-600 font-medium">Email:</div>
                  <div className="break-all">{user?.email}</div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="w-32 text-gray-600 font-medium">Department:</div>
                  <div>{user?.department}</div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="w-32 text-gray-600 font-medium">Join Date:</div>
                  <div>{new Date(user?.joinDate).toLocaleDateString()}</div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="w-32 text-gray-600 font-medium">Role:</div>
                  <div className="capitalize">{user?.role}</div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-3">Leave Balance</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">Sick Leave</p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">{user?.leaveBalance?.sickLeave}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">Casual Leave</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">{user?.leaveBalance?.casualLeave}</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">Earned Leave</p>
                      <p className="text-xl sm:text-2xl font-bold text-purple-600">{user?.leaveBalance?.earnedLeave}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <ApplyLeaveModal
          onClose={() => setShowApplyModal(false)}
          onSubmit={handleApplyLeave}
          leaveBalance={user?.leaveBalance}
        />
      )}
    </div>
  );
};

export default EmployeeDashboard;