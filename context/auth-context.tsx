import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUserToken, getUserDetails, signOut as signOutService } from '@/services/auth.services';
import { useDispatch, useSelector } from 'react-redux';
import { setInitialAuth, signOutUser } from '@/store/auth-slice';
import { AppDispatch, RootState } from '@/store';
import { AuthUser } from '@/types';

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const storedToken = await getUserToken();
    const storedUser = await getUserDetails();
    dispatch(setInitialAuth({ token: storedToken, user: storedUser || null }));
    setLoading(false);
  };

  const signOut = async () => {
    await dispatch(signOutUser());
  };

  useEffect(() => { refresh(); }, []);

  return (
    <AuthContext.Provider value={{ token, user, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};