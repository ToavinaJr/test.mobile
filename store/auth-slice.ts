// store/auth-slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SignInFormData, AuthUser } from '@/types';
import { signIn as signInService, signOut as signOutService } from '@/services/auth.services';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isSigningIn: boolean;
  signInError: string | null;
  isSigningOut: boolean;
  signOutError: string | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isSigningIn: false,
  signInError: null,
  isSigningOut: false,
  signOutError: null,
};

export const signInUser = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: SignInFormData, { rejectWithValue }) => {
    try {
      const response = await signInService({ email, password });

      if (response.success && response.token && response.user) {
        return { token: response.token, user: response.user };
      } else {
        return rejectWithValue(response.message || 'Email ou mot de passe invalide.');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Une erreur inattendue est survenue.');
    }
  }
);

export const signOutUser = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await signOutService();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur lors de la déconnexion.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.signInError = null;
      state.signOutError = null;
    },
    setAuthToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    setAuthUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
    },
    setInitialAuth: (state, action: PayloadAction<{ token: string | null; user: AuthUser | null }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInUser.pending, (state) => {
        state.isSigningIn = true;
        state.signInError = null;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.isSigningIn = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.signInError = null;
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.isSigningIn = false;
        state.token = null;
        state.user = null;
        state.signInError = action.payload as string;
      })
      .addCase(signOutUser.pending, (state) => {
        state.isSigningOut = true;
        state.signOutError = null;
      })
      .addCase(signOutUser.fulfilled, (state) => {
        state.isSigningOut = false;
        state.token = null;
        state.user = null;
        state.signOutError = null;
      })
      .addCase(signOutUser.rejected, (state, action) => {
        state.isSigningOut = false;
        state.signOutError = action.payload as string;
      });
  },
});

export const { clearAuthError, setAuthToken, setAuthUser, setInitialAuth } = authSlice.actions;

export default authSlice.reducer;