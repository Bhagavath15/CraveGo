const FALLBACK_IMAGE = require("../assets/images/chickenBriyani.jpg");

export const toImageUri = (url: string | null | undefined) => {
    if (!url) return FALLBACK_IMAGE;
    if (url.startsWith("http")) return { uri: url };
    return FALLBACK_IMAGE;
};