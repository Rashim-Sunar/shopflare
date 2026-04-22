import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getAuthHeaders } from "../../utils/authToken";

/* =========================================================
   ASYNC THUNK
   ========================================================= */

/**
 * Create a checkout session (authenticated user)
 */
export const createCheckout = createAsyncThunk(
  "checkout/createCheckout",
  async (checkoutData, { rejectWithValue }) => {
    const authHeaders = getAuthHeaders();

    if (!authHeaders.Authorization) {
      return rejectWithValue({ message: "Please login to continue checkout" });
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout`,
        checkoutData,
        {
          headers: authHeaders,
        }
      );
      console.log("While creating checkout: ", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to create checkout" }
      );
    }
  }
);

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  checkout: null,   // Stores checkout session/order info
  loading: false,   // Loading state for checkout creation
  error: null,      // Error message (if any)
};

/* =========================================================
   SLICE
   ========================================================= */

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    /**
     * Clear checkout data (after order success / logout)
     */
    clearCheckout: (state) => {
      state.checkout = null;
      state.error = null;
      state.loading = false;
    },

    /**
     * Clear checkout-related errors
     */
    clearCheckoutError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- CREATE CHECKOUT ---------- */
      .addCase(createCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = action.payload?.checkout;
        state.error = null;
      })
      .addCase(createCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Checkout failed";
      });
  },
});


export const { clearCheckout, clearCheckoutError } = checkoutSlice.actions;

export default checkoutSlice.reducer;
