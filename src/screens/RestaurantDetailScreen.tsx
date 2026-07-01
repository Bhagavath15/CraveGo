import { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {
    RouteProp,
    useNavigation,
    useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList, CustomizationGroup } from "../types/types";
import { MenuItem, restaurantList, getItemCustomizations } from "../data/restaurantData";
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

type RouteProps = RouteProp<RootStackParamList, "RestaurantDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RestaurantDetailScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { restaurantId } = route.params;

    const scrollY = useRef(new Animated.Value(0)).current;
    const [selectedCategory, setSelectedCategory] = useState("Recommended");
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [customizationGroups, setCustomizationGroups] = useState<CustomizationGroup[]>([]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const cart = useCart();

    const restaurant = restaurantList.find(
        (item) => item.id === restaurantId
    );

    useEffect(() => {
        if (selectedItem?.customizable) {
            setCustomizationGroups(
                getItemCustomizations(restaurantId, selectedItem.id)
            );
        }
    }, [selectedItem, restaurantId]);

    useEffect(() => {
        return () => cart.clearCart();
    }, []);

    const handleAdd = (item: MenuItem) => {
        if (item.customizable) {
            setSelectedItem(item);
            setIsSheetOpen(true);
        } else {
            cart.addToCart(item, restaurantId, restaurant!.name);
        }
    };

    const handleIncrement = (item: MenuItem) => {
        if (item.customizable) {
            setSelectedItem(item);
            setIsSheetOpen(true);
        } else {
            cart.addToCart(item, restaurantId, restaurant!.name);
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

    if (!restaurant) {
        return (
            <View style={styles.center}>
                <Text>Restaurant not found.</Text>
            </View>
        );
    }

    const handleNavigateToCart = () => {
        navigation.navigate("CartCheckout", { restaurantId });
    }

    const categoryTitles = restaurant.menu.map((c) => c.title);
    const cuisinesLabel =
        restaurant.cuisines || restaurant.category.join(" • ");
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
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                <View style={styles.heroContainer}>
                    <Image
                        source={restaurant.image}
                        style={styles.heroImage}
                    />
                    <LinearGradient
                        colors={[
                            "transparent",
                            "rgba(252,249,248,0.3)",
                            "#FCF9F8",
                        ]}
                        locations={[0, 0.5, 1]}
                        style={styles.heroGradient}
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

                <CategoryTabs
                    categories={categoryTitles}
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                />

                <View style={styles.menuContainer}>
                    {restaurant.menu
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
