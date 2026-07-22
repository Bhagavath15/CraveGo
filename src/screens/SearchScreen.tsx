import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { getRestaurants } from "../api/restaurant";
import { toImageUri, imageSource } from "../utils/imageUtils";
import { useCart } from "../context/CartContext";
import { useFavouriteIds, toggleFavourite } from "../context/FavoritesStore";
import Skeleton from "../components/Skeleton";

const PRIMARY = "#FF6B35";
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

interface SearchRestaurant {
    id: string;
    name: string;
    image: string;
    cuisines: string;
    rating: number;
    deliveryTime: string;
    distance: string;
    priceForOne: string;
    offer?: string;
    isVeg: boolean;
    menuItemNames: string[];
}

const SearchScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const cart = useCart();
    const { favouriteIds } = useFavouriteIds();
    const scrollY = useRef(new Animated.Value(0)).current;
    const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(["Filters"]));
    const [restaurants, setRestaurants] = useState<SearchRestaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [fetchError, setFetchError] = useState("");

    useFocusEffect(
        useCallback(() => {
            setActiveFilters(new Set(["Filters"]));
            setShowSearch(false);
            setSearchQuery("");
        }, [])
    );

    const mapApiRestaurant = (r: any): SearchRestaurant => ({
        id: r.restaurantId || r._id,
        name: r.name,
        image: toImageUri(r.image),
        cuisines: Array.isArray(r.cuisines) ? r.cuisines.join(" • ") : r.cuisines || "",
        rating: r.rating || 0,
        deliveryTime: r.deliveryTime || "",
        distance: r.distance || "",
        priceForOne: r.priceForOne || "",
        offer: r.offer,
        isVeg: r.isVeg ?? false,
        menuItemNames: r.menuItemNames || [],
    });

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const res = await getRestaurants();
                if (res.success && res.restaurants?.length) {
                    setRestaurants(res.restaurants.map(mapApiRestaurant));
                } else {
                    setFetchError(res?.message || "Failed to load restaurants");
                }
            } catch (e: any) {
                setFetchError(e?.message || "Network error");
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

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

    const parseMinMinutes = (time: string): number => {
        const nums = time.match(/\d+/g);
        return nums ? Math.min(...nums.map(Number)) : 99;
    };

    const [searchResults, setSearchResults] = useState<SearchRestaurant[] | null>(null);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults(null);
            return;
        }
        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const res = await getRestaurants(searchQuery.trim());
                if (res.success && res.restaurants) {
                    setSearchResults(res.restaurants.map(mapApiRestaurant));
                }
            } catch { } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const filteredBySearch = searchResults
        ? searchResults
        : restaurants;

    const filteredRestaurants = useMemo(() =>
        filteredBySearch.filter((r) => {
            if (activeFilters.size === 0 || (activeFilters.size === 1 && activeFilters.has("Filters"))) return true;
            if (activeFilters.has("Ratings 4.0+") && (!r.rating || r.rating < 4.0)) return false;
            if (activeFilters.has("Pure Veg") && !r.isVeg) return false;
            if (activeFilters.has("Offers") && !r.offer) return false;
            if (activeFilters.has("Fast Delivery") && parseMinMinutes(r.deliveryTime) > 25) return false;
            return true;
        }),
        [filteredBySearch, activeFilters]
    );

    const handleSearchToggle = () => {
        setShowSearch(!showSearch);
        if (showSearch) setSearchQuery("");
    };

    const handleClearSearch = () => setSearchQuery("");

    const handleRestaurantPress = (id: string) => {
        navigation.navigate("RestaurantDetail", { restaurantId: id });
    };

    const handleCartPress = () => {
        navigation.navigate("CartCheckout", {
            restaurantId: cart.restaurantId || "",
        });
    };

    const renderFilterChip = (f: string) => {
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
    };

    const renderRestaurantCard = (r: SearchRestaurant) => (
        <TouchableOpacity
            key={r.id}
            activeOpacity={0.95}
            onPress={() => handleRestaurantPress(r.id)}
            style={styles.restaurantCard}
        >
            <View style={styles.cardImageWrapper}>
                <Image
                    source={imageSource(r.image)}
                    style={styles.cardImage}
                />
                <TouchableOpacity
                    style={styles.searchFavBtn}
                    onPress={() => toggleFavourite(r.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <MaterialCommunityIcons
                        name={favouriteIds.has(r.id) ? "heart" : "heart-outline"}
                        size={20}
                        color={favouriteIds.has(r.id) ? PRIMARY : "#FFF"}
                    />
                </TouchableOpacity>
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
                {r.isVeg && (
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
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>Search</Text>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity
                            style={styles.headerBtn}
                            onPress={handleSearchToggle}
                        >
                            <MaterialCommunityIcons
                                name={showSearch ? "close" : "magnify"}
                                size={24}
                                color={ON_SURFACE}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate("Notifications")}>
                            <MaterialCommunityIcons
                                name="bell-outline"
                                size={24}
                                color={ON_SURFACE}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {showSearch && (
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color={ON_SURFACE_VARIANT} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search restaurants or cuisines..."
                        placeholderTextColor={ON_SURFACE_VARIANT}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={handleClearSearch}>
                            <MaterialCommunityIcons name="close-circle" size={18} color={ON_SURFACE_VARIANT} />
                        </TouchableOpacity>
                    )}
                </View>
            )}

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
                    {FILTERS.map(renderFilterChip)}
                </ScrollView>

                <View style={styles.cardGrid}>
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <View key={i} style={styles.skeletonCard}>
                                <Skeleton width="100%" height={224} borderRadius={0} />
                                <View style={styles.skeletonBody}>
                                    <Skeleton width="70%" height={18} />
                                    <Skeleton width="50%" height={14} style={{ marginTop: 8 }} />
                                    <View style={styles.skeletonMeta}>
                                        <Skeleton width={80} height={14} />
                                        <Skeleton width={100} height={14} />
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : filteredRestaurants.length === 0 ? (
                        <Text style={styles.emptyText}>{fetchError || "No restaurants match your filters."}</Text>
                    ) : (
                        filteredRestaurants.map(renderRestaurantCard)
                    )}
                </View>
            </ScrollView>

            {cart.itemCount > 0 && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={handleCartPress}
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
                            ₹{cart.grandTotal.toFixed(2)}
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
    searchFavBtn: {
        position: "absolute",
        top: 12,
        left: 12,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "rgba(0,0,0,0.25)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2,
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
    emptyText: {
        textAlign: "center",
        fontSize: 16,
        color: ON_SURFACE_VARIANT,
        lineHeight: 24,
        marginTop: 60,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: OUTLINE_VARIANT,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: ON_SURFACE,
        padding: 0,
    },
    skeletonCard: {
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: `${SURFACE_VARIANT}4D`,
    },
    skeletonBody: {
        padding: 16,
        gap: 8,
    },
    skeletonMeta: {
        flexDirection: "row",
        gap: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: `${SURFACE_VARIANT}80`,
    },
});
