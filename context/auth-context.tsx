import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUserToken, signOut as signOutService } from '@/services/auth.services';
import { storage } from '@/services/storage.services';

interface AuthContextType {
  token: string | null;
  loading: boolean;
  login: (t: string) => Promise<void>;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* -------- login (persistance + state) -------- */
  const login = async (t: string) => {
    await storage.set('userToken', t);    // ou SecureStore si vous préférez
    setToken(t);
  };

  /* -------- refresh au démarrage -------- */
  const refresh = async () => {
    setLoading(true);
    const saved = await getUserToken();   // récup SecureStore ou AsyncStorage
    setToken(saved);
    setLoading(false);
  };

  /* -------- signOut -------- */
  const signOut = async () => {
    await signOutService();
    setToken(null);
  };

  useEffect(() => { refresh(); }, []);

  return (
    <AuthContext.Provider value={{ token, loading, login, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
