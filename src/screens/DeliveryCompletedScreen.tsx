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

const PRIMARY = "#AB3500";
const PRIMARY_CONTAINER = "#FF6B35";
const SECONDARY = "#006D37";
const BG = "#FCF9F8";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";
const OUTLINE = "#8D7168";
const OUTLINE_VARIANT = "#E1BFB5";
const SURFACE_LOWEST = "#FFFFFF";
const SURFACE_CONTAINER_HIGH = "#EAE7E7";
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

    const safeRiderName = riderName || "";

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
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.headerButton}
                >
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={24}
                        color={PRIMARY}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delivery Completed</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <MaterialCommunityIcons
                        name="help-circle-outline"
                        size={24}
                        color={ON_SURFACE_VARIANT}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.celebrationSection}>
                    <MaterialCommunityIcons name="party-popper" size={96} color={SECONDARY} />
                </View>

                <View style={styles.successSection}>
                    <View style={styles.successRow}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.successText}>
                            Order Delivered Successfully
                        </Text>
                    </View>
                    <Text style={styles.successSubtext}>
                        Arrived at {deliveredTime || "N/A"}
                    </Text>
                </View>

                <View style={styles.orderCard}>
                    <View style={styles.restaurantIcon}>
                        <MaterialCommunityIcons
                            name="silverware"
                            size={32}
                            color={PRIMARY_CONTAINER}
                        />
                    </View>
                    <View style={styles.restaurantInfo}>
                        <Text style={styles.restaurantName}>
                            {restaurantName}
                        </Text>
                        <Text style={styles.itemsText}>{items}</Text>
                        <Text style={styles.priceText}>₹{totalPrice}.00</Text>
                    </View>
                </View>

                <View style={styles.ratingCard}>
                    <View style={styles.ratingHeader}>
                        <Text style={styles.ratingTitle}>Rate your Food</Text>
                        <View style={styles.starRow}>
                            {[0, 1, 2, 3, 4].map((i) => (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => setFoodRating(i + 1)}
                                    activeOpacity={0.7}
                                >
                                    <MaterialCommunityIcons
                                        name={i < foodRating ? "star" : "star-outline"}
                                        size={24}
                                        color={
                                            i < foodRating
                                                ? "#fabd00"
                                                : OUTLINE
                                        }
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <TextInput
                        style={styles.commentInput}
                        placeholder={`Add a comment for ${restaurantName}...`}
                        placeholderTextColor={ON_SURFACE_VARIANT + "99"}
                        value={foodComment}
                        onChangeText={setFoodComment}
                    />
                </View>

                <View style={styles.riderCard}>
                    <View style={styles.riderHeader}>
                        <View style={styles.riderAvatar}>
                            <Text style={styles.riderAvatarText}>
                                {safeRiderName.charAt(0)}
                            </Text>
                        </View>
                        <View style={styles.riderInfo}>
                            <View style={styles.riderNameRow}>
                                <Text style={styles.riderName}>{safeRiderName}</Text>
                                <MaterialCommunityIcons name="check-decagram" size={14} color={PRIMARY_CONTAINER} />
                            </View>
                            <Text style={styles.riderRole}>
                                Your Delivery Partner
                            </Text>
                        </View>
                        <View style={styles.starRow}>
                            {[0, 1, 2, 3, 4].map((i) => (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => setRiderRating(i + 1)}
                                    activeOpacity={0.7}
                                >
                                    <MaterialCommunityIcons
                                        name={i < riderRating ? "star" : "star-outline"}
                                        size={24}
                                        color={
                                            i < riderRating
                                                ? "#fabd00"
                                                : OUTLINE
                                        }
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
                        placeholderTextColor={ON_SURFACE_VARIANT + "99"}
                        value={riderComment}
                        onChangeText={setRiderComment}
                    />
                </View>

                <TouchableOpacity style={styles.submitBtn} activeOpacity={0.92} onPress={handleSubmitRating} disabled={submitting}>
                    <Text style={styles.submitBtnText}>{submitting ? "Submitting..." : "Submit Rating"}</Text>
                </TouchableOpacity>

                <View style={styles.bottomRow}>
                    <TouchableOpacity
                        style={styles.homeButton}
                        onPress={handleBackToHome}
                    >
                        <Text style={styles.homeButtonText}>
                            Back to Home
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.historyButton}
                        onPress={() => handleNavigateToOrderHistory()}
                    >
                        <Text style={styles.historyButtonText}>
                            View Order History
                        </Text>
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
        backgroundColor: BG,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        height: 64,
        backgroundColor: BG,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        fontFamily: "Plus Jakarta Sans",
        color: PRIMARY,
        lineHeight: 28,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
        alignItems: "center",
    },

    celebrationSection: {
        width: "100%",
        height: 120,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 8,
    },

    successSection: {
        alignItems: "center",
        marginBottom: 16,
    },
    successRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 4,
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: SECONDARY,
    },
    successText: {
        fontSize: 14,
        fontWeight: "600",
        fontFamily: "Plus Jakarta Sans",
        color: SECONDARY,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    successSubtext: {
        fontSize: 14,
        fontWeight: "400",
        fontFamily: "Plus Jakarta Sans",
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        textAlign: "center",
    },

    orderCard: {
        width: "100%",
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    restaurantIcon: {
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: `${PRIMARY_CONTAINER}1A`,
        justifyContent: "center",
        alignItems: "center",
    },
    restaurantInfo: {
        flex: 1,
    },
    restaurantName: {
        fontSize: 14,
        fontWeight: "600",
        fontFamily: "Plus Jakarta Sans",
        color: ON_SURFACE,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    itemsText: {
        fontSize: 14,
        fontWeight: "400",
        fontFamily: "Plus Jakarta Sans",
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
    },
    priceText: {
        fontSize: 14,
        fontWeight: "600",
        fontFamily: "Plus Jakarta Sans",
        color: PRIMARY_CONTAINER,
        lineHeight: 20,
        letterSpacing: 0.1,
        marginTop: 4,
    },

    ratingCard: {
        width: "100%",
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
    },
    ratingHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    ratingTitle: {
        fontSize: 14,
        fontWeight: "600",
        fontFamily: "Plus Jakarta Sans",
        color: ON_SURFACE,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    starRow: {
        flexDirection: "row",
        gap: 4,
    },
    commentInput: {
        width: "100%",
        marginTop: 8,
        backgroundColor: `${PRIMARY_CONTAINER}0D`,
        borderWidth: 1,
        borderColor: `${OUTLINE_VARIANT}4D`,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 14,
        fontWeight: "400",
        fontFamily: "Plus Jakarta Sans",
        color: ON_SURFACE,
        lineHeight: 20,
    },

    riderCard: {
        width: "100%",
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
    },
    riderHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginBottom: 8,
    },
    riderAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: SURFACE_CONTAINER_HIGH,
        borderWidth: 2,
        borderColor: `${PRIMARY_CONTAINER}33`,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    riderAvatarText: {
        fontSize: 14,
        fontWeight: "700",
        color: PRIMARY_CONTAINER,
    },
    riderInfo: {
        flex: 1,
    },
    riderNameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    riderName: {
        fontSize: 14,
        fontWeight: "600",
        fontFamily: "Plus Jakarta Sans",
        color: ON_SURFACE,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    riderRole: {
        fontSize: 12,
        fontWeight: "400",
        fontFamily: "Plus Jakarta Sans",
        color: ON_SURFACE_VARIANT,
        lineHeight: 16,
    },

    chipRow: {
        flexDirection: "row",
        gap: 4,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: `${OUTLINE_VARIANT}80`,
    },
    chipActive: {
        backgroundColor: `${PRIMARY_CONTAINER}1A`,
        borderColor: PRIMARY_CONTAINER,
    },
    chipText: {
        fontSize: 12,
        fontWeight: "600",
        fontFamily: "Plus Jakarta Sans",
        color: ON_SURFACE_VARIANT,
        lineHeight: 16,
        letterSpacing: 0.1,
    },
    chipTextActive: {
        color: PRIMARY_CONTAINER,
    },

    submitBtn: {
        width: "100%",
        backgroundColor: PRIMARY_CONTAINER,
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        shadowColor: PRIMARY_CONTAINER,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    submitBtnText: {
        fontSize: 16,
        fontWeight: "600",
        fontFamily: "Plus Jakarta Sans",
        color: "#fff",
        lineHeight: 28,
    },

    bottomRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        paddingBottom: 24,
    },
    homeButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: `${OUTLINE_VARIANT}`,
    },
    homeButtonText: {
        fontSize: 14,
        fontWeight: "600",
        fontFamily: "Plus Jakarta Sans",
        color: PRIMARY_CONTAINER,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    historyButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    historyButtonText: {
        fontSize: 14,
        fontWeight: "600",
        fontFamily: "Plus Jakarta Sans",
        color: PRIMARY_CONTAINER,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
});
