import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { signIn as authSignInService, signOut as authSignOutService, getUserToken, getUserDetails, updateUser as authUpdateUserService } from '@/services/auth.services';
import { SignInFormData, User } from '@/types';

// Définition de l'état de l'authentification
interface AuthState {
  user: { id: string; name: string; email: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isSigningIn: boolean; // État spécifique pour le processus de connexion
  signInError: string | null; // Erreur spécifique à la connexion
  isSigningUp: boolean;
  signUpError: string | null;
  isUpdatingProfile: boolean;
  updateProfileError: string | null;
}

// État initial
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true, // Initialement à true pour le chargement initial du token
  error: null,
  isSigningIn: false,
  signInError: null,
  isSigningUp: false,
  signUpError: null,
  isUpdatingProfile: false,
  updateProfileError: null,
};

// Thunk pour la connexion
export const signInUser = createAsyncThunk(
  'auth/signInUser',
  async (credentials: SignInFormData, { rejectWithValue }) => {
    try {
      const response = await authSignInService(credentials);
      if (response.success && response.token && response.user) {
        return { token: response.token, user: response.user };
      } else {
        return rejectWithValue(response.message || 'Échec de la connexion');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Une erreur inattendue est survenue lors de la connexion');
    }
  }
);

// Thunk pour la déconnexion
export const signOutUser = createAsyncThunk(
  'auth/signOutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authSignOutService();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Échec de la déconnexion');
    }
  }
);

// Thunk pour charger l'utilisateur depuis le stockage au démarrage de l'application
export const loadUserFromStorage = createAsyncThunk(
  'auth/loadUserFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getUserToken();
      const userDetails = await getUserDetails();
      if (token && userDetails) {
        return { token, user: userDetails };
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Échec du chargement de l\'utilisateur depuis le stockage');
    }
  }
);

// Thunk pour la mise à jour du profil utilisateur
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload: { name: string; email: string }, { rejectWithValue }) => {
    try {
      const updatedUser = await authUpdateUserService(payload);
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Échec de la mise à jour du profil');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
      state.signInError = null;
      state.signUpError = null;
      state.updateProfileError = null;
    },
    // Si vous avez un thunk pour l'inscription, vous pouvez ajouter des reducers ici
    // Par exemple, pour gérer l'état de l'inscription
  },
  extraReducers: (builder) => {
    builder
      // signInUser
      .addCase(signInUser.pending, (state) => {
        state.isSigningIn = true;
        state.signInError = null;
      })
      .addCase(signInUser.fulfilled, (state, action: PayloadAction<{ token: string; user: { id: string; name: string; email: string } }>) => {
        state.isSigningIn = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.signInError = null;
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.isSigningIn = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.signInError = action.payload as string;
      })
      // signOutUser
      .addCase(signOutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = null;
        state.signInError = null;
        state.signUpError = null;
        state.updateProfileError = null;
      })
      .addCase(signOutUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // loadUserFromStorage
      .addCase(loadUserFromStorage.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action: PayloadAction<{ token: string; user: { id: string; name: string; email: string } } | null>) => {
        state.loading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.user = action.payload.user;
        } else {
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
        }
      })
      .addCase(loadUserFromStorage.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload as string;
      })
      // updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.isUpdatingProfile = true;
        state.updateProfileError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.isUpdatingProfile = false;
        if (state.user) {
          state.user.name = action.payload.name;
          state.user.email = action.payload.email;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isUpdatingProfile = false;
        state.updateProfileError = action.payload as string;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
