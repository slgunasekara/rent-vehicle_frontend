import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { favoriteIds, saveAd, unsaveAd } from '../service/engage';
import type { RootState } from './index';

export const loadFavorites = createAsyncThunk('favorites/load', async () => favoriteIds());

export const toggleFavorite = createAsyncThunk<void, string, { state: RootState }>('favorites/toggle', async (id, { getState, dispatch, rejectWithValue }) => {
  const saved = getState().favorites.ids.includes(id);
  dispatch(slice.actions.setOne({ id, saved: !saved }));
  try { await (saved ? unsaveAd(id) : saveAd(id)); } catch (e) { dispatch(slice.actions.setOne({ id, saved })); return rejectWithValue(e); }
});

const slice = createSlice({
  name: 'favorites',
  initialState: { ids: [] as string[] },
  reducers: {
    clearFavorites(s) { s.ids = []; },
    setOne(s, a: { payload: { id: string; saved: boolean } }) {
      const has = s.ids.includes(a.payload.id);
      if (a.payload.saved && !has) s.ids.push(a.payload.id);
      if (!a.payload.saved && has) s.ids = s.ids.filter((x) => x !== a.payload.id);
    },
  },
  extraReducers: (b) => { b.addCase(loadFavorites.fulfilled, (s, a) => { s.ids = a.payload; }); },
});
export const { clearFavorites } = slice.actions;
export default slice.reducer;
