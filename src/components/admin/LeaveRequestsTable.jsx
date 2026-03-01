import React from 'react';

const LeaveRequestsTable = ({ leaves, onAction, showActions = true, showAll = false }) => {
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
    <div className="overflow-x-auto -mx-4 sm:mx-0 ps-4 ">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className=" table min-w-full divide-y divide-gray-300  ">
            <thead className="bg-gray-50 " >
              <tr>
                <th className="table-header">Employee</th>
                <th className="table-header">Department</th>
                <th className="table-header">Leave Type</th>
                <th className="table-header">From</th>
                <th className="table-header">To</th>
                <th className="table-header">Days</th>
                <th className="table-header">Reason</th>
                <th className="table-header">Status</th>
                {showActions && <th className="table-header">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayLeaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="font-medium text-gray-900">{leave.userName}</div>
                  </td>
                  <td className="table-cell">{leave.department}</td>
                  <td className="table-cell">
                    {leave.leaveType.replace(/([A-Z])/g, ' $1').trim()}
                  </td>
                  <td className="table-cell">{formatDate(leave.fromDate)}</td>
                  <td className="table-cell">{formatDate(leave.toDate)}</td>
                  <td className="table-cell font-medium">
                    {leave.days || 
                      Math.ceil((new Date(leave.toDate) - new Date(leave.fromDate)) / (1000 * 60 * 60 * 24)) + 1
                    }
                  </td>
                  <td className="table-cell max-w-xs truncate">{leave.reason}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(leave.status)}`}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </td>
                  {showActions && leave.status === 'pending' && (
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onAction(leave.id, 'approve', leave.userId, leave.leaveType, leave.days)}
                          className="text-green-600 hover:text-green-900 font-medium text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onAction(leave.id, 'reject', leave.userId, leave.leaveType, leave.days)}
                          className="text-red-600 hover:text-red-900 font-medium text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  )}
                  {showActions && leave.status !== 'pending' && (
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
                  <td colSpan={showActions ? 9 : 8} className="text-center py-8 text-gray-500">
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

export default LeaveRequestsTable;