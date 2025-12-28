import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* =========================================================
   ASYNC THUNKS (ADMIN ONLY)
   ========================================================= */

/**
 * Fetch all users (Admin)
 */
export const fetchAllUsers = createAsyncThunk(
  "admin/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      return response.data.users;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch users" }
      );
    }
  }
);

/**
 * Create a new user (Admin)
 */
export const createUser = createAsyncThunk(
  "admin/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to create user" }
      );
    }
  }
);

/**
 * Update user (Admin)
 */
export const updateUser = createAsyncThunk(
  "admin/updateUser",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${id}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update user" }
      );
    }
  }
);

/**
 * Delete user (Admin)
 */
export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      return id; // return deleted user id
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to delete user" }
      );
    }
  }
);

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  users: [],        // All users list
  loading: {
    fetch: false,
    create: false,
    update: false,
    delete: false,
  },
  error: null,
};

/* =========================================================
   ADMIN SLICE
   ========================================================= */

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    /**
     * Clear admin errors
     */
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ---------- FETCH USERS ---------- */
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Unable to load users";
      })

      /* ---------- CREATE USER ---------- */
      .addCase(createUser.pending, (state) => {
        state.loading.create = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading.create = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading.create = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Unable to create user";
      })

      /* ---------- UPDATE USER ---------- */
      .addCase(updateUser.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading.update = false;

        const index = state.users.findIndex(
          (user) => user._id === action.payload._id
        );

        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading.update = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Unable to update user";
      })

      /* ---------- DELETE USER ---------- */
      .addCase(deleteUser.pending, (state) => {
        state.loading.delete = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading.delete = false;
        state.users = state.users.filter(
          (user) => user._id !== action.payload
        );
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading.delete = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Unable to delete user";
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
