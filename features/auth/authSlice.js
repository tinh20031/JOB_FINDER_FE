import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
  isLoggedIn: false,
  user: null, // Có thể lưu thông tin user ở đây nếu API trả về
  role: null,
  userId: null, // Add userId to the initial state
  token: null, // Thêm token vào state
  profileUpdated: 0, // Thêm biến trigger cập nhật profile
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoginState: (state, action) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      const user = action.payload.user || {}; // Use 'user' for clarity
      const userAvatar =
        user.image || user.avatar || "/images/resource/candidate-1.png";

      state.user = {
        ...user,
        image: userAvatar,
        avatar: userAvatar,
      };

      // Standardize userId extraction
      state.userId = user.id || user.userId || user.sub || user.nameid || null;
      state.role = action.payload.role || null;
      state.token = action.payload.token || null; // Lưu token vào Redux
    },
    clearLoginState: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.role = null;
      state.userId = null; // Clear userId on logout
      state.token = null; // Xóa token khi logout
    },
    setProfileUpdated: (state, action) => {
      state.profileUpdated = action.payload;
    },
  },
});

export const { setLoginState, clearLoginState, setProfileUpdated } =
  authSlice.actions;
export default authSlice.reducer;
