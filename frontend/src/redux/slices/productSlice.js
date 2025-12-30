import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* =========================================================
   ASYNC THUNKS
   ========================================================= */

/**
 * Fetch products using filters (collection, category, price, etc.)
 */
export const fetchProductsByFilters = createAsyncThunk(
  "products/fetchByFilters",
  async (filters, { rejectWithValue }) => { // filters is an object
    try {
      const query = new URLSearchParams();

      // Dynamically append only valid filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query.append(key, value);
      });

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products?${query.toString()}`
      );

      // console.log(response.data.products);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch products" });
    }
  }
);

/**
 * Fetch single product details by ID
 */
export const fetchProductDetails = createAsyncThunk(
  "products/fetchProductDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch product details" });
    }
  }
);

/**
 * Update product (Admin only)
 */
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, productDetails }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`,
        productDetails,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Product update failed" });
    }
  }
);

/**
 * Fetch similar products
 */
export const fetchSimilarProducts = createAsyncThunk(
  "products/fetchSimilarProducts",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/similar/${id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch similar products" });
    }
  }
);

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  products: [],
  selectedProduct: null,
  similarProducts: [],
  loading: {
    list: false,
    details: false,
    update: false,
    similar: false,
  },
  error: null,
  filters: {
    collection: "",
    category: "",
    gender: "",
    color: "",
    size: "",
    material: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    sort: "",
    search: "",
  },
};

/* =========================================================
   SLICE
   ========================================================= */

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    /**
     * Update filters (merge with existing)
     */
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    /**
     * Reset all filters
     */
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },

    /**
     * Clear global error
     */
    clearProductError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- FETCH PRODUCTS ---------- */
      .addCase(fetchProductsByFilters.pending, (state) => {
        state.loading.list = true;
        state.error = null;
      })
      .addCase(fetchProductsByFilters.fulfilled, (state, action) => {
        state.loading.list = false;
        state.products = Array.isArray(action.payload?.products) ? action.payload?.products : [];
      })
      .addCase(fetchProductsByFilters.rejected, (state, action) => {
        state.loading.list = false;
        state.error = action.payload?.message || action.error?.message;
      })

      /* ---------- FETCH PRODUCT DETAILS ---------- */
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading.details = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading.details = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading.details = false;
        state.error = action.payload?.message || action.error?.message;
      })

      /* ---------- UPDATE PRODUCT ---------- */
      .addCase(updateProduct.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading.update = false;

        const updatedProduct = action.payload;
        const index = state.products.findIndex(
          (product) => product._id === updatedProduct._id
        );

        if (index !== -1) {
          state.products[index] = updatedProduct;
        }

        // Also update selected product if open
        if (state.selectedProduct?._id === updatedProduct._id) {
          state.selectedProduct = updatedProduct;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.payload?.message || action.error?.message;
      })

      /* ---------- FETCH SIMILAR PRODUCTS ---------- */
      .addCase(fetchSimilarProducts.pending, (state) => {
        state.loading.similar = true;
        state.error = null;
      })
      .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
        state.loading.similar = false;
        state.similarProducts = action.payload || [];
      })
      .addCase(fetchSimilarProducts.rejected, (state, action) => {
        state.loading.similar = false;
        state.error = action.payload?.message || action.error?.message;
      });
  },
});

/* =========================================================
   EXPORTS
   ========================================================= */

export const {
  setFilters,
  clearFilters,
  clearProductError,
} = productSlice.actions;

export default productSlice.reducer;
