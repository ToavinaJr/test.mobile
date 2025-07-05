// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import { getAllProducts, invalidateProductsCache, addProduct } from '@/services/products.services';
// import { Product } from '@/types';
// import { AddProductFormInput } from '@/schemas/product/product-add.schema';

// interface ProductState {
//   products: Product[];
//   loading: boolean;
//   error: string | null;
//   search: string;
//   selectedCategory: string | null;
//   addingProduct: boolean;
//   addProductError: string | null;
// }

// const initialState: ProductState = {
//   products: [],
//   loading: false,
//   error: null,
//   search: '',
//   selectedCategory: null,
//   addingProduct: false,
//   addProductError: null,
// };

// export const fetchProducts = createAsyncThunk(
//   'products/fetchProducts',
//   async (_, { rejectWithValue }) => {
//     try {
//       invalidateProductsCache();
//       const data = await getAllProducts();
//       return data;
//     } catch (error: any) {
//       return rejectWithValue(error.message || 'Échec du chargement des produits');
//     }
//   }
// );

// export const addNewProduct = createAsyncThunk(
//   'products/addNewProduct',
//   async (productPayload: Omit<Product, 'id'>, { rejectWithValue, dispatch }) => {
//     try {
//       const newProduct = await addProduct(productPayload);
//       invalidateProductsCache();
//       dispatch(fetchProducts());
//       return newProduct;
//     } catch (error: any) {
//       return rejectWithValue(error.message || 'Échec de l\'ajout du produit');
//     }
//   }
// );

// const productSlice = createSlice({
//   name: 'products',
//   initialState,
//   reducers: {
//     setSearch: (state, action: PayloadAction<string>) => {
//       state.search = action.payload;
//     },
//     setSelectedCategory: (state, action: PayloadAction<string | null>) => {
//       state.selectedCategory = action.payload;
//     },
//     clearProducts: (state) => {
//       state.products = [];
//       state.loading = false;
//       state.error = null;
//       state.search = '';
//       state.selectedCategory = null;
//       state.addingProduct = false;
//       state.addProductError = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchProducts.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
//         state.loading = false;
//         state.products = action.payload;
//       })
//       .addCase(fetchProducts.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//         state.products = [];
//       })
//       .addCase(addNewProduct.pending, (state) => {
//         state.addingProduct = true;
//         state.addProductError = null;
//       })
//       .addCase(addNewProduct.fulfilled, (state, action: PayloadAction<Product>) => {
//         state.addingProduct = false;
//       })
//       .addCase(addNewProduct.rejected, (state, action) => {
//         state.addingProduct = false;
//         state.addProductError = action.payload as string;
//       });
//   },
// });

// export const { setSearch, setSelectedCategory, clearProducts } = productSlice.actions;

// export default productSlice.reducer;
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getAllProducts, invalidateProductsCache, addProduct, updateProductById } from '@/services/products.services';
import { Product } from '@/types';
import { AddProductFormInput } from '@/schemas/add-product.schema';
import { EditProductFormInput } from '@/schemas/product/product-edit.schema';

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  search: string;
  selectedCategory: string | null;
  addingProduct: boolean;
  addProductError: string | null;
  updatingProduct: boolean;
  updateProductError: string | null;
  currentPage: number;
  itemsPerPage: number;
  totalProducts: number;
}

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

export const updateExistingProduct = createAsyncThunk(
  'products/updateExistingProduct',
  async ({ id, data }: { id: string; data: Partial<Product> }, { rejectWithValue, dispatch }) => {
    try {
      const updatedProduct = await updateProductById(id, data);
      invalidateProductsCache();
      dispatch(fetchProducts());
      return updatedProduct;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Échec de la mise à jour du produit');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.currentPage = 1;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
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
        state.totalProducts = action.payload.length;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.products = [];
        state.totalProducts = 0;
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
      })
      .addCase(updateExistingProduct.pending, (state) => {
        state.updatingProduct = true;
        state.updateProductError = null;
      })
      .addCase(updateExistingProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.updatingProduct = false;
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateExistingProduct.rejected, (state, action) => {
        state.updatingProduct = false;
        state.updateProductError = action.payload as string;
      });
  },
});

export const { setSearch, setSelectedCategory, setCurrentPage, clearProducts } = productSlice.actions;

export default productSlice.reducer;
