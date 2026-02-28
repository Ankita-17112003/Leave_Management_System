import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: {
      container: 'w-8 h-8',
      border: 'border-2',
      text: 'text-xs'
    },
    md: {
      container: 'w-16 h-16',
      border: 'border-4',
      text: 'text-sm'
    },
    lg: {
      container: 'w-24 h-24',
      border: 'border-4',
      text: 'text-base'
    }
  };

  const selectedSize = sizes[size] || sizes.md;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <div 
          className={`${selectedSize.container} ${selectedSize.border} border-primary-200 rounded-full`}
        ></div>
        <div 
          className={`absolute top-0 left-0 ${selectedSize.container} ${selectedSize.border} border-primary-600 border-t-transparent rounded-full animate-spin`}
        ></div>
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <p className={`${selectedSize.text} text-gray-600`}>{text}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;