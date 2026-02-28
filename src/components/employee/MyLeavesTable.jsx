import React from 'react';

const MyLeavesTable = ({ leaves, onCancel, showCancel = false, showAll = false }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const displayLeaves = showAll ? leaves : leaves.slice(0, 5);

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Leave Type</th>
                <th className="table-header">From</th>
                <th className="table-header">To</th>
                <th className="table-header">Days</th>
                <th className="table-header">Reason</th>
                <th className="table-header">Applied On</th>
                <th className="table-header">Status</th>
                {showCancel && <th className="table-header">Action</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayLeaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    {leave.leaveType.replace(/([A-Z])/g, ' $1').trim()}
                  </td>
                  <td className="table-cell">{formatDate(leave.fromDate)}</td>
                  <td className="table-cell">{formatDate(leave.toDate)}</td>
                  <td className="table-cell">
                    {leave.days || 
                      Math.ceil((new Date(leave.toDate) - new Date(leave.fromDate)) / (1000 * 60 * 60 * 24)) + 1
                    }
                  </td>
                  <td className="table-cell max-w-xs truncate">{leave.reason}</td>
                  <td className="table-cell">{formatDate(leave.appliedDate)}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(leave.status)}`}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </td>
                  {showCancel && leave.status === 'pending' && (
                    <td className="table-cell">
                      <button
                        onClick={() => onCancel(leave.id, leave.leaveType, leave.days)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </td>
                  )}
                  {showCancel && leave.status !== 'pending' && (
                    <td className="table-cell text-gray-400 text-sm">
                      {leave.status === 'approved' ? '✓ Approved' : 
                       leave.status === 'rejected' ? '✗ Rejected' : 
                       '✗ Cancelled'}
                    </td>
                  )}
                </tr>
              ))}
              {displayLeaves.length === 0 && (
                <tr>
                  <td colSpan={showCancel ? 8 : 7} className="text-center py-8 text-gray-500">
                    No leave requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyLeavesTable;