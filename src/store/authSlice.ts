import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api, errMsg, tokens } from '../service/api';
import { User } from '../types';

interface AuthState { user: User | null; loading: boolean; initialised: boolean; error?: string }
const initialState: AuthState = { user: null, loading: false, initialised: false };

interface AuthResp { accessToken: string; refreshToken: string; user: User }
const handle = (d: AuthResp): User => { tokens.set(d.accessToken, d.refreshToken); return d.user; };

export const loadMe = createAsyncThunk('auth/me', async () => {
  if (!tokens.access && !tokens.refresh) return null;
  return (await api.get('/auth/me')).data.data as User;
});

export const login = createAsyncThunk('auth/login', async (b: { email: string; password: string }, { rejectWithValue }) => {
  try { return handle((await api.post('/auth/login', b)).data.data); } catch (e) { return rejectWithValue(errMsg(e)); }
});

export const registerUser = createAsyncThunk('auth/register', async (b: { name: string; email: string; phone: string; password: string }, { rejectWithValue }) => {
  try { return handle((await api.post('/auth/register', b)).data.data); } catch (e) { return rejectWithValue(errMsg(e)); }
});

export const googleAuth = createAsyncThunk('auth/google', async (credential: string, { rejectWithValue }) => {
  try { return handle((await api.post('/auth/google', { credential })).data.data); } catch (e) { return rejectWithValue(errMsg(e)); }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try { await api.post('/auth/logout', { refreshToken: tokens.refresh }); } catch { /* ignore */ }
  tokens.clear();
});

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    forceLogout(s) { s.user = null; },
    setUser(s, a: PayloadAction<User>) { s.user = a.payload; },
  },
  extraReducers: (b) => {
    b.addCase(loadMe.fulfilled, (s, a) => { s.user = a.payload; s.initialised = true; });
    b.addCase(loadMe.rejected, (s, a) => {
      s.user = null;
      s.initialised = true;
      // keep the tokens if the server was just unreachable; clear only when they are really invalid
      if ((a.error as { message?: string }).message?.includes('401')) tokens.clear();
    });
    for (const t of [login, registerUser, googleAuth]) {
      b.addCase(t.pending, (s) => { s.loading = true; s.error = undefined; });
      b.addCase(t.fulfilled, (s, a) => { s.loading = false; s.user = a.payload as User; });
      b.addCase(t.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });
    }
    b.addCase(logoutUser.fulfilled, (s) => { s.user = null; });
  },
});

export const { forceLogout, setUser } = slice.actions;
export default slice.reducer;
