import { api } from "./client";

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice?: number;
  image?: string;
}

export interface DeliveryAddress {
  houseNumber: string;
  apartment?: string;
  area: string;
  city: string;
  pincode: string;
  addressType?: string;
  coordinates?: { lat: number; lng: number };
}

export interface Order {
  _id: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName?: string;
  restaurantImage?: string;
  restaurantSnapshot?: { name?: string; image?: string; rating?: number };
  grandTotal?: number;
  totalPrice?: number;
  deliveryFee?: number;
  tax?: number;
  discount?: number;
  subtotal?: number;
  estimatedDeliveryTime?: number;
  estimatedTime?: string;
  items: OrderItem[];
  paymentMethod: "COD" | "UPI" | "CARD";
  paymentStatus: "PENDING" | "PAID" | "REFUNDED" | "Pending" | "Authorized" | "Paid" | "Failed" | "Refunded";
  paymentIntentId?: string;
  orderStatus: number;
  createdAt: string;
  deliveryAddress?: DeliveryAddress | string;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  riderImage?: string;
  riderRating?: number;
  isRated?: boolean;
  cancelledReason?: string;
}

export interface RatingData {
  overallRating: number;
  foodRating?: number;
  speedRating?: number;
  packagingRating?: number;
  reviewText?: string;
  riderRating?: number;
  riderFeedback?: string[];
}

export const placeOrder = (data: {
  restaurantId: string;
  items: { menuItemId: string; quantity: number }[];
  addressId: string;
  paymentMethod: string;
}) => api.post<{ success: boolean; order?: Order; message?: string }>("/orders", data);

export const getOrders = () =>
  api.get<{ success: boolean; orders: Order[] }>("/orders");

export const getOrderById = (id: string) =>
  api.get<{ success: boolean; order: Order }>(`/orders/${id}`);

export const advanceOrderStatus = (orderId: string) =>
  api.patch<{ success: boolean; order: Order }>(`/orders/${orderId}/advance`);

export const cancelOrder = (orderId: string, reason?: string) =>
  api.post<{ success: boolean; order: Order; message?: string }>(`/orders/${orderId}/cancel`, { reason });

export const rateOrder = (orderId: string, data: RatingData) =>
  api.post<{ success: boolean; message?: string }>(`/orders/${orderId}/rate`, data);

export const reorder = (orderId: string) =>
  api.post<{ success: boolean; order?: Order; message?: string }>(`/orders/${orderId}/reorder`);
