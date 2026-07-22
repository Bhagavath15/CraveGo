import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "cravego_auth_token";

type TokenListener = (token: string | null) => void;
const listeners = new Set<TokenListener>();

function notify(token: string | null) {
    listeners.forEach(fn => fn(token));
}

export function onTokenChange(listener: TokenListener) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}

export const saveToken = async (token: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    notify(token);
};

export const getToken = async (): Promise<string | null> => {
    return AsyncStorage.getItem(TOKEN_KEY);
};

export const clearToken = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    notify(null);
};