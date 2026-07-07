import { useState } from "react";
import {
    Image,
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

const PRIMARY = "#ab3500";
const PRIMARY_CONTAINER = "#FF6B35";
const SECONDARY = "#006D37";
const BG = "#FCF9F8";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";
const OUTLINE = "#8D7168";
const OUTLINE_VARIANT = "#E1BFB5";
const SURFACE_LOWEST = "#FFFFFF";
const SURFACE_CONTAINER_LOW = "#F6F3F2";
const SURFACE_VARIANT = "#E5E2E1";
const PRIMARY_CONTAINER_10 = "rgba(255,107,53,0.1)";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "DeliveryCompleted">;

const StarRating = ({
    rating,
    onRate,
}: {
    rating: number;
    onRate: (val: number) => void;
}) => (
    <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => onRate(star)} activeOpacity={0.7}>
                <MaterialCommunityIcons
                    name={star <= rating ? "star" : "star-outline"}
                    size={32}
                    color={star <= rating ? PRIMARY : OUTLINE_VARIANT}
                />
            </TouchableOpacity>
        ))}
    </View>
);

const DeliveryCompletedScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const cart = useCart();
    const {
        restaurantName = "Spice Garden",
        items = "2x Special Chicken Biryani",
        totalPrice = 850,
        deliveredTime = "7:45 PM",
        riderName = "Arjun K.",
    } = route.params || {};

    const [foodRating, setFoodRating] = useState(0);
    const [riderRating, setRiderRating] = useState(0);

    const handleBackToHome = () => {
        cart.clearCart();
        navigation.navigate("Home");
    };

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
                        color={ON_SURFACE}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delivery Completed</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <MaterialCommunityIcons
                        name="help-circle-outline"
                        size={24}
                        color={ON_SURFACE}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.heroSection}>
                    <View style={styles.heroImageWrapper}>
                        <Image
                            source={require("../assets/images/delivery-hero.png")}
                            style={styles.heroImage}
                            resizeMode="contain"
                        />
                        <View style={styles.successBadge}>
                            <MaterialCommunityIcons
                                name="check-circle"
                                size={24}
                                color="#FFF"
                            />
                        </View>
                    </View>
                    <Text style={styles.successTitle}>
                        Hope you enjoy your meal!
                    </Text>
                    <View style={styles.deliveredRow}>
                        <MaterialCommunityIcons
                            name="clipboard-check-outline"
                            size={20}
                            color={SECONDARY}
                        />
                        <Text style={styles.deliveredText}>
                            Delivered at {deliveredTime}
                        </Text>
                    </View>
                </View>

                <View style={styles.orderCard}>
                    <View style={styles.orderCardBody}>
                        <View style={styles.restaurantIcon}>
                            <MaterialCommunityIcons
                                name="silverware"
                                size={24}
                                color={PRIMARY}
                            />
                        </View>
                        <View style={styles.restaurantInfo}>
                            <Text style={styles.restaurantName}>
                                {restaurantName}
                            </Text>
                            <Text style={styles.itemsText}>{items}</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Order Total</Text>
                        <Text style={styles.totalValue}>₹{totalPrice}</Text>
                    </View>
                </View>

                <View style={styles.ratingCard}>
                    <Text style={styles.ratingTitle}>Rate your Food</Text>
                    <StarRating rating={foodRating} onRate={setFoodRating} />
                </View>

                <View style={styles.ratingCard}>
                    <View style={styles.riderHeader}>
                        <View style={styles.riderAvatar}>
                            <Image
                                source={require("../assets/images/rider-arjun.png")}
                                style={styles.riderAvatarImage}
                            />
                        </View>
                        <View>
                            <Text style={styles.ratingTitle}>
                                Rate your Rider
                            </Text>
                            <Text style={styles.riderName}>{riderName}</Text>
                        </View>
                    </View>
                    <View style={styles.riderStars}>
                        <StarRating
                            rating={riderRating}
                            onRate={setRiderRating}
                        />
                    </View>
                    <TextInput
                        style={styles.noteInput}
                        placeholder="Add a note..."
                        placeholderTextColor={OUTLINE}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                <View style={styles.actionsSection}>
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
                        onPress={() => navigation.navigate("Home", { screen: "OrdersTab" })}
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
        paddingTop: 12,
        paddingBottom: 8,
    },
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 28,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 48,
    },
    heroSection: {
        alignItems: "center",
        paddingTop: 16,
        paddingBottom: 24,
    },
    heroImageWrapper: {
        width: 280,
        height: 280,
        marginBottom: 16,
        position: "relative",
    },
    heroImage: {
        width: "100%",
        height: "100%",
    },
    successBadge: {
        position: "absolute",
        top: -8,
        right: -8,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: SECONDARY,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: SECONDARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: ON_SURFACE,
        lineHeight: 36,
        textAlign: "center",
        marginBottom: 8,
    },
    deliveredRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    deliveredText: {
        fontSize: 16,
        color: ON_SURFACE_VARIANT,
        lineHeight: 24,
    },
    orderCard: {
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 24,
        padding: 16,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 20,
        elevation: 2,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.8)",
    },
    orderCardBody: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingBottom: 16,
    },
    restaurantIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: PRIMARY_CONTAINER_10,
        justifyContent: "center",
        alignItems: "center",
    },
    restaurantInfo: {
        flex: 1,
    },
    restaurantName: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 28,
        marginBottom: 2,
    },
    itemsText: {
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    divider: {
        height: 1,
        backgroundColor: SURFACE_VARIANT,
        marginBottom: 16,
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    totalLabel: {
        fontSize: 16,
        color: ON_SURFACE_VARIANT,
        lineHeight: 24,
    },
    totalValue: {
        fontSize: 24,
        fontWeight: "700",
        color: ON_SURFACE,
        lineHeight: 32,
    },
    ratingCard: {
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 20,
        elevation: 2,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.8)",
    },
    ratingTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 28,
        marginBottom: 12,
    },
    starRow: {
        flexDirection: "row",
        gap: 8,
    },
    riderHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
    },
    riderAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: `${PRIMARY_CONTAINER}33`,
    },
    riderAvatarImage: {
        width: "100%",
        height: "100%",
    },
    riderName: {
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    riderStars: {
        marginBottom: 12,
    },
    noteInput: {
        backgroundColor: SURFACE_CONTAINER_LOW,
        borderRadius: 16,
        padding: 16,
        fontSize: 14,
        color: ON_SURFACE,
        lineHeight: 20,
        minHeight: 80,
        borderWidth: 2,
        borderColor: "transparent",
    },
    actionsSection: {
        marginTop: 32,
        alignItems: "center",
        gap: 12,
    },
    homeButton: {
        width: "100%",
        backgroundColor: PRIMARY_CONTAINER,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: "center",
        shadowColor: PRIMARY_CONTAINER,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
    },
    homeButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#5F1900",
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    historyButton: {
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 999,
    },
    historyButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: PRIMARY,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
});
