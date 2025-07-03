import { SignInFormData, SignUpFormData, User } from '@/types';
import { storage } from './storage.services';
import * as SecureStore from 'expo-secure-store';

/* ─────────── CONSTANTES ─────────── */
const USERS_KEY = 'allUsers';          // <-- clé où l’on stocke le tableau complet
const TOKEN_KEY = 'userToken';
const DETAILS_KEY = 'userDetails';

/* ─────────── HELPERS ─────────── */
const fakeHash = (pwd: string) =>
  'hash$' +
  Array.from(pwd)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');

const fakeCompare = (plain: string, hashed: string) => fakeHash(plain) === hashed;

/* Chargement des utilisateurs (une seule fois) */
let cachedUsers: User[] | null = null;
const loadUsers = async (): Promise<User[]> => {
  if (cachedUsers) return cachedUsers;
  cachedUsers = (await storage.get<User[]>(USERS_KEY)) ?? [];
  return cachedUsers;
};

/* Sauvegarde immuable du tableau en cache + AsyncStorage */
const saveUsers = async (users: User[]) => {
  cachedUsers = users;
  await storage.set(USERS_KEY, users);
};

/* ─────────── SIGN‑UP ─────────── */
export const signUp = async (data: SignUpFormData) => {
  const { name, email, password, confirmPassword } = data;

  /* 1. vérifications */
  if (![name, email, password, confirmPassword].every((v) => v?.trim()))
    return { success: false, message: 'Tous les champs sont requis.' };

  if (password !== confirmPassword)
    return { success: false, message: 'Les mots de passe ne correspondent pas.' };

  const users = await loadUsers();
  if (users.some((u) => u.email === email.trim().toLowerCase()))
    return { success: false, message: 'Un utilisateur avec cet email existe déjà.' };

  /* 2. création du nouvel utilisateur */
  const newUser: User = {
    id: Date.now().toString(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    hashedPassword: fakeHash(password),
  };

  /* 3. mise à jour + persistance */
  await saveUsers([...users, newUser]);

  return { success: true, user: newUser };
};

/* ─────────── SIGN‑IN ─────────── */
export const signIn = async ({ email, password }: SignInFormData) => {
  await new Promise((r) => setTimeout(r, 500)); // latence simulée

  const users = await loadUsers();
  const user = users.find((u) => u.email === email.trim().toLowerCase());

  if (!user || !fakeCompare(password, user.hashedPassword))
    return { success: false, message: 'Email ou mot de passe invalide.' };

  const token = `simulated_token_${user.id}_${Date.now()}`;
  const userDetails = { id: user.id, name: user.name, email: user.email };

  /* — persistance — */
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await storage.set(DETAILS_KEY, userDetails);

  return { success: true, token, user: userDetails };
};

/* ─────────── UTILS ─────────── */
export const getUserToken = () => SecureStore.getItemAsync(TOKEN_KEY);

export const getUserDetails = () => storage.get<typeof cachedUsers[0]>(DETAILS_KEY);

export const signOut = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    storage.multiRemove([DETAILS_KEY]),
  ]);
  return { success: true };
};
