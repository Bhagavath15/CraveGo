// @react-native-async-storage/async-storage
// Requires a native build: after install, run `cd android; .\gradlew clean` then rebuild
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "cravego_auth_token";

export const saveToken = async (token: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
    return AsyncStorage.getItem(TOKEN_KEY);
};

export const clearToken = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
};