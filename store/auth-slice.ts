// store/auth-slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SignInFormData, SignUpFormData, AuthUser } from '@/types'; // Import SignUpFormData
import { signIn as signInService, signUp as signUpService, signOut as signOutService } from '@/services/auth-services'; // Import signUp service

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isSigningIn: boolean;
  signInError: string | null;
  isSigningOut: boolean;
  signOutError: string | null;
  isSigningUp: boolean; // New state for sign-up loading
  signUpError: string | null; // New state for sign-up error
  signUpSuccess: boolean; // New state for sign-up success
}

const initialState: AuthState = {
  token: null,
  user: null,
  isSigningIn: false,
  signInError: null,
  isSigningOut: false,
  signOutError: null,
  isSigningUp: false, // Initialize new state
  signUpError: null,  // Initialize new state
  signUpSuccess: false, // Initialize new state
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

// Async Thunk for Sign Up
export const signUpUser = createAsyncThunk(
  'auth/signUp',
  async (data: SignUpFormData, { rejectWithValue }) => {
    try {
      const response = await signUpService(data);

      if (response.success && response.user) {
        // We don't get a token directly from signUp service, but user details are returned
        return response.user;
      } else {
        return rejectWithValue(response.message || 'Échec de l’inscription.');
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
      state.signUpError = null; // Clear sign-up specific error
    },
    clearSignUpSuccess: (state) => {
      state.signUpSuccess = false; // Clear sign-up success state
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
      // Sign In
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
      // Sign Up
      .addCase(signUpUser.pending, (state) => {
        state.isSigningUp = true;
        state.signUpError = null;
        state.signUpSuccess = false;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.isSigningUp = false;
        // For sign-up, we just confirm success; no token is set here
        state.signUpSuccess = true;
        state.signUpError = null;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.isSigningUp = false;
        state.signUpSuccess = false;
        state.signUpError = action.payload as string;
      })
      // Sign Out
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

export const { clearAuthError, clearSignUpSuccess, setAuthToken, setAuthUser, setInitialAuth } = authSlice.actions;

export default authSlice.reducer;