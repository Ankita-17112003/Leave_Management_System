import React, { useEffect, useState } from 'react';

const LeaveBalanceCard = ({ type, used, remaining, total, percentage, color }) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">{type}</h3>
      
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs sm:text-sm text-gray-600">
          Used: <span className="font-semibold">{used} days</span>
        </span>
        <span className="text-xs sm:text-sm text-gray-600">
          Remaining: <span className="font-semibold">{remaining} days</span>
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 mb-2">
        <div 
          className={`${color} h-2 sm:h-2.5 rounded-full transition-all duration-700 ease-in-out`}
          style={{ width: `${animatedPercentage}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-xs sm:text-sm">
        <span className="text-gray-500">Total: {total} days</span>
        <span className="font-medium">
          {remaining > 0 ? (
            <span className="text-green-600">{remaining} left</span>
          ) : (
            <span className="text-red-600">No leaves left</span>
          )}
        </span>
      </div>
    </div>
  );
};

export default LeaveBalanceCard;