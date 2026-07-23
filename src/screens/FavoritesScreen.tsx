import { useEffect, useState, useCallback } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../types/types";
import { Restaurant } from "../types/types";
import { getFavourites } from "../api/favorites";
import { imageSource, toImageUri } from "../utils/imageUtils";
import { useFavouriteIds, toggleFavourite } from "../context/FavoritesStore";
import Skeleton from "../components/Skeleton";
import { colors, spacing, typography, radius, shadows } from "../theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FavoritesScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const { favouriteIds } = useFavouriteIds();

    const [favourites, setFavourites] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");

    const fetchFavourites = useCallback(async () => {
        setLoading(true);
        setFetchError("");
        try {
            const res = await getFavourites();
            if (res.success && Array.isArray(res.favourites)) {
                const mapped: Restaurant[] = res.favourites.map((r: any) => ({
                    id: r.restaurantId || r._id,
                    name: r.name,
                    image: toImageUri(r.image),
                    description: r.description,
                    category: r.category || [],
                    cuisines: Array.isArray(r.cuisines) ? r.cuisines.join(" • ") : r.cuisines || "",
                    address: r.address || "",
                    rating: r.rating || 0,
                    totalRatings: r.totalRatings?.toString() || "0",
                    distance: r.distance || "",
                    deliveryTime: r.deliveryTime || "",
                    priceForOne: r.priceForOne || "",
                    offer: r.offer,
                    offerDescription: r.offerDescription,
                    isVeg: r.isVeg ?? false,
                    isFavorite: true,
                    restaurantId: r.restaurantId || r._id,
                    menu: [],
                    menuItemNames: r.menuItemNames || [],
                }));
                setFavourites(mapped);
            } else {
                setFavourites([]);
                setFetchError(res.message || "Failed to load favourites");
            }
        } catch {
            setFavourites([]);
            setFetchError("Network error. Check your connection.");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchFavourites();
        }, [fetchFavourites])
    );

    const renderRestaurant = ({ item }: { item: Restaurant }) => (
        <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => navigation.navigate("RestaurantDetail", { restaurantId: item.id })}
        >
            <View style={styles.imageWrapper}>
                <Image source={imageSource(item.image)} style={styles.cardImage} />
                <TouchableOpacity
                    style={styles.favBtn}
                    onPress={async () => {
                        const wasFav = favouriteIds.has(item.id);
                        await toggleFavourite(item.id);
                        if (wasFav) {
                            setFavourites((prev) => prev.filter((r) => r.id !== item.id));
                        }
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <MaterialCommunityIcons
                        name={favouriteIds.has(item.id) ? "heart" : "heart-outline"}
                        size={20}
                        color={favouriteIds.has(item.id) ? colors.primary : colors.white}
                    />
                </TouchableOpacity>
                <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ {item.rating}</Text>
                </View>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardDesc}>{item.description}</Text>
                <View style={styles.cardFooter}>
                    <View style={styles.footerItem}>
                        <MaterialCommunityIcons name="map-marker" size={14} color={colors.textMuted} />
                        <Text style={styles.footerText}>{item.distance}</Text>
                    </View>
                    <View style={styles.footerItem}>
                        <MaterialCommunityIcons name="clock-time-four-outline" size={14} color={colors.textMuted} />
                        <Text style={styles.footerText}>{item.deliveryTime}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmpty = () => {
        if (loading) return null;
        if (fetchError) {
            return (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="heart-broken" size={72} color={colors.outline} />
                    <Text style={styles.emptyTitle}>Something went wrong</Text>
                    <Text style={styles.emptySubtitle}>{fetchError}</Text>
                    <TouchableOpacity style={styles.browseBtn} onPress={fetchFavourites}>
                        <Text style={styles.browseBtnText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <View style={styles.emptyState}>
                <MaterialCommunityIcons name="heart-outline" size={72} color={colors.outline} />
                <Text style={styles.emptyTitle}>No favourites yet</Text>
                <Text style={styles.emptySubtitle}>
                    Save your favourite restaurants for quick access later.
                </Text>
                <TouchableOpacity
                    style={styles.browseBtn}
                    onPress={() => navigation.navigate("Home" as any)}
                >
                    <Text style={styles.browseBtnText}>Browse Restaurants</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Favourites</Text>
                <View style={styles.backBtn} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <View key={i} style={styles.skeletonCard}>
                            <Skeleton width="100%" height={160} borderRadius={14} />
                            <Skeleton width="60%" height={18} style={{ marginTop: 12 }} />
                            <Skeleton width="80%" height={14} style={{ marginTop: 6 }} />
                        </View>
                    ))}
                </View>
            ) : (
                <FlatList
                    data={favourites}
                    keyExtractor={(item) => item.id}
                    renderItem={renderRestaurant}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={favourites.length === 0 ? { flex: 1 } : { padding: spacing.md }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default FavoritesScreen;

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
        paddingVertical: 12,
        backgroundColor: colors.background,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    loadingContainer: {
        padding: spacing.md,
        gap: spacing.md,
    },
    skeletonCard: {
        backgroundColor: colors.surface,
        borderRadius: 14,
        marginBottom: 18,
        overflow: "hidden",
        padding: spacing.md,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 14,
        marginBottom: 18,
        overflow: "hidden",
        elevation: 3,
        shadowColor: colors.shadow,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    imageWrapper: {
        position: "relative",
    },
    cardImage: {
        width: "100%",
        height: 160,
    },
    favBtn: {
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
    ratingBadge: {
        position: "absolute",
        top: 12,
        right: 12,
        backgroundColor: colors.white,
        borderRadius: radius.xl,
        paddingHorizontal: 10,
        paddingVertical: 5,
        elevation: 4,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    cardContent: {
        padding: 14,
    },
    cardName: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    cardDesc: {
        color: colors.textSecondary,
        marginTop: 5,
        fontSize: 13,
    },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
    },
    footerItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
    },
    footerText: {
        fontSize: 13,
        color: colors.textMuted,
        fontWeight: typography.fontWeight.semibold,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.xl,
        gap: 12,
    },
    emptyTitle: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        marginTop: spacing.sm,
    },
    emptySubtitle: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        textAlign: "center",
        lineHeight: typography.lineHeight.md,
    },
    browseBtn: {
        marginTop: spacing.md,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: 14,
        borderRadius: radius.md,
    },
    browseBtnText: {
        color: colors.white,
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
    },
});
