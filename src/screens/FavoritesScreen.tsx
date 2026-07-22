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

const PRIMARY = "#FF6B35";
const BG = "#FCF9F8";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";
const OUTLINE = "#8D7168";
const SURFACE_LOWEST = "#FFFFFF";

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
                        color={favouriteIds.has(item.id) ? PRIMARY : "#FFF"}
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
                        <MaterialCommunityIcons name="map-marker" size={14} color="#666" />
                        <Text style={styles.footerText}>{item.distance}</Text>
                    </View>
                    <View style={styles.footerItem}>
                        <MaterialCommunityIcons name="clock-time-four-outline" size={14} color="#666" />
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
                    <MaterialCommunityIcons name="heart-broken" size={72} color={OUTLINE} />
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
                <MaterialCommunityIcons name="heart-outline" size={72} color={OUTLINE} />
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
                    <MaterialCommunityIcons name="arrow-left" size={24} color={ON_SURFACE} />
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
                    contentContainerStyle={favourites.length === 0 ? { flex: 1 } : { padding: 16 }}
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
        backgroundColor: BG,
    },
    headerBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: BG,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
    },
    loadingContainer: {
        padding: 16,
        gap: 16,
    },
    skeletonCard: {
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 14,
        marginBottom: 18,
        overflow: "hidden",
        padding: 16,
    },
    card: {
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 14,
        marginBottom: 18,
        overflow: "hidden",
        elevation: 3,
        shadowColor: "#000",
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
        backgroundColor: "#FFF",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        elevation: 4,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#222",
    },
    cardContent: {
        padding: 14,
    },
    cardName: {
        fontSize: 18,
        fontWeight: "700",
        color: ON_SURFACE,
    },
    cardDesc: {
        color: ON_SURFACE_VARIANT,
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
        gap: 4,
    },
    footerText: {
        fontSize: 13,
        color: "#666",
        fontWeight: "600",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
        marginTop: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        textAlign: "center",
        lineHeight: 20,
    },
    browseBtn: {
        marginTop: 16,
        backgroundColor: PRIMARY,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    browseBtnText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
    },
});
