import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import MobileMenu from '../common/MobileMenu';

const EmployeeSidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'my-leaves', label: 'My Leaves', icon: '📋' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <>
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block w-64 bg-gray-900 text-white fixed h-full z-10">
        {/* Logo */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary-400">LeaveMS</h2>
          <p className="text-xs text-gray-400 mt-1">Employee Portal</p>
        </div>

        {/* Menu Items */}
        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-64 p-6">
          <button
            onClick={logout}
            className="w-full flex items-center text-gray-300 hover:text-white"
          >
            <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
          <p className="text-xs text-gray-500 mt-4">Version 1.0.0</p>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-30 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="text-gray-600 hover:text-gray-900"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-primary-600">LeaveMS</h2>
        <div className="w-6"></div> {/* Spacer */}
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        menuItems={menuItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        logout={logout}
      />
    </>
  );
};

export default EmployeeSidebar;