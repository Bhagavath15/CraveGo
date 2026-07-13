import { getToken } from "../utils/authStore";

const BASE_URL = 'http://localhost:8080';

let cachedToken: string | null | undefined = undefined;

export const setAuthToken = (token: string | null) => {
    cachedToken = token;
};

export const clearAuthToken = () => {
    cachedToken = null;
};

const getAuthHeaders = async (): Promise<Record<string, string>> => {
    if (cachedToken === undefined) {
        cachedToken = await getToken();
    }
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (cachedToken) {
        headers["Authorization"] = `Bearer ${cachedToken}`;
    }
    return headers;
};

const request = async <T = any>(path: string, options: RequestOptions): Promise<T> => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_URL}${path}`, {
        method: options.method,
        headers: { ...headers, ...options.headers },
        body: options.body ? JSON.stringify(options.body) : undefined,
    });
    return res.json();
};

interface RequestOptions {
    method: "GET" | "POST" | "PATCH" | "DELETE";
    body?: any;
    headers?: Record<string, string>;
}

export const api = {
    get: <T = any>(path: string) => request<T>(path, { method: "GET" }),
    post: <T = any>(path: string, body?: any) =>
        request<T>(path, { method: "POST", body }),
    patch: <T = any>(path: string, body?: any) =>
        request<T>(path, { method: "PATCH", body }),
    delete: <T = any>(path: string, body?: any) =>
        request<T>(path, { method: "DELETE", body }),
};
