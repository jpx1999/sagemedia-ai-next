import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  dashboardData: null,
  loading: false,
  error: null,
  selectedUserDetails: null,
  loadingUserDetails: false,
  currentPlanFilter: null,
  pagination: {
    currentPage: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  },
};

export const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDashboardData: (state, action) => {
      state.dashboardData = action.payload;
      state.error = null;
      // Update pagination info from API response
      if (action.payload?.pagination) {
        state.pagination.totalItems = action.payload.pagination.totalUserCount;
        state.pagination.totalPages = Math.ceil(
          action.payload.pagination.totalUserCount / state.pagination.limit
        );
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedUserDetails: (state, action) => {
      state.selectedUserDetails = action.payload;
    },
    setLoadingUserDetails: (state, action) => {
      state.loadingUserDetails = action.payload;
    },
    clearSelectedUserDetails: (state) => {
      state.selectedUserDetails = null;
      state.loadingUserDetails = false;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setPageSize: (state, action) => {
      state.pagination.limit = action.payload;
      state.pagination.currentPage = 1; // Reset to first page when changing page size
      state.pagination.totalPages = Math.ceil(
        state.pagination.totalItems / action.payload
      );
    },
    setCurrentPlanFilter: (state, action) => {
      state.currentPlanFilter = action.payload;
    },
    clearCurrentPlanFilter: (state) => {
      state.currentPlanFilter = null;
    },
  },
});

export const {
  setLoading,
  setDashboardData,
  setError,
  setSelectedUserDetails,
  setLoadingUserDetails,
  clearSelectedUserDetails,
  setCurrentPage,
  setPageSize,
  setCurrentPlanFilter,
  clearCurrentPlanFilter,
} = adminDashboardSlice.actions;

export default adminDashboardSlice.reducer;
