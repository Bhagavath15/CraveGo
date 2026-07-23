import { StyleSheet, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import HomeScreen from "../screens/HomeScreen";
import OrdersScreen from "../screens/OrdersScreen";
import SearchScreen from "../screens/SearchScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors } from "../theme";

const Tab = createBottomTabNavigator();

const BottomTabNavigationBar = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabBarLabel,
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{
                    tabBarLabel: "Home",
                    tabBarAccessibilityLabel: "Home tab",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="SearchTab"
                component={SearchScreen}
                options={{
                    tabBarLabel: "Search",
                    tabBarAccessibilityLabel: "Search tab",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="magnify" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="OrdersTab"
                component={OrdersScreen}
                options={{
                    tabBarLabel: "Orders",
                    tabBarAccessibilityLabel: "Orders tab",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="clipboard-list-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{
                    tabBarLabel: "Profile",
                    tabBarAccessibilityLabel: "Profile tab",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: "rgba(225,191,181,0.3)",
        paddingBottom: 4,
        paddingTop: 4,
        height: 60,
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 0.5,
    },
    placeholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    placeholderText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
});

export default BottomTabNavigationBar;
