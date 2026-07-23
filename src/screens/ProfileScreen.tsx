import { useCallback, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, CommonActions, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { clearToken } from "../utils/authStore";
import { clearAuthToken } from "../api/client";
import { disconnectSocket } from "../api/socket";
import Toast from "react-native-toast-message";
import { getProfile } from "../api/auth";
import { getOrders } from "../api/order";
import { colors, spacing, typography, radius, shadows, sizes } from "../theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
                    Toast.show({ type: "success", text1: "Logged out successfully" });
                    setTimeout(() => {
                        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "OnBoarding" }] }));
                    }, 500);
                },
            },
        ]);
    };


    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.headerBar}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate("EditProfile")}>
                    <MaterialCommunityIcons name="cog-outline" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.profileCard}>
                    <TouchableOpacity onPress={() => navigation.navigate("EditProfile")}>
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={require("../assets/images/rider-arjun.png")}
                                style={styles.avatarImage}
                            />
                            <View style={styles.cameraBadge}>
                                <MaterialCommunityIcons name="camera" size={12} color={colors.surface} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.profileName}>{userName || "User"}</Text>
                    <Text style={styles.profileEmail}>{userEmail}</Text>
                    <View style={styles.goldBadge}>
                        <MaterialCommunityIcons name="star" size={12} color={colors.tertiary} />
                        <Text style={styles.goldText}>Gold Member</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <View style={styles.statIconBg}>
                            <MaterialCommunityIcons name="receipt" size={18} color={colors.primary} />
                        </View>
                        <Text style={styles.statValue}>{orderCount}</Text>
                        <Text style={styles.statLabel}>Orders</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <View style={[styles.statIconBg, { backgroundColor: `${colors.secondary}15` }]}>
                            <MaterialCommunityIcons name="ticket-percent-outline" size={18} color={colors.secondary} />
                        </View>
                        <Text style={styles.statValue}>5</Text>
                        <Text style={styles.statLabel}>Coupons</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Account Settings</Text>

                <View style={styles.menuSection}>
                    {MENU_ITEMS.map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[styles.menuRow, i < MENU_ITEMS.length - 1 && styles.menuRowBorder]}
                            onPress={() => handleMenuPress(item)}
                        >
                            <View style={[styles.menuIconBg, i === 0 && { backgroundColor: `${colors.primary}15` },
                                i === 1 && { backgroundColor: `${colors.secondary}15` },
                                i === 2 && { backgroundColor: `${colors.errorLight}66` },
                                i === 3 && { backgroundColor: `${colors.tertiary}33` },
                                i === 4 && { backgroundColor: `${colors.surfaceContainerHigh}` },
                            ]}>
                                <MaterialCommunityIcons
                                    name={item.icon}
                                    size={20}
                                    color={i === 0 ? colors.primary : i === 1 ? colors.secondary : i === 2 ? colors.error : i === 3 ? colors.tertiary : colors.textSecondary}
                                />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                <Text style={styles.menuDesc}>{item.description}</Text>
                            </View>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={18}
                                color={colors.outlineVariant}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.logoutSection}>
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <MaterialCommunityIcons name="logout" size={18} color={colors.error} />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                    <Text style={styles.versionText}>
                        Version 2.4.1
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
        backgroundColor: colors.background,
    },
    headerBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.background,
    },
    headerTitle: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xxl,
    },
    settingsBtn: {
        width: sizes.avatar,
        height: sizes.avatar,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    profileCard: {
        alignItems: "center",
        paddingTop: spacing.lg,
        paddingBottom: spacing.lg,
        marginHorizontal: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        ...shadows.card,
    },
    avatarWrapper: {
        position: "relative",
        marginBottom: spacing.md,
    },
    avatarImage: {
        width: sizes.avatarLg,
        height: sizes.avatarLg,
        borderRadius: 48,
        borderWidth: 3,
        borderColor: colors.surfaceContainer,
    },
    cameraBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: colors.textPrimary,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: colors.surface,
    },
    profileName: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xxxl,
    },
    profileEmail: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.md,
        marginTop: 2,
    },
    goldBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        backgroundColor: `${colors.tertiary}18`,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: radius.full,
        marginTop: 12,
    },
    goldText: {
        fontSize: 11,
        fontWeight: typography.fontWeight.semibold,
        color: colors.tertiary,
        lineHeight: typography.lineHeight.sm,
        letterSpacing: typography.letterSpacing.wider,
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surface,
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        ...shadows.card,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
        gap: 4,
    },
    statIconBg: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: `${colors.primary}15`,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    statValue: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xxxl,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: typography.fontWeight.medium,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.sm,
        letterSpacing: typography.letterSpacing.wider,
    },
    statDivider: {
        width: 1,
        height: spacing.xl,
        backgroundColor: colors.outlineVariant,
    },
    sectionTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.sm,
        letterSpacing: typography.letterSpacing.wider,
        textTransform: "uppercase",
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        marginHorizontal: spacing.md,
    },
    menuSection: {
        marginHorizontal: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        ...shadows.card,
    },
    menuRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: spacing.md,
        gap: spacing.md,
    },
    menuRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceContainerHighest,
    },
    menuIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    menuContent: {
        flex: 1,
    },
    menuLabel: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.md,
    },
    menuDesc: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.sm,
        marginTop: 1,
    },
    logoutSection: {
        marginTop: spacing.lg,
        marginHorizontal: spacing.md,
    },
    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: `${colors.errorLight}99`,
        backgroundColor: colors.surface,
    },
    logoutText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.error,
        lineHeight: typography.lineHeight.xl,
    },
    versionText: {
        textAlign: "center",
        fontSize: 11,
        fontWeight: typography.fontWeight.medium,
        color: `${colors.outline}99`,
        lineHeight: typography.lineHeight.sm,
        letterSpacing: typography.letterSpacing.wider,
        marginTop: spacing.md,
    },
});
