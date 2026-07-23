import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { getOrderById, Order, OrderItem } from "../api/order";
import Skeleton from "../components/Skeleton";
import { colors, spacing, typography, radius } from "../theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "Receipt">;

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${month} ${day}, ${h12}:${minutes} ${ampm}`;
};

const isVeg = (item: any) => item.isVeg === true || item.foodType === "veg";

const ReceiptScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getOrderById(orderId);
        if (res.success && res.order) {
          setOrder(res.order);
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  const snap = order?.restaurantSnapshot || {};
  const addrSnap = (order as any)?.addressSnapshot || {};
  const items: OrderItem[] = order?.items || [];
  const subtotal = order?.subtotal ?? 0;
  const deliveryFee = order?.deliveryFee ?? 0;
  const tax = order?.tax ?? 0;
  const discount = order?.discount ?? 0;
  const grandTotal = order?.grandTotal ?? 0;
  const paymentMethod = order?.paymentMethod || "COD";
  const paymentIntentId = (order as any)?.paymentIntentId;

  const pmtLabel: Record<string, string> = {
    COD: "Cash on Delivery",
    UPI: "UPI",
    CARD: "Credit / Debit Card",
    ONLINE: "Online Payment",
  };

  const restaurantAddr = "";
  const deliveryAddr = [addrSnap.houseNumber, addrSnap.apartment, addrSnap.area, addrSnap.city, addrSnap.pincode]
    .filter(Boolean)
    .join(", ");

  return (
    <View style={[s.wrapper, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Order Receipt</Text>
        <View style={s.headerBtn} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={s.loadingCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Skeleton width="35%" height={16} />
              <Skeleton width="40%" height={16} />
            </View>
            <Skeleton width="100%" height={80} style={{ marginTop: 16 }} borderRadius={16} />
            <Skeleton width="100%" height={120} style={{ marginTop: 16 }} borderRadius={16} />
            <Skeleton width="100%" height={100} style={{ marginTop: 16 }} borderRadius={16} />
            <Skeleton width="100%" height={60} style={{ marginTop: 16 }} borderRadius={16} />
          </View>
        ) : !order ? (
          <View style={s.emptyState}>
            <MaterialCommunityIcons name="receipt" size={64} color={colors.outlineVariant} />
            <Text style={s.emptyTitle}>Receipt Not Found</Text>
          </View>
        ) : (
          <View style={s.invoiceCard}>
            <View style={s.brandSection}>
              <View>
                <Image
                  source={require("../assets/images/app_icon.png")}
                  style={{ width: 48, height: 48 }}
                  resizeMode="contain"
                />
                <Text style={s.invoiceLabel}>Order Invoice</Text>
              </View>
              <View style={s.orderIdCol}>
                <Text style={s.orderIdLabel}>Order ID</Text>
                <Text style={s.orderIdValue}>{order.orderNumber}</Text>
                <Text style={s.orderDate}>{fmtDate(order.createdAt)}</Text>
              </View>
            </View>

            <View style={s.addrRow}>
              <View style={s.addrCol}>
                <Text style={s.addrTitle}>Ordered From</Text>
                <Text style={s.addrName}>{snap.name || order.restaurantName || "Restaurant"}</Text>
              </View>
              <View style={s.addrDivider} />
              <View style={s.addrCol}>
                <Text style={s.addrTitle}>Delivered To</Text>
                <Text style={s.addrName}>{addrSnap.fullName || "Customer"}</Text>
                {addrSnap.mobileNumber ? <Text style={s.addrPhone}>{addrSnap.mobileNumber}</Text> : null}
                {deliveryAddr ? <Text style={s.addrDetail}>{deliveryAddr}</Text> : null}
              </View>
            </View>

            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderCell, s.colItem]}>Item Name</Text>
              <Text style={[s.tableHeaderCell, s.colQty]}>Qty</Text>
              <Text style={[s.tableHeaderCell, s.colPrice]}>Price</Text>
            </View>

            <View style={s.tableBody}>
              {items.length === 0 ? (
                <Text style={s.emptyItems}>No items</Text>
              ) : (
                items.map((item, idx) => (
                  <View key={item.menuItemId || idx} style={s.tableRow}>
                    <View style={[s.colItem, { flexDirection: "row", alignItems: "center", gap: 6 }]}>
                      <View style={[s.vegDot, { backgroundColor: isVeg(item) ? colors.veg : colors.error }]} />
                      <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                    </View>
                    <Text style={[s.colQty, s.cellVal]}>{item.quantity}</Text>
                    <Text style={[s.colPrice, s.cellVal, s.priceVal]}>₹ {item.totalPrice?.toFixed(2) ?? (item.price * item.quantity).toFixed(2)}</Text>
                  </View>
                ))
              )}
            </View>

            <View style={s.divider} />

            <View style={s.breakdown}>
              <View style={s.breakRow}>
                <Text style={s.breakLabel}>Item Total</Text>
                <Text style={s.breakValue}>₹ {subtotal.toFixed(2)}</Text>
              </View>
              <View style={s.breakRow}>
                <Text style={s.breakLabel}>Delivery Charges</Text>
                <Text style={s.breakValue}>
                  {deliveryFee === 0 ? (
                    <Text style={s.freeText}>FREE</Text>
                  ) : (
                    `₹ ${deliveryFee.toFixed(2)}`
                  )}
                </Text>
              </View>
              <View style={s.breakRow}>
                <Text style={s.breakLabel}>Taxes (GST)</Text>
                <Text style={s.breakValue}>₹ {tax.toFixed(2)}</Text>
              </View>
              {discount > 0 && (
                <View style={[s.breakRow, s.discountRow]}>
                  <Text style={s.discountLabel}>Discount Applied</Text>
                  <Text style={s.discountValue}>- ₹ {discount.toFixed(2)}</Text>
                </View>
              )}
            </View>

            <View style={s.totalSection}>
              <View>
                <Text style={s.totalLabel}>Grand Total</Text>
                <Text style={s.pmtMethod}>{pmtLabel[paymentMethod] || paymentMethod}</Text>
                {paymentMethod !== "COD" && paymentIntentId ? (
                  <Text style={s.paymentIdText}>ID: {paymentIntentId}</Text>
                ) : null}
              </View>
              <Text style={s.totalValue}>₹ {grandTotal.toFixed(2)}</Text>
            </View>

            <View style={s.footer}>
              <Text style={s.disclaimer}>
                Disclaimer: This is an acknowledgement of delivery and not an actual invoice. Details mentioned above including the menu prices and taxes (as applicable) are as provided by the Restaurant to CraveGo.
              </Text>
              <View style={s.footerActions}>
                <TouchableOpacity style={s.footerBtn}>
                  <MaterialCommunityIcons name="download" size={14} color={colors.textSecondary} />
                  <Text style={s.footerBtnText}>Download PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.footerBtn}>
                  <MaterialCommunityIcons name="help-circle-outline" size={14} color={colors.textSecondary} />
                  <Text style={s.footerBtnText}>Need Help?</Text>
                </TouchableOpacity>
              </View>
              <Text style={s.brandFooter}>CRAVEGO • FRESHNESS DELIVERED</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.md, paddingVertical: 12,
  },
  headerBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, lineHeight: typography.lineHeight.xl },
  scroll: { flex: 1 },
  scrollInner: { padding: spacing.md, paddingBottom: 48 },

  loadingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: spacing.lg,
  },
  emptyState: { alignItems: "center", paddingVertical: spacing.xxxl, gap: 12 },
  emptyTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textSecondary },

  invoiceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.outlineVariant + "4D",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  brandSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  invoiceLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.primary, letterSpacing: typography.letterSpacing.xl, textTransform: "uppercase", marginTop: spacing.xs },
  orderIdCol: { alignItems: "flex-end" },
  orderIdLabel: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary, letterSpacing: typography.letterSpacing.wider, textTransform: "uppercase" },
  orderIdValue: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginTop: 2 },
  orderDate: { fontSize: 11, color: colors.textSecondary, marginTop: spacing.xs },

  addrRow: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  addrCol: { flex: 1 },
  addrTitle: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, color: colors.textSecondary, letterSpacing: typography.letterSpacing.wider, textTransform: "uppercase", marginBottom: spacing.xs },
  addrName: { fontSize: 13, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, lineHeight: 18 },
  addrPhone: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  addrDetail: { fontSize: typography.fontSize.xs, color: colors.textSecondary, lineHeight: typography.lineHeight.xs, marginTop: spacing.xs },
  addrDivider: { width: 1, backgroundColor: colors.outlineVariant },

  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingTop: 20,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest + "66",
  },
  tableHeaderCell: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, color: colors.textSecondary, letterSpacing: typography.letterSpacing.wider, textTransform: "uppercase" },
  tableBody: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xs },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.surfaceContainerHighest + "33" },
  colItem: { flex: 2.5 },
  colQty: { flex: 0.8, textAlign: "center" },
  colPrice: { flex: 1.2, textAlign: "right" },
  cellVal: { fontSize: 13, color: colors.textPrimary },
  priceVal: { fontWeight: typography.fontWeight.bold },
  itemName: { fontSize: 13, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, flex: 1 },
  vegDot: { width: 8, height: 8, borderRadius: spacing.xs },
  emptyItems: { fontSize: 13, color: colors.textSecondary, textAlign: "center", paddingVertical: spacing.md },

  divider: { borderTopWidth: 2, borderTopColor: colors.surfaceContainerHighest, borderStyle: "dashed", marginHorizontal: spacing.lg, marginTop: spacing.sm },

  breakdown: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm },
  breakRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  breakLabel: { fontSize: 13, color: colors.textSecondary },
  breakValue: { fontSize: 13, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary },
  freeText: { color: colors.secondary, fontWeight: typography.fontWeight.bold },
  discountRow: { marginTop: spacing.xs },
  discountLabel: { fontSize: 13, fontStyle: "italic", color: colors.secondary },
  discountValue: { fontSize: 13, fontWeight: typography.fontWeight.bold, color: colors.secondary },

  totalSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary + "0D",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary + "1A",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, color: colors.primary, letterSpacing: typography.letterSpacing.wider, textTransform: "uppercase" },
  pmtMethod: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  paymentIdText: { fontSize: 9, color: colors.textSecondary, marginTop: 2, maxWidth: 180 },
  totalValue: { fontSize: typography.fontSize.xxxl, fontWeight: typography.fontWeight.extrabold, color: colors.primary },

  footer: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    gap: spacing.md,
  },
  disclaimer: { fontSize: 11, color: colors.textSecondary, lineHeight: typography.lineHeight.sm, textAlign: "center" },
  footerActions: { flexDirection: "row", gap: 12 },
  footerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  footerBtnText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, color: colors.textSecondary },
  brandFooter: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, color: colors.textSecondary + "60", letterSpacing: typography.letterSpacing.wider },
});

export default ReceiptScreen;
