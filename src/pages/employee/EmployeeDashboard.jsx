import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService, leaveService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import EmployeeSidebar from '../../components/employee/EmployeeSidebar';
import LeaveBalanceCard from '../../components/employee/LeaveBalanceCard';
import MyLeavesTable from '../../components/employee/MyLeavesTable';
import ApplyLeaveModal from '../../components/employee/ApplyLeaveModal';
import ProfileSection from '../../components/employee/ProfileSection';

const EmployeeDashboard = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [myLeaves, setMyLeaves] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [stats, setStats] = useState({
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    cancelledLeaves: 0,
    totalDaysUsed: 0
  });

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshUser();
      fetchMyLeaves(false);
      setLastUpdated(Date.now());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab became visible, refreshing data...');
        refreshUser();
        fetchMyLeaves(false);
        setLastUpdated(Date.now());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      console.log('✨ Window focused, refreshing data...');
      refreshUser();
      fetchMyLeaves(false);
      setLastUpdated(Date.now());
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchMyLeaves = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      
      const leaves = await leaveService.getLeavesByUser(user.id);
      setMyLeaves(leaves);

      await userService.recalculateUserBalance(user.id);
      await refreshUser();

      const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
      const approvedLeaves = leaves.filter(l => l.status === 'approved').length;
      const rejectedLeaves = leaves.filter(l => l.status === 'rejected').length;
      const cancelledLeaves = leaves.filter(l => l.status === 'cancelled').length;
      
      const totalDaysUsed = leaves
        .filter(l => l.status === 'approved')
        .reduce((sum, leave) => sum + (leave.days || 1), 0);

      const newStats = {
        totalLeaves: leaves.length,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
        cancelledLeaves,
        totalDaysUsed
      };

      setStats(newStats);

    } catch (error) {
      console.error('❌ Failed to fetch leaves:', error);
      if (showLoading) toast.error('Failed to fetch your leaves');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleApplyLeave = async (leaveData) => {
    try {
      const loadingToast = toast.loading('Applying for leave...');
      
      await leaveService.applyLeave({
        ...leaveData,
        userId: user.id,
        userName: user.name,
        department: user.department
      });
      
      toast.dismiss(loadingToast);
      toast.success('Leave applied successfully!');
      
      await refreshUser();
      await fetchMyLeaves();
      setLastUpdated(Date.now());
      setShowApplyModal(false);
      
    } catch (error) {
      toast.error(error.message || 'Failed to apply leave');
    }
  };

  const handleCancelLeave = async (leaveId, leaveType, days) => {
    if (window.confirm('Are you sure you want to cancel this leave request?')) {
      try {
        const loadingToast = toast.loading('Cancelling leave...');
        
        await leaveService.cancelLeave(leaveId, user.id, leaveType, days);
        
        toast.dismiss(loadingToast);
        toast.success('Leave cancelled successfully');
        
        await refreshUser();
        await fetchMyLeaves();
        setLastUpdated(Date.now());
        
      } catch (error) {
        toast.error('Failed to cancel leave');
      }
    }
  };

  const handleManualRefresh = async () => {
    const loadingToast = toast.loading('Refreshing data...');
    await refreshUser();
    await fetchMyLeaves(false);
    toast.dismiss(loadingToast);
    toast.success('Data refreshed!');
    setLastUpdated(Date.now());
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sickBalance = user?.leaveBalance?.sickLeave ?? 12;
  const casualBalance = user?.leaveBalance?.casualLeave ?? 10;
  const earnedBalance = user?.leaveBalance?.earnedLeave ?? 15;

  const sickUsed = 12 - sickBalance;
  const casualUsed = 10 - casualBalance;
  const earnedUsed = 15 - earnedBalance;

  const sickPercentage = (sickUsed / 12) * 100;
  const casualPercentage = (casualUsed / 10) * 100;
  const earnedPercentage = (earnedUsed / 15) * 100;

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

      <div className="flex-1 overflow-auto pt-14 md:pt-0 md:ml-64">
        <header className="hidden md:block bg-white shadow-sm">
          <div className="flex justify-between items-center px-8 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'my-leaves' && 'My Leave Requests'}
                {activeTab === 'profile' && 'My Profile'}
              </h1>
             
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleManualRefresh}
                className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Now
              </button>
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
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <LeaveBalanceCard
                  type="Sick Leave"
                  used={sickUsed}
                  remaining={sickBalance}
                  total={12}
                  percentage={sickPercentage}
                  color="bg-blue-500"
                />
                <LeaveBalanceCard
                  type="Casual Leave"
                  used={casualUsed}
                  remaining={casualBalance}
                  total={10}
                  percentage={casualPercentage}
                  color="bg-green-500"
                />
                <LeaveBalanceCard
                  type="Earned Leave"
                  used={earnedUsed}
                  remaining={earnedBalance}
                  total={15}
                  percentage={earnedPercentage}
                  color="bg-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                  <p className="text-xs sm:text-sm text-gray-600">Total Leaves</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-800">{stats.totalLeaves}</p>
                  <p className="text-xs text-gray-500 mt-1">All requests</p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                  <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                  <p className="text-xl sm:text-3xl font-bold text-yellow-600">{stats.pendingLeaves}</p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                  <p className="text-xs sm:text-sm text-gray-600">Approved</p>
                  <p className="text-xl sm:text-3xl font-bold text-green-600">{stats.approvedLeaves}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.totalDaysUsed} days used</p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                  <p className="text-xs sm:text-sm text-gray-600">Rejected</p>
                  <p className="text-xl sm:text-3xl font-bold text-red-600">{stats.rejectedLeaves}</p>
                  <p className="text-xs text-gray-500 mt-1">Not approved</p>
                </div>
              </div>

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

              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Recent Leave Requests</h2>
                  
                </div>
                <MyLeavesTable 
                  leaves={myLeaves.slice(0, 5)}
                  onCancel={handleCancelLeave}
                  showCancel={true}
                />
                {/* {stats.totalLeaves === 0 && (
                  <p className="text-center text-gray-500 py-4">No leave requests yet.</p>
                )} */}
              </div>
            </div>
          )}

          {activeTab === 'my-leaves' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 sm:p-6 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">My Leave History</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Total: {stats.totalLeaves} 
                    </p>
                  </div>
                  <div className="flex gap-2">
                   
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="btn-primary"
                    >
                      + Apply New Leave
                    </button>
                  </div>
                </div>
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
             <ProfileSection />
          )}
        </div>
      </div>

      {showApplyModal && (
        <ApplyLeaveModal
          onClose={() => setShowApplyModal(false)}
          onSubmit={handleApplyLeave}
          leaveBalance={{
            sickLeave: sickBalance,
            casualLeave: casualBalance,
            earnedLeave: earnedBalance
          }}
        />
      )}
    </div>
  );
};

export default EmployeeDashboard;