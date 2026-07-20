import { api } from "./client";

export const getAvailableCoupons = (
    restaurantId: string,
    subtotal: number
) =>
    api.get(`/coupon?restaurantId=${encodeURIComponent(restaurantId)}&subtotal=${subtotal}`);

export const validateCoupon = (data: {
    couponCode: string;
    restaurantId: string;
    subtotal: number;
    deliveryFee: number;
    tax: number;
}) => api.post("/coupon/validate", data);

export const removeCouponApi = () => api.post("/coupon/remove");
