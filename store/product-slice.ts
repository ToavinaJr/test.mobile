import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getAllProducts, invalidateProductsCache, addProduct } from '@/services/products.services';
import { Product } from '@/types';
import { AddProductFormInput } from '@/schemas/product/product-add.schema';

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  search: string;
  selectedCategory: string | null;
  addingProduct: boolean;
  addProductError: string | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  search: '',
  selectedCategory: null,
  addingProduct: false,
  addProductError: null,
};

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

export const addNewProduct = createAsyncThunk(
  'products/addNewProduct',
  async (productPayload: Omit<Product, 'id'>, { rejectWithValue, dispatch }) => {
    try {
      const newProduct = await addProduct(productPayload);
      invalidateProductsCache();
      dispatch(fetchProducts());
      return newProduct;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Échec de l\'ajout du produit');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    clearProducts: (state) => {
      state.products = [];
      state.loading = false;
      state.error = null;
      state.search = '';
      state.selectedCategory = null;
      state.addingProduct = false;
      state.addProductError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.products = [];
      })
      .addCase(addNewProduct.pending, (state) => {
        state.addingProduct = true;
        state.addProductError = null;
      })
      .addCase(addNewProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.addingProduct = false;
      })
      .addCase(addNewProduct.rejected, (state, action) => {
        state.addingProduct = false;
        state.addProductError = action.payload as string;
      });
  },
});

export const { setSearch, setSelectedCategory, clearProducts } = productSlice.actions;

export default productSlice.reducer;
