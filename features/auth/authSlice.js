import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
  isLoggedIn: false,
  user: null, // Có thể lưu thông tin user ở đây nếu API trả về
  role: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoginState: (state, action) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.user = action.payload.userObject || null;
      state.role = action.payload.role || null;
    },
    clearLoginState: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.role = null;
    },
  },
});

export const { setLoginState, clearLoginState } = authSlice.actions;
export default authSlice.reducer; 