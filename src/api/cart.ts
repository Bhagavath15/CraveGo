import { api } from "./client";

export const addToCart = (
    restaurantId: string,
    menuItemId: string,
    quantity: number,
    customization?: { name: string; price: number }[],
    itemName?: string
) =>
    api.post("/cart/add", {
        restaurantId, menuItemId, quantity, customization, name: itemName,
    });

export const getCart = () => api.get("/cart");

export const updateCartItem = (menuItemId: string, quantity: number) =>
    api.patch("/cart/update", { menuItemId, quantity });

export const removeCartItem = (menuItemId: string) =>
    api.post("/cart/delete", { menuItemId });

export const clearCart = () => api.post("/cart/clear");
