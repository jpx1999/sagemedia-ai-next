import { createSlice } from "@reduxjs/toolkit";

// Initialize state from localStorage if available
const getInitialState = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return {
      isLoggedIn: false,
      user: null,
      token: null,
      refreshToken: null,
      role: null,
    };
  }

  const authData = localStorage.getItem("authData");
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const role = localStorage.getItem("role");

  try {
    const parsedAuthData = authData ? JSON.parse(authData) : null;

    return {
      isLoggedIn: parsedAuthData?.isLoggedIn || false,
      user: parsedAuthData?.user || null,
      token: accessToken || null,
      refreshToken: refreshToken || null,
      role: role || null,
    };
  } catch (error) {
    console.error("Error parsing auth data:", error);
    return {
      isLoggedIn: false,
      user: null,
      token: null,
      refreshToken: null,
      role: null,
    };
  }
};

export const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    loginSuccess: (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.role = action.payload.role;
    },
    updateTokens: (state, action) => {
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
    logout: (state) => {
      // Clear Redux state
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;

      // Clear localStorage (only in browser environment)
      if (typeof window !== 'undefined') {
        localStorage.removeItem("authData");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    },
  },
});

export const { loginSuccess, updateTokens, logout } = authSlice.actions;
export default authSlice.reducer;
