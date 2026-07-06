import { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
    RouteProp,
    useNavigation,
    useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { useCart } from "../context/CartContext";
import { restaurantList } from "../data/restaurantData";

const PRIMARY = "#FF6B35";
const SECONDARY = "#006D37";
const BG = "#FCF9F8";
const SURFACE_LOWEST = "#FFFFFF";
const SURFACE_CONTAINER_HIGH = "#EAE7E7";
const OUTLINE_VARIANT = "#E1BFB5";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";

type RouteProps = RouteProp<RootStackParamList, "CartCheckout">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CheckoutScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { restaurantId } = route.params;
    const cart = useCart();
    const [selectedPayment, setSelectedPayment] = useState("online");

    const restaurant = restaurantList.find((r) => r.id === restaurantId);
    const deliveryFee = 0;
    const taxesAndCharges = 0;
    const grandTotal = cart.totalAmount + deliveryFee + taxesAndCharges;

    const handlePlaceOrder = () => {
        navigation.navigate("OrderSuccess", { itemCount: cart.itemCount });
    };

    const groupedItems = cart.cartItems.reduce<{ item: typeof cart.cartItems[0]; quantity: number }[]>((acc, item) => {
        const existing = acc.find((g) => g.item.id === item.id);
        if (existing) {
            existing.quantity++;
        } else {
            acc.push({ item, quantity: 1 });
        }
        return acc;
    }, []);

    const handleRemove = (itemId: string) => {
        for (let i = cart.cartItems.length - 1; i >= 0; i--) {
            if (cart.cartItems[i].id === itemId) {
                cart.removeItem(i);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={24}
                        color={PRIMARY}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Your Cart</Text>
                <TouchableOpacity
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                        <MaterialCommunityIcons
                            name="bell-outline"
                            size={24}
                            color={PRIMARY}
                        />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Order Summary</Text>
                        <Text style={styles.itemCountLabel}>
                            {cart.itemCount} Item
                            {cart.itemCount !== 1 ? "s" : ""}
                        </Text>
                    </View>

                    {groupedItems.map(({ item, quantity }) => (
                        <View
                            key={item.id}
                            style={styles.cartItemCard}
                        >
                            <Image
                                source={item.image}
                                style={styles.cartItemImage}
                            />
                            <View style={styles.cartItemContent}>
                                <View style={styles.cartItemHeader}>
                                    <Text
                                        style={styles.cartItemName}
                                        numberOfLines={1}
                                    >
                                        {item.name}
                                    </Text>
                                    <Text style={styles.cartItemPrice}>
                                        ₹{item.price * quantity}
                                    </Text>
                                </View>
                                <Text style={styles.cartItemQuantity}>
                                    Quantity: {quantity}
                                </Text>
                                <View style={styles.cartItemActions}>
                                    <TouchableOpacity
                                        style={styles.editButton}
                                        onPress={() => {
                                            navigation.navigate(
                                                "RestaurantDetail",
                                                { restaurantId }
                                            );
                                        }}
                                    >
                                        <Text style={styles.editText}>
                                            Edit
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleRemove(item.id)}
                                    >
                                        <Text style={styles.removeText}>
                                            Remove
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.addressSection}>
                    <View style={styles.addressSectionHeader}>
                        <View style={styles.addressTitleRow}>
                            <MaterialCommunityIcons
                                name="map-marker"
                                size={20}
                                color={PRIMARY}
                            />
                            <Text style={styles.sectionTitle}>
                                Delivery Address
                            </Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.changeText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.addressCard}>
                        <Text style={styles.addressLabel}>Home</Text>
                        <Text style={styles.addressText}>
                            {restaurant?.address || "No address available"}
                        </Text>
                    </View>
                </View>

                <View style={styles.billSection}>
                    <Text style={styles.billSectionTitle}>Bill Summary</Text>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Item Total</Text>
                        <Text style={styles.billValue}>
                            ₹{cart.totalAmount}
                        </Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Delivery Fee</Text>
                        <Text style={[styles.billValue, styles.freeText]}>
                            FREE
                        </Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>
                            Taxes & Charges
                        </Text>
                        <Text style={styles.billValue}>
                            ₹{taxesAndCharges}
                        </Text>
                    </View>
                    <View style={styles.billDivider} />
                    <View style={styles.billGrandRow}>
                        <Text style={styles.grandTotalLabel}>
                            Grand Total
                        </Text>
                        <Text style={styles.grandTotalValue}>
                            ₹{grandTotal}
                        </Text>
                    </View>
                </View>

                <View style={styles.paymentSection}>
                    <View style={styles.paymentTitleRow}>
                        <MaterialCommunityIcons
                            name="wallet-outline"
                            size={20}
                            color={ON_SURFACE}
                        />
                        <Text style={styles.paymentSectionTitle}>
                            Payment Method
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            selectedPayment === "online" && styles.paymentOptionSelected,
                        ]}
                        onPress={() => setSelectedPayment("online")}
                    >
                        <View style={styles.radioOuter}>
                            {selectedPayment === "online" && (
                                <View style={styles.radioInner} />
                            )}
                        </View>
                        <MaterialCommunityIcons
                            name="credit-card-outline"
                            size={22}
                            color={ON_SURFACE}
                        />
                        <View style={styles.paymentOptionText}>
                            <Text style={styles.paymentOptionLabel}>
                                Online Payment
                            </Text>
                            <Text style={styles.paymentOptionHint}>
                                Razorpay
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            selectedPayment === "cod" && styles.paymentOptionSelected,
                        ]}
                        onPress={() => setSelectedPayment("cod")}
                    >
                        <View style={styles.radioOuter}>
                            {selectedPayment === "cod" && (
                                <View style={styles.radioInner} />
                            )}
                        </View>
                        <MaterialCommunityIcons
                            name="cash"
                            size={22}
                            color={ON_SURFACE}
                        />
                        <View style={styles.paymentOptionText}>
                            <Text style={styles.paymentOptionLabel}>
                                Cash on Delivery
                            </Text>
                            <Text style={styles.paymentOptionHint}>
                                Pay when your food arrives
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.placeOrderButton}
                    onPress={handlePlaceOrder}
                    activeOpacity={0.9}
                >
                    <Text style={styles.placeOrderText}>Place Order</Text>
                    <MaterialCommunityIcons
                        name="chevron-right"
                        size={24}
                        color="#FFF"
                    />
                </TouchableOpacity>
                <Text style={styles.totalPayable}>
                    Total Payable • ₹{grandTotal}
                </Text>
            </View>
        </SafeAreaView>
    );
};

export default CheckoutScreen;

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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: `${OUTLINE_VARIANT}33`,
        backgroundColor: `${BG}E6`,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: ON_SURFACE,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },

    section: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    sectionHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: ON_SURFACE,
    },
    itemCountLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: PRIMARY,
    },

    cartItemCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: `${OUTLINE_VARIANT}4D`,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    cartItemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: SURFACE_CONTAINER_HIGH,
    },
    cartItemContent: {
        flex: 1,
    },
    cartItemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    cartItemName: {
        fontSize: 16,
        fontWeight: "600",
        color: ON_SURFACE,
        flex: 1,
        marginRight: 8,
    },
    cartItemPrice: {
        fontSize: 16,
        fontWeight: "600",
        color: PRIMARY,
    },
    cartItemQuantity: {
        fontSize: 13,
        color: ON_SURFACE_VARIANT,
        marginTop: 2,
    },
    cartItemActions: {
        flexDirection: "row",
        gap: 8,
        marginTop: 8,
    },
    editButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: `${PRIMARY}33`,
        backgroundColor: `${PRIMARY}0D`,
    },
    editText: {
        fontSize: 13,
        fontWeight: "600",
        color: PRIMARY,
    },
    removeText: {
        fontSize: 13,
        fontWeight: "600",
        color: ON_SURFACE_VARIANT,
        paddingVertical: 8,
        paddingHorizontal: 8,
    },

    addressSection: {
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 12,
        padding: 16,
        backgroundColor: `${SURFACE_CONTAINER_HIGH}66`,
        borderWidth: 1,
        borderColor: `${OUTLINE_VARIANT}33`,
    },
    addressSectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    addressTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    changeText: {
        fontSize: 13,
        fontWeight: "600",
        color: PRIMARY,
    },
    addressCard: {
        backgroundColor: SURFACE_LOWEST,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: `${OUTLINE_VARIANT}1A`,
    },
    addressLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: ON_SURFACE,
    },
    addressText: {
        fontSize: 13,
        color: ON_SURFACE_VARIANT,
        marginTop: 4,
    },

    billSection: {
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: `${OUTLINE_VARIANT}4D`,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    billSectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: ON_SURFACE,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: `${OUTLINE_VARIANT}33`,
        marginBottom: 12,
    },
    billRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
    },
    billLabel: {
        fontSize: 15,
        color: ON_SURFACE_VARIANT,
    },
    billValue: {
        fontSize: 15,
        fontWeight: "600",
        color: ON_SURFACE,
    },
    freeText: {
        color: SECONDARY,
        fontWeight: "700",
    },
    billDivider: {
        borderTopWidth: 1,
        borderTopColor: OUTLINE_VARIANT,
        borderStyle: "dashed",
        marginVertical: 12,
    },
    billGrandRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    grandTotalLabel: {
        fontSize: 20,
        fontWeight: "700",
        color: ON_SURFACE,
    },
    grandTotalValue: {
        fontSize: 20,
        fontWeight: "700",
        color: PRIMARY,
    },

    paymentSection: {
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: `${OUTLINE_VARIANT}4D`,
    },
    paymentTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    paymentSectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: ON_SURFACE,
    },
    paymentOption: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "transparent",
    },
    paymentOptionSelected: {
        backgroundColor: `${PRIMARY}0D`,
        borderColor: `${PRIMARY}33`,
    },
    paymentOptionText: {
        flex: 1,
    },
    paymentOptionLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE,
    },
    paymentOptionHint: {
        fontSize: 12,
        color: ON_SURFACE_VARIANT,
        marginTop: 2,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: `${PRIMARY}80`,
        alignItems: "center",
        justifyContent: "center",
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: PRIMARY,
    },

    footer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 24,
        backgroundColor: `${BG}D9`,
        borderTopWidth: 1,
        borderTopColor: `${OUTLINE_VARIANT}1A`,
    },
    placeOrderButton: {
        backgroundColor: PRIMARY,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 18,
        borderRadius: 12,
        gap: 4,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    placeOrderText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FFF",
    },
    totalPayable: {
        fontSize: 13,
        fontWeight: "600",
        color: PRIMARY,
        textAlign: "center",
        marginTop: 8,
    },

});
