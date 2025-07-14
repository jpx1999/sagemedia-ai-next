import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isLoggedIn: false,
  user: null,
  token: null,
  refreshToken: null,
  role: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isLoggedIn = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.refreshToken = action.payload.refreshToken
      state.role = action.payload.role
    },
    logout: (state) => {
      state.isLoggedIn = false
      state.user = null
      state.token = null
      state.refreshToken = null
      state.role = null
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authData')
        localStorage.removeItem('role')
      }
    },
    updateTokens: (state, action) => {
      state.token = action.payload.token
      state.refreshToken = action.payload.refreshToken
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
    },
    setRole: (state, action) => {
      state.role = action.payload
    }
  },
})

export const { 
  loginSuccess, 
  logout, 
  updateTokens, 
  updateUser, 
  setRole 
} = authSlice.actions

export default authSlice.reducer 