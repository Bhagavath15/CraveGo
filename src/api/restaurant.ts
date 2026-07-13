import { api } from "./client";

export const getRestaurants = () => api.get("/restaurants");

export const getRestaurantMenu = (restaurantId: string) =>
    api.get(`/restaurants/${restaurantId}/menu`);
