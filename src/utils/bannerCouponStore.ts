let pendingCouponCode: string | null = null;

export const setPendingCoupon = (code: string | null) => {
    pendingCouponCode = code;
};

export const getPendingCoupon = (): string | null => {
    const code = pendingCouponCode;
    pendingCouponCode = null;
    return code;
};
