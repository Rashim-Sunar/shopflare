import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* =========================================================
   ASYNC THUNKS (ADMIN ONLY)
   ========================================================= */

// Fetch all orders (Admin)
export const fetchAllOrders = createAsyncThunk(
  "adminOrders/fetchAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      return response.data.orders;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch orders" }
      );
    }
  }
);

// Update order status (Admin)
export const updateOrderStatus = createAsyncThunk(
  "adminOrders/updateOrderStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      return response.data?.updatedOrder;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update order status" }
      );
    }
  }
);

// Delete order (Admin)
export const deleteOrder = createAsyncThunk(
  "adminOrders/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to delete order" }
      );
    }
  }
);

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  orders: [],
  loading: {
    fetch: false,
    update: false,
    delete: false,
  },
  error: null,
};

/* =========================================================
   SLICE
   ========================================================= */

const adminOrderSlice = createSlice({
  name: "adminOrders",
  initialState,
  reducers: {
    clearAdminOrderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- FETCH ---------- */
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.orders = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error =
          action.payload?.message || action.error?.message;
      })

      /* ---------- UPDATE ---------- */
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading.update = false;

        const index = state.orders.findIndex(
          (order) => order._id === action.payload._id
        );

        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading.update = false;
        state.error =
          action.payload?.message || action.error?.message;
      })

      /* ---------- DELETE ---------- */
      .addCase(deleteOrder.pending, (state) => {
        state.loading.delete = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading.delete = false;
        state.orders = state.orders.filter(
          (order) => order._id !== action.payload
        );
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading.delete = false;
        state.error =
          action.payload?.message || action.error?.message;
      });
  },
});

export const { clearAdminOrderError } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;
