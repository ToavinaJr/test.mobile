import { Product } from '@/types';
import allProducts from '@/data/products.json';
import { storage } from './storage.services';

const INDEX_KEY = 'products:index';
const ENTITY_KEY = (id: string) => `product:${id}`;

let cachedProducts: Product[] | null = null;

const loadIndex = async (): Promise<string[]> =>
  (await storage.get<string[]>(INDEX_KEY)) ?? [];

const saveIndex = (ids: string[]) => storage.set(INDEX_KEY, ids);

const saveProductEntity = (p: Product) => storage.set(ENTITY_KEY(p.id), p);

const removeProductEntity = (id: string) => storage.remove(ENTITY_KEY(id));

const seedIfNeeded = async () => {
  const alreadySeeded = await storage.get<string[]>(INDEX_KEY);
  if (alreadySeeded) return;

  const ids = (allProducts as Product[]).map((p) => p.id);
  await saveIndex(ids);
  await Promise.all((allProducts as Product[]).map(saveProductEntity));
};

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

export const getAllProducts = () => loadProducts();

export const getProductById = async (id: string): Promise<Product | null> => {
  if (cachedProducts) {
    const match = cachedProducts.find((p) => p.id === id);
    if (match) return match;
  }
  return (await storage.get<Product>(ENTITY_KEY(id))) ?? null;
};

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

export const invalidateProductsCache = () => {
  cachedProducts = null;
};