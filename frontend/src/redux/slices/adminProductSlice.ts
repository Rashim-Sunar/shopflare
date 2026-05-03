import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* ============================
   THUNKS
============================ */

// GET all products (Admin)
export const fetchAdminProducts = createAsyncThunk(
  "adminProducts/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/products`,
         {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
    );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

// GET single product (Admin)
export const fetchAdminProductById = createAsyncThunk(
  "adminProducts/fetchById",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// UPDATE product
export const updateAdminProduct = createAsyncThunk(
  "adminProducts/update",
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/products/${productId}`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return data.updatedProduct;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// DELETE product
export const deleteAdminProduct = createAsyncThunk(
  "adminProducts/delete",
  async (productId, { rejectWithValue }) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/products/${productId}`,
         {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
    );
      return productId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  }
);

/* ============================
   SLICE
============================ */

const adminProductSlice = createSlice({
  name: "adminProducts",
  initialState: {
    products: [],
    selectedProduct: null,
    totalProducts: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminProductError: (state) => {
      state.error = null;
    },
    clearAdminSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH PRODUCTS
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.totalProducts = action.payload.totalProducts;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH ONE
      .addCase(fetchAdminProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchAdminProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

        // UPDATE
      .addCase(updateAdminProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(updateAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE PRODUCT
      .addCase(deleteAdminProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(
          (p) => p._id !== action.payload
        );
      })
      .addCase(deleteAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminProductError, clearAdminSelectedProduct } = adminProductSlice.actions;
export default adminProductSlice.reducer;
