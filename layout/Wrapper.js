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
      const user = authService.getStoredUser();
      
      if (token && role && user) {
        dispatch(setLoginState({ isLoggedIn: true, user, role, token }));
      }
    }
  }, [dispatch, isLoggedIn]);

  return <>{children}</>;
};

export default Wrapper;
