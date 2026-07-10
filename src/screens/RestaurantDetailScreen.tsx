import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {
    RouteProp,
    useNavigation,
    useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList, CustomizationGroup } from "../types/types";
import { MenuItem, MenuCategory, restaurantList, getItemCustomizations } from "../data/restaurantData";
import { getRestaurants, getRestaurantMenu } from "../utils/api";
import { toImageUri } from "../utils/imageUtils";
import { useCart } from "../context/CartContext";
import {
    AnimatedHeader,
    RestaurantInfoCard,
    CategoryTabs,
    MenuItemCard,
    FloatingCart,
} from "../components/restaurant";
import FoodCustomizationModal from "../components/restaurant/FoodCustomizationModal";

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
            id: item._id || item.id || "",
            name: item.name || "",
            description: item.description || "",
            price: item.price || 0,
            image: toImageUri(item.image),
            isVeg: item.isVeg ?? false,
            isBestseller: item.isBestseller ?? false,
            customizable: item.customizable ?? false,
        })),
    }));
};

const RestaurantDetailScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { restaurantId } = route.params;
    console.log("RestaurantDetail - route params restaurantId:", JSON.stringify(restaurantId));

    const scrollY = useRef(new Animated.Value(0)).current;
    const [selectedCategory, setSelectedCategory] = useState("Recommended");
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [customizationGroups, setCustomizationGroups] = useState<CustomizationGroup[]>([]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
    const [menu, setMenu] = useState<MenuCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");
    const cart = useCart();

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("RestaurantDetail - fetching for ID:", restaurantId);

                const [restRes, menuRes] = await Promise.all([
                    getRestaurants(),
                    getRestaurantMenu(restaurantId),
                ]);

                console.log(`RestaurantDetailScreen.tsx 100 menuRes---->`,menuRes)

                if (restRes.success) {
                    const matched = restRes.restaurants.find(
                        (x: any) => String(x.restaurantId) === String(restaurantId)
                    );
                    if (matched) {
                        console.log("RestaurantDetail - matched:", matched.name);
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
                    console.log("RestaurantDetail - menu categories:", menuRes.data.menu.length);
                    console.log("RestaurantDetail - menu first category:", JSON.stringify(menuRes.data.menu[0]).slice(0, 500));
                    if (menuRes.data.menu[0]?.items?.length > 0) {
                        console.log("RestaurantDetail - first item:", JSON.stringify(menuRes.data.menu[0].items[0]));
                    }
                    setMenu(mapApiMenu(menuRes.data.menu));
                } else if (!menuRes.success) {
                    console.warn("RestaurantDetail - menu API failed:", JSON.stringify(menuRes));
                } else {
                    console.warn("RestaurantDetail - menu data missing:", JSON.stringify(menuRes).slice(0, 500));
                }
            } catch (err) {
                console.warn("Failed to fetch restaurant data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [restaurantId]);

    useEffect(() => {
        if (selectedItem?.customizable) {
            const localRest = restaurantList.find(
                r => r.name.toLowerCase() === restaurant?.name?.toLowerCase()
            );
            if (localRest) {
                const localItem = localRest.menu
                    .flatMap(c => c.items)
                    .find(i => i.name.toLowerCase() === selectedItem.name.toLowerCase());
                if (localItem) {
                    setCustomizationGroups(getItemCustomizations(localRest.id, localItem.id));
                    return;
                }
            }
            setCustomizationGroups(getItemCustomizations(restaurantId, selectedItem.id));
        }
    }, [selectedItem, restaurantId, restaurant]);

    useEffect(() => {
        return () => cart.clearCart();
    }, []);

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
        const customizedItem: MenuItem = {
            ...item,
            price: totalPrice,
        };
        cart.addToCart(customizedItem, restaurantId, restaurant!.name);
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
        console.log("RestaurantDetail - RENDER: loading=true");
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        );
    }

    if (!restaurant) {
        console.log("RestaurantDetail - RENDER: restaurant=null, fetchError:", fetchError);
        return (
            <View style={styles.center}>
                <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Restaurant not found</Text>
                {fetchError ? <Text style={{ color: "#888", textAlign: "center", paddingHorizontal: 40 }}>{fetchError}</Text> : null}
                <Text style={{ color: "#aaa", marginTop: 16, fontSize: 12 }}>ID: {restaurantId?.slice(0, 12)}...</Text>
            </View>
        );
    }

    console.log("RestaurantDetail - RENDER: showing details for", restaurant);

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
                />
            )}

            <Animated.ScrollView
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
                        source={restaurant.image}
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

                <View style={styles.menuContainer}>
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
                                            quantity={cart.getItemQuantity(item.id)}
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

            <FloatingCart
                itemCount={cart.itemCount}
                restaurantName={restaurant.name}
                onViewCart={handleNavigateToCart}
            />
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
    heroContainer: {
        height: HERO_HEIGHT,
        width: SCREEN_WIDTH,
        position: "relative",
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
