import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/Splash/SplashScreen";
import OnBoardingScreen from "../screens/OnBoardingScreen";
import LoginScreen from "../screens/LoginScreen";
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

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="OnBoarding"
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen
                    name="OnBoarding"
                    component={OnBoardingScreen}
                />
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                />
                <Stack.Screen
                    name="Home"
                    component={BottomTabNavigationBar}
                />
                <Stack.Screen
                    name="RestaurantDetail"
                    component={RestaurantDetailScreen}
                    options={{ animation: "slide_from_right" }}
                />
                <Stack.Screen
                    name="CartCheckout"
                    component={CheckoutScreen}
                    options={{ animation: "slide_from_bottom" }}
                />
                <Stack.Screen
                    name="OrderSuccess"
                    component={OrderSuccessScreen}
                    options={{ animation: "fade" }}
                />
                <Stack.Screen
                    name='TrackMyOrder'
                    component={TrackMyOrder}
                    options={{
                        animation: "slide_from_bottom",
                        headerShown: true,
                        title: 'Track My Order'
                    }}
                />
                <Stack.Screen
                    name="DeliveryCompleted"
                    component={DeliveryCompletedScreen}
                    options={{
                        animation: "slide_from_bottom",
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="ReviewRating"
                    component={ReviewRatingScreen}
                    options={{
                        animation: "slide_from_right",
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="SignUp"
                    component={SignUpScreen}
                    options={{
                        animation: "slide_from_right",
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="ProfileSetup"
                    component={ProfileSetupScreen}
                    options={{
                        animation: "slide_from_right",
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="ForgotPassword"
                    component={ForgotPasswordScreen}
                    options={{
                        animation: "slide_from_right",
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="EditProfile"
                    component={EditProfileScreen}
                    options={{
                        animation: "slide_from_right",
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="AddressBook"
                    component={AddressBookScreen}
                    options={{
                        animation: "slide_from_right",
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="PaymentMethods"
                    component={PaymentMethodsScreen}
                    options={{
                        animation: "slide_from_right",
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="Favorites"
                    component={FavoritesScreen}
                    options={{
                        animation: "slide_from_right",
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="Notifications"
                    component={NotificationsScreen}
                    options={{
                        animation: "slide_from_right",
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="HelpSupport"
                    component={HelpSupportScreen}
                    options={{
                        animation: "slide_from_right",
                        headerShown: false,
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default RootNavigator    