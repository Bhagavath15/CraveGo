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
import { colors, spacing, typography, radius, shadows, sizes } from "../theme";



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
                        color={isActive ? colors.white : colors.textSecondary}
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
                        color={favouriteIds.has(r.id) ? colors.primary : colors.white}
                    />
                </TouchableOpacity>
                <View style={styles.ratingBadge}>
                    <MaterialCommunityIcons
                        name="star"
                        size={14}
                        color={colors.secondary}
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
                            color={colors.primaryDark}
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
                            color={colors.textSecondary}
                        />
                        <Text style={styles.metaText}>
                            {r.deliveryTime}
                        </Text>
                    </View>
                    <View style={styles.metaItem}>
                        <MaterialCommunityIcons
                            name="map-marker"
                            size={16}
                            color={colors.textSecondary}
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
                                color={colors.textPrimary}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate("Notifications")}>
                            <MaterialCommunityIcons
                                name="bell-outline"
                                size={24}
                                color={colors.textPrimary}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {showSearch && (
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search restaurants or cuisines..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={handleClearSearch}>
                            <MaterialCommunityIcons name="close-circle" size={18} color={colors.textSecondary} />
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
                            color={colors.white}
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
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.background,
        paddingBottom: spacing.xs,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    headerTitle: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xxxl,
    },
    headerIcons: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
    },
    headerBtn: {
        width: sizes.avatar,
        height: sizes.avatar,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    filterRow: {
        marginBottom: spacing.md,
        paddingLeft: spacing.md,
    },
    filterContent: {
        gap: spacing.sm,
        flexDirection: "row",
        paddingRight: spacing.md,
    },
    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
    },
    filterChipPrimary: {
        backgroundColor: colors.primary,
        ...shadows.card,
    },
    filterChipActive: {
        backgroundColor: colors.surface,
        borderWidth: 1.5,
        borderColor: colors.primary,
    },
    filterChipInactive: {
        backgroundColor: colors.surface,
        borderWidth: 1.5,
        borderColor: colors.outlineVariant,
    },
    filterChipText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.normal,
    },
    filterChipTextPrimary: {
        color: colors.white,
    },
    filterChipTextOn: {
        color: colors.primary,
    },
    filterChipTextOff: {
        color: colors.textSecondary,
    },
    cardGrid: {
        paddingHorizontal: spacing.md,
        gap: spacing.lg,
    },
    restaurantCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.xxl,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: `${colors.surfaceContainerHighest}4D`,
        ...shadows.card,
    },
    cardImageWrapper: {
        height: 224,
        position: "relative",
    },
    searchFavBtn: {
        position: "absolute",
        top: spacing.sm + spacing.xs,
        left: spacing.sm + spacing.xs,
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
        top: spacing.sm + spacing.xs,
        right: spacing.sm + spacing.xs,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        backgroundColor: "rgba(255,255,255,0.9)",
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.sm,
    },
    ratingText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.normal,
    },
    freeDeliveryBadge: {
        position: "absolute",
        bottom: spacing.sm + spacing.xs,
        left: spacing.sm + spacing.xs,
        backgroundColor: colors.secondary,
        paddingHorizontal: spacing.sm + spacing.xs,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
    },
    freeDeliveryText: {
        fontSize: 11,
        fontWeight: typography.fontWeight.medium,
        color: colors.white,
        lineHeight: typography.lineHeight.sm,
        letterSpacing: typography.letterSpacing.wider,
        textTransform: "uppercase",
    },
    pureVegBadge: {
        position: "absolute",
        top: spacing.sm + spacing.xs,
        left: spacing.sm + spacing.xs,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        backgroundColor: colors.tertiary,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.sm,
    },
    pureVegText: {
        fontSize: 11,
        fontWeight: typography.fontWeight.medium,
        color: colors.primaryDark,
        lineHeight: typography.lineHeight.sm,
        letterSpacing: typography.letterSpacing.wider,
    },
    cardBody: {
        padding: spacing.md,
    },
    cardTitleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: spacing.xs,
    },
    cardRestaurantName: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xxl,
        flex: 1,
        marginRight: spacing.sm,
    },
    cardPrice: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
        lineHeight: typography.lineHeight.md,
    },
    cardCuisines: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.md,
        marginBottom: spacing.sm + spacing.xs,
    },
    cardMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingTop: spacing.sm + spacing.xs,
        borderTopWidth: 1,
        borderTopColor: `${colors.surfaceContainerHighest}80`,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
    },
    metaText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.normal,
    },
    fab: {
        position: "absolute",
        bottom: spacing.md,
        right: spacing.md,
        left: spacing.md,
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm + spacing.xs,
        paddingVertical: 14,
        borderRadius: radius.lg,
        ...shadows.button,
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
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
    },
    fabBadgeText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
    },
    fabLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        color: colors.white,
        lineHeight: typography.lineHeight.xs,
        textTransform: "uppercase",
        opacity: 0.8,
    },
    fabPrice: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.normal,
    },
    emptyText: {
        textAlign: "center",
        fontSize: typography.fontSize.lg,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.xl,
        marginTop: 60,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        paddingHorizontal: spacing.sm + spacing.xs,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: colors.outlineVariant,
        gap: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: typography.fontSize.lg,
        color: colors.textPrimary,
        padding: 0,
    },
    skeletonCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.xxl,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: `${colors.surfaceContainerHighest}4D`,
    },
    skeletonBody: {
        padding: spacing.md,
        gap: spacing.sm,
    },
    skeletonMeta: {
        flexDirection: "row",
        gap: spacing.md,
        paddingTop: spacing.sm + spacing.xs,
        borderTopWidth: 1,
        borderTopColor: `${colors.surfaceContainerHighest}80`,
    },
});
