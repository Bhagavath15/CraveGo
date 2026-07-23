import { useEffect, useRef, useState, useCallback } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { colors, spacing, typography, radius, shadows, sizes } from "../theme";

const AUTO_NAVIGATE_DELAY = 4000;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "OrderSuccess">;

const OrderSuccessScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { orderId, orderNumber, restaurantName, totalPrice, items } = route.params;
    const itemsDisplay = typeof items === "string" ? items : Array.isArray(items) ? items.map(i => i.name).join(", ") : "";
    const [countdown, setCountdown] = useState(4);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const navigatedRef = useRef(false);

    const handleTrackOrder = useCallback(() => {
        if (navigatedRef.current) return;
        navigatedRef.current = true;
        if (timerRef.current) clearInterval(timerRef.current);
        navigation.navigate("TrackMyOrder", {
            orderId,
            orderNumber,
            restaurantName,
            totalPrice,
            items,
        });
    }, [navigation, orderId, orderNumber, restaurantName, totalPrice, items]);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    handleTrackOrder();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [handleTrackOrder]);

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.successSection}>
                    <View style={styles.checkCircle}>
                        <MaterialCommunityIcons name="check" size={40} color={colors.white} />
                    </View>
                    <Text style={styles.title}>Order Placed!</Text>
                    <Text style={styles.subtitle}>
                        Restaurant has started preparing your order.
                    </Text>
                    <View style={styles.orderIdBadge}>
                        <MaterialCommunityIcons name="receipt" size={14} color={colors.primary} />
                        <Text style={styles.orderIdText}>Order #{orderNumber}</Text>
                    </View>
                </View>

                <View style={styles.restaurantCard}>
                    <View style={styles.restaurantCardLeft}>
                        <View style={styles.restaurantIconWrap}>
                            <MaterialCommunityIcons name="silverware" size={22} color={colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.restaurantName}>{restaurantName}</Text>
                            <Text style={styles.restaurantItems}>{itemsDisplay}</Text>
                        </View>
                    </View>
                    <Text style={styles.restaurantPrice}>₹{totalPrice}</Text>
                </View>

                <View style={styles.deliveryCard}>
                    <MaterialCommunityIcons name="bike-fast" size={24} color={colors.primary} />
                    <View style={styles.deliveryCardContent}>
                        <Text style={styles.deliveryLabel}>Estimated Delivery</Text>
                        <Text style={styles.deliveryTime}>25 - 35 mins</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.outlineVariant} />
                </View>

                <TouchableOpacity style={styles.trackButton} onPress={handleTrackOrder}>
                    <MaterialCommunityIcons name="map-marker-path" size={20} color={colors.white} />
                    <Text style={styles.trackButtonText}>Track My Order</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.homeButton}
                    onPress={() => {
                        if (timerRef.current) clearInterval(timerRef.current);
                        navigation.navigate("Home");
                    }}
                >
                    <Text style={styles.homeButtonText}>Back to Home</Text>
                </TouchableOpacity>

                <View style={styles.autoHintRow}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color={colors.outline} />
                    <Text style={styles.autoHint}>
                        Auto-navigating to tracking in {countdown}s
                    </Text>
                </View>
            </ScrollView>

            <View style={styles.brandSection}>
                <Text style={styles.brandText}>CraveGo</Text>
            </View>
        </View>
    );
};

export default OrderSuccessScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        alignItems: "center",
        paddingHorizontal: spacing.md,
        paddingTop: 60,
        paddingBottom: spacing.lg,
    },

    successSection: {
        alignItems: "center",
        marginBottom: spacing.xl,
    },
    checkCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.secondary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: spacing.lg,
        ...shadows.medium,
    },
    title: {
        fontSize: 28,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        lineHeight: 36,
        textAlign: "center",
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.xl,
        textAlign: "center",
        marginBottom: spacing.md,
    },
    orderIdBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: colors.primary + "12",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
    },
    orderIdText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
    },

    restaurantCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.outlineVariant + "4D",
        ...shadows.card,
    },
    restaurantCardLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        flex: 1,
    },
    restaurantIconWrap: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        backgroundColor: colors.primary + "15",
        justifyContent: "center",
        alignItems: "center",
    },
    restaurantName: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    restaurantItems: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: 1,
    },
    restaurantPrice: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },

    deliveryCard: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.xl,
        gap: spacing.md,
    },
    deliveryCardContent: {
        flex: 1,
    },
    deliveryLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.textSecondary,
        letterSpacing: typography.letterSpacing.wider,
        textTransform: "uppercase",
    },
    deliveryTime: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginTop: 2,
    },

    trackButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: radius.md,
        width: "100%",
        marginBottom: 12,
        ...shadows.button,
    },
    trackButtonText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
    },
    homeButton: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: radius.md,
        width: "100%",
        borderWidth: 1.5,
        borderColor: colors.outlineVariant,
        backgroundColor: colors.surface,
        marginBottom: spacing.lg,
    },
    homeButtonText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    autoHintRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
    },
    autoHint: {
        fontSize: typography.fontSize.sm,
        color: colors.outline,
    },

    brandSection: {
        paddingBottom: spacing.lg,
        alignItems: "center",
    },
    brandText: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.extrabold,
        color: colors.primaryDark,
        letterSpacing: typography.letterSpacing.snug,
        opacity: 0.4,
    },
});
