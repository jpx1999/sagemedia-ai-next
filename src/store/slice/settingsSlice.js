import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  settings: {
    source: "",
    llm: "",
    usequeryanalyzer: false,
    enablechatbot: false,
    enablepodcast: false,
    advanceLoader: false,
  },
  isLoading: false,
  error: null,
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettings: (state, action) => {
      state.settings = action.payload;
    },
    updateSetting: (state, action) => {
      const { key, value } = action.payload;
      state.settings[key] = value;
    },
    setSettingsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setSettingsError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setSettings,
  updateSetting,
  setSettingsLoading,
  setSettingsError,
} = settingsSlice.actions;

export default settingsSlice.reducer;
