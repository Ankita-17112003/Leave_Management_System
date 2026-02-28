import React from "react";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gray-100 px-4 py-8">
      <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0">
        <h1 className="text-3xl md:text-5xl font-bold mb-6 text-gray-800">
          Welcome to{" "}
          <span className="text-blue-600">Leave Management System</span>
        </h1>

        <p className="text-gray-600 text-base md:text-lg mb-6">
          Efficiently manage employee leave requests, approvals, and records in a
          secure and transparent platform.
        </p>

        <ul className="list-none space-y-2 text-gray-700">
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✔</span> Easy Leave Application
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✔</span> Manager Approval Workflow
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✔</span> Real-time Leave Tracking
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✔</span> Secure & Reliable System
          </li>
        </ul>
      </div>

      {/* Right Side: Login Form */}
      <div className="md:w-1/2 bg-white rounded-lg shadow p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Login
        </h2>

        <form className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-600">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;