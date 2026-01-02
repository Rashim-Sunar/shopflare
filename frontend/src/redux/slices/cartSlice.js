import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* =========================================================
   LOCAL STORAGE HELPERS
   ========================================================= */

/**
 * Safely load cart from localStorage
 */
const loadCartFromStorage = () => {
  try {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : { products: [] };
  } catch (error) {
    console.error("Failed to parse cart from storage", error);
    return { products: [] };
  }
};

/**
 * Persist cart to localStorage
 */
const saveCartToStorage = (cart) => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

/* =========================================================
   ASYNC THUNKS
   ========================================================= */

/**
 * Fetch cart for logged-in user or guest
 */
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async ({ userId, guestId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart`,
        { params: { userId, guestId } }
      );
      // console.log("Cart products: ",response.data?.cart.products)
      return response.data;
    } catch (error) {
      console.log("Error fetcing cart",error);
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch cart" }
      );
    }
  }
);

/**
 * Add product to cart
 */
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart`,
        payload
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to add product to cart" }
      );
    }
  }
);

/**
 * Update quantity of a cart item
 */
export const updateCartItemQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart`,
        payload
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update cart item" }
      );
    }
  }
);

/**
 * Remove item from cart
 */
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart`,
        { data: payload }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to remove item from cart" }
      );
    }
  }
);

/**
 * Merge guest cart into user cart after login
 */
export const mergeCart = createAsyncThunk(
  "cart/mergeCart",
  async ({ guestId, user }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart/merge`,
        { guestId, user },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to merge cart" }
      );
    }
  }
);

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  cart: loadCartFromStorage(),
  loading: {
    fetch: false,
    add: false,
    update: false,
    remove: false,
    merge: false,
  },
  error: null,
};

/* =========================================================
   CART SLICE
   ========================================================= */

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /**
     * Clear cart completely (logout / order placed)
     */
    clearCart: (state) => {
      state.cart = { products: [] };
      localStorage.removeItem("cart");
    },

    /**
     * Clear cart-related errors
     */
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- FETCH CART ---------- */
      .addCase(fetchCart.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.cart = action.payload?.cart;
        saveCartToStorage(action.payload?.cart);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = action.payload?.message || action.error?.message;
      })
      /* ---------- ADD TO CART ---------- */
      .addCase(addToCart.pending, (state) => {
        state.loading.add = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading.add = false;
        state.cart = action.payload;
        saveCartToStorage(action.payload);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading.add = false;
        state.error = action.payload?.message || action.error?.message;
      })
      /* ---------- UPDATE CART ITEM ---------- */
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.loading.update = false;
        state.cart = action.payload?.cart;
        saveCartToStorage(action.payload?.payload);
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.payload?.message || action.error?.message;
      })
      /* ---------- REMOVE FROM CART ---------- */
      .addCase(removeFromCart.pending, (state) => {
        state.loading.remove = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading.remove = false;
        state.cart = action.payload;
        saveCartToStorage(action.payload);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading.remove = false;
        state.error = action.payload?.message || action.error?.message;
      })

      /* ---------- MERGE CART ---------- */
      .addCase(mergeCart.pending, (state) => {
        state.loading.merge = true;
        state.error = null;
      })
      .addCase(mergeCart.fulfilled, (state, action) => {
        state.loading.merge = false;
        state.cart = action.payload;
        saveCartToStorage(action.payload);
      })
      .addCase(mergeCart.rejected, (state, action) => {
        state.loading.merge = false;
        state.error = action.payload?.message || action.error?.message;
      });
  },
});

/* =========================================================
   EXPORTS
   ========================================================= */

export const { clearCart, clearCartError } = cartSlice.actions;
// export cartReducer to be added in store
export default cartSlice.reducer;
