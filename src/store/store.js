import { configureStore } from "@reduxjs/toolkit";
import newsDetailsReducer from "./slice/newsDetailsSlice";
import themeReducer from "./slice/themeSlice";
import authReducer from "./slice/authSlice";
import settingsReducer from "./slice/settingsSlice";
import adminDashboardReducer from "./slice/adminDashboardSlice";

export const store = configureStore({
  reducer: {
    newsDetails: newsDetailsReducer,
    theme: themeReducer,
    auth: authReducer,
    settings: settingsReducer,
    adminDashboard: adminDashboardReducer,
  },
});
