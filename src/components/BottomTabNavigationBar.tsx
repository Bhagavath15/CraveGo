import { StyleSheet, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import HomeScreen from "../screens/HomeScreen";

const PRIMARY = "#FF6B35";
const ON_SURFACE_VARIANT = "#594139";

const Tab = createBottomTabNavigator();

const SearchScreen = () => (
    <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Search</Text>
    </View>
);

const OrdersScreen = () => (
    <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Orders</Text>
    </View>
);

const ProfileScreen = () => (
    <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Profile</Text>
    </View>
);

const BottomTabNavigationBar = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: PRIMARY,
                tabBarInactiveTintColor: ON_SURFACE_VARIANT,
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabBarLabel,
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{
                    tabBarLabel: "Home",
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
        backgroundColor: "#FFF",
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
        backgroundColor: "#FCF9F8",
    },
    placeholderText: {
        fontSize: 16,
        color: ON_SURFACE_VARIANT,
    },
});

export default BottomTabNavigationBar;
