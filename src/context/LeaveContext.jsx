import React, { createContext, useContext, useState, useEffect } from 'react';
import { leaveService } from '../services/api';

const LeaveContext = createContext();

export const useLeaves = () => {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error('useLeaves must be used within LeaveProvider');
  }
  return context;
};

export const LeaveProvider = ({ children, userId }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Fetch leaves from db.json
  const fetchLeaves = async () => {
    try {
      if (userId) {
        const data = await leaveService.getLeavesByUser(userId);
        setLeaves(data);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLeaves();
  }, [userId]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing leaves from db.json...');
      fetchLeaves();
      setLastUpdate(Date.now());
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [userId]);

  // Manual refresh function
  const refreshLeaves = async () => {
    await fetchLeaves();
    setLastUpdate(Date.now());
  };

  const value = {
    leaves,
    loading,
    lastUpdate,
    refreshLeaves,
    setLeaves // Direct set for immediate updates
  };

  return (
    <LeaveContext.Provider value={value}>
      {children}
    </LeaveContext.Provider>
  );
};