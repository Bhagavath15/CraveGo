import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { MenuItem } from "../data/restaurantData";

type CartContextType = {
    cartItems: MenuItem[];
    restaurantId: string | null;
    restaurantName: string | null;
    itemCount: number;
    totalAmount: number;
    addToCart: (item: MenuItem, restId: string, restName: string) => void;
    removeItem: (itemIndex: number) => void;
    decrementItem: (itemId: string) => void;
    clearCart: () => void;
    getItemQuantity: (itemId: string) => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<MenuItem[]>([]);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [restaurantName, setRestaurantName] = useState<string | null>(null);

    const addToCart = useCallback((item: MenuItem, restId: string, restName: string) => {
        setRestaurantId(restId);
        setRestaurantName(restName);
        setCartItems((prev) => [...prev, item]);
    }, []);

    const removeItem = useCallback((itemIndex: number) => {
        setCartItems((prev) => prev.filter((_, i) => i !== itemIndex));
    }, []);

    const decrementItem = useCallback((itemId: string) => {
        setCartItems((prev) => {
            for (let i = prev.length - 1; i >= 0; i--) {
                if (prev[i].id === itemId) {
                    return prev.filter((_, idx) => idx !== i);
                }
            }
            return prev;
        });
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
        setRestaurantId(null);
        setRestaurantName(null);
    }, []);

    const getItemQuantity = useCallback(
        (itemId: string) => cartItems.filter((i) => i.id === itemId).length,
        [cartItems]
    );

    const itemCount = cartItems.length;
    const totalAmount = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.price, 0),
        [cartItems]
    );

    const value = useMemo(
        () => ({
            cartItems,
            restaurantId,
            restaurantName,
            itemCount,
            totalAmount,
            addToCart,
            removeItem,
            decrementItem,
            clearCart,
            getItemQuantity,
        }),
        [cartItems, restaurantId, restaurantName, itemCount, totalAmount, addToCart, removeItem, decrementItem, clearCart, getItemQuantity]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
};
