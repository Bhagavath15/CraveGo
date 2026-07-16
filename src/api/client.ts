import { getToken, clearToken } from "../utils/authStore";
import { API_BASE_URL } from "../config";

const BASE_URL = API_BASE_URL;
const REQUEST_TIMEOUT = 15000;

let cachedToken: string | null | undefined = undefined;

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export const setAuthToken = (token: string | null) => {
    cachedToken = token;
};

export const clearAuthToken = () => {
    cachedToken = null;
};

export const setOnUnauthorized = (handler: UnauthorizedHandler) => {
    unauthorizedHandler = handler;
};

export const triggerUnauthorized = () => {
    clearAuthToken();
    clearToken();
    unauthorizedHandler?.();
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: options.method,
            headers: { ...headers, ...options.headers },
            body: options.body ? JSON.stringify(options.body) : undefined,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.status === 401) {
            triggerUnauthorized();
            const text = await res.text();
            let body;
            try { body = JSON.parse(text); } catch { body = { message: text }; }
            return { ...body, success: false } as T;
        }
        if (!res.ok) {
            const text = await res.text();
            let body;
            try { body = JSON.parse(text); } catch { body = { message: text }; }
            return { ...body, success: false } as T;
        }
        return res.json();
    } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            return { success: false, message: 'Request timed out' } as T;
        }
        throw err;
    }
};

interface RequestOptions {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: any;
    headers?: Record<string, string>;
}

export const api = {
    get: <T = any>(path: string) => request<T>(path, { method: "GET" }),
    post: <T = any>(path: string, body?: any) =>
        request<T>(path, { method: "POST", body }),
    patch: <T = any>(path: string, body?: any) =>
        request<T>(path, { method: "PATCH", body }),
    put: <T = any>(path: string, body?: any) =>
        request<T>(path, { method: "PUT", body }),
    delete: <T = any>(path: string, body?: any) =>
        request<T>(path, { method: "DELETE", body }),
};
