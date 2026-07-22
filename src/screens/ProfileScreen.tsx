import { useCallback, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, CommonActions, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import LinearGradient from "react-native-linear-gradient";
import { RootStackParamList } from "../types/types";
import { clearToken } from "../utils/authStore";
import { clearAuthToken } from "../api/client";
import { disconnectSocket } from "../api/socket";
import { getProfile } from "../api/auth";
import { getOrders } from "../api/order";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PRIMARY = "#FF6B35";
const PRIMARY_CONTAINER = "#FF6B35";
const SECONDARY = "#006D37";
const SECONDARY_CONTAINER = "#6BFE9C";
const ON_SECONDARY_CONTAINER = "#00743A";
const BG = "#FCF9F8";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";
const OUTLINE_VARIANT = "#E1BFB5";
const SURFACE_LOWEST = "#FFFFFF";
const SURFACE_CONTAINER_HIGH = "#EAE7E7";
const ERROR = "#BA1A1A";
const ERROR_CONTAINER = "#FFDAD6";
const OUTLINE = "#8D7168";

interface MenuItem {
    icon: string;
    label: string;
    description: string;
    route?: keyof RootStackParamList;
}

const MENU_ITEMS: MenuItem[] = [
    { icon: "clipboard-list-outline", label: "My Orders", description: "History and active tracking", route: "Home" },
    { icon: "home-map-marker", label: "Address Book", description: "Home, office, and more", route: "AddressBook" },
    { icon: "heart-outline", label: "Favorites", description: "Saved restaurants & items", route: "Favorites" },
    { icon: "bell-outline", label: "Notifications", description: "Manage your alerts", route: "Notifications" },
    { icon: "help-circle-outline", label: "Help & Support", description: "24/7 customer service", route: "HelpSupport" },
];

const ProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [orderCount, setOrderCount] = useState(0);

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    const [profileRes, ordersRes] = await Promise.all([
                        getProfile(),
                        getOrders(),
                    ]);
                    if (profileRes.success) {
                        setUserName(profileRes.user.name || "");
                        setUserEmail(profileRes.user.email || "");
                    }
                    if (ordersRes.success) {
                        setOrderCount(ordersRes.orders?.length || 0);
                    }
                } catch {}
            };
            fetchData();
        }, [])
    );

    const handleMenuPress = (item: MenuItem) => {
        if (item.route === "Home") {
            navigation.navigate("Home", { screen: "OrdersTab" });
        } else if (item.route) {
            navigation.navigate(item.route as any);
        }
    };

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout", style: "destructive", onPress: async () => {
                    disconnectSocket();
                    clearAuthToken();
                    await clearToken();
                    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "OnBoarding" }] }));
                },
            },
        ]);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.headerBar}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate("EditProfile")}>
                    <MaterialCommunityIcons name="square-edit-outline" size={24} color={SURFACE_LOWEST} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <LinearGradient
                    colors={[PRIMARY_CONTAINER, PRIMARY]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.profileHeader}
                >
                    <TouchableOpacity
                        style={styles.avatarSection}
                        onPress={() => navigation.navigate("EditProfile")}
                    >
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={require("../assets/images/rider-arjun.png")}
                                style={styles.avatarImage}
                            />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.profileName}>{userName || "User"}</Text>
                    <Text style={styles.profileEmail}>{userEmail}</Text>
                    <View style={styles.goldBadge}>
                        <MaterialCommunityIcons
                            name="star"
                            size={14}
                            color={ON_SECONDARY_CONTAINER}
                        />
                        <Text style={styles.goldText}>Gold Member</Text>
                    </View>
                </LinearGradient>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{orderCount}</Text>
                        <Text style={styles.statLabel}>Orders</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>5</Text>
                        <Text style={styles.statLabel}>Coupons</Text>
                    </View>
                </View>

                <View style={styles.menuSection}>
                    {MENU_ITEMS.map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.menuRow}
                            onPress={() => handleMenuPress(item)}
                        >
                            <View style={styles.menuIconBg}>
                                <MaterialCommunityIcons
                                    name={item.icon}
                                    size={22}
                                    color={PRIMARY}
                                />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                <Text style={styles.menuDesc}>{item.description}</Text>
                            </View>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={20}
                                color={OUTLINE_VARIANT}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.logoutSection}>
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <MaterialCommunityIcons name="logout" size={20} color={ERROR} />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                    <Text style={styles.versionText}>
                        Version 2.4.1 (Premium Experience)
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    headerBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: PRIMARY_CONTAINER,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: SURFACE_LOWEST,
        lineHeight: 28,
    },
    settingsBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        paddingBottom: 32,
    },
    profileHeader: {
        alignItems: "center",
        paddingTop: 48,
        paddingBottom: 24,
        paddingHorizontal: 16,
    },
    avatarSection: {
        marginBottom: 16,
    },
    avatarWrapper: {
        position: "relative",
    },
    avatarImage: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 3,
        borderColor: SURFACE_LOWEST,
    },
    profileName: {
        fontSize: 24,
        fontWeight: "700",
        color: SURFACE_LOWEST,
        lineHeight: 32,
    },
    profileEmail: {
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
        lineHeight: 20,
        marginTop: 2,
    },
    goldBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: SECONDARY_CONTAINER,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        marginTop: 12,
    },
    goldText: {
        fontSize: 11,
        fontWeight: "500",
        color: ON_SECONDARY_CONTAINER,
        lineHeight: 16,
        letterSpacing: 0.5,
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: SURFACE_LOWEST,
        marginHorizontal: 16,
        marginTop: -20,
        borderRadius: 12,
        paddingVertical: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statValue: {
        fontSize: 24,
        fontWeight: "700",
        color: PRIMARY,
        lineHeight: 32,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: "500",
        color: ON_SURFACE_VARIANT,
        lineHeight: 16,
        letterSpacing: 0.5,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: OUTLINE_VARIANT,
    },
    menuSection: {
        marginTop: 24,
        marginHorizontal: 16,
        gap: 4,
    },
    menuRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: SURFACE_LOWEST,
        padding: 16,
        borderRadius: 12,
        gap: 16,
    },
    menuIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#FFDBD033",
        justifyContent: "center",
        alignItems: "center",
    },
    menuContent: {
        flex: 1,
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 24,
    },
    menuDesc: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        marginTop: 1,
    },
    logoutSection: {
        marginTop: 24,
        marginHorizontal: 16,
    },
    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: `${ERROR_CONTAINER}33`,
    },
    logoutText: {
        fontSize: 20,
        fontWeight: "600",
        color: ERROR,
        lineHeight: 28,
    },
    versionText: {
        textAlign: "center",
        fontSize: 11,
        fontWeight: "500",
        color: `${OUTLINE}99`,
        lineHeight: 16,
        letterSpacing: 0.5,
        marginTop: 16,
    },
});
