import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductModel } from "../Models/ProductModel";

export function initProducts(currentState: ProductModel[], action: PayloadAction<ProductModel[]>): ProductModel[] {
    return action.payload.map(product => ({
        ...product,
        isLiked: product.isLiked || false,
        likeCount: product.likeCount || 0
    }));
}

export function addProduct(currentState: ProductModel[], action: PayloadAction<ProductModel>): ProductModel [] {
    const newState = [...currentState];
    newState.push({
        ...action.payload,
        isLiked: false,
        likeCount: 0
    });
    return newState;
}

export function updateProduct(currentState: ProductModel[], action: PayloadAction<ProductModel>): ProductModel[] {
    const newState = [...currentState];
    const index = newState.findIndex(v => v.productId === action.payload.productId);
    newState[index] = {
        ...action.payload,
        isLiked: action.payload.isLiked || false,
        likeCount: action.payload.likeCount || 0
    };
    return newState;
}

export function deleteProduct(currentState: ProductModel[], action: PayloadAction<string>): ProductModel[] {
    const newState = [...currentState];
    const index = newState.findIndex(v => v.productId === action.payload);
    newState.splice(index, 1);
    return newState;
}

export function clearProducts(currentState: ProductModel[], action: PayloadAction): ProductModel[] {
    return [];
}

export function updateProductsLikeStatus(currentState: ProductModel[], action: PayloadAction<ProductModel[]>): ProductModel[] {
    return currentState.map(product => {
        const likedProduct = action.payload.find(v => v.productId === product.productId);
        return likedProduct 
            ? { ...product, isLiked: true, likeCount: likedProduct.likeCount }
            : { ...product, isLiked: false, likeCount: 0 }
    });
}

export function addLikeToProduct(currentState: ProductModel[], action: PayloadAction<string>): ProductModel[] {
    return currentState.map(product => 
        product.productId === action.payload 
            ? { ...product, isLiked: true, likeCount: product.likeCount + 1 }
            : product
    );
}

export function removeLikeFromProduct(currentState: ProductModel[], action: PayloadAction<string>): ProductModel[] {
    return currentState.map(product => 
        product.productId === action.payload 
            ? { ...product, isLiked: false, likeCount: product.likeCount - 1 }
            : product
    );
}

export const productSlice = createSlice({
    name: "products",
    initialState: [],
    reducers: {
        initProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        clearProducts,
        updateProductsLikeStatus,
        addLikeToProduct,
        removeLikeFromProduct
    }
});

export const productActions = productSlice.actions;