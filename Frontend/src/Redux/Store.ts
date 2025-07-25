import { configureStore } from "@reduxjs/toolkit";
// import { LikeModel } from "../Models/LikeModel";
import { UserModel } from "../Models/UserModel";
import { loggerMiddleware } from "./Middleware";
import { userSlice } from "./UserSlice";
// import { ProductModel } from "../Models/ProductModel";
// import { productSlice } from "./ProductSlice";


export type AppState = {
    // products: ProductModel[]; // products state type - disabled for game project
    user: UserModel | null; // Allow null for the initial state
    // likes: LikeModel[]; // Likes state type
};

export const store = configureStore({
    reducer: {
        // products: productSlice.reducer, // disabled for game project
        user: userSlice.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(loggerMiddleware)
});