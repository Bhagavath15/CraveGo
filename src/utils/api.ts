import { getToken } from "./authStore";

const BASE_URL = 'http://localhost:8080';

export const registerUser = async (name: string, email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    });
    return res.json();
};

export const verifyEmailOtp = async (email: string, otp: string) => {
    const res = await fetch(`${BASE_URL}/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
    });
    return res.json();
};

export const loginUser = async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    return res.json();
};

export const forgotPassword = async (email: string) => {
    const res = await fetch(`${BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    return res.json();
};

export const verifyForgotPasswordOtp = async (email: string, otp: string) => {
    const res = await fetch(`${BASE_URL}/verify-forgot-password-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
    });
    return res.json();
};

export const resetPassword = async (resetToken: string, newPassword: string) => {
    const res = await fetch(`${BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
    });
    return res.json();
};

export const resendOtp = async (email: string, type: "signup" | "forgot_password") => {
    const res = await fetch(`${BASE_URL}/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type }),
    });
    return res.json();
};

const authHeaders = async () => {
    const token = await getToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const getRestaurants = async () => {
    const res = await fetch(`${BASE_URL}/restaurants`, {
        method: "GET",
        headers: await authHeaders(),
    });
    return res.json();
};

export const getRestaurantMenu = async (restaurantId: string) => {
    const res = await fetch(`${BASE_URL}/restaurants/${restaurantId}/menu`, {
        method: "GET",
        headers: await authHeaders(),
    });
    return res.json();
};