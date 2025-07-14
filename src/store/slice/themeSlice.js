import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentTheme: "",
};
export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setcurrentTheme: (state, action) => {
      state.currentTheme = action.payload;
    },
  },
});
export const { setcurrentTheme } = themeSlice.actions;
export default themeSlice.reducer;
