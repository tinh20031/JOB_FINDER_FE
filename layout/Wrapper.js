'use client'

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoginState } from '../features/auth/authSlice';
import { authService } from '../services/authService';

const Wrapper = ({ children }) => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoggedIn) {
      const token = authService.getToken();
      const role = authService.getRole();
      const userString = localStorage.getItem('user');
      
      if (token && role && userString) {
        try {
          const user = JSON.parse(userString);
          dispatch(setLoginState({ isLoggedIn: true, user, role }));
        } catch (error) {
          console.error("Failed to parse user from localStorage", error);
        }
      }
    }
  }, [dispatch, isLoggedIn]);

  return <>{children}</>;
};

export default Wrapper;
