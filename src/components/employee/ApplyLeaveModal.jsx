import React, { useState } from 'react';

const ApplyLeaveModal = ({ onClose, onSubmit, leaveBalance }) => {
  const [formData, setFormData] = useState({
    leaveType: 'sickLeave',
    fromDate: '',
    toDate: '',
    reason: ''
  });
  
  const [errors, setErrors] = useState({});
  const [calculatedDays, setCalculatedDays] = useState(0);

  const leaveTypes = [
    { id: 'sickLeave', name: 'Sick Leave', balance: leaveBalance?.sickLeave || 0 },
    { id: 'casualLeave', name: 'Casual Leave', balance: leaveBalance?.casualLeave || 0 },
    { id: 'earnedLeave', name: 'Earned Leave', balance: leaveBalance?.earnedLeave || 0 },
  ];

  const calculateDays = (from, to) => {
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      const diffTime = Math.abs(toDate - fromDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setCalculatedDays(diffDays);
      return diffDays;
    }
    return 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      if (name === 'fromDate' || name === 'toDate') {
        calculateDays(
          name === 'fromDate' ? value : prev.fromDate,
          name === 'toDate' ? value : prev.toDate
        );
      }
      
      return newData;
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.leaveType) {
      newErrors.leaveType = 'Please select leave type';
    }

    if (!formData.fromDate) {
      newErrors.fromDate = 'Start date is required';
    }

    if (!formData.toDate) {
      newErrors.toDate = 'End date is required';
    }

    if (formData.fromDate && formData.toDate) {
      const fromDate = new Date(formData.fromDate);
      const toDate = new Date(formData.toDate);
      
      if (toDate < fromDate) {
        newErrors.toDate = 'End date cannot be before start date';
      }

      const selectedLeave = leaveTypes.find(l => l.id === formData.leaveType);
      if (selectedLeave && calculatedDays > selectedLeave.balance) {
        newErrors.leaveType = `Insufficient balance. You have only ${selectedLeave.balance} days left`;
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason';
    } else if (formData.reason.length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        days: calculatedDays
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Apply for Leave</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type *
            </label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              className={`input-field ${errors.leaveType ? 'border-red-500' : ''}`}
            >
              {leaveTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.balance} days left)
                </option>
              ))}
            </select>
            {errors.leaveType && (
              <p className="mt-1 text-xs text-red-500">{errors.leaveType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date *
            </label>
            <input
              type="date"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={`input-field ${errors.fromDate ? 'border-red-500' : ''}`}
            />
            {errors.fromDate && (
              <p className="mt-1 text-xs text-red-500">{errors.fromDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date *
            </label>
            <input
              type="date"
              name="toDate"
              value={formData.toDate}
              onChange={handleChange}
              min={formData.fromDate || new Date().toISOString().split('T')[0]}
              className={`input-field ${errors.toDate ? 'border-red-500' : ''}`}
            />
            {errors.toDate && (
              <p className="mt-1 text-xs text-red-500">{errors.toDate}</p>
            )}
          </div>

          {calculatedDays > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                Total Days: <span className="font-bold">{calculatedDays}</span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="4"
              className={`input-field ${errors.reason ? 'border-red-500' : ''}`}
              placeholder="Please provide reason for leave..."
            ></textarea>
            {errors.reason && (
              <p className="mt-1 text-xs text-red-500">{errors.reason}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.reason.length} / 10 minimum characters
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto"
            >
              Apply for Leave
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeaveModal;