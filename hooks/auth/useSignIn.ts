import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ZodError } from 'zod';
import { signInSchema } from '@/schemas/auth/auth-sign-in.schema';
import { signInUser, clearAuthError } from '@/store/auth-slice';
import { AppDispatch, RootState } from '@/store';
import { Keyboard } from 'react-native';

export const useSignIn = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isSigningIn, signInError, token } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPW, setShowPW] = useState(false);

  const [emailErr, setEmailErr] = useState<string | null>("");
  const [passErr, setPassErr] = useState<string | null>("");

  useEffect(() => {
    // Nettoie toute erreur d'authentification précédente au montage du composant
    // ou si `signInError` est détecté, assurant un état propre pour une nouvelle tentative de connexion.
    if (signInError) {
      dispatch(clearAuthError());
    }
  }, []); // Exécuté une seule fois au montage.

  // `useCallback` est utilisé ici pour mémoriser la fonction `validateField`.
  // Elle est cruciale pour éviter des recréations inutiles de cette fonction
  // lors des rendus, ce qui peut optimiser les performances des composants enfants
  // qui dépendent de cette fonction (ex: <TextInput> avec `onChangeText`).
  // Cette fonction gère la validation en temps réel des champs email et mot de passe
  // en utilisant Zod, et met à jour les états d'erreur correspondants.
  const validateField = useCallback((field: 'email' | 'password', value: string) => {
    try {
      // Utilise `pick` pour valider un seul champ spécifique du schéma `signInSchema`.
      // Le `as never` est un contournement TypeScript pour des cas où `pick` attend
      // un type générique qui n'est pas directement compatible, mais la logique
      // de validation reste correcte.
      signInSchema.pick({ [field]: true } as never).parse({ [field]: value });
      if (field === 'email') setEmailErr(null);
      if (field === 'password') setPassErr(null);
    } catch (e) {
      if (e instanceof ZodError) {
        const msg = e.errors[0]?.message || 'Invalide';
        if (field === 'email') setEmailErr(msg);
        if (field === 'password') setPassErr(msg);
      }
    }
  }, []);

  const handleChangeEmail = useCallback((value: string) => {
    setEmail(value);
    validateField('email', value);
    // Efface l'erreur globale de connexion dès que l'utilisateur commence à taper,
    // offrant une meilleure expérience utilisateur.
    if (signInError) dispatch(clearAuthError());
  }, [validateField, signInError, dispatch]);

  const handleChangePassword = useCallback((value: string) => {
    setPassword(value);
    validateField('password', value);
    // Efface l'erreur globale de connexion dès que l'utilisateur commence à taper.
    if (signInError) dispatch(clearAuthError());
  }, [validateField, signInError, dispatch]);

  const toggleShowPassword = useCallback(() => {
    setShowPW(prev => !prev);
  }, []);

  // Cette fonction `handleSubmit` est le point d'entrée pour la logique de connexion.
  // Elle gère la validation complète du formulaire avant de tenter la connexion via Redux.
  // Elle inclut également la gestion des erreurs de validation (Zod) et des erreurs
  // renvoyées par l'action Redux (`signInUser.rejected`).
  // Le `Keyboard.dismiss()` est appelé pour cacher le clavier virtuel avant la soumission.
  const handleSubmit = useCallback(async () => {
    Keyboard.dismiss();
    setEmailErr(null);
    setPassErr(null);
    dispatch(clearAuthError());

    try {
      // Tente de valider le formulaire entier avant de dispatcher l'action de connexion.
      signInSchema.parse({ email, password });

      // Dispatche l'action asynchrone de connexion à l'utilisateur.
      const resultAction = await dispatch(signInUser({ email, password }));

      // Vérifie si l'action `signInUser` a été rejetée (échec de connexion).
      if (signInUser.rejected.match(resultAction)) {
        return { success: false, error: signInError };
      }
      return { success: true };
    } catch (e) {
      if (e instanceof ZodError) {
        // En cas d'erreur de validation Zod, parcourt les erreurs
        // et met à jour les messages d'erreur spécifiques aux champs.
        e.errors.forEach(err => {
          if (err.path[0] === 'email') setEmailErr(err.message);
          if (err.path[0] === 'password') setPassErr(err.message);
        });
        return { success: false, error: 'Validation failed' };
      }
      // Gère les erreurs inattendues qui ne sont pas des ZodError.
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, [email, password, dispatch, signInError]);

  return {
    email,
    password,
    showPW,
    emailErr,
    passErr,
    isSigningIn,
    signInError,
    token,
    handleChangeEmail,
    handleChangePassword,
    toggleShowPassword,
    handleSubmit,
  };
};