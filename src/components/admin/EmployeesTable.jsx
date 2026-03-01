import React, { useState } from 'react';
import { userService } from '../../services/api';
import toast from 'react-hot-toast';
import AddEmployeeModal from './AddEmployeeModal';

const EmployeesTable = ({ employees, onRefresh, onEmployeeClick }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDeleteEmployee = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await userService.deleteUser(id);
        toast.success('Employee deleted successfully');
        onRefresh();
      } catch (error) {
        toast.error('Failed to delete employee');
      }
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary w-full sm:w-auto flex items-center justify-center"
        >
          <span className="text-xl mr-2">+</span>
          Add Employee
        </button>
      </div>

      {/* Employees Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Name</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Department</th>
                  <th className="table-header">Join Date</th>
                  <th className="table-header">Leave Balance</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                      
                        <div>
                          {/* Clickable Employee Name */}
                          <button
                            onClick={() => onEmployeeClick(emp)}
                            className="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline text-left"
                          >
                            {emp.name}
                          </button>
                          {/* <p className="text-xs text-gray-500">ID: {emp.id}</p> */}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.email}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.department}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(emp.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">S:{emp.leaveBalance?.sickLeave || 0}</span>
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">C:{emp.leaveBalance?.casualLeave || 0}</span>
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full">E:{emp.leaveBalance?.earnedLeave || 0}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
};

export default EmployeesTable;