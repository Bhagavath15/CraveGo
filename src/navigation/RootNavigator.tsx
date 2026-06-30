import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/Splash/SplashScreen";
import HomeScreen from "../screens/HomeScreen";
import OnBoardingScreen from "../screens/OnBoardingScreen";
import LoginScreen from "../screens/LoginScreen";
import Header from "../screens/Header";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName='OnBoarding'
                screenOptions={{
                    header: () => <Header />,
                }}
            >
                <Stack.Screen
                    name="OnBoarding"
                    component={OnBoardingScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name='Home'
                    component={HomeScreen}

                />
                <Stack.Screen
                    name='Login'
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>

    )
}

export default RootNavigator    