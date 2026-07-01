import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/Splash/SplashScreen";
import OnBoardingScreen from "../screens/OnBoardingScreen";
import LoginScreen from "../screens/LoginScreen";
import RestaurantDetailScreen from "../screens/RestaurantDetailScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import OrderSuccessScreen from "../screens/OrderSuccessScreen";
import BottomTabNavigationBar from "../components/BottomTabNavigationBar";

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
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default RootNavigator    