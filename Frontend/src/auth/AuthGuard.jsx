import React, { useEffect } from 'react';
import config from "../config";
import { useNavigate } from 'react-router-dom';
import { apiRequest } from './ApiRequest';

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest(`${import.meta.env.VITE_SERVER_URL}/users/`, {
          method: 'GET'
        });

        if (response.status === 401 || response.status === 403) {
          navigate('/login'); // Reindirizza alla login
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        navigate('/login'); // Reindirizza alla login
      }
    };

    checkAuth();
  }, [navigate]);

  return <>{children}</>;
};

export default AuthGuard;