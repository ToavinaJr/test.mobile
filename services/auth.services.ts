import { SignInFormData, SignUpFormData, User } from '@/types';
import { storage } from './storage.services';
import * as SecureStore from 'expo-secure-store';

<<<<<<< HEAD
const USERS_KEY = 'allUsers';
const TOKEN_KEY = 'userToken';
const DETAILS_KEY = 'userDetails';

=======
/* ─────────── CONSTANTES ─────────── */
const USERS_KEY = 'allUsers';          // <-- clé où l’on stocke le tableau complet
const TOKEN_KEY = 'userToken';
const DETAILS_KEY = 'userDetails';

/* ─────────── HELPERS ─────────── */
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
const fakeHash = (pwd: string) =>
  'hash$' +
  Array.from(pwd)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');

<<<<<<< HEAD
const fakeCompare = (plain: string, hashed: string) =>
  fakeHash(plain) === hashed;

let cachedUsers: User[] | null = null;

=======
const fakeCompare = (plain: string, hashed: string) => fakeHash(plain) === hashed;

/* Chargement des utilisateurs (une seule fois) */
let cachedUsers: User[] | null = null;
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
const loadUsers = async (): Promise<User[]> => {
  if (cachedUsers) return cachedUsers;
  cachedUsers = (await storage.get<User[]>(USERS_KEY)) ?? [];
  return cachedUsers;
};

<<<<<<< HEAD
=======
/* Sauvegarde immuable du tableau en cache + AsyncStorage */
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
const saveUsers = async (users: User[]) => {
  cachedUsers = users;
  await storage.set(USERS_KEY, users);
};

<<<<<<< HEAD
export const signUp = async (data: SignUpFormData) => {
  const { name, email, password, confirmPassword } = data;
=======
/* ─────────── SIGN‑UP ─────────── */
export const signUp = async (data: SignUpFormData) => {
  const { name, email, password, confirmPassword } = data;

  /* 1. vérifications */
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
  if (![name, email, password, confirmPassword].every((v) => v?.trim()))
    return { success: false, message: 'Tous les champs sont requis.' };

  if (password !== confirmPassword)
    return { success: false, message: 'Les mots de passe ne correspondent pas.' };

  const users = await loadUsers();
  if (users.some((u) => u.email === email.trim().toLowerCase()))
    return { success: false, message: 'Un utilisateur avec cet email existe déjà.' };

<<<<<<< HEAD
=======
  /* 2. création du nouvel utilisateur */
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
  const newUser: User = {
    id: Date.now().toString(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    hashedPassword: fakeHash(password),
  };

<<<<<<< HEAD
=======
  /* 3. mise à jour + persistance */
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
  await saveUsers([...users, newUser]);

  return { success: true, user: newUser };
};

<<<<<<< HEAD
export const signIn = async ({ email, password }: SignInFormData) => {
  await new Promise((r) => setTimeout(r, 500));

  const users = (await storage.get<User[]>(USERS_KEY)) ?? [];
  cachedUsers = users;

  const user = users.find(
    (u) => u.email === email.trim().toLowerCase()
  );
=======
/* ─────────── SIGN‑IN ─────────── */
export const signIn = async ({ email, password }: SignInFormData) => {
  await new Promise((r) => setTimeout(r, 500)); // latence simulée

  const users = await loadUsers();
  const user = users.find((u) => u.email === email.trim().toLowerCase());
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec

  if (!user || !fakeCompare(password, user.hashedPassword))
    return { success: false, message: 'Email ou mot de passe invalide.' };

  const token = `simulated_token_${user.id}_${Date.now()}`;
  const userDetails = { id: user.id, name: user.name, email: user.email };

<<<<<<< HEAD
=======
  /* — persistance — */
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await storage.set(DETAILS_KEY, userDetails);

  return { success: true, token, user: userDetails };
};

<<<<<<< HEAD
export const getUserToken = () => SecureStore.getItemAsync(TOKEN_KEY);

export const getUserDetails = () =>
  storage.get<{ id: string; name: string; email: string }>(DETAILS_KEY);
=======
/* ─────────── UTILS ─────────── */
export const getUserToken = () => SecureStore.getItemAsync(TOKEN_KEY);

export const getUserDetails = () => storage.get<typeof cachedUsers[0]>(DETAILS_KEY);
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec

export const signOut = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    storage.multiRemove([DETAILS_KEY]),
  ]);
  return { success: true };
};
<<<<<<< HEAD

export const updateUser = async (payload: { name: string; email: string }) => {
  const details = await getUserDetails();
  if (!details) throw new Error('Profil introuvable');

  const users = (await storage.get<User[]>(USERS_KEY)) ?? [];
  const idx = users.findIndex((u) => u.id === details.id);
  if (idx === -1) throw new Error('Utilisateur non trouvé');

  const updatedUser = { ...users[idx], ...payload };
  users[idx] = updatedUser;

  await storage.set(USERS_KEY, users);
  cachedUsers = users;

  await storage.set(DETAILS_KEY, {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
  });

  return updatedUser;
};
=======
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
