import { api } from "./client";

export interface Banner {
    _id: string;
    image: string;
    badgeText: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    buttonText: string;
    couponCode: string;
    isActive: boolean;
    sortOrder: number;
}

export const getBanners = () => api.get<{ success: boolean; data: Banner[] }>("/banners");
