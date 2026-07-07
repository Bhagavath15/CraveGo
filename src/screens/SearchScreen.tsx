import { useRef, useState } from "react";
import {
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { restaurantList } from "../data/restaurantData";
import { useCart } from "../context/CartContext";

const PRIMARY = "#ab3500";
const PRIMARY_CONTAINER = "#FF6B35";
const SECONDARY = "#006D37";
const BG = "#FCF9F8";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";
const OUTLINE_VARIANT = "#E1BFB5";
const SURFACE_LOWEST = "#FFFFFF";
const SURFACE_VARIANT = "#E5E2E1";
const SURFACE_CONTAINER = "#F0EDED";
const TERTIARY_CONTAINER = "#C29200";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FILTERS = ["Filters", "Ratings 4.0+", "Fast Delivery", "Offers", "Pure Veg"];

const SearchScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const cart = useCart();
    const scrollY = useRef(new Animated.Value(0)).current;
    const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(["Filters"]));

    const toggleFilter = (f: string) => {
        const next = new Set(activeFilters);
        if (f === "Filters") {
            if (next.has("Filters")) {
                next.clear();
            } else {
                next.clear();
                next.add("Filters");
            }
        } else {
            next.add("Filters");
            if (next.has(f)) {
                next.delete(f);
            } else {
                next.add(f);
            }
        }
        setActiveFilters(next);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>Search</Text>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity style={styles.headerBtn}>
                            <MaterialCommunityIcons
                                name="magnify"
                                size={24}
                                color={ON_SURFACE}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerBtn}>
                            <MaterialCommunityIcons
                                name="bell-outline"
                                size={24}
                                color={ON_SURFACE}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollContent}
            >
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterRow}
                    contentContainerStyle={styles.filterContent}
                >
                    {FILTERS.map((f) => {
                        const isActive = activeFilters.has(f) || (f === "Filters" && activeFilters.size === 0);
                        return (
                            <TouchableOpacity
                                key={f}
                                style={[
                                    styles.filterChip,
                                    f === "Filters" && styles.filterChipPrimary,
                                    isActive && f !== "Filters" && styles.filterChipActive,
                                    !isActive && f !== "Filters" && styles.filterChipInactive,
                                ]}
                                onPress={() => toggleFilter(f)}
                            >
                                {f === "Filters" && (
                                    <MaterialCommunityIcons
                                        name="filter-variant"
                                        size={18}
                                        color={isActive ? "#FFF" : ON_SURFACE_VARIANT}
                                    />
                                )}
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        f === "Filters" && styles.filterChipTextPrimary,
                                        isActive && f !== "Filters" && styles.filterChipTextOn,
                                        !isActive && f !== "Filters" && styles.filterChipTextOff,
                                    ]}
                                >
                                    {f}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <View style={styles.cardGrid}>
                    {restaurantList.map((r, index) => (
                        <TouchableOpacity
                            key={r.id}
                            activeOpacity={0.95}
                            onPress={() =>
                                navigation.navigate("RestaurantDetail", {
                                    restaurantId: r.id,
                                })
                            }
                            style={styles.restaurantCard}
                        >
                            <View style={styles.cardImageWrapper}>
                                <Image
                                    source={r.image}
                                    style={styles.cardImage}
                                />
                                <View style={styles.ratingBadge}>
                                    <MaterialCommunityIcons
                                        name="star"
                                        size={14}
                                        color={SECONDARY}
                                    />
                                    <Text style={styles.ratingText}>
                                        {r.rating}
                                    </Text>
                                </View>
                                {r.offer && (
                                    <View style={styles.freeDeliveryBadge}>
                                        <Text style={styles.freeDeliveryText}>
                                            Free Delivery
                                        </Text>
                                    </View>
                                )}
                                {index === 1 && (
                                    <View style={styles.pureVegBadge}>
                                        <MaterialCommunityIcons
                                            name="leaf"
                                            size={12}
                                            color="#5F1900"
                                        />
                                        <Text style={styles.pureVegText}>
                                            PURE VEG
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.cardBody}>
                                <View style={styles.cardTitleRow}>
                                    <Text
                                        style={styles.cardRestaurantName}
                                        numberOfLines={1}
                                    >
                                        {r.name}
                                    </Text>
                                    <Text style={styles.cardPrice}>
                                        ₹{parseInt(r.priceForOne.replace(/[^0-9]/g, "")) * 2} for two
                                    </Text>
                                </View>
                                <Text
                                    style={styles.cardCuisines}
                                    numberOfLines={1}
                                >
                                    {r.cuisines}
                                </Text>
                                <View style={styles.cardMeta}>
                                    <View style={styles.metaItem}>
                                        <MaterialCommunityIcons
                                            name="clock-outline"
                                            size={16}
                                            color={ON_SURFACE_VARIANT}
                                        />
                                        <Text style={styles.metaText}>
                                            {r.deliveryTime}
                                        </Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <MaterialCommunityIcons
                                            name="map-marker"
                                            size={16}
                                            color={ON_SURFACE_VARIANT}
                                        />
                                        <Text style={styles.metaText}>
                                            {r.distance}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.viewMoreButton}>
                    <Text style={styles.viewMoreText}>
                        View More Restaurants
                    </Text>
                    <MaterialCommunityIcons
                        name="chevron-down"
                        size={20}
                        color={PRIMARY}
                    />
                </TouchableOpacity>
            </ScrollView>

            {cart.itemCount > 0 && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() =>
                        navigation.navigate("CartCheckout", {
                            restaurantId: cart.restaurantId || "",
                        })
                    }
                >
                    <View style={styles.fabIconRow}>
                        <MaterialCommunityIcons
                            name="shopping-outline"
                            size={24}
                            color="#FFF"
                        />
                        <View style={styles.fabBadge}>
                            <Text style={styles.fabBadgeText}>
                                {cart.itemCount}
                            </Text>
                        </View>
                    </View>
                    <View>
                        <Text style={styles.fabLabel}>View Cart</Text>
                        <Text style={styles.fabPrice}>
                            ₹{cart.totalAmount.toFixed(2)}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default SearchScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    header: {
        backgroundColor: BG,
        paddingBottom: 4,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: ON_SURFACE,
        lineHeight: 32,
    },
    headerIcons: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    headerBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        paddingBottom: 32,
    },
    filterRow: {
        marginBottom: 16,
        paddingLeft: 16,
    },
    filterContent: {
        gap: 8,
        flexDirection: "row",
        paddingRight: 16,
    },
    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
    },
    filterChipPrimary: {
        backgroundColor: PRIMARY,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    filterChipActive: {
        backgroundColor: SURFACE_LOWEST,
        borderWidth: 1.5,
        borderColor: PRIMARY,
    },
    filterChipInactive: {
        backgroundColor: SURFACE_LOWEST,
        borderWidth: 1.5,
        borderColor: OUTLINE_VARIANT,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: "600",
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    filterChipTextPrimary: {
        color: "#FFF",
    },
    filterChipTextOn: {
        color: PRIMARY,
    },
    filterChipTextOff: {
        color: ON_SURFACE_VARIANT,
    },
    cardGrid: {
        paddingHorizontal: 16,
        gap: 24,
    },
    restaurantCard: {
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: `${SURFACE_VARIANT}4D`,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    cardImageWrapper: {
        height: 224,
        position: "relative",
    },
    cardImage: {
        width: "100%",
        height: "100%",
    },
    ratingBadge: {
        position: "absolute",
        top: 12,
        right: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(255,255,255,0.9)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    freeDeliveryBadge: {
        position: "absolute",
        bottom: 12,
        left: 12,
        backgroundColor: SECONDARY,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    freeDeliveryText: {
        fontSize: 11,
        fontWeight: "500",
        color: "#FFF",
        lineHeight: 16,
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    pureVegBadge: {
        position: "absolute",
        top: 12,
        left: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: TERTIARY_CONTAINER,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    pureVegText: {
        fontSize: 11,
        fontWeight: "500",
        color: "#5F1900",
        lineHeight: 16,
        letterSpacing: 0.5,
    },
    cardBody: {
        padding: 16,
    },
    cardTitleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 4,
    },
    cardRestaurantName: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 28,
        flex: 1,
        marginRight: 8,
    },
    cardPrice: {
        fontSize: 14,
        fontWeight: "600",
        color: PRIMARY,
        lineHeight: 20,
    },
    cardCuisines: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        marginBottom: 12,
    },
    cardMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: `${SURFACE_VARIANT}80`,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    metaText: {
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    viewMoreButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        marginTop: 24,
        marginHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: PRIMARY,
    },
    viewMoreText: {
        fontSize: 14,
        fontWeight: "600",
        color: PRIMARY,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    fab: {
        position: "absolute",
        bottom: 16,
        right: 16,
        left: 16,
        backgroundColor: PRIMARY,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        paddingVertical: 14,
        borderRadius: 16,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    fabIconRow: {
        position: "relative",
    },
    fabBadge: {
        position: "absolute",
        top: -6,
        right: -6,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
    },
    fabBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: PRIMARY,
    },
    fabLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: "#FFF",
        lineHeight: 14,
        textTransform: "uppercase",
        opacity: 0.8,
    },
    fabPrice: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFF",
        lineHeight: 20,
        letterSpacing: 0.1,
    },
});
