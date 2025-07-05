import { SignInFormData, SignUpFormData, User } from '@/types';
import { storage } from './storage-services';

// Clés pour le stockage local
const USERS_KEY = 'allUsers';
const TOKEN_KEY = 'userToken';
const DETAILS_KEY = 'userDetails';

/**
 * @function fakeHash
 * @description Simule un hachage de mot de passe à des fins de test. **Ne doit pas être utilisé en production.**
 * @param {string} pwd - Le mot de passe à "hacher".
 * @returns {string} Le mot de passe "haché" (préfixé par 'hash$').
 */
const fakeHash = (pwd: string) =>
  'hash$' +
  Array.from(pwd)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');

/**
 * @function fakeCompare
 * @description Simule la comparaison d'un mot de passe en clair avec un mot de passe "haché". **Ne doit pas être utilisé en production.**
 * @param {string} plain - Le mot de passe en clair.
 * @param {string} hashed - Le mot de passe "haché" à comparer.
 * @returns {boolean} Vrai si les "hachages" correspondent, faux sinon.
 */
const fakeCompare = (plain: string, hashed: string) =>
  fakeHash(plain) === hashed;

let cachedUsers: User[] | null = null;

/**
 * @function loadUsers
 * @description Charge la liste des utilisateurs depuis le stockage local ou le cache.
 * @returns {Promise<User[]>} Une promesse qui résout avec un tableau d'utilisateurs.
 */
const loadUsers = async (): Promise<User[]> => {
  if (cachedUsers) return cachedUsers;
  cachedUsers = (await storage.get<User[]>(USERS_KEY)) ?? [];
  return cachedUsers;
};

/**
 * @function saveUsers
 * @description Sauvegarde la liste des utilisateurs dans le stockage local et met à jour le cache.
 * @param {User[]} users - Le tableau d'utilisateurs à sauvegarder.
 * @returns {Promise<void>} Une promesse qui résout une fois les utilisateurs sauvegardés.
 */
const saveUsers = async (users: User[]) => {
  cachedUsers = users;
  await storage.set(USERS_KEY, users);
};

/**
 * @function signUp
 * @description Gère le processus d'inscription d'un nouvel utilisateur.
 * @param {SignUpFormData} data - Les données du formulaire d'inscription (nom, email, mot de passe, confirmation).
 * @returns {Promise<{ success: boolean; message?: string; user?: User }>} Un objet indiquant le succès/échec de l'inscription, avec un message d'erreur si échec et l'utilisateur si succès.
 */
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

/**
 * @function signIn
 * @description Gère le processus de connexion d'un utilisateur existant.
 * @param {SignInFormData} credentials - Les données du formulaire de connexion (email, mot de passe).
 * @returns {Promise<{ success: boolean; message?: string; token?: string; user?: { id: string; name: string; email: string } }>} Un objet indiquant le succès/échec de la connexion, avec un message d'erreur si échec, et le token/détails de l'utilisateur si succès.
 */
export const signIn = async ({ email, password }: SignInFormData) => {
  await new Promise((r) => setTimeout(r, 500)); // Simule un délai réseau.

  const users = (await storage.get<User[]>(USERS_KEY)) ?? [];
  cachedUsers = users;

  const user = users.find(
    (u) => u.email === email.trim().toLowerCase()
  );

  if (!user || !fakeCompare(password, user.hashedPassword))
    return { success: false, message: 'Email ou mot de passe invalide.' };

  const token = `simulated_token_${user.id}_${Date.now()}`;
  const userDetails = { id: user.id, name: user.name, email: user.email };

  await storage.set(TOKEN_KEY, token);
  await storage.set(DETAILS_KEY, userDetails);

  return { success: true, token, user: userDetails };
};

/**
 * @function getUserToken
 * @description Récupère le token d'authentification de l'utilisateur depuis le stockage local.
 * @returns {Promise<string | null>} Le token ou `null` s'il n'existe pas.
 */
export const getUserToken = () => storage.get<string>(TOKEN_KEY);

/**
 * @function getUserDetails
 * @description Récupère les détails de l'utilisateur actuellement connecté depuis le stockage local.
 * @returns {Promise<{ id: string; name: string; email: string } | null>} Les détails de l'utilisateur (id, nom, email) ou `null` si non connecté.
 */
export const getUserDetails = () =>
  storage.get<{ id: string; name: string; email: string }>(DETAILS_KEY);

/**
 * @function signOut
 * @description Gère le processus de déconnexion de l'utilisateur en supprimant le token et les détails du stockage local.
 * @returns {Promise<{ success: boolean }>} Un objet indiquant le succès de la déconnexion.
 */
export const signOut = async () => {
  await Promise.all([
    storage.remove(TOKEN_KEY),
    storage.multiRemove([DETAILS_KEY]),
  ]);
  return { success: true };
};

/**
 * @function updateUser
 * @description Met à jour les informations (nom, email) d'un utilisateur existant.
 * @param {{ name: string; email: string }} payload - Les données de mise à jour (nom et email).
 * @returns {Promise<User>} L'objet utilisateur mis à jour.
 * @throws {Error} Si le profil introuvable (pas d'utilisateur connecté), l'utilisateur non trouvé, ou l'email est déjà utilisé par un autre compte.
 */
export const updateUser = async (payload: { name: string; email: string }) => {
  const details = await getUserDetails();
  if (!details) throw new Error('Profil introuvable');

  const users = (await storage.get<User[]>(USERS_KEY)) ?? [];
  const idx = users.findIndex((u) => u.id === details.id);
  if (idx === -1) throw new Error('Utilisateur non trouvé');

  const newEmail = payload.email.trim().toLowerCase();
  const existingUserWithEmail = users.find(
    (u) => u.email === newEmail && u.id !== details.id
  );

  if (existingUserWithEmail) {
    throw new Error('Cet email est déjà utilisé par un autre compte.');
  }

  const updatedUser = { ...users[idx], ...payload, email: newEmail };
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