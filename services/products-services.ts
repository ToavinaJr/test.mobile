import { Product } from '@/types';
import allProducts from '@/data/products.json';
import { storage } from './storage-services';

const INDEX_KEY = 'products:index';
const ENTITY_KEY = (id: string) => `product:${id}`;

let cachedProducts: Product[] | null = null;

/**
 * @function loadIndex
 * @description Charge l'index des IDs de produits depuis le stockage local.
 * @returns {Promise<string[]>} Une promesse qui résout avec un tableau d'IDs de produits. Retourne un tableau vide si aucun index n'est trouvé.
 */
const loadIndex = async (): Promise<string[]> =>
  (await storage.get<string[]>(INDEX_KEY)) ?? [];

/**
 * @function saveIndex
 * @description Sauvegarde l'index des IDs de produits dans le stockage local.
 * @param {string[]} ids - Le tableau d'IDs de produits à sauvegarder.
 * @returns {Promise<void>} Une promesse qui résout une fois l'index sauvegardé.
 */
const saveIndex = (ids: string[]) => storage.set(INDEX_KEY, ids);

/**
 * @function saveProductEntity
 * @description Sauvegarde un produit individuel dans le stockage local en utilisant sa clé unique.
 * @param {Product} p - L'objet produit à sauvegarder.
 * @returns {Promise<void>} Une promesse qui résout une fois le produit sauvegardé.
 */
const saveProductEntity = (p: Product) => storage.set(ENTITY_KEY(p.id), p);

/**
 * @function removeProductEntity
 * @description Supprime un produit individuel du stockage local en utilisant son ID.
 * @param {string} id - L'ID du produit à supprimer.
 * @returns {Promise<void>} Une promesse qui résout une fois le produit supprimé.
 */
const removeProductEntity = (id: string) => storage.remove(ENTITY_KEY(id));

/**
 * @function seedIfNeeded
 * @description Initialise le stockage local avec les produits mockés si ce n'est pas déjà fait.
 * @returns {Promise<void>} Une promesse qui résout une fois l'opération de seeding terminée.
 */
const seedIfNeeded = async () => {
  const alreadySeeded = await storage.get<string[]>(INDEX_KEY);
  if (alreadySeeded) return;

  const ids = (allProducts as Product[]).map((p) => p.id);
  await saveIndex(ids);
  await Promise.all((allProducts as Product[]).map(saveProductEntity));
};

/**
 * @function loadProducts
 * @description Charge tous les produits depuis le stockage local. Utilise un cache pour optimiser les lectures et effectue un "seeding" initial si nécessaire.
 * @returns {Promise<Product[]>} Une promesse qui résout avec un tableau de tous les produits.
 */
export const loadProducts = async (): Promise<Product[]> => {
  if (cachedProducts) return cachedProducts;

  await seedIfNeeded();
  const ids = await loadIndex();

  const products = (
    await Promise.all(ids.map((id) => storage.get<Product>(ENTITY_KEY(id))))
  ).filter(Boolean) as Product[];

  cachedProducts = products;
  return products;
};

/**
 * @function getAllProducts
 * @description Récupère tous les produits disponibles. C'est un alias pour `loadProducts`.
 * @returns {Promise<Product[]>} Une promesse qui résout avec un tableau de tous les produits.
 */
export const getAllProducts = () => loadProducts();

/**
 * @function getProductById
 * @description Récupère un produit spécifique par son ID. Cherche d'abord dans le cache, puis dans le stockage local.
 * @param {string} id - L'ID du produit à récupérer.
 * @returns {Promise<Product | null>} Une promesse qui résout avec l'objet produit ou `null` s'il n'est pas trouvé.
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  if (cachedProducts) {
    const match = cachedProducts.find((p) => p.id === id);
    if (match) return match;
  }
  return (await storage.get<Product>(ENTITY_KEY(id))) ?? null;
};

/**
 * @function addProduct
 * @description Ajoute un nouveau produit au système. Génère un ID unique pour le nouveau produit et met à jour le stockage local ainsi que le cache.
 * @param {Omit<Product, 'id'>} payload - Les données du nouveau produit, sans l'ID (il sera généré).
 * @returns {Promise<Product>} Une promesse qui résout avec l'objet du nouveau produit ajouté.
 */
export const addProduct = async (
  payload: Omit<Product, 'id'>,
): Promise<Product> => {
  const products = await loadProducts();
  const newProduct: Product = {
    ...payload,
    id: Date.now().toString(),
  };

  const next = [...products, newProduct];
  await Promise.all([
    saveProductEntity(newProduct),
    saveIndex(next.map((p) => p.id)),
  ]);

  cachedProducts = next;
  return newProduct;
};

/**
 * @function updateProductById
 * @description Met à jour les informations d'un produit existant par son ID. Met à jour le stockage local et le cache.
 * @param {string} id - L'ID du produit à mettre à jour.
 * @param {Partial<Product>} data - Les données partielles du produit à modifier.
 * @returns {Promise<Product>} Une promesse qui résout avec l'objet produit mis à jour.
 * @throws {Error} Si le produit avec l'ID spécifié est introuvable.
 */
export const updateProductById = async (
  id: string,
  data: Partial<Product>,
): Promise<Product> => {
  const products = await loadProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Produit #${id} introuvable.`);

  const updated: Product = { ...products[idx], ...data, id };
  products[idx] = updated;

  await Promise.all([
    saveProductEntity(updated),
    saveIndex(products.map((p) => p.id)),
  ]);

  cachedProducts = products;
  return updated;
};

/**
 * @function deleteProductById
 * @description Supprime un produit du système par son ID. Met à jour le stockage local et le cache.
 * @param {string} id - L'ID du produit à supprimer.
 * @returns {Promise<void>} Une promesse qui résout une fois le produit supprimé.
 * @throws {Error} Si le produit avec l'ID spécifié est introuvable.
 */
export const deleteProductById = async (id: string) => {
  const products = await loadProducts();
  const next = products.filter((p) => p.id !== id);
  if (next.length === products.length)
    throw new Error(`Produit #${id} introuvable, impossible de supprimer.`);

  await Promise.all([
    removeProductEntity(id),
    saveIndex(next.map((p) => p.id)),
  ]);

  cachedProducts = next;
};

/**
 * @function invalidateProductsCache
 * @description Invalide le cache des produits. Force le rechargement des produits depuis le stockage local lors du prochain appel à `loadProducts`.
 * @returns {void}
 */
export const invalidateProductsCache = () => {
  cachedProducts = null;
};