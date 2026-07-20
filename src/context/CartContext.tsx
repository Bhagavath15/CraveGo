import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef, ReactNode } from "react";
import { MenuItem } from "../data/restaurantData";
import {
    addToCart as addToCartApi,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart as clearCartApi,
} from "../api/cart";
import { validateCoupon as validateCouponApi, removeCouponApi } from "../api/coupon";
import { getToken } from "../utils/authStore";

export interface CartItem {
    id: string;
    name: string;
    image: any;
    price: number;
    quantity: number;
    isVeg: boolean;
    customization?: { name: string; price: number }[];
    totalPrice: number;
}

interface CartState {
    items: CartItem[];
    restaurantId: string | null;
    restaurantName: string | null;
    subtotal: number;
    deliveryFee: number;
    tax: number;
    discount: number;
    grandTotal: number;
    couponId: string | null;
    couponCode: string;
    couponTitle: string;
    couponType: string;
}

interface CouponResult {
    couponId: string;
    couponCode: string;
    couponTitle: string;
    couponType: string;
    discount: number;
    grandTotal: number;
}

interface CartContextType extends CartState {
    cartItems: CartItem[];
    itemCount: number;
    totalAmount: number;
    loading: boolean;
    addToCart: (item: MenuItem, restId: string, restName: string, customization?: { name: string; price: number }[]) => void;
    removeItem: (menuItemId: string) => void;
    decrementItem: (menuItemId: string) => void;
    clearCart: () => void;
    getItemQuantity: (menuItemId: string, itemName?: string) => number;
    lastClearTime: number;
    applyCoupon: (code: string) => Promise<CouponResult>;
    removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const emptyCart: CartState = {
    items: [],
    restaurantId: null,
    restaurantName: null,
    subtotal: 0,
    deliveryFee: 0,
    tax: 0,
    discount: 0,
    grandTotal: 0,
    couponId: null,
    couponCode: "",
    couponTitle: "",
    couponType: "",
};

const mapItem = (si: any): CartItem => ({
    id: si.menuItemId,
    name: si.name,
    image: si.image,
    price: si.price,
    quantity: si.quantity,
    isVeg: si.isVeg,
    customization: si.customization,
    totalPrice: si.totalPrice,
});

const fromApi = (cart: any, restName?: string): CartState => {
    const result = {
        items: (cart.items || []).map(mapItem),
        restaurantId: cart.restaurantId || null,
        restaurantName: restName || cart.restaurantName || null,
        subtotal: cart.subtotal || 0,
        deliveryFee: cart.deliveryFee || 0,
        tax: cart.tax || 0,
        discount: cart.discount || 0,
        grandTotal: cart.grandTotal || 0,
        couponId: cart.couponId || null,
        couponCode: cart.couponCode || "",
        couponTitle: cart.couponTitle || "",
        couponType: cart.couponType || "",
    };
    return result;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartState>(emptyCart);
    const [loading, setLoading] = useState(true);
    const [lastClearTime, setLastClearTime] = useState(0);
    const addingRef = useRef(false);

    const setCartWithLog = useCallback((next: CartState) => {
        setCart(next);
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                const token = await getToken();
                if (!token) {
                    setLoading(false);
                    return;
                }
                const data = await getCart();
                if (data.success && data.cart) {
                    const mapped = fromApi(data.cart);
                    setCartWithLog(mapped);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const clearCart = useCallback(async () => {
        setCartWithLog(emptyCart);
        setLastClearTime(Date.now());
        try {
            await clearCartApi();
        } catch (e) {
        }
    }, []);

    const addToCart = useCallback(async (item: MenuItem, restId: string, restName: string, customization?: { name: string; price: number }[]) => {
        if (addingRef.current) return;
        addingRef.current = true;
        try {
            const data = await addToCartApi(restId, item.id, 1, customization, item.name);
            if (data.success && data.cart) {
                const mapped = fromApi(data.cart, restName);
                setCartWithLog(mapped);
            } else if (data.message?.includes?.("another restaurant")) {
                setCartWithLog(emptyCart);
                try {
                    await clearCart();
                } catch (e) {
                }
                const retry = await addToCartApi(restId, item.id, 1, customization, item.name);
                if (retry.success && retry.cart) {
                    setCartWithLog(fromApi(retry.cart, restName));
                }
            }
        } finally {
            addingRef.current = false;
        }
    }, []);

    const decrementItem = useCallback(async (menuItemId: string) => {
        try {
            const existing = cart.items.find((ci) => ci.id === menuItemId);
            if (!existing) return;
            if (existing.quantity > 1) {
                const data = await updateCartItem(menuItemId, existing.quantity - 1);
                if (data.success && data.cart) setCartWithLog(fromApi(data.cart));
            } else {
                const data = await removeCartItem(menuItemId);
                if (data.success && data.cart) setCartWithLog(fromApi(data.cart));
            }
        } catch (e) { }
    }, [cart.items]);

    const removeItem = useCallback(async (menuItemId: string) => {
        try {
            const data = await removeCartItem(menuItemId);
            if (data.success && data.cart) setCartWithLog(fromApi(data.cart));
        } catch (e) { }
    }, []);

    const applyCoupon = useCallback(async (code: string): Promise<CouponResult> => {
        if (!cart.restaurantId) throw new Error("No restaurant in cart");

        const res = await validateCouponApi({
            couponCode: code,
            restaurantId: cart.restaurantId,
            subtotal: cart.subtotal,
            deliveryFee: cart.deliveryFee,
            tax: cart.tax,
        });

        if (!res.success) {
            throw new Error(res.message || "Invalid coupon");
        }

        const data: CouponResult = res.data;

        setCartWithLog({
            ...cart,
            discount: data.discount,
            grandTotal: data.grandTotal,
            couponId: data.couponId,
            couponCode: data.couponCode,
            couponTitle: data.couponTitle,
            couponType: data.couponType,
        });

        return data;
    }, [cart]);

    const removeCoupon = useCallback(() => {
        const round2 = (n: number) => Math.round(n * 100) / 100;
        const restoredGrandTotal = round2(cart.subtotal + cart.deliveryFee + cart.tax);

        setCartWithLog({
            ...cart,
            discount: 0,
            grandTotal: restoredGrandTotal,
            couponId: null,
            couponCode: "",
            couponTitle: "",
            couponType: "",
        });

        removeCouponApi().catch(() => {});
    }, [cart]);

    const getItemQuantity = useCallback(
        (menuItemId: string, itemName?: string) => {
            let found = cart.items.find((ci) => ci.id === menuItemId);
            if (!found && itemName) {
                found = cart.items.find((ci) => ci.name === itemName);
            }
            return found ? found.quantity : 0;
        },
        [cart.items]
    );

    const itemCount = useMemo(
        () => cart.items.reduce((sum, ci) => sum + ci.quantity, 0),
        [cart.items]
    );

    const totalAmount = useMemo(
        () => cart.items.reduce((sum, ci) => sum + (ci.totalPrice || ci.price * ci.quantity), 0),
        [cart.items]
    );

    const value = useMemo(
        () => ({
            ...cart,
            cartItems: cart.items,
            itemCount,
            totalAmount,
            loading,
            lastClearTime,
            addToCart,
            removeItem,
            decrementItem,
            clearCart,
            getItemQuantity,
            applyCoupon,
            removeCoupon,
        }),
        [cart, itemCount, totalAmount, loading, lastClearTime, addToCart, removeItem, decrementItem, clearCart, getItemQuantity, applyCoupon, removeCoupon]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
};
