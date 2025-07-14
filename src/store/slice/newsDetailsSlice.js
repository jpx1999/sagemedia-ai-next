import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  newsQuery: "",
  chatQuery: "", // ADD THIS: New state for chat queries separate from header search
  activeNewsId: null,
  menuItems: [],
  newHighlightedItems: [],
  isLoadingNewHeadlines: false,
  showNewGroupPopup: false,
  sectorSidebarVisible: false,
  rightSidebarVisible: false, // ADD THIS: New state for right sidebar visibility
  selectedSectors: [],
  sectors: [],
  currentLocation: "",
  locationMenuVisible: false,
  availableRegions: [],
  refreshLoading: false,
  errorResponse: null,
  isLoadingImpacts: false,
  chatVisible: false,
  userSelection: [],
  maxLimit: 10,
  searchCount: 0,
  notificationRefreshTrigger: 0,
};

export const newsDetailsSlice = createSlice({
  name: "newsDetails",
  initialState,
  reducers: {
    setNewsQuery: (state, action) => {
      state.newsQuery = action.payload;
    },
    setChatQuery: (state, action) => {
      // ADD THIS: New reducer for chat queries
      state.chatQuery = action.payload;
    },
    setActiveNewsId: (state, action) => {
      const newId = action.payload;
      state.activeNewsId = newId;
      state.errorResponse = null;
    },
    setMenuItems: (state, action) => {
      state.menuItems = action.payload;
    },
    setNewHighlightedItems: (state, action) => {
      state.newHighlightedItems = action.payload;
    },
    prependNewHighlightedItems: (state, action) => {
      const newItems = action.payload;
      state.newHighlightedItems = newItems.map((item) => item.id);
      state.menuItems = [...newItems, ...state.menuItems];
    },
    clearNewHighlights: (state) => {
      state.newHighlightedItems = [];
    },
    removeHighlightFromItem: (state, action) => {
      const itemId = action.payload;
      state.newHighlightedItems = state.newHighlightedItems.filter(
        (id) => id !== itemId
      );
    },
    setIsLoadingNewHeadlines: (state, action) => {
      state.isLoadingNewHeadlines = action.payload;
    },
    setShowNewGroupPopup: (state, action) => {
      state.showNewGroupPopup = action.payload;
    },
    setSectorSidebarVisible: (state, action) => {
      state.sectorSidebarVisible = action.payload;
    },
    setRightSidebarVisible: (state, action) => {
      // ADD THIS: New reducer for right sidebar
      state.rightSidebarVisible = action.payload;
    },
    setSelectedSectors: (state, action) => {
      state.selectedSectors = action.payload;
    },
    setSectors: (state, action) => {
      state.sectors = action.payload;
    },
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
    },
    setLocationMenuVisible: (state, action) => {
      state.locationMenuVisible = action.payload;
    },
    setAvailableRegions: (state, action) => {
      state.availableRegions = action.payload;
    },
    setRefreshLoading: (state, action) => {
      state.refreshLoading = action.payload;
    },
    setErrorResponse: (state, action) => {
      state.errorResponse = action.payload;
    },
    setIsLoadingImpacts: (state, action) => {
      state.isLoadingImpacts = action.payload;
    },
    setChatVisible: (state, action) => {
      state.chatVisible = action.payload;
    },
    setUserSelection: (state, action) => {
      state.userSelection = action.payload;
    },
    setSearchLimits: (state, action) => {
      const { maxLimit, searchCount } = action.payload;
      state.maxLimit = maxLimit;
      state.searchCount = searchCount;
    },
    incrementNotificationRefreshTrigger: (state) => {
      state.notificationRefreshTrigger += 1;
    },
  },
});

export const {
  setNewsQuery,
  setChatQuery, // ADD THIS: Export the new action
  setActiveNewsId,
  setMenuItems,
  setNewHighlightedItems,
  prependNewHighlightedItems,
  clearNewHighlights,
  removeHighlightFromItem,
  setIsLoadingNewHeadlines,
  setShowNewGroupPopup,
  setSectorSidebarVisible,
  setRightSidebarVisible, // ADD THIS: Export the new action
  setSelectedSectors,
  setSectors,
  setCurrentLocation,
  setLocationMenuVisible,
  setAvailableRegions,
  setRefreshLoading,
  setErrorResponse,
  setIsLoadingImpacts,
  setBannerImage,
  setChatVisible,
  setUserSelection,
  setSearchLimits,
  incrementNotificationRefreshTrigger,
} = newsDetailsSlice.actions;

export default newsDetailsSlice.reducer;
