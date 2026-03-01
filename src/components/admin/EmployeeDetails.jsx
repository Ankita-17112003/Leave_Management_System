import React from 'react';

const EmployeeDetails = ({ employee, onClose }) => {
  const joinDate = employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : 'N/A';
  const employeeId = employee.id || 'N/A';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2">
      <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Employee Profile</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Profile Card */}
        <div className="p-4">
          <div className="flex items-start space-x-4">
            {/* Profile Image - Small */}
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-2xl font-bold text-white">
                {employee.name ? employee.name.charAt(0).toUpperCase() : '?'}
              </span>
            </div>

            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-800 truncate">{employee.name}</h3>
              <p className="text-xs text-primary-600 capitalize mb-2">{employee.role}</p>
              
              {/* ID Badge */}
              <div className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                ID: {employeeId}
              </div>
            </div>
          </div>

          {/* Details Grid - Compact */}
          <div className="mt-4 space-y-2">
            {/* Email */}
            <div className="flex items-center text-sm">
              <div className="w-6 h-6 bg-primary-50 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                <svg className="h-3 w-3 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-gray-600 text-xs truncate">{employee.email}</span>
            </div>

            {/* Department */}
            <div className="flex items-center text-sm">
              <div className="w-6 h-6 bg-primary-50 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                <svg className="h-3 w-3 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                </svg>
              </div>
              <span className="text-gray-600 text-xs">{employee.department}</span>
            </div>

            {/* Join Date */}
            <div className="flex items-center text-sm">
              <div className="w-6 h-6 bg-primary-50 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                <svg className="h-3 w-3 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-gray-600 text-xs">{joinDate}</span>
            </div>
          </div>

          {/* Leave Balance - Compact */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Leave Balance</h4>
            <div className="grid grid-cols-3 gap-1">
              <div className="text-center bg-blue-50 rounded-lg p-1.5">
                <p className="text-[10px] text-blue-600 font-medium">Sick</p>
                <p className="text-sm font-bold text-blue-700">{employee.leaveBalance?.sickLeave || 0}</p>
              </div>
              <div className="text-center bg-green-50 rounded-lg p-1.5">
                <p className="text-[10px] text-green-600 font-medium">Casual</p>
                <p className="text-sm font-bold text-green-700">{employee.leaveBalance?.casualLeave || 0}</p>
              </div>
              <div className="text-center bg-purple-50 rounded-lg p-1.5">
                <p className="text-[10px] text-purple-600 font-medium">Earned</p>
                <p className="text-sm font-bold text-purple-700">{employee.leaveBalance?.earnedLeave || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;