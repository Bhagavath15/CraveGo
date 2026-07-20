import { useState, useEffect, useRef } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
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
import { useStripe } from "@stripe/stripe-react-native";

import { RootStackParamList } from "../types/types";
import { useCart } from "../context/CartContext";
import { placeOrder } from "../api/order";
import { getAddresses, Address } from "../api/address";
import Skeleton from "../components/Skeleton";
import { createPaymentIntent } from "../api/payment";
import { getAvailableCoupons } from "../api/coupon";
import { getPendingCoupon } from "../utils/bannerCouponStore";

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

    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const { restaurantId } = route.params;
    const cart = useCart();
    const [selectedPayment, setSelectedPayment] = useState("ONLINE");
    const [placing, setPlacing] = useState(false);
    const placingRef = useRef(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [addressesLoading, setAddressesLoading] = useState(true);

    useEffect(() => {
        const loadAddresses = async () => {
            setAddressesLoading(true);
            try {
                const res = await getAddresses();
                if (res.success && res.addresses?.length) {
                    setAddresses(res.addresses);
                    const def = res.addresses.find(a => a.isDefault) || res.addresses[0];
                    setSelectedAddressId(def._id);
                }
            } catch { }
            setAddressesLoading(false);
        };
        loadAddresses();
    }, []);

    const selectedAddr = addresses.length > 0
        ? addresses.find(a => a._id === selectedAddressId) || addresses[0]
        : null;

    const deliveryFee = cart.deliveryFee ?? 0;
    const tax = cart.tax ?? 0;
    const totalBeforeDiscount = (cart.totalAmount ?? 0) + deliveryFee + tax;
    const grandTotal = cart.grandTotal ?? 0;

    const pendingPaymentRef = useRef<{ paymentIntentId: string | undefined; clientSecret: string | undefined } | null>(null);

    const [couponInput, setCouponInput] = useState("");
    const [couponError, setCouponError] = useState("");
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
    const [showCoupons, setShowCoupons] = useState(false);
    const autoApplyRef = useRef(false);

    useEffect(() => {
        if (!cart.subtotal || !restaurantId) return;
        const load = async () => {
            try {
                const res = await getAvailableCoupons(restaurantId, cart.subtotal);
                if (res.success && res.data) setAvailableCoupons(res.data);
            } catch { }
        };
        load();
    }, [cart.subtotal, restaurantId]);

    useEffect(() => {
        if (autoApplyRef.current || !cart.subtotal || cart.couponCode) return;
        const code = getPendingCoupon();
        if (!code) return;
        autoApplyRef.current = true;
        (async () => {
            try {
                await cart.applyCoupon(code);
            } catch (e: any) {
                setCouponError(e.message || "Coupon not applicable");
            }
        })();
    }, [cart.subtotal, cart.couponCode]);

    const presentSheet = async (secret: string) => {
        const { error: initError } = await initPaymentSheet({
            merchantDisplayName: "CraveGo",
            paymentIntentClientSecret: secret,
            defaultBillingDetails: { address: { country: "IN" } },
        });
        if (initError) return initError;
        return (await presentPaymentSheet()).error;
    };

    const handleOnlinePayment = async () => {
        const cached = pendingPaymentRef.current;
        if (cached?.clientSecret && cached?.paymentIntentId) {
            const error = await presentSheet(cached.clientSecret);
            if (!error) return cached.paymentIntentId;
        }

        const response = await createPaymentIntent();
        if (!response.success) {
            Alert.alert("Payment Error", response.message || "Unable to start payment");
            return null;
        }

        const { clientSecret, paymentIntentId } = response;
        if (!clientSecret) {
            Alert.alert("Payment Error", "Missing payment details from server.");
            return null;
        }

        pendingPaymentRef.current = { paymentIntentId, clientSecret };

        const error = await presentSheet(clientSecret);
        if (error) {
            pendingPaymentRef.current = null;
            Alert.alert("Payment Error", error.message);
            return null;
        }

        pendingPaymentRef.current = null;
        return paymentIntentId;
    };

    const handlePlaceOrder = async () => {
        if (placing || placingRef.current) return;
        if (!selectedAddr) {
            Alert.alert("Address Required", "Please add a delivery address before placing the order.");
            return;
        }
        if (!selectedAddr.fullName?.trim()) {
            Alert.alert("Invalid Address", "The selected address is missing a recipient name. Please update it.");
            return;
        }
        if (!/^\d{6}$/.test(selectedAddr.pincode)) {
            Alert.alert("Invalid Address", "The selected address has an invalid pincode. Please update it.");
            return;
        }
        if (!/^\d{10}$/.test(selectedAddr.mobileNumber?.replace(/\D/g, ''))) {
            Alert.alert("Invalid Address", "The selected address has an invalid mobile number. Please update it.");
            return;
        }
        placingRef.current = true;
        setPlacing(true);
        let paymentIntentId: string | null | undefined;
        try {
            if (selectedPayment === "ONLINE") {
                paymentIntentId = await handleOnlinePayment();
                if (!paymentIntentId) {
                    return;
                }
            }

            const items = cart.cartItems.map((i) => ({
                menuItemId: i.id,
                quantity: i.quantity,
            }));
            const orderPayload: any = {
                restaurantId,
                items,
                addressId: selectedAddr._id,
                paymentMethod: selectedPayment,
            };
            if (paymentIntentId) {
                orderPayload.paymentIntentId = paymentIntentId;
            }
            const res = await placeOrder(orderPayload);
            if (res.success && res.order) {
                const count = cart.cartItems.reduce((s, i) => s + i.quantity, 0);
                const snap = res.order.restaurantSnapshot || {};
                const orderItems = (res.order.items || []).map(i => ({
                    id: i.menuItemId,
                    name: i.name,
                    quantity: i.quantity,
                    price: i.price,
                    totalPrice: i.totalPrice,
                }));
                const totalPrice = res.order.grandTotal ?? 0;
                console.log(`CheckoutScreen.tsx 213 totalPrice---->`,totalPrice)
                try {
                    await cart.clearCart();
                } catch (e) {
                }
                navigation.navigate("OrderSuccess", {
                    itemCount: count,
                    orderId: res.order._id,
                    orderNumber: res.order.orderNumber,
                    restaurantName: snap.name || res.order.restaurantName || "Restaurant",
                    totalPrice,
                    items: orderItems,
                });
            } else {
                const errMsg = res.message || JSON.stringify(res);
                Alert.alert("Order Failed", errMsg);
            }
        } catch (err) {
            if (selectedPayment === "ONLINE") {
                Alert.alert("Payment Failed", "Unable to process your payment.");
            } else {
                Alert.alert("Error", `Something went wrong: ${err instanceof Error ? err.message : "Please try again"}`);
            }
        } finally {
            setPlacing(false);
            placingRef.current = false;
        }
    };

    const handleRemove = (itemId: string) => {
        cart.removeItem(itemId);
    };

    const handleClearCart = () => {
        Alert.alert("Clear Cart", "Remove all items from your cart?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Clear",
                style: "destructive",
                onPress: async () => {
                    await cart.clearCart();
                    navigation.goBack();
                },
            },
        ]);
    };

    const handleApplyCoupon = async (code?: string) => {
        const finalCode = (code || couponInput).trim().toUpperCase();
        if (!finalCode) { setCouponError("Enter a coupon code"); return; }
        setApplyingCoupon(true);
        setCouponError("");
        try {
            await cart.applyCoupon(finalCode);
            setCouponInput("");
            setCouponError("");
        } catch (e: any) {
            setCouponError(e.message || "Invalid coupon");
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        cart.removeCoupon();
        setCouponError("");
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

                    {cart.cartItems.map((item) => (
                        <View
                            key={item.id}
                            style={styles.cartItemCard}
                        >
                            <Image
                                source={typeof item.image === "string" ? { uri: item.image } : item.image}
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
                                        ₹{item.price * item.quantity}
                                    </Text>
                                </View>
                                <Text style={styles.cartItemQuantity}>
                                    Quantity: {item.quantity}
                                </Text>
                                <View style={styles.cartItemActions}>
                                    <TouchableOpacity
                                        style={styles.editButton}
                                        onPress={() => {
                                            navigation.navigate(
                                                "RestaurantDetail",
                                                { restaurantId: cart.restaurantId || restaurantId, editItemId: item.id }
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
                        <TouchableOpacity
                            onPress={() => navigation.navigate("AddressBook")}
                        >
                            <Text style={styles.changeText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.addressCard}>
                        {addressesLoading ? (
                            <View style={{ gap: 8 }}>
                                <Skeleton width="30%" height={14} borderRadius={6} />
                                <Skeleton width="100%" height={14} borderRadius={6} />
                                <Skeleton width="60%" height={14} borderRadius={6} />
                            </View>
                        ) : !selectedAddr ? (
                            <Text style={styles.addressText}>No address available</Text>
                        ) : (
                            <>
                                <Text style={styles.addressLabel}>{selectedAddr.addressType}</Text>
                                <Text style={styles.addressText}>
                                    {selectedAddr.houseNumber}{selectedAddr.apartment ? `, ${selectedAddr.apartment}` : ""}, {selectedAddr.area}, {selectedAddr.city} — {selectedAddr.pincode}
                                </Text>
                            </>
                        )}
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
                        <Text style={[styles.billValue, deliveryFee === 0 && styles.freeText]}>
                            {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                        </Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>
                            Tax
                        </Text>
                        <Text style={styles.billValue}>
                            ₹{tax}
                        </Text>
                    </View>
                    <View style={styles.billDivider} />
                    <View style={styles.billRow}>
                        <Text style={[styles.billLabel, { fontWeight: "600" }]}>Total</Text>
                        <Text style={[styles.billValue, { fontWeight: "700" }]}>₹{totalBeforeDiscount}</Text>
                    </View>
                    <View style={[styles.billDivider, { marginVertical: 8 }]} />
                    {cart.discount > 0 && (
                        <View style={[styles.billRow, { paddingBottom: 8 }]}>
                            <Text style={styles.billLabel}>
                                Discount {cart.couponCode ? `(${cart.couponCode})` : ""}
                            </Text>
                            <Text style={[styles.billValue, { color: SECONDARY }]}>
                                -₹{cart.discount}
                            </Text>
                        </View>
                    )}
                    <View style={styles.billGrandRow}>
                        <Text style={styles.grandTotalLabel}>
                            Grand Total
                        </Text>
                        <Text style={styles.grandTotalValue}>
                            ₹{grandTotal}
                        </Text>
                    </View>
                </View>

                <View style={styles.couponSection}>
                    <View style={styles.couponSectionHeader}>
                        <MaterialCommunityIcons name="brightness-percent" size={20} color={ON_SURFACE} />
                        <Text style={styles.couponSectionTitle}>Coupon</Text>
                    </View>

                    {cart.couponCode ? (
                        <View style={styles.appliedCouponCard}>
                            <View style={styles.appliedCouponInfo}>
                                <MaterialCommunityIcons name="check-circle" size={20} color={SECONDARY} />
                                <View style={styles.appliedCouponText}>
                                    <Text style={styles.appliedCouponCode}>{cart.couponCode}</Text>
                                    {cart.couponTitle ? (
                                        <Text style={styles.appliedCouponTitle}>{cart.couponTitle}</Text>
                                    ) : null}
                                </View>
                            </View>
                            <TouchableOpacity onPress={handleRemoveCoupon} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <MaterialCommunityIcons name="close-circle" size={22} color={ON_SURFACE_VARIANT} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <View style={styles.couponInputRow}>
                                <TextInput
                                    style={styles.couponInput}
                                    placeholder="Enter coupon code"
                                    placeholderTextColor={ON_SURFACE_VARIANT}
                                    value={couponInput}
                                    onChangeText={(t) => { setCouponInput(t.toUpperCase()); setCouponError(""); }}
                                    autoCapitalize="characters"
                                />
                                <TouchableOpacity
                                    style={[styles.applyBtn, applyingCoupon && { opacity: 0.6 }]}
                                    onPress={() => handleApplyCoupon()}
                                    disabled={applyingCoupon}
                                >
                                    <Text style={styles.applyBtnText}>{applyingCoupon ? "..." : "Apply"}</Text>
                                </TouchableOpacity>
                            </View>
                            {couponError ? <Text style={styles.couponErrorText}>{couponError}</Text> : null}

                            {availableCoupons.length > 0 && (
                                <>
                                    <TouchableOpacity
                                        style={styles.availableCouponsToggle}
                                        onPress={() => setShowCoupons(!showCoupons)}
                                    >
                                        <Text style={styles.availableCouponsLabel}>
                                            {availableCoupons.length} coupon{availableCoupons.length > 1 ? "s" : ""} available
                                        </Text>
                                        <MaterialCommunityIcons
                                            name={showCoupons ? "chevron-up" : "chevron-down"}
                                            size={18}
                                            color={PRIMARY}
                                        />
                                    </TouchableOpacity>
                                    {showCoupons && (
                                        <View style={styles.availableCouponsList}>
                                            {availableCoupons.map((c: any) => (
                                                <TouchableOpacity
                                                    key={c._id}
                                                    style={styles.availableCouponItem}
                                                    onPress={() => handleApplyCoupon(c.code)}
                                                >
                                                    <View style={styles.availableCouponHeader}>
                                                        <MaterialCommunityIcons name="brightness-percent" size={16} color={PRIMARY} />
                                                        <Text style={styles.availableCouponCode}>{c.code}</Text>
                                                    </View>
                                                    <Text style={styles.availableCouponTitle}>
                                                        {c.title || c.description || `${c.discountType === "FLAT" ? "₹" : ""}${c.discountValue}${c.discountType === "PERCENTAGE" ? "%" : ""} off`}
                                                    </Text>
                                                    {c.minimumOrderAmount > 0 && (
                                                        <Text style={styles.availableCouponMin}>Min. order ₹{c.minimumOrderAmount}</Text>
                                                    )}
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </>
                            )}
                        </>
                    )}
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
                            selectedPayment === "ONLINE" && styles.paymentOptionSelected,
                        ]}
                        onPress={() => setSelectedPayment("ONLINE")}
                    >
                        <View style={styles.radioOuter}>
                            {selectedPayment === "ONLINE" && (
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
                            selectedPayment === "COD" && styles.paymentOptionSelected,
                        ]}
                        onPress={() => setSelectedPayment("COD")}
                    >
                        <View style={styles.radioOuter}>
                            {selectedPayment === "COD" && (
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
                <View style={styles.footerRow}>
                    <TouchableOpacity
                        style={[styles.placeOrderButton, placing && { opacity: 0.7 }]}
                        onPress={handlePlaceOrder}
                        disabled={placing}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.placeOrderText}>
                            {placing ? "Placing Order..." : "Place Order"}
                        </Text>
                        {!placing && (
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={24}
                                color="#FFF"
                            />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.clearCartBtn}
                        onPress={handleClearCart}
                        disabled={placing}
                    >
                        <MaterialCommunityIcons
                            name="delete-outline"
                            size={22}
                            color={ON_SURFACE_VARIANT}
                        />
                    </TouchableOpacity>
                </View>
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
        fontSize: 18,
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
        fontSize: 16,
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
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE,
        flex: 1,
        marginRight: 8,
    },
    cartItemPrice: {
        fontSize: 14,
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
        fontSize: 16,
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
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
    },
    billValue: {
        fontSize: 14,
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
        fontSize: 16,
        fontWeight: "700",
        color: ON_SURFACE,
    },
    grandTotalValue: {
        fontSize: 16,
        fontWeight: "700",
        color: PRIMARY,
    },

    couponSection: {
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: `${OUTLINE_VARIANT}4D`,
    },
    couponSectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    couponSectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: ON_SURFACE,
    },
    couponInputRow: {
        flexDirection: "row",
        gap: 8,
    },
    couponInput: {
        flex: 1,
        height: 44,
        borderWidth: 1,
        borderColor: OUTLINE_VARIANT,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE,
        backgroundColor: SURFACE_LOWEST,
        letterSpacing: 1,
    },
    applyBtn: {
        height: 44,
        paddingHorizontal: 20,
        backgroundColor: PRIMARY,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    applyBtnText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFF",
    },
    couponErrorText: {
        fontSize: 12,
        color: "#D32F2F",
        marginTop: 6,
    },
    appliedCouponCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: `${SECONDARY}0D`,
        borderWidth: 1,
        borderColor: `${SECONDARY}33`,
        borderRadius: 8,
        padding: 12,
    },
    appliedCouponInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    appliedCouponText: {
        flex: 1,
    },
    appliedCouponCode: {
        fontSize: 14,
        fontWeight: "700",
        color: SECONDARY,
        letterSpacing: 1,
    },
    appliedCouponTitle: {
        fontSize: 12,
        color: ON_SURFACE_VARIANT,
        marginTop: 2,
    },
    availableCouponsToggle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        marginTop: 12,
        paddingVertical: 6,
    },
    availableCouponsLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: PRIMARY,
    },
    availableCouponsList: {
        marginTop: 8,
        gap: 8,
    },
    availableCouponItem: {
        borderWidth: 1,
        borderColor: `${PRIMARY}33`,
        borderRadius: 8,
        padding: 12,
        backgroundColor: `${PRIMARY}05`,
    },
    availableCouponHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    availableCouponCode: {
        fontSize: 13,
        fontWeight: "700",
        color: ON_SURFACE,
        letterSpacing: 0.5,
    },
    availableCouponTitle: {
        fontSize: 12,
        color: ON_SURFACE_VARIANT,
        marginTop: 4,
    },
    availableCouponMin: {
        fontSize: 11,
        color: ON_SURFACE_VARIANT,
        marginTop: 2,
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
        fontSize: 16,
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
    footerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    clearCartBtn: {
        flex: 1,
        height: 54,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: OUTLINE_VARIANT,
        justifyContent: "center",
        alignItems: "center",
    },
    placeOrderButton: {
        flex: 9,
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
        fontSize: 16,
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
