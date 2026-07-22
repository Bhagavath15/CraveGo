import { api } from "./client";

export const getRestaurants = (search?: string) =>
    api.get(`/restaurants${search ? `?search=${encodeURIComponent(search)}` : ""}`);

export const getRestaurantMenu = (restaurantId: string) =>
    api.get(`/restaurants/${restaurantId}/menu`);


