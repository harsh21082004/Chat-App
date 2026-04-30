import { createSlice } from '@reduxjs/toolkit';
import { performUltronAction } from '../thunks/ultronThunks';

const ultronSlice = createSlice({
  name: 'ultron',
  initialState: {
    loading: false,
    result: null,
    error: null,
  },
  reducers: {
    clearUltronResult: (state) => {
      state.result = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(performUltronAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performUltronAction.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(performUltronAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUltronResult } = ultronSlice.actions;
export default ultronSlice.reducer;