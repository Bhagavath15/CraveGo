import { api } from "./client";

export interface NotificationItem {
    _id: string;
    type: "ORDER" | "PAYMENT" | "COUPON" | "PROMOTION" | "SYSTEM";
    title: string;
    message: string;
    data?: Record<string, any>;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

interface ListResponse {
    success: boolean;
    data: NotificationItem[];
    pagination: PaginationInfo;
}

interface SingleResponse {
    success: boolean;
    data?: NotificationItem;
    unreadCount?: number;
    message?: string;
}

interface UnreadCountResponse {
    success: boolean;
    count: number;
}

interface MessageResponse {
    success: boolean;
    message: string;
    unreadCount?: number;
}

export const getNotificationsList = (page = 1, limit = 20) =>
    api.get<ListResponse>(`/notification/?page=${page}&limit=${limit}`);

export const markNotificationRead = (id: string) =>
    api.patch<SingleResponse>(`/notification/${id}/read`);

export const markAllNotificationsRead = () =>
    api.patch<MessageResponse>("/notification/read-all");

export const deleteNotification = (id: string) =>
    api.delete<MessageResponse>(`/notification/${id}`);

export const getUnreadCount = () =>
    api.get<UnreadCountResponse>("/notification/unread-count");
