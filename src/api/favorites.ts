import { api } from "./client";

export const addFavourite = (restaurantId: string) =>
    api.post("/favorites", { restaurantId });

export const getFavourites = () => api.get("/favorites");

export const removeFavourite = (restaurantId: string) =>
    api.delete(`/favorites/${restaurantId}`);

export const checkFavouriteStatus = (restaurantId: string) =>
    api.get(`/favorites/${restaurantId}/status`);
