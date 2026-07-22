import { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { NavigationContainer, createNavigationContainerRef, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ErrorBoundary from "../components/ErrorBoundary";
import OfflineBanner from "../components/OfflineBanner";
import OnBoardingScreen from "../screens/OnBoardingScreen";
import LoginScreen from "../screens/LoginScreen";
import EmailOTPVerificationScreen from "../screens/EmailOTPVerificationScreen";
import ForgotPasswordOTPScreen from "../screens/ForgotPasswordOTPScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import RestaurantDetailScreen from "../screens/RestaurantDetailScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import OrderSuccessScreen from "../screens/OrderSuccessScreen";
import BottomTabNavigationBar from "../components/BottomTabNavigationBar";
import TrackMyOrder from "../screens/TrackMyOrderScreen";
import DeliveryCompletedScreen from "../screens/DeliveryCompletedScreen";
import ReviewRatingScreen from "../screens/ReviewRatingScreen";
import SignUpScreen from "../screens/SignUpScreen";
import ProfileSetupScreen from "../screens/ProfileSetupScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import AddressBookScreen from "../screens/AddressBookScreen";
import PaymentMethodsScreen from "../screens/PaymentMethodsScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import HelpSupportScreen from "../screens/HelpSupportScreen";
import AddAddressScreen from "../screens/AddAddressScreen";
import ReceiptScreen from "../screens/ReceiptScreen";
import { getToken, onTokenChange } from "../utils/authStore";
import { setOnUnauthorized, clearAuthToken } from "../api/client";
import { pushService } from "../services/pushService";

export const navigationRef = createNavigationContainerRef();

export const resetToAuth = () => {
    if (navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: "OnBoarding" }] });
    }
};

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        setOnUnauthorized(() => {
            clearAuthToken();
            setToken(null);
            resetToAuth();
        });
    }, []);

    useEffect(() => {
        const loadToken = async () => {
            const value = await getToken();
            setToken(value);
            setLoading(false);
        };
        loadToken();
    }, []);

    useEffect(() => {
        if (token) {
            pushService.init(token);
        }
    }, [token]);

    useEffect(() => {
        return onTokenChange((newToken) => {
            setToken(newToken);
        });
    }, []);

    if (loading) {
        return (
            <View style={styles.splash}>
                <Image source={require("../assets/images/splash_logo.png")} style={styles.logo} resizeMode="contain" />
            </View>
        );
    }

    const navTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: '#FCF9F8',
        },
    };

    const linking = {
        prefixes: ['cravego://', 'https://cravego.com'],
        config: {
            screens: {
                OnBoarding: '',
                Login: 'login',
                SignUp: 'signup',
                RestaurantDetail: 'restaurant/:restaurantId',
                CartCheckout: 'cart',
                OrderSuccess: 'order-success',
                TrackMyOrder: 'order/:orderId',
                DeliveryCompleted: 'delivery-completed/:orderId',
                Notifications: 'notifications',
            },
        },
    } as any;

    return (
        <ErrorBoundary>
        <View style={{ flex: 1 }}>
            <OfflineBanner />
            <NavigationContainer theme={navTheme} linking={linking}>
                <Stack.Navigator initialRouteName={token ? "Home" : "OnBoarding"} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FCF9F8' } }}>
                <Stack.Screen name="Home" component={BottomTabNavigationBar} />
                <Stack.Screen name="OnBoarding" component={OnBoardingScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="EmailOTPVerification" component={EmailOTPVerificationScreen} options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="ForgotPasswordOTP" component={ForgotPasswordOTPScreen} options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="CartCheckout" component={CheckoutScreen} options={{ animation: "slide_from_bottom" }} />
                <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ animation: "fade" }} />
                <Stack.Screen name="TrackMyOrder" component={TrackMyOrder} options={{ animation: "slide_from_bottom", headerShown: true, title: "Track My Order" }} />
                <Stack.Screen name="DeliveryCompleted" component={DeliveryCompletedScreen} options={{ animation: "slide_from_bottom", headerShown: false }} />
                <Stack.Screen name="ReviewRating" component={ReviewRatingScreen} options={{ animation: "slide_from_right", headerShown: false }} />
                <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} options={{ animation: "slide_from_right", headerShown: false }} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ animation: "slide_from_right", headerShown: false }} />
                <Stack.Screen name="AddAddress" component={AddAddressScreen} options={{ animation: "slide_from_right", headerShown: false }} />
                <Stack.Screen name="AddressBook" component={AddressBookScreen} options={{ animation: "slide_from_right", headerShown: false }} />
                <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ animation: "slide_from_right", headerShown: false }} />
                <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ animation: "slide_from_right", headerShown: false }} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: "slide_from_right", headerShown: false }} />
                <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ animation: "slide_from_right", headerShown: false }} />
                <Stack.Screen name="Receipt" component={ReceiptScreen} options={{ animation: "slide_from_right" }} />
            </Stack.Navigator>
        </NavigationContainer>
        </View>
        </ErrorBoundary>
    );
};

export default RootNavigator;

const styles = StyleSheet.create({
    splash: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FCF9F8",
    },
    logo: {
        width: "60%",
        aspectRatio: 487 / 1105,
    },
});