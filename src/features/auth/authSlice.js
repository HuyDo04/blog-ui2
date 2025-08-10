import { createSlice } from "@reduxjs/toolkit";
import fetchCurrentUser from "./authAsync";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    comments: [],
    currentUser: null,
    token: localStorage.getItem("token") || null,
    isLoading: false,
  },
  reducers: {
    loginSuccess(state, action) {
      const token = action.payload;
      state.token = token;
      localStorage.setItem("token", token);
    },
    logout(state) {
      state.currentUser = null;
      state.token = null;
      state.isLoading = false;
      localStorage.removeItem("token");
    },
    setUser(state, action) {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.currentUser = null;
        state.isLoading = false;
        state.token = null;
        localStorage.removeItem("token");
      });
  },
});

export const { loginSuccess, logout, setUser, setComments, addComment } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.currentUser;
export const selectUserLoading = (state) => state.auth.isLoading;
export const selectToken = (state) => state.auth.token;
// Comment