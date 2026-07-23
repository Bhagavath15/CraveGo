import { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    RouteProp,
    useFocusEffect,
    useIsFocused,
    useNavigation,
    useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { RootStackParamList, CustomizationGroup } from "../types/types";
import { MenuItem, MenuCategory } from "../types/types";
import { getRestaurants, getRestaurantMenu } from "../api/restaurant";
import { getAvailableCoupons } from "../api/coupon";
import { setPendingCoupon } from "../utils/bannerCouponStore";
import { toImageUri, imageSource } from "../utils/imageUtils";
import { useCart } from "../context/CartContext";
import { useIsFavourite, toggleFavourite } from "../context/FavoritesStore";
import {
    AnimatedHeader,
    RestaurantInfoCard,
    CategoryTabs,
    MenuItemCard,
    FloatingCart,
} from "../components/restaurant";
import FoodCustomizationModal from "../components/restaurant/FoodCustomizationModal";
import Skeleton from "../components/Skeleton";
import { colors, spacing, typography, radius, shadows, sizes } from "../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = 280;

interface RestaurantInfo {
    id: string;
    name: string;
    image: any;
    cuisines: string;
    category: string[];
    rating: number;
    totalRatings: string;
    distance: string;
    deliveryTime: string;
    priceForOne: string;

    isVeg: boolean;
    isFavorite: boolean;
    address: string;
}

type RouteProps = RouteProp<RootStackParamList, "RestaurantDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const mapApiMenu = (apiMenu: any[]): MenuCategory[] => {
    return apiMenu.map((cat: any, index: number) => ({
        id: cat.title || `cat-${index}`,
        title: cat.title || "",
        items: (cat.items || []).map((item: any) => ({
            id: item.itemId || item.id || item._id || "",
            name: item.name || "",
            description: item.description || "",
            price: item.price || 0,
            image: toImageUri(item.image),
            isVeg: item.isVeg ?? false,
            isBestseller: item.isBestseller ?? false,
            customizable: item.customizable ?? false,
            customizations: item.customizations || [],
        })),
    }));
};

const RestaurantDetailScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { restaurantId, editItemId } = route.params;

    const scrollY = useRef(new Animated.Value(0)).current;
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [customizationGroups, setCustomizationGroups] = useState<CustomizationGroup[]>([]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
    const [menu, setMenu] = useState<MenuCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");
    const [menuY, setMenuY] = useState(0);
    const [couponOffer, setCouponOffer] = useState<string | undefined>(undefined);
    const [couponDesc, setCouponDesc] = useState<string | undefined>(undefined);
    const [, forceUpdate] = useState(0);
    const scrollRef = useRef<any>(null);
    const cart = useCart();
    const isFav = useIsFavourite(restaurantId);
    const isFocused = useIsFocused();

    useFocusEffect(
        useCallback(() => {
            forceUpdate((n) => n + 1);
        }, [])
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [restRes, menuRes] = await Promise.all([
                    getRestaurants(),
                    getRestaurantMenu(restaurantId),
                ]);

                if (restRes.success) {
                    const matched = restRes.restaurants.find(
                        (x: any) => String(x.restaurantId) === String(restaurantId)
                    );
                    if (matched) {
                        setRestaurant({
                            id: matched.restaurantId,
                            name: matched.name,
                            image: toImageUri(matched.image),
                            cuisines: Array.isArray(matched.cuisines) ? matched.cuisines.join(" • ") : matched.cuisines || "",
                            category: matched.category || [],
                            rating: matched.rating || 0,
                            totalRatings: matched.totalRatings?.toString() || "0",
                            distance: matched.distance || "",
                            deliveryTime: matched.deliveryTime || "",
                            priceForOne: matched.priceForOne || "",
                            isVeg: matched.isVeg ?? false,
                            isFavorite: matched.isFavorite ?? false,
                            address: matched.address || "",
                        });
                        const couponRes = await getAvailableCoupons(restaurantId, 0);
                        if (couponRes.success && couponRes.data?.length) {
                            const best = couponRes.data[0];
                            const offer = best.discountType === "FLAT"
                                ? `Save ₹${best.discountValue} off`
                                : best.discountType === "PERCENTAGE"
                                    ? `Save ${best.discountValue}% off`
                                    : best.discountType === "FREE_DELIVERY"
                                        ? "Free delivery"
                                        : undefined;
                            setCouponOffer(offer);
                            setCouponDesc(best.title || best.description);
                            setPendingCoupon(best.code);
                        }
                    }
                }

                if (menuRes.success && menuRes.data?.menu) {
                    const mapped = mapApiMenu(menuRes.data.menu);
                    setMenu(mapped);
                    if (mapped.length > 0) {
                        if (editItemId) {
                            const editItemName = cart.items.find((ci) => ci.id === editItemId)?.name;
                            const found = mapped.find((c) =>
                                c.items.some(
                                    (i) => i.id === editItemId || (editItemName && i.name === editItemName)
                                )
                            );
                            setSelectedCategory(found?.title || mapped[0].title);
                        } else {
                            setSelectedCategory(mapped[0].title);
                        }
                    }
                } else if (!menuRes.success) {
                    setFetchError("Failed to load menu");
                } else {
                    setFetchError("Menu data unavailable");
                }
            } catch (err) {
                setFetchError("Failed to load restaurant");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [restaurantId]);

    const showRestaurantMismatchAlert = useCallback((onClear: () => void) => {
        console.log("[RestaurantDetail] Showing restaurant mismatch alert.", {
            cartRestaurantId: cart.restaurantId,
            currentRestaurantId: restaurantId,
            currentRestaurantName: restaurant?.name,
            cartItemCount: cart.items.length,
        });
        Alert.alert(
            "Clear Cart?",
            `Your cart has items from another restaurant. Start fresh with ${restaurant?.name || "this restaurant"}?`,
            [
                {
                    text: "Keep Cart",
                    style: "cancel",
                    onPress: () => console.log("[RestaurantDetail] User action: Keep Cart — cart NOT cleared, item NOT added."),
                },
                {
                    text: "Clear Cart",
                    onPress: () => {
                        console.log("[RestaurantDetail] User action: Clear Cart — proceeding to clear and add.");
                        onClear();
                    },
                },
            ]
        );
    }, [restaurant, cart.restaurantId, cart.items.length, restaurantId]);

    const isCartFromDifferentRestaurant = cart.restaurantId && cart.restaurantId !== restaurantId && cart.items.length > 0;

    useEffect(() => {
        if (selectedItem?.customizable) {
            setCustomizationGroups(selectedItem.customizations ?? []);
        }
    }, [selectedItem]);

    useEffect(() => {
        if (editItemId && menu.length > 0) {
            const editItemName = cart.items.find((ci) => ci.id === editItemId)?.name;
            const found = menu.find((c) =>
                c.items.some(
                    (i) => i.id === editItemId || (editItemName && i.name === editItemName)
                )
            );
            if (found) {
                setSelectedCategory(found.title);
            }
        }
    }, [editItemId, menu, cart.items]);

    useEffect(() => {
        if (!loading && editItemId && menuY > 0 && scrollRef.current) {
            const timer = setTimeout(() => {
                scrollRef.current?.scrollTo({ y: Math.max(0, menuY - 60), animated: true });
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [loading, editItemId, menuY]);

    const handleAdd = (item: MenuItem) => {
        console.log("[RestaurantDetail] handleAdd called", { itemId: item.id, itemName: item.name, isCartFromDifferentRestaurant });
        if (isCartFromDifferentRestaurant) {
            console.log("[RestaurantDetail] Blocked by restaurant mismatch — showing alert.");
            showRestaurantMismatchAlert(() => {
                cart.clearCart();
                if (restaurant) cart.addToCart(item, restaurantId, restaurant.name);
            });
            return;
        }
        if (item.customizable) {
            setSelectedItem(item);
            setIsSheetOpen(true);
        } else {
            if (restaurant) cart.addToCart(item, restaurantId, restaurant.name);
        }
    };

    const handleIncrement = (item: MenuItem) => {
        console.log("[RestaurantDetail] handleIncrement called", { itemId: item.id, itemName: item.name, isCartFromDifferentRestaurant });
        if (isCartFromDifferentRestaurant) {
            console.log("[RestaurantDetail] Blocked by restaurant mismatch — showing alert.");
            showRestaurantMismatchAlert(() => {
                cart.clearCart();
                if (restaurant) cart.addToCart(item, restaurantId, restaurant.name);
            });
            return;
        }
        if (item.customizable) {
            setSelectedItem(item);
            setIsSheetOpen(true);
        } else {
            if (restaurant) cart.addToCart(item, restaurantId, restaurant.name);
        }
    };

    const handleDecrement = (item: MenuItem) => {
        cart.decrementItem(item.id);
    };

    const handleAddToCart = (
        item: MenuItem,
        selections: Record<string, string[]>,
        totalPrice: number
    ) => {
        console.log("[RestaurantDetail] handleAddToCart called (customization modal)", { itemId: item.id, isCartFromDifferentRestaurant });
        const doAdd = () => {
            const customization = customizationGroups
                .flatMap((g) => (selections[g.id] || []).map((oid) => {
                    const opt = g.options.find((o) => o.id === oid);
                    return opt ? { name: opt.name, price: opt.price } : null;
                }))
                .filter(Boolean) as { name: string; price: number }[];
            const customizedItem: MenuItem = {
                ...item,
                price: totalPrice,
            };
            cart.addToCart(customizedItem, restaurantId, restaurant!.name, customization);
            setSelectedItem(null);
            setCustomizationGroups([]);
            setIsSheetOpen(false);
        };

        if (isCartFromDifferentRestaurant) {
            console.log("[RestaurantDetail] Blocked by restaurant mismatch (customization flow) — showing alert.");
            showRestaurantMismatchAlert(() => {
                cart.clearCart();
                doAdd();
            });
            return;
        }
        doAdd();
    };

    const handleSheetClose = useCallback(() => {
        setIsSheetOpen(false);
        setSelectedItem(null);
        setCustomizationGroups([]);
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <Skeleton width="100%" height={HERO_HEIGHT} borderRadius={0} />
                <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.md }}>
                    <Skeleton width="60%" height={24} />
                    <Skeleton width="80%" height={16} style={{ marginTop: spacing.sm }} />
                    <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.sm + spacing.xs }}>
                        <Skeleton width={80} height={14} />
                        <Skeleton width={60} height={14} />
                        <Skeleton width={70} height={14} />
                    </View>
                </View>
                <View style={{ flexDirection: "row", paddingHorizontal: spacing.md, marginTop: spacing.lg, gap: spacing.sm + spacing.xs }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} width={90} height={32} borderRadius={radius.lg} />
                    ))}
                </View>
                <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg }}>
                    <Skeleton width="40%" height={24} />
                    <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.md }}>
                        {Array.from({ length: 2 }).map((_, i) => (
                            <View key={i} style={{ flex: 1 }}>
                                <Skeleton width="100%" height={120} borderRadius={radius.md} />
                                <Skeleton width="70%" height={16} style={{ marginTop: spacing.sm }} />
                                <Skeleton width="50%" height={14} style={{ marginTop: spacing.xs }} />
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    }

    if (!restaurant) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorTitle}>Restaurant not found</Text>
                {fetchError ? <Text style={styles.errorDesc}>{fetchError}</Text> : null}
                <Text style={styles.errorId}>ID: {restaurantId?.slice(0, 12)}...</Text>
            </View>
        );
    }

    const handleNavigateToCart = () => {
        navigation.navigate("CartCheckout", { restaurantId });
    }

    const categoryTitles = menu.map((c) => c.title);
    const cuisinesLabel = restaurant.cuisines || restaurant.category.join(" • ") || "";
    const vegLabel = restaurant.isVeg ? "Pure Veg" : "Non Veg";

    return (
        <View style={styles.container}>
            {!isSheetOpen && (
                <AnimatedHeader
                    restaurantName={restaurant.name}
                    scrollY={scrollY}
                    onBack={() => navigation.goBack()}
                    onFavourite={() => toggleFavourite(restaurant.id)}
                    isFavourite={isFav}
                />
            )}

            <Animated.ScrollView
                ref={scrollRef}
                onScroll={Animated.event(
                    [
                        {
                            nativeEvent: {
                                contentOffset: { y: scrollY },
                            },
                        },
                    ],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: (!cart.restaurantId || cart.restaurantId === restaurantId) && cart.itemCount ? 120 : 50 }}
            >
                <View style={styles.heroContainer}>
                    <Image
                        source={imageSource(restaurant.image)}
                        style={styles.heroImage}
                    />
                </View>

                <RestaurantInfoCard
                    name={restaurant.name}
                    cuisinesLabel={cuisinesLabel}
                    vegLabel={vegLabel}
                    rating={restaurant.rating}
                    deliveryTime={restaurant.deliveryTime}
                    distance={restaurant.distance}
                    offer={couponOffer}
                    offerDescription={couponDesc}
                />

                {menu.length > 0 && (
                    <CategoryTabs
                        categories={categoryTitles}
                        selectedCategory={selectedCategory}
                        onSelect={setSelectedCategory}
                    />
                )}

                <View
                    style={styles.menuContainer}
                    onLayout={(e) => { if (editItemId) setMenuY(e.nativeEvent.layout.y); }}
                >
                    {menu
                        .filter(
                            (cat) => cat.title === selectedCategory
                        )
                        .map((category) => (
                            <View key={category.id}>
                                <Text style={styles.sectionTitle}>
                                    {category.title}
                                </Text>

                                <View style={styles.gridContainer}>
                                    {category.items.map((item) => (
                                        <MenuItemCard
                                            key={item.id}
                                            item={item}
                                            quantity={cart.getItemQuantity(item.id, item.name)}
                                            onAdd={handleAdd}
                                            onIncrement={handleIncrement}
                                            onDecrement={handleDecrement}
                                        />
                                    ))}
                                </View>
                            </View>
                        ))}
                </View>
            </Animated.ScrollView>

            {(!cart.restaurantId || cart.restaurantId === restaurantId) && (
                <FloatingCart
                    itemCount={cart.itemCount}
                    restaurantName={restaurant.name}
                    onViewCart={handleNavigateToCart}
                />
            )}
            <FoodCustomizationModal
                visible={isSheetOpen}
                selectedItem={selectedItem}
                customizationGroups={customizationGroups}
                onAddToCart={handleAddToCart}
                onClose={handleSheetClose}
            />

        </View>
    );
};

export default RestaurantDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        marginBottom: spacing.sm,
    },
    errorDesc: {
        color: colors.textLight,
        textAlign: "center",
        paddingHorizontal: 40,
    },
    errorId: {
        color: colors.textLight,
        marginTop: spacing.md,
        fontSize: typography.fontSize.sm,
    },
    heroContainer: {
        height: HERO_HEIGHT,
        width: SCREEN_WIDTH,
        position: "relative",
    },
    heroOverlay: {
        position: "absolute",
        top: spacing.sm + spacing.xs,
        left: spacing.sm + spacing.xs,
        right: spacing.sm + spacing.xs,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    heroIconBtn: {
        width: sizes.avatar,
        height: sizes.avatar,
        borderRadius: radius.xl,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    heroImage: {
        width: "100%",
        height: "100%",
    },
    heroGradient: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 120,
    },
    menuContainer: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xxxl,
        marginBottom: spacing.md,
    },
    gridContainer: {
        gap: spacing.md,
    },
});


