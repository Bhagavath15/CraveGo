import { useState, useEffect, useRef } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
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
import Toast from "react-native-toast-message";
import { createPaymentIntent } from "../api/payment";
import { getAvailableCoupons } from "../api/coupon";
import { getPendingCoupon } from "../utils/bannerCouponStore";
import { colors, spacing, typography, radius, shadows } from "../theme";

type RouteProps = RouteProp<RootStackParamList, "CartCheckout">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SECTION_HEADER_ICON_SIZE = 20;

const round2 = (n: number) => Math.round(n * 100) / 100;

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
    const [refreshing, setRefreshing] = useState(false);

    const loadAddresses = async () => {
        try {
            const res = await getAddresses();
            if (res.success && res.addresses?.length) {
                setAddresses(res.addresses);
                const def = res.addresses.find(a => a.isDefault) || res.addresses[0];
                setSelectedAddressId(def._id);
            }
        } catch { }
    };

    useEffect(() => {
        setAddressesLoading(true);
        loadAddresses().finally(() => setAddressesLoading(false));
    }, []);

    const selectedAddr = addresses.length > 0
        ? addresses.find(a => a._id === selectedAddressId) || addresses[0]
        : null;

    const deliveryFee = cart.deliveryFee ?? 0;
    const tax = cart.tax ?? 0;
    const totalBeforeDiscount = round2((cart.totalAmount ?? 0) + deliveryFee + tax);
    const grandTotal = cart.grandTotal ?? 0;
    const savings = cart.discount > 0 ? cart.discount : 0;

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
        try {
            const { error: presentError } = await presentPaymentSheet();
            return presentError;
        } catch (e: any) {
            return e;
        }
    };

    const handleOnlinePayment = async () => {
        const cached = pendingPaymentRef.current;
        if (cached?.clientSecret && cached?.paymentIntentId) {
            const error = await presentSheet(cached.clientSecret);
            if (!error) return cached.paymentIntentId;
        }

        const response = await createPaymentIntent();
        if (!response.success) {
            Toast.show({ text1: response.message || "Unable to start payment", type: "error" });
            return null;
        }

        const { clientSecret, paymentIntentId } = response;
        if (!clientSecret) {
            Toast.show({ text1: "Missing payment details from server.", type: "error" });
            return null;
        }

        pendingPaymentRef.current = { paymentIntentId, clientSecret };

        const error = await presentSheet(clientSecret);
        if (error) {
            pendingPaymentRef.current = null;
            Toast.show({ text1: error.message || "Unable to process your payment.", type: "error" });
            return null;
        }

        pendingPaymentRef.current = null;
        return paymentIntentId;
    };

    const handlePlaceOrder = async () => {
        if (placing || placingRef.current) return;
        if (!selectedAddr) {
            Toast.show({ text1: "Please add a delivery address before placing the order.", type: "error" });
            return;
        }
        if (!selectedAddr.fullName?.trim()) {
            Toast.show({ text1: "The selected address is missing a recipient name. Please update it.", type: "error" });
            return;
        }
        if (!/^\d{6}$/.test(selectedAddr.pincode)) {
            Toast.show({ text1: "The selected address has an invalid pincode. Please update it.", type: "error" });
            return;
        }
        if (!/^\d{10}$/.test(selectedAddr.mobileNumber?.replace(/\D/g, ''))) {
            Toast.show({ text1: "The selected address has an invalid mobile number. Please update it.", type: "error" });
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
                const errMsg = res.message || "Failed to place order";
                Toast.show({ text1: errMsg, type: "error" });
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
            Toast.show({ text1: msg, type: "error" });
        } finally {
            setPlacing(false);
            placingRef.current = false;
        }
    };

    const handleRemove = (itemId: string) => {
        cart.removeItem(itemId);
    };

    const handleDecrementFromCart = (itemId: string) => {
        cart.decrementItem(itemId);
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

    if (cart.cartItems.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <View style={styles.headerBackBtn}>
                            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.textPrimary} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Your Cart</Text>
                    <View style={styles.headerBackBtn} />
                </View>
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconWrap}>
                        <MaterialCommunityIcons name="cart-off" size={56} color={colors.white} />
                    </View>
                    <Text style={styles.emptyTitle}>Your cart is empty</Text>
                    <Text style={styles.emptySubtitle}>Looks like you haven't added anything yet.</Text>
                    <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.emptyButtonText}>Browse Restaurants</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <View style={styles.headerBackBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={22} color={colors.textPrimary} />
                    </View>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Your Cart</Text>
                    <Text style={styles.headerSubtitle}>{cart.itemCount} Item{cart.itemCount !== 1 ? "s" : ""}</Text>
                </View>
                <TouchableOpacity onPress={handleClearCart}>
                    <View style={styles.headerBackBtn}>
                        <MaterialCommunityIcons name="delete-outline" size={22} color={colors.textSecondary} />
                    </View>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadAddresses(); setRefreshing(false); }} tintColor={colors.primary} />}
                >
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={styles.sectionHeaderLeft}>
                                <MaterialCommunityIcons name="shopping-outline" size={SECTION_HEADER_ICON_SIZE} color={colors.textPrimary} />
                                <Text style={styles.sectionTitle}>Order Summary</Text>
                            </View>
                        </View>

                        {cart.cartItems.map((item) => {
                            const itemTotal = item.totalPrice || item.price * item.quantity;
                            const unitPrice = item.price;
                            return (
                                <View key={item.id} style={styles.cartItemCard}>
                                    <Image
                                        source={typeof item.image === "string" ? { uri: item.image } : item.image}
                                        style={styles.cartItemImage}
                                    />
                                    <View style={styles.cartItemBody}>
                                        <View style={styles.cartItemTop}>
                                            <View style={styles.cartItemNameRow}>
                                                {item.isVeg && <View style={styles.vegDot} />}
                                                <Text style={styles.cartItemName}>{item.name}</Text>
                                            </View>
                                            <Text style={styles.cartItemTotalPrice}>₹{itemTotal}</Text>
                                        </View>

                                        {item.customization && item.customization.length > 0 && (
                                            <Text style={styles.cartItemCustom} numberOfLines={2}>
                                                {item.customization.map(c => c.name).join(", ")}
                                            </Text>
                                        )}

                                        <View style={styles.cartItemUnitRow}>
                                            <Text style={styles.cartItemUnitPrice}>₹{unitPrice} each</Text>
                                        </View>

                                        <View style={styles.cartItemActionsRow}>
                                            <View style={styles.qtyStepper}>
                                                <TouchableOpacity
                                                    style={styles.qtyBtn}
                                                    onPress={() => handleDecrementFromCart(item.id)}
                                                >
                                                    <MaterialCommunityIcons name="minus" size={14} color={colors.primary} />
                                                </TouchableOpacity>
                                                <Text style={styles.qtyValue}>{item.quantity}</Text>
                                                <TouchableOpacity
                                                    style={styles.qtyBtn}
                                                    onPress={() => cart.addToCart(
                                                        { id: item.id, name: item.name, price: item.price, image: item.image, isVeg: item.isVeg, description: "", isBestseller: false, customizable: false, customizations: [] },
                                                        cart.restaurantId || restaurantId,
                                                        ""
                                                    )}
                                                >
                                                    <MaterialCommunityIcons name="plus" size={14} color={colors.primary} />
                                                </TouchableOpacity>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.removeBtn}
                                                onPress={() => handleRemove(item.id)}
                                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                            >
                                                <MaterialCommunityIcons name="delete-outline" size={18} color={colors.textMuted} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.addressSection}>
                        <View style={styles.addressSectionHeader}>
                            <View style={styles.addressTitleRow}>
                                <MaterialCommunityIcons name="map-marker-outline" size={SECTION_HEADER_ICON_SIZE} color={colors.textPrimary} />
                                <Text style={styles.sectionTitle}>Delivery Address</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate("AddressBook")}>
                                <View style={styles.changeBtn}>
                                    <Text style={styles.changeText}>Change</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={16} color={colors.primary} />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.addressCard}>
                            {addressesLoading ? (
                                <View style={{ gap: 8 }}>
                                    <Skeleton width="30%" height={12} borderRadius={6} />
                                    <Skeleton width="100%" height={12} borderRadius={6} />
                                    <Skeleton width="60%" height={12} borderRadius={6} />
                                </View>
                            ) : !selectedAddr ? (
                                <View style={styles.noAddressWrap}>
                                    <MaterialCommunityIcons name="map-marker-off-outline" size={32} color={colors.outlineVariant} />
                                    <Text style={styles.noAddressText}>No address available</Text>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.addressTypeRow}>
                                        <MaterialCommunityIcons
                                            name={selectedAddr.addressType === "Home" ? "home-outline" : selectedAddr.addressType === "Work" ? "briefcase-outline" : "map-marker-outline"}
                                            size={14}
                                            color={colors.primary}
                                        />
                                        <Text style={styles.addressLabel}>{selectedAddr.addressType || "Other"}</Text>
                                    </View>
                                    <Text style={styles.addressName}>{selectedAddr.fullName}</Text>
                                    <Text style={styles.addressText}>
                                        {selectedAddr.houseNumber}{selectedAddr.apartment ? `, ${selectedAddr.apartment}` : ""}, {selectedAddr.area}, {selectedAddr.city} — {selectedAddr.pincode}
                                    </Text>
                                    {selectedAddr.mobileNumber && (
                                        <Text style={styles.addressPhone}>{selectedAddr.mobileNumber}</Text>
                                    )}
                                </>
                            )}
                        </View>
                    </View>

                    <View style={styles.billSection}>
                        <View style={styles.billHeaderRow}>
                            <MaterialCommunityIcons name="file-document-outline" size={SECTION_HEADER_ICON_SIZE} color={colors.textPrimary} />
                            <Text style={styles.billSectionTitle}>Bill Summary</Text>
                        </View>
                        <View style={styles.billRows}>
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Item Total</Text>
                                <Text style={styles.billValue}>₹{cart.totalAmount}</Text>
                            </View>
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Delivery Fee</Text>
                                <Text style={[styles.billValue, deliveryFee === 0 && styles.freeText]}>
                                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                                </Text>
                            </View>
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Tax & Charges</Text>
                                <Text style={styles.billValue}>₹{tax}</Text>
                            </View>
                            {savings > 0 && (
                                <View style={styles.billRow}>
                                    <Text style={styles.billLabel}>
                                        Discount {cart.couponCode ? `(${cart.couponCode})` : ""}
                                    </Text>
                                    <Text style={[styles.billValue, styles.savingsText]}>-₹{savings}</Text>
                                </View>
                            )}
                            <View style={styles.billDivider} />
                            <View style={styles.billGrandRow}>
                                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                                <View style={styles.grandTotalRight}>
                                    {savings > 0 && (
                                        <Text style={styles.grandTotalOld}>₹{totalBeforeDiscount}</Text>
                                    )}
                                    <Text style={styles.grandTotalValue}>₹{grandTotal}</Text>
                                </View>
                            </View>
                        </View>
                        {savings > 0 && (
                            <View style={styles.savingsBanner}>
                                <MaterialCommunityIcons name="tag-check" size={14} color={colors.secondary} />
                                <Text style={styles.savingsBannerText}>You saved ₹{savings} on this order!</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.couponSection}>
                        <View style={styles.couponSectionHeader}>
                            <MaterialCommunityIcons name="brightness-percent" size={SECTION_HEADER_ICON_SIZE} color={colors.textPrimary} />
                            <Text style={styles.sectionTitle}>Coupon</Text>
                        </View>

                        {cart.couponCode ? (
                            <View style={styles.appliedCouponCard}>
                                <View style={styles.appliedCouponLeft}>
                                    <View style={styles.appliedCouponIconWrap}>
                                        <MaterialCommunityIcons name="check" size={16} color={colors.white} />
                                    </View>
                                    <View style={styles.appliedCouponText}>
                                        <Text style={styles.appliedCouponCode}>{cart.couponCode}</Text>
                                        {cart.couponTitle && (
                                            <Text style={styles.appliedCouponTitle}>{cart.couponTitle}</Text>
                                        )}
                                    </View>
                                </View>
                                <TouchableOpacity onPress={handleRemoveCoupon} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                    <MaterialCommunityIcons name="close-circle" size={22} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <View style={styles.couponInputRow}>
                                    <View style={styles.couponInputWrap}>
                                        <MaterialCommunityIcons name="brightness-percent" size={16} color={colors.textMuted} />
                                        <TextInput
                                            style={styles.couponInput}
                                            placeholder="Enter coupon code"
                                            placeholderTextColor={colors.textMuted}
                                            value={couponInput}
                                            onChangeText={(t) => { setCouponInput(t.toUpperCase()); setCouponError(""); }}
                                            autoCapitalize="characters"
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.applyBtn, applyingCoupon && { opacity: 0.6 }]}
                                        onPress={() => handleApplyCoupon()}
                                        disabled={applyingCoupon}
                                    >
                                        <Text style={styles.applyBtnText}>{applyingCoupon ? "..." : "Apply"}</Text>
                                    </TouchableOpacity>
                                </View>
                                {couponError ? (
                                    <View style={styles.couponErrorRow}>
                                        <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.error} />
                                        <Text style={styles.couponErrorText}>{couponError}</Text>
                                    </View>
                                ) : null}

                                {availableCoupons.length > 0 && (
                                    <>
                                        <TouchableOpacity
                                            style={styles.availableCouponsToggle}
                                            onPress={() => setShowCoupons(!showCoupons)}
                                        >
                                            <View style={styles.availableCouponsToggleLeft}>
                                                <MaterialCommunityIcons name="tag-outline" size={16} color={colors.primary} />
                                                <Text style={styles.availableCouponsLabel}>
                                                    {availableCoupons.length} coupon{availableCoupons.length > 1 ? "s" : ""} available
                                                </Text>
                                            </View>
                                            <MaterialCommunityIcons
                                                name={showCoupons ? "chevron-up" : "chevron-down"}
                                                size={18}
                                                color={colors.textSecondary}
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
                                                            <View style={styles.couponBadge}>
                                                                <MaterialCommunityIcons name="brightness-percent" size={14} color={colors.primary} />
                                                            </View>
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
                            <MaterialCommunityIcons name="wallet-outline" size={SECTION_HEADER_ICON_SIZE} color={colors.textPrimary} />
                            <Text style={styles.sectionTitle}>Payment Method</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.paymentOption, selectedPayment === "ONLINE" && styles.paymentOptionSelected]}
                            onPress={() => setSelectedPayment("ONLINE")}
                        >
                            <View style={styles.radioOuter}>
                                {selectedPayment === "ONLINE" && <View style={styles.radioInner} />}
                            </View>
                            <View style={styles.paymentIconWrap}>
                                <MaterialCommunityIcons name="credit-card-outline" size={20} color={selectedPayment === "ONLINE" ? colors.primary : colors.textSecondary} />
                            </View>
                            <View style={styles.paymentInfo}>
                                <Text style={[styles.paymentOptionLabel, selectedPayment === "ONLINE" && { color: colors.textPrimary }]}>Online Payment</Text>
                                <Text style={styles.paymentOptionHint}>Pay via Razorpay</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.paymentOption, selectedPayment === "COD" && styles.paymentOptionSelected]}
                            onPress={() => setSelectedPayment("COD")}
                        >
                            <View style={styles.radioOuter}>
                                {selectedPayment === "COD" && <View style={styles.radioInner} />}
                            </View>
                            <View style={styles.paymentIconWrap}>
                                <MaterialCommunityIcons name="cash" size={20} color={selectedPayment === "COD" ? colors.primary : colors.textSecondary} />
                            </View>
                            <View style={styles.paymentInfo}>
                                <Text style={[styles.paymentOptionLabel, selectedPayment === "COD" && { color: colors.textPrimary }]}>Cash on Delivery</Text>
                                <Text style={styles.paymentOptionHint}>Pay when your food arrives</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <View style={styles.footerTotals}>
                    <Text style={styles.footerTotalLabel}>Total Payable</Text>
                    <Text style={styles.footerTotalValue}>₹{grandTotal}</Text>
                </View>
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
                        <MaterialCommunityIcons name="arrow-right" size={20} color={colors.white} />
                    )}
                    {placing && (
                        <MaterialCommunityIcons name="loading" size={20} color={colors.white} />
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        backgroundColor: colors.background + "E6",
    },
    headerBackBtn: {
        width: 36,
        height: 36,
        borderRadius: radius.full,
        backgroundColor: colors.surfaceContainer,
        justifyContent: "center",
        alignItems: "center",
    },
    headerCenter: {
        alignItems: "center",
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    headerSubtitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.textSecondary,
        marginTop: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.lg,
    },

    section: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
    },
    sectionHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.md,
    },
    sectionHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },

    cartItemCard: {
        flexDirection: "row",
        gap: 14,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.outlineVariant + "4D",
        ...shadows.card,
    },
    cartItemImage: {
        width: 84,
        height: 84,
        borderRadius: radius.sm,
        backgroundColor: colors.surfaceContainerHigh,
    },
    cartItemBody: {
        flex: 1,
    },
    cartItemTop: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    cartItemNameRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 6,
        flex: 1,
        marginRight: spacing.sm,
    },
    vegDot: {
        width: 8,
        height: 8,
        borderRadius: 2,
        backgroundColor: colors.veg,
        marginTop: 4,
    },
    cartItemName: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        flexShrink: 1,
    },
    cartItemCustom: {
        fontSize: typography.fontSize.sm,
        color: colors.textMuted,
        marginTop: 4,
        lineHeight: typography.lineHeight.md,
    },
    cartItemUnitRow: {
        marginTop: 6,
    },
    cartItemUnitPrice: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    cartItemActionsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
    },
    qtyStepper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surfaceContainer,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.outlineVariant + "80",
    },
    qtyBtn: {
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    qtyValue: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        minWidth: 24,
        textAlign: "center",
    },
    removeBtn: {
        width: 36,
        height: 36,
        borderRadius: radius.full,
        backgroundColor: colors.surfaceContainer,
        justifyContent: "center",
        alignItems: "center",
    },
    cartItemTotalPrice: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        flexShrink: 0,
    },

    addressSection: {
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        borderRadius: radius.md,
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.outlineVariant + "4D",
        ...shadows.card,
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
        gap: spacing.sm,
    },
    changeBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },
    changeText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
    },
    addressCard: {
        backgroundColor: colors.background,
        padding: spacing.md,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.outlineVariant + "33",
    },
    addressTypeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: spacing.xs,
    },
    addressLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
        textTransform: "capitalize",
    },
    addressName: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: 2,
    },
    addressText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.md,
    },
    addressPhone: {
        fontSize: typography.fontSize.sm,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    noAddressWrap: {
        alignItems: "center",
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    noAddressText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },

    billSection: {
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.outlineVariant + "4D",
        ...shadows.card,
    },
    billHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.outlineVariant + "33",
        marginBottom: 12,
    },
    billSectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    billRows: {
        gap: 10,
    },
    billRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    billLabel: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
    },
    billValue: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    freeText: {
        color: colors.secondary,
        fontWeight: typography.fontWeight.bold,
    },
    savingsText: {
        color: colors.secondary,
    },
    billDivider: {
        borderTopWidth: 1,
        borderTopColor: colors.outlineVariant,
        borderStyle: "dashed",
        marginVertical: 8,
    },
    billGrandRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 4,
    },
    grandTotalLabel: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    grandTotalRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    grandTotalOld: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
        color: colors.textMuted,
        textDecorationLine: "line-through",
    },
    grandTotalValue: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
    },
    savingsBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        marginTop: 12,
        paddingVertical: 10,
        backgroundColor: colors.secondary + "0D",
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.secondary + "26",
    },
    savingsBannerText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.secondary,
    },

    couponSection: {
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.outlineVariant + "4D",
        ...shadows.card,
    },
    couponSectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        marginBottom: 12,
    },
    couponInputRow: {
        flexDirection: "row",
        gap: spacing.sm,
    },
    couponInputWrap: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        height: 46,
        borderWidth: 1,
        borderColor: colors.outlineVariant,
        borderRadius: radius.sm,
        paddingHorizontal: 12,
        backgroundColor: colors.surface,
    },
    couponInput: {
        flex: 1,
        height: "100%",
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        letterSpacing: typography.letterSpacing.xl,
        padding: 0,
    },
    applyBtn: {
        height: 46,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.primary,
        borderRadius: radius.sm,
        justifyContent: "center",
        alignItems: "center",
    },
    applyBtnText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
    },
    couponErrorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        marginTop: spacing.sm,
    },
    couponErrorText: {
        fontSize: typography.fontSize.sm,
        color: colors.error,
    },
    appliedCouponCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.secondary + "08",
        borderWidth: 1,
        borderColor: colors.secondary + "26",
        borderRadius: radius.sm,
        padding: 12,
    },
    appliedCouponLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    appliedCouponIconWrap: {
        width: 28,
        height: 28,
        borderRadius: radius.full,
        backgroundColor: colors.secondary,
        justifyContent: "center",
        alignItems: "center",
    },
    appliedCouponText: {
        flex: 1,
    },
    appliedCouponCode: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.secondary,
        letterSpacing: typography.letterSpacing.xl,
    },
    appliedCouponTitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    availableCouponsToggle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 12,
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    availableCouponsToggleLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    availableCouponsLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
    },
    availableCouponsList: {
        marginTop: spacing.sm,
        gap: spacing.sm,
    },
    availableCouponItem: {
        borderWidth: 1,
        borderColor: colors.primary + "26",
        borderRadius: radius.sm,
        padding: 12,
        backgroundColor: colors.primary + "05",
    },
    availableCouponHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    couponBadge: {
        width: 24,
        height: 24,
        borderRadius: radius.full,
        backgroundColor: colors.primary + "15",
        justifyContent: "center",
        alignItems: "center",
    },
    availableCouponCode: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
        letterSpacing: typography.letterSpacing.wider,
    },
    availableCouponTitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    availableCouponMin: {
        fontSize: typography.fontSize.xs,
        color: colors.textMuted,
        marginTop: 2,
    },

    paymentSection: {
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        marginBottom: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.outlineVariant + "4D",
        ...shadows.card,
    },
    paymentTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    paymentOption: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: radius.sm,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.transparent,
    },
    paymentOptionSelected: {
        backgroundColor: colors.primary + "08",
        borderColor: colors.primary + "26",
    },
    paymentIconWrap: {
        width: 36,
        height: 36,
        borderRadius: radius.sm,
        backgroundColor: colors.surfaceContainer,
        justifyContent: "center",
        alignItems: "center",
    },
    paymentInfo: {
        flex: 1,
    },
    paymentOptionLabel: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
    },
    paymentOptionHint: {
        fontSize: typography.fontSize.sm,
        color: colors.textMuted,
        marginTop: 1,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.primary + "80",
        alignItems: "center",
        justifyContent: "center",
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },

    footer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        paddingBottom: spacing.lg,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.outlineVariant + "4D",
        gap: spacing.md,
        ...shadows.floating,
    },
    footerTotals: {
        flex: 1,
    },
    footerTotalLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    footerTotalValue: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
    },
    placeOrderButton: {
        flex: 1,
        backgroundColor: colors.primary,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
        borderRadius: radius.md,
        gap: spacing.sm,
        ...shadows.button,
    },
    placeOrderText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
    },

    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.xl,
    },
    emptyIconWrap: {
        width: 100,
        height: 100,
        borderRadius: radius.full,
        backgroundColor: colors.primary + "15",
        justifyContent: "center",
        alignItems: "center",
    },
    emptyTitle: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginTop: spacing.lg,
    },
    emptySubtitle: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        textAlign: "center",
        marginTop: spacing.sm,
        lineHeight: typography.lineHeight.md,
    },
    emptyButton: {
        marginTop: spacing.lg,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: 14,
        borderRadius: radius.full,
        ...shadows.button,
    },
    emptyButtonText: {
        color: colors.white,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
    },
});
