import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfileSection = () => {
  const { user } = useAuth();

  const sickBalance = user?.leaveBalance?.sickLeave || 12;
  const casualBalance = user?.leaveBalance?.casualLeave || 10;
  const earnedBalance = user?.leaveBalance?.earnedLeave || 15;

  const sickUsed = 12 - sickBalance;
  const casualUsed = 10 - casualBalance;
  const earnedUsed = 15 - earnedBalance;

  const joinDate = user?.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Cover Image */}
        <div className="h-20 sm:h-24 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400"></div>
        
        {/* Profile Info */}
        <div className="relative px-4 sm:px-6 pb-4 sm:pb-6">
          {/* Avatar */}
          <div className="relative -mt-10 sm:-mt-12 mb-3 sm:mb-4 flex justify-center sm:justify-start">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg ring-4 ring-white">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
                </span>
              </div>
              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
          </div>

          {/* Name and Role */}
          <div className="text-center sm:text-left">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-primary-600 font-medium text-sm sm:text-base capitalize">{user?.role}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{user?.department} Department</p>
          </div>

          {/* Quick Info Pills */}
          <div className="flex flex-wrap gap-2 mt-3 sm:mt-4 justify-center sm:justify-start">
            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {user?.email}
            </span>
            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs">
              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              ID: {user?.id}
            </span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Personal Details */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Details
            </h3>
            
            <div className="space-y-3">
              <InfoRow 
                icon="user" 
                label="Full Name" 
                value={user?.name} 
              />
              <InfoRow 
                icon="mail" 
                label="Email Address" 
                value={user?.email} 
              />
              <InfoRow 
                icon="building" 
                label="Department" 
                value={user?.department} 
              />
              <InfoRow 
                icon="calendar" 
                label="Join Date" 
                value={joinDate} 
              />
              <InfoRow 
                icon="id" 
                label="Employee ID" 
                value={user?.id} 
              />
            </div>
          </div>

          {/* Role & Status Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Role & Status
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="text-xs sm:text-sm text-gray-600">Role</span>
                <span className="px-2 py-1 bg-primary-100 text-primary-600 rounded-full text-xs font-medium capitalize">
                  {user?.role}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="text-xs sm:text-sm text-gray-600">Status</span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-xs font-medium text-green-600">Active</span>
                </span>
              </div>

              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="text-xs sm:text-sm text-gray-600">Member Since</span>
                <span className="text-xs font-medium text-gray-800">
                  {new Date(user?.joinDate).getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Leave Balance & Activity */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Leave Balance Cards */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Leave Balance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Sick Leave Card */}
              <LeaveCard
                title="Sick Leave"
                used={sickUsed}
                remaining={sickBalance}
                total={12}
                color="blue"
                icon="clock"
              />

              {/* Casual Leave Card */}
              <LeaveCard
                title="Casual Leave"
                used={casualUsed}
                remaining={casualBalance}
                total={10}
                color="green"
                icon="calendar"
              />

              {/* Earned Leave Card */}
              <LeaveCard
                title="Earned Leave"
                used={earnedUsed}
                remaining={earnedBalance}
                total={15}
                color="purple"
                icon="star"
              />
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Activity
            </h3>

            <div className="space-y-3">
              <ActivityItem
                status="approved"
                text="Leave request approved for 2 days"
                time="2 hours ago"
              />
              <ActivityItem
                status="pending"
                text="Leave request pending for review"
                time="1 day ago"
              />
              <ActivityItem
                status="info"
                text="Profile information updated"
                time="3 days ago"
              />
            </div>

            <button className="mt-4 w-full py-2 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-2 border-t border-gray-100 pt-4">
              View All Activity
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <ActionButton icon="plus" label="Apply Leave" color="primary" />
              <ActionButton icon="calendar" label="View Leaves" color="primary" />
              <ActionButton icon="edit" label="Edit Profile" color="primary" />
              <ActionButton icon="settings" label="Settings" color="primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoRow = ({ icon, label, value }) => {
  const icons = {
    user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    building: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16",
    calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    id: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
  };

  return (
    <div className="flex items-center p-2 bg-gray-50 rounded-lg">
      <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
        <svg className="h-3.5 w-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[icon]} />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
};

const LeaveCard = ({ title, used, remaining, total, color, icon }) => {
  const percentage = (used / total) * 100;
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      bar: 'bg-blue-500',
      icon: 'bg-blue-500',
      light: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      bar: 'bg-green-500',
      icon: 'bg-green-500',
      light: 'text-green-600'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      bar: 'bg-purple-500',
      icon: 'bg-purple-500',
      light: 'text-purple-600'
    }
  };

  const icons = {
    clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
  };

  return (
    <div className={`${colors[color].bg} rounded-xl p-3 sm:p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 ${colors[color].icon} rounded-lg flex items-center justify-center`}>
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[icon]} />
          </svg>
        </div>
        <span className={`text-lg sm:text-xl font-bold ${colors[color].text}`}>{remaining}</span>
      </div>
      <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1">{title}</h4>
      <div className="w-full bg-white bg-opacity-50 rounded-full h-1.5 mb-1">
        <div 
          className={`${colors[color].bar} h-1.5 rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className={`text-xs ${colors[color].light}`}>{used} of {total} days used</p>
    </div>
  );
};

const ActivityItem = ({ status, text, time }) => {
  const getStatusStyles = () => {
    switch(status) {
      case 'approved':
        return 'bg-green-100 text-green-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  const getIcon = () => {
    switch(status) {
      case 'approved':
        return "M5 13l4 4L19 7";
      case 'pending':
        return "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z";
      default:
        return "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
    }
  };

  return (
    <div className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusStyles()}`}>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIcon()} />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-gray-800">{text}</p>
        <p className="text-xs text-gray-500 mt-0.5">{time}</p>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label, color }) => {
  const icons = {
    plus: "M12 4v16m8-8H4",
    calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    edit: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
    settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
  };

  return (
    <button className="p-2 sm:p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors text-center group">
      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 mx-auto mb-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[icon]} />
      </svg>
      <span className="text-[10px] sm:text-xs font-medium text-primary-600">{label}</span>
    </button>
  );
};

export default ProfileSection;