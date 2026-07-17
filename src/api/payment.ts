import { api } from "./client";

export const createPaymentIntent = () =>
  api.post<{ success: boolean; clientSecret?: string; paymentIntentId?: string; message?: string }>(
    "/payment/create-payment-intent"
  );
