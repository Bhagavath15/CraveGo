import { api } from "./client";

export interface Address {
  _id: string;
  userId?: string;
  fullName: string;
  mobileNumber: string;
  houseNumber: string;
  apartment?: string;
  landmark?: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  addressType: "Home" | "Work" | "Other";
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const getAddresses = () =>
  api.get<{ success: boolean; total: number; addresses: Address[] }>("/address");

export const getAddressById = (id: string) =>
  api.get<{ success: boolean; address: Address }>(`/address/${id}`);

export const addAddress = (data: {
  fullName: string;
  mobileNumber: string;
  houseNumber: string;
  apartment?: string;
  landmark?: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  addressType?: string;
}) =>
  api.post<{ success: boolean; message: string; address: Address }>("/address", data);

export const updateAddress = (id: string, data: Partial<{
  fullName: string;
  mobileNumber: string;
  houseNumber: string;
  apartment: string;
  landmark: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  addressType: string;
}>) =>
  api.put<{ success: boolean; message: string; address: Address }>(`/address/${id}`, data);

export const deleteAddress = (id: string) =>
  api.delete<{ success: boolean; message: string }>(`/address/${id}`);

export const setDefaultAddress = (id: string) =>
  api.patch<{ success: boolean; message: string; address: Address }>(`/address/${id}/default`);
