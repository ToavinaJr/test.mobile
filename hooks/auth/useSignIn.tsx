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
    if (signInError) {
      dispatch(clearAuthError());
    }
  }, []);

  const validateField = useCallback((field: 'email' | 'password', value: string) => {
    try {
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
    if (signInError) dispatch(clearAuthError());
  }, [validateField, signInError, dispatch]);

  const handleChangePassword = useCallback((value: string) => {
    setPassword(value);
    validateField('password', value);
    if (signInError) dispatch(clearAuthError());
  }, [validateField, signInError, dispatch]);

  const toggleShowPassword = useCallback(() => {
    setShowPW(prev => !prev);
  }, []);

  const handleSubmit = useCallback(async () => {
    Keyboard.dismiss();
    setEmailErr(null);
    setPassErr(null);
    dispatch(clearAuthError());

    try {
      signInSchema.parse({ email, password });

      const resultAction = await dispatch(signInUser({ email, password }));

      if (signInUser.rejected.match(resultAction)) {
        return { success: false, error: signInError };
      }
      return { success: true };
    } catch (e) {
      if (e instanceof ZodError) {
        e.errors.forEach(err => {
          if (err.path[0] === 'email') setEmailErr(err.message);
          if (err.path[0] === 'password') setPassErr(err.message);
        });
        return { success: false, error: 'Validation failed' };
      }
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