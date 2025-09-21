import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token by getting current user
          const response = await userAPI.getCurrentUser();
          setUser(response.data);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login({ email, password });
      
      // Backend returns { data: { user, token } }
      const { user, token } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { user, token };
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(userData);
      
      // Backend returns { data: { user, token } }
      const { user, token } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { user, token };
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  const updateUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.updateProfile(userData);
      
      // Update user data in state and localStorage
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      setError(error.response?.data?.message || 'Profile update failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Role-based helper functions
  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return user && roles.includes(user.role);
  };

  const isAdmin = () => hasRole('BUSINESS_OWNER');
  const isManufacturingManager = () => hasRole('MANUFACTURING_MANAGER');
  const isInventoryManager = () => hasRole('INVENTORY_MANAGER');
  const isOperator = () => hasRole('OPERATOR');

  // Permission checks
  const canAccess = (resource, action) => {
    if (!user) return false;
    
    const permissions = {
      'manufacturing-orders': {
        'create': ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER'],
        'read': ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'INVENTORY_MANAGER'],
        'update': ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER'],
        'delete': ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER']
      },
      'work-orders': {
        'create': ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER'],
        'read': ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'INVENTORY_MANAGER', 'OPERATOR'],
        'update': ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'OPERATOR'],
        'delete': ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER']
      },
      'work-centers': {
        'create': ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER'],
        'read': ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'INVENTORY_MANAGER', 'OPERATOR'],
        'update': ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER'],
        'delete': ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER']
      },
      'stock-ledger': {
        'create': ['BUSINESS_OWNER', 'INVENTORY_MANAGER'],
        'read': ['BUSINESS_OWNER', 'INVENTORY_MANAGER', 'MANUFACTURING_MANAGER'],
        'update': ['BUSINESS_OWNER', 'INVENTORY_MANAGER'],
        'delete': ['BUSINESS_OWNER', 'INVENTORY_MANAGER']
      },
      'boms': {
        'create': ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER'],
        'read': ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'INVENTORY_MANAGER'],
        'update': ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER'],
        'delete': ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER']
      },
      'reports': {
        'all': ['BUSINESS_OWNER'],
        'production': ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER'],
        'stock': ['BUSINESS_OWNER', 'INVENTORY_MANAGER'],
        'personal': ['OPERATOR']
      }
    };

    const resourcePermissions = permissions[resource];
    if (!resourcePermissions) return false;

    const allowedRoles = resourcePermissions[action];
    if (!allowedRoles) return false;

    return allowedRoles.includes(user.role);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    isAuthenticated: !!user,
    // Role-based functions
    hasRole,
    hasAnyRole,
    isAdmin,
    isManufacturingManager,
    isInventoryManager,
    isOperator,
    canAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
