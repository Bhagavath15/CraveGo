import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { useCart } from "../context/CartContext";
import { rateOrder } from "../api/order";
import { colors, spacing, typography, radius, shadows } from "../theme";
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "DeliveryCompleted">;

const CHIPS = ["Super fast", "Polite", "Followed instructions"];

const DeliveryCompletedScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const cart = useCart();
    const {
        orderId,
        restaurantName,
        items,
        totalPrice,
        deliveredTime,
        riderName,
    } = route.params || {};

    const safeRiderName = riderName || "Rahul";

    const [foodRating, setFoodRating] = useState(0);
    const [riderRating, setRiderRating] = useState(0);
    const [selectedChips, setSelectedChips] = useState<string[]>([]);
    const [foodComment, setFoodComment] = useState("");
    const [riderComment, setRiderComment] = useState("");

    const toggleChip = (chip: string) => {
        setSelectedChips(prev =>
            prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
        );
    };

    const [submitting, setSubmitting] = useState(false);

    const handleSubmitRating = async () => {
        if (submitting || !orderId) return;
        setSubmitting(true);
        try {
            await rateOrder(orderId, {
                overallRating: foodRating,
                foodRating,
                riderRating,
                riderFeedback: selectedChips,
                reviewText: foodComment,
            });
            await cart.clearCart();
            navigation.navigate("Home");
        } finally {
            setSubmitting(false);
        }
    };

    const handleBackToHome = async () => {
        await cart.clearCart();
        navigation.navigate("Home");
    };

    const handleNavigateToOrderHistory = async () => {
        await cart.clearCart();
        try {
            navigation.navigate("Home", { screen: "OrdersTab" });
        } catch (e) {
            navigation.navigate("Home");
        }
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delivery Completed</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.successSection}>
                    <View style={styles.successIconWrap}>
                        <MaterialCommunityIcons name="check" size={40} color={colors.white} />
                    </View>
                    <Text style={styles.successTitle}>Order Delivered!</Text>
                    <Text style={styles.successSubtext}>Arrived at {deliveredTime || "N/A"}</Text>
                </View>

                <View style={styles.orderCard}>
                    <View style={styles.orderCardIcon}>
                        <MaterialCommunityIcons name="silverware" size={26} color={colors.primary} />
                    </View>
                    <View style={styles.orderCardContent}>
                        <Text style={styles.orderRestaurantName}>{restaurantName}</Text>
                        <Text style={styles.orderItemsText}>{items}</Text>
                        <Text style={styles.orderPriceText}>₹{totalPrice}</Text>
                    </View>
                </View>

                <View style={styles.ratingCard}>
                    <Text style={styles.ratingCardTitle}>Rate the Food</Text>
                    <View style={styles.starRow}>
                        {[0, 1, 2, 3, 4].map((i) => (
                            <TouchableOpacity key={i} onPress={() => setFoodRating(i + 1)} activeOpacity={0.7}>
                                <MaterialCommunityIcons
                                    name={i < foodRating ? "star" : "star-outline"}
                                    size={32}
                                    color={i < foodRating ? colors.rating : colors.outlineVariant}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TextInput
                        style={styles.commentInput}
                        placeholder={`Add a comment for ${restaurantName}...`}
                        placeholderTextColor={colors.textMuted}
                        value={foodComment}
                        onChangeText={setFoodComment}
                    />
                </View>

                <View style={styles.ratingCard}>
                    <Text style={styles.ratingCardTitle}>Rate the Rider</Text>
                    <View style={styles.riderProfile}>
                        <View style={styles.riderAvatar}>
                            <Text style={styles.riderAvatarText}>
                                {safeRiderName.charAt(0)}
                            </Text>
                        </View>
                        <View style={styles.riderInfo}>
                            <View style={styles.riderNameRow}>
                                <Text style={styles.riderName}>{safeRiderName}</Text>
                                <MaterialCommunityIcons name="check-decagram" size={14} color={colors.primary} />
                            </View>
                            <Text style={styles.riderRole}>Your Delivery Partner</Text>
                        </View>
                        <View style={styles.starRow}>
                            {[0, 1, 2, 3, 4].map((i) => (
                                <TouchableOpacity key={i} onPress={() => setRiderRating(i + 1)} activeOpacity={0.7}>
                                    <MaterialCommunityIcons
                                        name={i < riderRating ? "star" : "star-outline"}
                                        size={22}
                                        color={i < riderRating ? colors.rating : colors.outlineVariant}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={styles.chipRow}>
                        {CHIPS.map((chip) => {
                            const active = selectedChips.includes(chip);
                            return (
                                <TouchableOpacity
                                    key={chip}
                                    style={[styles.chip, active && styles.chipActive]}
                                    onPress={() => toggleChip(chip)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                        {chip}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    <TextInput
                        style={styles.commentInput}
                        placeholder={`Add a comment for ${safeRiderName}...`}
                        placeholderTextColor={colors.textMuted}
                        value={riderComment}
                        onChangeText={setRiderComment}
                    />
                </View>

                <TouchableOpacity style={styles.submitBtn} activeOpacity={0.92} onPress={handleSubmitRating} disabled={submitting}>
                    <Text style={styles.submitBtnText}>{submitting ? "Submitting..." : "Submit Rating"}</Text>
                </TouchableOpacity>

                <View style={styles.bottomRow}>
                    <TouchableOpacity style={styles.homeButton} onPress={handleBackToHome}>
                        <MaterialCommunityIcons name="home-outline" size={18} color={colors.primary} />
                        <Text style={styles.homeButtonText}>Back to Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.historyButton} onPress={handleNavigateToOrderHistory}>
                        <MaterialCommunityIcons name="history" size={18} color={colors.primary} />
                        <Text style={styles.historyButtonText}>Order History</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default DeliveryCompletedScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.md,
        height: 56,
        backgroundColor: colors.background,
    },
    headerBtn: {
        width: 36,
        height: 36,
        borderRadius: radius.full,
        backgroundColor: colors.surfaceContainer,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
        alignItems: "center",
    },

    successSection: {
        alignItems: "center",
        paddingVertical: spacing.xl,
    },
    successIconWrap: {
        width: 72,
        height: 72,
        borderRadius: radius.full,
        backgroundColor: colors.secondary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: spacing.md,
        ...shadows.medium,
    },
    successTitle: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xxxl,
    },
    successSubtext: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },

    orderCard: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.outlineVariant + "4D",
        ...shadows.card,
    },
    orderCardIcon: {
        width: 48,
        height: 48,
        borderRadius: radius.md,
        backgroundColor: colors.primary + "15",
        justifyContent: "center",
        alignItems: "center",
    },
    orderCardContent: {
        flex: 1,
    },
    orderRestaurantName: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    orderItemsText: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        marginTop: 2,
    },
    orderPriceText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
        marginTop: spacing.xs,
    },

    ratingCard: {
        width: "100%",
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.outlineVariant + "4D",
        ...shadows.card,
    },
    ratingCardTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    starRow: {
        flexDirection: "row",
        gap: spacing.xs,
    },
    commentInput: {
        width: "100%",
        marginTop: spacing.md,
        backgroundColor: colors.surfaceContainerLow,
        borderWidth: 1,
        borderColor: colors.outlineVariant + "80",
        borderRadius: radius.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        fontSize: typography.fontSize.md,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.md,
    },

    riderProfile: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    riderAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary + "15",
        borderWidth: 2,
        borderColor: colors.primary + "33",
        justifyContent: "center",
        alignItems: "center",
    },
    riderAvatarText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
    },
    riderInfo: {
        flex: 1,
    },
    riderNameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
    },
    riderName: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    riderRole: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: 1,
    },

    chipRow: {
        flexDirection: "row",
        gap: spacing.xs,
        flexWrap: "wrap",
    },
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: colors.outlineVariant + "80",
        backgroundColor: colors.surface,
    },
    chipActive: {
        backgroundColor: colors.primary + "15",
        borderColor: colors.primary,
    },
    chipText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
    },
    chipTextActive: {
        color: colors.primary,
    },

    submitBtn: {
        width: "100%",
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.md,
        ...shadows.button,
    },
    submitBtnText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
    },

    bottomRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingBottom: spacing.lg,
    },
    homeButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        paddingVertical: 14,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.outlineVariant,
        backgroundColor: colors.surface,
    },
    homeButtonText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
    },
    historyButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        paddingVertical: 14,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.outlineVariant,
        backgroundColor: colors.surface,
    },
    historyButtonText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
    },
});
