// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'https://localhost:7084/api'; // Your backend URL

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const username = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole');
    
    if (token && username) {
      setUser({
        username,
        role: userRole,
        token
      });
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE}/Auth/login`, {
        username,
        password
      }, {
        timeout: 10000
      });

      const { token, username: responseUsername, role } = response.data;
      
      // Store in localStorage (matching your existing approach)
      localStorage.setItem('jwtToken', token);
      localStorage.setItem('username', responseUsername);
      localStorage.setItem('userRole', role);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const userData = { username: responseUsername, role, token };
      setUser(userData);
      
      toast.success(`Welcome ${responseUsername}!`);
      return { success: true, user: userData };
    } catch (error) {
      let errorMessage = 'Login failed';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Invalid username or password';
        } else {
          errorMessage = error.response.data || 'Unknown error';
        }
      } else if (error.request) {
        errorMessage = 'Cannot connect to backend server';
      } else {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.info('Logged out successfully');
  };

  const value = {
    user,
    login,
    logout,
    API_BASE
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}