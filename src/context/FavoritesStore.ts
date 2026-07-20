import { useState, useEffect } from "react";
import { getToken } from "../utils/authStore";
import { addFavourite as addFavouriteApi, removeFavourite as removeFavouriteApi, getFavourites as getFavouritesApi } from "../api/favorites";

let favouriteIds = new Set<string>();
let listeners: Set<() => void> = new Set();
let loaded = false;
let loadPromise: Promise<void> | null = null;

const notify = () => {
    listeners.forEach((l) => l());
};

export const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

const load = async () => {
    try {
        const token = await getToken();
        if (!token) return;
        const res = await getFavouritesApi();
        if (res.success && Array.isArray(res.favourites)) {
            favouriteIds = new Set(res.favourites.map((r: any) => r.restaurantId || r._id));
        }
    } catch {
    } finally {
        loaded = true;
        notify();
    }
};

if (!loadPromise) {
    loadPromise = load();
}

export const isFavourite = (restaurantId: string): boolean => {
    return favouriteIds.has(restaurantId);
};

export const toggleFavourite = async (restaurantId: string): Promise<boolean> => {
    await loadPromise;

    const wasFav = favouriteIds.has(restaurantId);

    if (wasFav) {
        const newSet = new Set(favouriteIds);
        newSet.delete(restaurantId);
        favouriteIds = newSet;
        notify();
        try {
            const res = await removeFavouriteApi(restaurantId);
            if (!res.success) {
                favouriteIds = new Set(favouriteIds);
                favouriteIds.add(restaurantId);
                notify();
                return false;
            }
            return false;
        } catch {
            favouriteIds = new Set(favouriteIds);
            favouriteIds.add(restaurantId);
            notify();
            return true;
        }
    } else {
        const newSet = new Set(favouriteIds);
        newSet.add(restaurantId);
        favouriteIds = newSet;
        notify();
        try {
            const res = await addFavouriteApi(restaurantId);
            if (!res.success) {
                favouriteIds = new Set(favouriteIds);
                favouriteIds.delete(restaurantId);
                notify();
                return false;
            }
            return true;
        } catch {
            favouriteIds = new Set(favouriteIds);
            favouriteIds.delete(restaurantId);
            notify();
            return false;
        }
    }
};

export const useFavouriteIds = (): { favouriteIds: Set<string>; loading: boolean } => {
    const [ids, setIds] = useState(favouriteIds);
    const [loading, setLoading] = useState(!loaded);

    useEffect(() => {
        const unsub = subscribe(() => {
            setIds(new Set(favouriteIds));
            setLoading(false);
        });
        return unsub;
    }, []);

    return { favouriteIds: ids, loading };
};

export const useIsFavourite = (restaurantId: string): boolean => {
    const [isFav, setIsFav] = useState(favouriteIds.has(restaurantId));

    useEffect(() => {
        const unsub = subscribe(() => {
            setIsFav(favouriteIds.has(restaurantId));
        });
        return unsub;
    }, [restaurantId]);

    return isFav;
};
