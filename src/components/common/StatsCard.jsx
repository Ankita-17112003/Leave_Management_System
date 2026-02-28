import React from 'react';

const StatsCard = ({ title, value, icon, color, change }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{value}</p>
          {change && (
            <p className="text-xs text-gray-500 mt-2">{change}</p>
          )}
        </div>
        <div className={`${color} w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;