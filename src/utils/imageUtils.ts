const BASE_URL = "http://localhost:8080";

export const toImageUri = (url: string | null | undefined) => {
    if (!url) return undefined;
    if (url.startsWith("http")) return { uri: url };
    const clean = url.startsWith("/") ? url.slice(1) : url;
    return { uri: `${BASE_URL}/uploads/${clean}` };
};