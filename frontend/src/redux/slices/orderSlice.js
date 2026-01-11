import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* =========================================================
   ASYNC THUNKS
   ========================================================= */

/**
 * Fetch all orders of the logged-in user
 */
export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch user orders" }
      );
    }
  }
);

/**
 * Fetch details of a single order by ID
 */
export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchOrderDetails",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch order details" }
      );
    }
  }
);

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  orders: [],           
  totalOrders: 0,       // Total count (if backend sends it)
  orderDetails: null,   // Selected order details
  loading: {
    list: false,
    details: false,
  },
  error: null,
};

/* =========================================================
   ORDER SLICE
   ========================================================= */

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    /**
     * Clear order details (when leaving order page)
     */
    clearOrderDetails: (state) => {
      state.orderDetails = null;
    },

    /**
     * Clear order-related errors
     */
    clearOrderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ---------- FETCH USER ORDERS ---------- */
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading.list = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading.list = false;   
        state.orders = action.payload?.order || [];
        state.totalOrders = action.payload?.order?.length || 0;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading.list = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to load orders";
      })
      /* ---------- FETCH ORDER DETAILS ---------- */
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading.details = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading.details = false;
        state.orderDetails = action.payload?.order;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading.details = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to load order details";
      });
  },
});


export const { clearOrderDetails, clearOrderError } = orderSlice.actions;

export default orderSlice.reducer;
