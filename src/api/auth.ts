import { api } from "./client";

export const register = (name: string, email: string, password: string) =>
    api.post("/register", { name, email, password });

export const verifyEmailOtp = (email: string, otp: string) =>
    api.post("/verify-email-otp", { email, otp });

export const login = (email: string, password: string) =>
    api.post("/login", { email, password });

export const forgotPassword = (email: string) =>
    api.post("/forgot-password", { email });

export const verifyForgotPasswordOtp = (email: string, otp: string) =>
    api.post("/verify-forgot-password-otp", { email, otp });

export const resetPassword = (resetToken: string, newPassword: string) =>
    api.post("/reset-password", { resetToken, newPassword });

export const resendOtp = (email: string, type: "signup" | "forgot_password") =>
    api.post("/resend-otp", { email, type });

export const getProfile = () =>
    api.get<{ success: boolean; user: { _id: string; name: string; email: string; phone?: string; isVerified: boolean; notifPref?: { orderUpdates: boolean; offersDisc: boolean; sysNotif: boolean } } }>("/user/profile");

export const updateProfile = (name: string, phone: string, email?: string, notifPref?: { orderUpdates: boolean; offersDisc: boolean; sysNotif: boolean }) =>
    api.patch("/user/profile", { name, phone, email, notifPref });
