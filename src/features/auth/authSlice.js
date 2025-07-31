import { createSlice } from '@reduxjs/toolkit'
import fetchCurrentUser from './authAsync';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    currentUser: null,
    isLoading: true
  },
  reducers: {
    logout(state) {
      state.currentUser = null;
      state.isLoading = false;
    },
    setUser(state, action) {
      state.currentUser = action.payload;
    }
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
      });
  }
});
export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
export const selectCurrentUser = (state) => state.auth.currentUser;
export const selectUserLoading = (state) => state.auth.isLoading;