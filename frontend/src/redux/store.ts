import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice'
import checkoutReducer from './slices/checkoutSlice'
import adminReducer from './slices/adminSlice'
import orderReducer from './slices/orderSlice'
import adminOrderReducer from "./slices/adminOrderSlice";
import adminProductReducer from "./slices/adminProductSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productReducer,
        cart: cartReducer,
        checkout: checkoutReducer,
        orders: orderReducer,
        admin: adminReducer,
        adminOrders: adminOrderReducer,
        adminProducts: adminProductReducer,
    },
});

export default store;
