import React from 'react';

const DepartmentChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Department Distribution</h2>
        <p className="text-gray-500 text-center py-8">No department data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4">Department Distribution</h2>
      
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = ((item.count / total) * 100).toFixed(1);
          return (
            <div key={item.department}>
              <div className="flex justify-between text-xs sm:text-sm mb-1">
                <span className="font-medium">{item.department}</span>
                <span className="text-gray-600">
                  {item.count} employees ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                <div 
                  className={`${colors[index % colors.length]} h-2 sm:h-2.5 rounded-full transition-all duration-500`} 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}

        <div className="mt-6 pt-4 border-t">
          <p className="text-xs sm:text-sm text-gray-600">
            Total Employees: <span className="font-bold text-gray-900">{total}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DepartmentChart;