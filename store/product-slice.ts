import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getAllProducts, invalidateProductsCache, addProduct, updateProductById, deleteProductById } from '@/services/products-services';
import { Product } from '@/types';

/**
 * Interface définissant la structure du state pour la gestion des produits
 */
interface ProductState {
  products: Product[];                // Liste des produits chargés
  loading: boolean;                   // Indicateur de chargement général (fetch)
  error: string | null;               // Message d'erreur général
  search: string;                    // Texte de recherche filtrant les produits
  selectedCategory: string | null;   // Catégorie sélectionnée pour filtrer
  addingProduct: boolean;            // Indicateur de chargement pendant l'ajout
  addProductError: string | null;    // Erreur lors de l'ajout
  updatingProduct: boolean;          // Indicateur de chargement pendant la mise à jour
  updateProductError: string | null; // Erreur lors de la mise à jour
  currentPage: number;               // Page courante pour la pagination
  itemsPerPage: number;              // Nombre d'items par page (fixe ici à 10)
  totalProducts: number;             // Nombre total de produits (après filtrage)
  deletingProduct: boolean;          // Indicateur de chargement pendant la suppression
  deleteProductError: string | null; // Erreur lors de la suppression
}

/**
 * État initial de la slice
 */
const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  search: '',
  selectedCategory: null,
  addingProduct: false,
  addProductError: null,
  updatingProduct: false,
  updateProductError: null,
  currentPage: 1,
  itemsPerPage: 10,
  totalProducts: 0,
  deletingProduct: false,
  deleteProductError: null,
};

/**
 * AsyncThunk pour récupérer la liste des produits
 * - Invalide le cache (via service) avant de récupérer les produits
 * - Retourne la liste ou une erreur en cas d'échec
 */
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      invalidateProductsCache();
      const data = await getAllProducts();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Échec du chargement des produits');
    }
  }
);

/**
 * AsyncThunk pour ajouter un nouveau produit
 * - Envoie les données du produit à ajouter
 * - Invalide le cache et relance la récupération des produits
 * - Retourne le produit ajouté ou une erreur
 */
export const addNewProduct = createAsyncThunk(
  'products/addNewProduct',
  async (productPayload: Omit<Product, 'id'>, { rejectWithValue, dispatch }) => {
    try {
      const newProduct = await addProduct(productPayload);
      invalidateProductsCache();
      dispatch(fetchProducts()); // Refresh de la liste après ajout
      return newProduct;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Échec de l\'ajout du produit');
    }
  }
);

/**
 * AsyncThunk pour mettre à jour un produit existant
 * - Prend l'id du produit et les données à modifier
 * - Invalide le cache et recharge la liste des produits
 * - Retourne le produit mis à jour ou une erreur
 */
export const updateExistingProduct = createAsyncThunk(
  'products/updateExistingProduct',
  async ({ id, data }: { id: string; data: Partial<Product> }, { rejectWithValue, dispatch }) => {
    try {
      const updatedProduct = await updateProductById(id, data);
      invalidateProductsCache();
      dispatch(fetchProducts()); // Refresh de la liste après update
      return updatedProduct;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Échec de la mise à jour du produit');
    }
  }
);

/**
 * AsyncThunk pour supprimer un produit
 * - Prend l'id du produit à supprimer
 * - Invalide le cache et recharge la liste des produits
 * - Retourne l'id supprimé ou une erreur
 */
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId: string, { rejectWithValue, dispatch }) => {
    try {
      await deleteProductById(productId);
      invalidateProductsCache();
      dispatch(fetchProducts()); // Refresh de la liste après suppression
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Échec de la suppression du produit');
    }
  }
);

/**
 * Slice Redux Toolkit pour la gestion des produits
 */
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    /**
     * Met à jour le texte de recherche et reset la page courante à 1
     */
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.currentPage = 1;
    },
    /**
     * Met à jour la catégorie sélectionnée et reset la page courante à 1
     */
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
      state.currentPage = 1;
    },
    /**
     * Met à jour la page courante de la pagination
     */
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    /**
     * Réinitialise complètement le state à l'état initial (utile par ex. lors d'une déconnexion)
     */
    clearProducts: (state) => {
      state.products = [];
      state.loading = false;
      state.error = null;
      state.search = '';
      state.selectedCategory = null;
      state.addingProduct = false;
      state.addProductError = null;
      state.updatingProduct = false;
      state.updateProductError = null;
      state.currentPage = 1;
      state.itemsPerPage = 10;
      state.totalProducts = 0;
      state.deletingProduct = false;
      state.deleteProductError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Récupération des produits - état pending
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Récupération des produits - succès
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.products = action.payload;
        state.totalProducts = action.payload.length;
      })
      // Récupération des produits - échec
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.products = [];
        state.totalProducts = 0;
      })
      // Ajout produit - état pending
      .addCase(addNewProduct.pending, (state) => {
        state.addingProduct = true;
        state.addProductError = null;
      })
      // Ajout produit - succès
      .addCase(addNewProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.addingProduct = false;
        // Le produit est ajouté dans la liste via fetchProducts déclenché après dispatch
      })
      // Ajout produit - échec
      .addCase(addNewProduct.rejected, (state, action) => {
        state.addingProduct = false;
        state.addProductError = action.payload as string;
      })
      // Mise à jour produit - état pending
      .addCase(updateExistingProduct.pending, (state) => {
        state.updatingProduct = true;
        state.updateProductError = null;
      })
      // Mise à jour produit - succès
      .addCase(updateExistingProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.updatingProduct = false;
        // Mise à jour locale du produit dans la liste (optimistic update)
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      // Mise à jour produit - échec
      .addCase(updateExistingProduct.rejected, (state, action) => {
        state.updatingProduct = false;
        state.updateProductError = action.payload as string;
      })
      // Suppression produit - état pending
      .addCase(deleteProduct.pending, (state) => {
        state.deletingProduct = true;
        state.deleteProductError = null;
      })
      // Suppression produit - succès
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.deletingProduct = false;
        // Suppression locale du produit dans la liste
        state.products = state.products.filter(p => p.id !== action.payload);
        state.totalProducts = state.products.length;
      })
      // Suppression produit - échec
      .addCase(deleteProduct.rejected, (state, action) => {
        state.deletingProduct = false;
        state.deleteProductError = action.payload as string;
      });
  },
});

// Export des actions synchrones (reducers)
export const { setSearch, setSelectedCategory, setCurrentPage, clearProducts } = productSlice.actions;

// Export du reducer pour configuration du store
export default productSlice.reducer;
