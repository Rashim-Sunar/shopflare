import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

// Retrieve user info and token from localStorage if available
const userFromStorage = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null;

// Check for an existing guestID in the localStorage or generate a new one
const initialGuestId = localStorage.getItem("guestId") || `guest_${new Date().getTime()}`;
localStorage.setItem("guestId", initialGuestId);

// Initial state for authentication slice
const initialState = {
    user: userFromStorage,
    guestId: initialGuestId,
    loading: false,
    error: null
};

// Async Thunk for User Login
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async(userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
                userData
            );

            localStorage.setItem("userInfo", JSON.stringify(response.data.user));
            localStorage.setItem("userToken", response.data.token);

            // console.log("Response: ", response.data);
            return response.data.user;
        } catch (error) {
            // console.log("LOGIN ERROR:", error.response?.data);
            return rejectWithValue(error.response.data);
        }
    }
);
 
// Async Thunk for User Login
export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async(userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
                userData
            );

            console.log("Response: ", response.data);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Slice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.guestId =  `guest_${new Date().getTime()}`; // Reset guest ID on logout
            localStorage.removeItem("userInfo");
            localStorage.removeItem("userToken");
            localStorage.setItem("guestId", state.guestId); // Set new guest ID in localStorage
        },
        generateNewGuestId: (state) => {
            state.guestId = `guest_${new Date().getTime()}`;
            localStorage.setItem("guestId", state.guestId);
        },
        // Clear the error for a component otherwise it is shown again if the url is backed to it 
        //(eg. Login failed, now if you go to register and again come back to login the error is shown again and again)
        clearError: (state) => {
            state.error = null;
        },
    },
    // extraReducer for async thunks
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Login failed";
            })
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Registration failed";
            });
    },
});

// export the actions 
export const { logout, generateNewGuestId, clearError } = authSlice.actions;

// export reducers so that it can be added to the Redux store
export default authSlice.reducer;