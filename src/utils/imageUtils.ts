const FALLBACK_IMAGE = require("../assets/images/chickenBriyani.jpg");

export const toImageUri = (url: string | null | undefined): string => {
    if (!url || !url.startsWith("http")) return "";
    return url;
};

export const imageSource = (url: any) => {
    if (typeof url === "number") return url;
    if (!url) return FALLBACK_IMAGE;
    return { uri: url };
};