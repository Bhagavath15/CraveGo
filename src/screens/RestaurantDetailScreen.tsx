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
import { MenuItem, MenuCategory } from "../data/restaurantData";
import { getRestaurants, getRestaurantMenu } from "../api/restaurant";
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
    offer?: string;
    offerDescription?: string;
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
                            offer: matched.offer,
                            offerDescription: matched.offerDescription,
                            isVeg: matched.isVeg ?? false,
                            isFavorite: matched.isFavorite ?? false,
                            address: matched.address || "",
                        });
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

    useEffect(() => {
        if (!isFocused) return;
        const shouldShow = cart.items.length > 0 && cart.restaurantId && cart.restaurantId !== restaurantId;
        if (shouldShow) {
            Alert.alert(
                "Clear Cart?",
                `Your cart has items from another restaurant. Start fresh with ${restaurant?.name || "this restaurant"}?`,
                [
                    { text: "Keep Cart", style: "cancel" },
                    { text: "Clear Cart", onPress: () => { cart.clearCart(); } },
                ]
            );
        }
    }, [restaurantId, cart.restaurantId, cart.items.length, isFocused]);

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
        if (item.customizable) {
            setSelectedItem(item);
            setIsSheetOpen(true);
        } else {
            if (restaurant) cart.addToCart(item, restaurantId, restaurant.name);
        }
    };

    const handleIncrement = (item: MenuItem) => {
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

    const handleSheetClose = useCallback(() => {
        setIsSheetOpen(false);
        setSelectedItem(null);
        setCustomizationGroups([]);
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <Skeleton width="100%" height={HERO_HEIGHT} borderRadius={0} />
                <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
                    <Skeleton width="60%" height={24} />
                    <Skeleton width="80%" height={16} style={{ marginTop: 8 }} />
                    <View style={{ flexDirection: "row", gap: 16, marginTop: 12 }}>
                        <Skeleton width={80} height={14} />
                        <Skeleton width={60} height={14} />
                        <Skeleton width={70} height={14} />
                    </View>
                </View>
                <View style={{ flexDirection: "row", paddingHorizontal: 16, marginTop: 24, gap: 12 }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} width={90} height={32} borderRadius={16} />
                    ))}
                </View>
                <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
                    <Skeleton width="40%" height={24} />
                    <View style={{ flexDirection: "row", gap: 16, marginTop: 16 }}>
                        {Array.from({ length: 2 }).map((_, i) => (
                            <View key={i} style={{ flex: 1 }}>
                                <Skeleton width="100%" height={120} borderRadius={12} />
                                <Skeleton width="70%" height={16} style={{ marginTop: 8 }} />
                                <Skeleton width="50%" height={14} style={{ marginTop: 4 }} />
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
                contentContainerStyle={{ paddingBottom: cart.itemCount ? 120 : 50 }}
            >
                <View style={styles.heroContainer}>
                    <Image
                        source={imageSource(restaurant.image)}
                        style={styles.heroImage}
                    />
                    <View style={styles.heroOverlay}>
                        <TouchableOpacity
                            style={styles.heroIconBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.heroIconBtn}
                            onPress={() => toggleFavourite(restaurant.id)}
                        >
                            <MaterialCommunityIcons
                                name={isFav ? "heart" : "heart-outline"}
                                size={22}
                                color={isFav ? "#FF6B35" : "#FFF"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <RestaurantInfoCard
                    name={restaurant.name}
                    cuisinesLabel={cuisinesLabel}
                    vegLabel={vegLabel}
                    rating={restaurant.rating}
                    deliveryTime={restaurant.deliveryTime}
                    distance={restaurant.distance}
                    offer={restaurant.offer}
                    offerDescription={restaurant.offerDescription}
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
        backgroundColor: "#FCF9F8",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    errorDesc: {
        color: "#888",
        textAlign: "center",
        paddingHorizontal: 40,
    },
    errorId: {
        color: "#aaa",
        marginTop: 16,
        fontSize: 12,
    },
    heroContainer: {
        height: HERO_HEIGHT,
        width: SCREEN_WIDTH,
        position: "relative",
    },
    heroOverlay: {
        position: "absolute",
        top: 12,
        left: 12,
        right: 12,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    heroIconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1B1C1C",
        lineHeight: 32,
        marginBottom: 16,
    },
    gridContainer: {
        gap: 16,
    },
});
