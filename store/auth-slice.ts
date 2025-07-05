// store/auth-slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SignInFormData, SignUpFormData, AuthUser } from '@/types'; 
import { signIn as signInService, signUp as signUpService, signOut as signOutService } from '@/services/auth-services'; 

/**
 * Interface décrivant la forme du state d'authentification
 */
interface AuthState {
  token: string | null;               // Token d'authentification JWT ou équivalent
  user: AuthUser | null;              // Objet utilisateur authentifié
  isSigningIn: boolean;               // Indicateur de chargement pendant la connexion
  signInError: string | null;         // Message d'erreur lors de la connexion
  isSigningOut: boolean;              // Indicateur de chargement pendant la déconnexion
  signOutError: string | null;        // Message d'erreur lors de la déconnexion
  isSigningUp: boolean;               // Indicateur de chargement pendant l'inscription
  signUpError: string | null;         // Message d'erreur lors de l'inscription
  signUpSuccess: boolean;              // Indicateur de succès de l'inscription
}

/**
 * État initial par défaut du slice auth
 */
const initialState: AuthState = {
  token: null,
  user: null,
  isSigningIn: false,
  signInError: null,
  isSigningOut: false,
  signOutError: null,
  isSigningUp: false,
  signUpError: null,
  signUpSuccess: false,
};

/**
 * AsyncThunk pour la connexion utilisateur
 * - Prend les données {email, password}
 * - Appelle le service signInService
 * - En cas de succès, retourne token et user
 * - Sinon, rejette avec un message d'erreur
 */
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

/**
 * AsyncThunk pour l'inscription utilisateur
 * - Prend les données d'inscription (SignUpFormData)
 * - Appelle le service signUpService
 * - En cas de succès, retourne les infos utilisateur (pas de token ici)
 * - Sinon, rejette avec message d'erreur
 */
export const signUpUser = createAsyncThunk(
  'auth/signUp',
  async (data: SignUpFormData, { rejectWithValue }) => {
    try {
      const response = await signUpService(data);

      if (response.success && response.user) {
        return response.user;
      } else {
        return rejectWithValue(response.message || 'Échec de l’inscription.');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Une erreur inattendue est survenue.');
    }
  }
);

/**
 * AsyncThunk pour la déconnexion utilisateur
 * - Appelle le service signOutService
 * - En cas de succès, retourne true
 * - Sinon, rejette avec message d'erreur
 */
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

/**
 * Création du slice auth avec createSlice
 * - Contient le state initial, les reducers synchrones, et les extraReducers pour gérer les thunks
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Efface toutes les erreurs liées à l'authentification (connexion, déconnexion, inscription)
     */
    clearAuthError: (state) => {
      state.signInError = null;
      state.signOutError = null;
      state.signUpError = null;
    },
    /**
     * Réinitialise l'indicateur de succès d'inscription
     */
    clearSignUpSuccess: (state) => {
      state.signUpSuccess = false;
    },
    /**
     * Met à jour le token dans le state (utile si on récupère un token externe)
     */
    setAuthToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    /**
     * Met à jour les infos utilisateur dans le state
     */
    setAuthUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
    },
    /**
     * Permet d'initialiser simultanément token et user (par exemple au démarrage de l'app)
     */
    setInitialAuth: (state, action: PayloadAction<{ token: string | null; user: AuthUser | null }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
  },
  extraReducers: (builder) => {
    builder
      // Gestion des états du thunk signInUser
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

      // Gestion des états du thunk signUpUser
      .addCase(signUpUser.pending, (state) => {
        state.isSigningUp = true;
        state.signUpError = null;
        state.signUpSuccess = false;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.isSigningUp = false;
        // Ici on ne reçoit pas de token, seulement la confirmation que l'inscription a réussi
        state.signUpSuccess = true;
        state.signUpError = null;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.isSigningUp = false;
        state.signUpSuccess = false;
        state.signUpError = action.payload as string;
      })

      // Gestion des états du thunk signOutUser
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

// Export des actions synchrones définies dans reducers
export const { clearAuthError, clearSignUpSuccess, setAuthToken, setAuthUser, setInitialAuth } = authSlice.actions;

// Export du reducer à utiliser dans le store
export default authSlice.reducer;
