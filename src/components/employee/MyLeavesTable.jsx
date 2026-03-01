import React, { useState } from 'react';

const MyLeavesTable = ({ leaves, onCancel, showCancel = false, showAll = false }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return (
          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateMobile = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter leaves based on status
  const filteredLeaves = leaves.filter(leave => {
    if (filterStatus === 'all') return true;
    return leave.status === filterStatus;
  });

  // Sort leaves
  const sortedLeaves = [...filteredLeaves].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.appliedDate) - new Date(a.appliedDate);
    }
    if (sortBy === 'type') {
      return a.leaveType.localeCompare(b.leaveType);
    }
    return 0;
  });

  const displayLeaves = showAll ? sortedLeaves : sortedLeaves.slice(0, 5);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Status filter options with proper styling
  const statusOptions = [
    { value: 'all', label: 'All', bg: 'bg-gray-500', lightBg: 'bg-gray-100', text: 'text-gray-700' },
    { value: 'pending', label: 'Pending', bg: 'bg-yellow-500', lightBg: 'bg-yellow-100', text: 'text-yellow-700' },
    { value: 'approved', label: 'Approved', bg: 'bg-green-500', lightBg: 'bg-green-100', text: 'text-green-700' },
    { value: 'rejected', label: 'Rejected', bg: 'bg-red-500', lightBg: 'bg-red-100', text: 'text-red-700' },
    { value: 'cancelled', label: 'Cancelled', bg: 'bg-gray-500', lightBg: 'bg-gray-100', text: 'text-gray-700' }
  ];

  return (
    <div className="w-full">
      {/* Mobile Filter Bar - FIXED BUTTON STYLING */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 px-1">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {statusOptions.map((option) => {
            const isActive = filterStatus === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setFilterStatus(option.value)}
                className={`
                  px-4 py-2 text-xs  font-medium rounded-full whitespace-nowrap transition-all
                  ${isActive 
                    ? `${option.bg} text-white shadow-md` 
                    : `${option.lightBg} ${option.text} hover:${option.lightBg} border border-gray-200`
                  }
                `}
              >
                {option.label}
                {option.value !== 'all' && (
                  <span className={`
                    ml-2 px-2 py-0.5 rounded-full text-xs
                    ${isActive ? 'bg-white bg-opacity-20 text-white' : 'bg-white text-gray-600'}
                  `}>
                    {leaves.filter(l => l.status === option.value).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border rounded-lg px-4 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-primary-500 w-full sm:w-auto"
        >
          <option value="date">Sort by Date</option>
          <option value="type">Sort by Type</option>
        </select>
      </div>

      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden sm:block overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow-lg ring-1 ring-black ring-opacity-5 rounded-xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">From</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">To</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Days</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applied On</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  {showCancel && <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {displayLeaves.length > 0 ? (
                  displayLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            leave.leaveType === 'sickLeave' ? 'bg-blue-500' :
                            leave.leaveType === 'casualLeave' ? 'bg-green-500' : 'bg-purple-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {leave.leaveType.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(leave.fromDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(leave.toDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {leave.days || 1} day{leave.days !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm text-gray-600 truncate" title={leave.reason}>{leave.reason}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(leave.appliedDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                          {getStatusIcon(leave.status)}
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </td>
                      {showCancel && leave.status === 'pending' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => onCancel(leave.id, leave.leaveType, leave.days)}
                            className="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                          </button>
                        </td>
                      )}
                      {showCancel && leave.status !== 'pending' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {leave.status === 'approved' ? '✓ Approved' : 
                           leave.status === 'rejected' ? '✗ Rejected' : 
                           '✗ Cancelled'}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={showCancel ? 8 : 7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 font-medium">No leave requests found</p>
                        <p className="text-sm text-gray-400 mt-1">Apply for a leave to see it here</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Card View - Shown only on mobile */}
      <div className="sm:hidden space-y-3">
        {displayLeaves.length > 0 ? (
          displayLeaves.map((leave) => (
            <div
              key={leave.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
            >
              {/* Card Header - Always Visible */}
              <div
                className="p-4 cursor-pointer active:bg-gray-50 transition-colors"
                onClick={() => toggleRow(leave.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      leave.leaveType === 'sickLeave' ? 'bg-blue-500' :
                      leave.leaveType === 'casualLeave' ? 'bg-green-500' : 'bg-purple-500'
                    }`}></div>
                    <h3 className="font-semibold text-gray-800 capitalize">
                      {leave.leaveType.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                    {getStatusIcon(leave.status)}
                    {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-gray-600">
                      <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDateMobile(leave.fromDate)}</span>
                    </div>
                    <span className="text-gray-400">→</span>
                    <div className="flex items-center text-gray-600">
                      <span>{formatDateMobile(leave.toDate)}</span>
                    </div>
                  </div>
                  <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                    {leave.days || 1}d
                  </span>
                </div>

                {/* Expand/Collapse Icon */}
                <div className="flex justify-center mt-2">
                  <svg
                    className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${expandedRow === leave.id ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedRow === leave.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3 animate-slideDown">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Reason</p>
                    <p className="text-sm text-gray-800">{leave.reason}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Applied: {formatDate(leave.appliedDate)}
                    </div>
                    
                    {showCancel && leave.status === 'pending' && (
                      <button
                        onClick={() => onCancel(leave.id, leave.leaveType, leave.days)}
                        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 font-medium">No leave requests found</p>
            <p className="text-sm text-gray-400 mt-1">Apply for a leave to see it here</p>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {displayLeaves.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-4">
          <span>Showing {displayLeaves.length} of {leaves.length} requests</span>
          {!showAll && leaves.length > 5 && (
            <button className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyLeavesTable;