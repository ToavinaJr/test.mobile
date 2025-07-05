import { SignInFormData, SignUpFormData, User } from '@/types';
import { storage } from './storage.services';
import * as SecureStore from 'expo-secure-store';

const USERS_KEY = 'allUsers';
const TOKEN_KEY = 'userToken';
const DETAILS_KEY = 'userDetails';

const fakeHash = (pwd: string) =>
  'hash$' +
  Array.from(pwd)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');

const fakeCompare = (plain: string, hashed: string) =>
  fakeHash(plain) === hashed;

let cachedUsers: User[] | null = null;

const loadUsers = async (): Promise<User[]> => {
  if (cachedUsers) return cachedUsers;
  cachedUsers = (await storage.get<User[]>(USERS_KEY)) ?? [];
  return cachedUsers;
};

const saveUsers = async (users: User[]) => {
  cachedUsers = users;
  await storage.set(USERS_KEY, users);
};

export const signUp = async (data: SignUpFormData) => {
  const { name, email, password, confirmPassword } = data;

  if (![name, email, password, confirmPassword].every((v) => v?.trim()))
    return { success: false, message: 'Tous les champs sont requis.' };

  if (password !== confirmPassword)
    return { success: false, message: 'Les mots de passe ne correspondent pas.' };

  const users = await loadUsers();
  if (users.some((u) => u.email === email.trim().toLowerCase()))
    return { success: false, message: 'Un utilisateur avec cet email existe déjà.' };

  const newUser: User = {
    id: Date.now().toString(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    hashedPassword: fakeHash(password),
  };

  await saveUsers([...users, newUser]);

  return { success: true, user: newUser };
};

export const signIn = async ({ email, password }: SignInFormData) => {
  await new Promise((r) => setTimeout(r, 500));

  const users = (await storage.get<User[]>(USERS_KEY)) ?? [];
  cachedUsers = users;

  const user = users.find(
    (u) => u.email === email.trim().toLowerCase()
  );

  if (!user || !fakeCompare(password, user.hashedPassword))
    return { success: false, message: 'Email ou mot de passe invalide.' };

  const token = `simulated_token_${user.id}_${Date.now()}`;
  const userDetails = { id: user.id, name: user.name, email: user.email };

  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await storage.set(DETAILS_KEY, userDetails);

  return { success: true, token, user: userDetails };
};

export const getUserToken = () => SecureStore.getItemAsync(TOKEN_KEY);

export const getUserDetails = () =>
  storage.get<{ id: string; name: string; email: string }>(DETAILS_KEY);

export const signOut = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    storage.multiRemove([DETAILS_KEY]),
  ]);
  return { success: true };
};

export const updateUser = async (payload: { name: string; email: string }) => {
  const details = await getUserDetails();
  if (!details) throw new Error('Profil introuvable');

  const users = (await storage.get<User[]>(USERS_KEY)) ?? [];
  const idx = users.findIndex((u) => u.id === details.id);
  if (idx === -1) throw new Error('Utilisateur non trouvé');

  // Vérifier si le nouvel email existe déjà pour un AUTRE utilisateur
  const newEmail = payload.email.trim().toLowerCase();
  const existingUserWithEmail = users.find(
    (u) => u.email === newEmail && u.id !== details.id
  );

  if (existingUserWithEmail) {
    throw new Error('Cet email est déjà utilisé par un autre compte.');
  }

  const updatedUser = { ...users[idx], ...payload, email: newEmail }; // Assurez-vous que l'email est en minuscules
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
