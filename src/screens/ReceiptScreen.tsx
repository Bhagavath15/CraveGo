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

const PRIMARY = "#FF6B35";
const ON_PRIMARY = "#ffffff";
const PRIMARY_TEXT = "#ab3500";
const SECONDARY = "#006D37";
const BG = "#fcf9f8";
const ON_SURFACE = "#1b1c1c";
const ON_SURFACE_VARIANT = "#594139";
const OUTLINE_VARIANT = "#e1bfb5";
const SURFACE_LOWEST = "#ffffff";
const SURFACE_CONTAINER_LOW = "#f6f3f2";
const SURFACE_CONTAINER_HIGH = "#eae7e7";
const SURFACE_VARIANT = "#e5e2e1";
const ERROR = "#ba1a1a";
const SUCCESS = "#006D37";

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
  };

  const restaurantAddr = "";
  const deliveryAddr = [addrSnap.houseNumber, addrSnap.apartment, addrSnap.area, addrSnap.city, addrSnap.pincode]
    .filter(Boolean)
    .join(", ");

  return (
    <View style={[s.wrapper, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={ON_SURFACE} />
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
            <MaterialCommunityIcons name="receipt" size={64} color={OUTLINE_VARIANT} />
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
                      <View style={[s.vegDot, { backgroundColor: isVeg(item) ? SUCCESS : ERROR }]} />
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
                  <MaterialCommunityIcons name="download" size={14} color={ON_SURFACE_VARIANT} />
                  <Text style={s.footerBtnText}>Download PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.footerBtn}>
                  <MaterialCommunityIcons name="help-circle-outline" size={14} color={ON_SURFACE_VARIANT} />
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
  wrapper: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  headerBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: ON_SURFACE, lineHeight: 24 },
  scroll: { flex: 1 },
  scrollInner: { padding: 16, paddingBottom: 48 },

  loadingCard: {
    backgroundColor: SURFACE_LOWEST,
    borderRadius: 24,
    padding: 24,
  },
  emptyState: { alignItems: "center", paddingVertical: 64, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: ON_SURFACE_VARIANT },

  invoiceCard: {
    backgroundColor: SURFACE_LOWEST,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: `${OUTLINE_VARIANT}4D`,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  brandSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 24,
    paddingBottom: 16,
  },
  invoiceLabel: { fontSize: 12, fontWeight: "700", color: PRIMARY, letterSpacing: 1, textTransform: "uppercase", marginTop: 4 },
  orderIdCol: { alignItems: "flex-end" },
  orderIdLabel: { fontSize: 10, fontWeight: "600", color: ON_SURFACE_VARIANT, letterSpacing: 0.5, textTransform: "uppercase" },
  orderIdValue: { fontSize: 14, fontWeight: "700", color: ON_SURFACE, marginTop: 2 },
  orderDate: { fontSize: 11, color: ON_SURFACE_VARIANT, marginTop: 4 },

  addrRow: {
    flexDirection: "row",
    marginHorizontal: 24,
    padding: 16,
    backgroundColor: SURFACE_CONTAINER_LOW,
    borderRadius: 16,
    gap: 16,
  },
  addrCol: { flex: 1 },
  addrTitle: { fontSize: 10, fontWeight: "700", color: ON_SURFACE_VARIANT, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 },
  addrName: { fontSize: 13, fontWeight: "700", color: ON_SURFACE, lineHeight: 18 },
  addrPhone: { fontSize: 11, color: ON_SURFACE_VARIANT, marginTop: 2 },
  addrDetail: { fontSize: 10, color: ON_SURFACE_VARIANT, lineHeight: 14, marginTop: 4 },
  addrDivider: { width: 1, backgroundColor: OUTLINE_VARIANT },

  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: `${SURFACE_VARIANT}66`,
  },
  tableHeaderCell: { fontSize: 10, fontWeight: "700", color: ON_SURFACE_VARIANT, letterSpacing: 0.5, textTransform: "uppercase" },
  tableBody: { paddingHorizontal: 24, paddingVertical: 4 },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: `${SURFACE_VARIANT}33` },
  colItem: { flex: 2.5 },
  colQty: { flex: 0.8, textAlign: "center" },
  colPrice: { flex: 1.2, textAlign: "right" },
  cellVal: { fontSize: 13, color: ON_SURFACE },
  priceVal: { fontWeight: "700" },
  itemName: { fontSize: 13, fontWeight: "600", color: ON_SURFACE, flex: 1 },
  vegDot: { width: 8, height: 8, borderRadius: 4 },
  emptyItems: { fontSize: 13, color: ON_SURFACE_VARIANT, textAlign: "center", paddingVertical: 16 },

  divider: { borderTopWidth: 2, borderTopColor: SURFACE_VARIANT, borderStyle: "dashed", marginHorizontal: 24, marginTop: 8 },

  breakdown: { paddingHorizontal: 24, paddingTop: 16, gap: 8 },
  breakRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  breakLabel: { fontSize: 13, color: ON_SURFACE_VARIANT },
  breakValue: { fontSize: 13, fontWeight: "600", color: ON_SURFACE },
  freeText: { color: SECONDARY, fontWeight: "700" },
  discountRow: { marginTop: 4 },
  discountLabel: { fontSize: 13, fontStyle: "italic", color: SECONDARY },
  discountValue: { fontSize: 13, fontWeight: "700", color: SECONDARY },

  totalSection: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    backgroundColor: `${PRIMARY}0D`,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${PRIMARY}1A`,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 10, fontWeight: "700", color: PRIMARY, letterSpacing: 0.5, textTransform: "uppercase" },
  pmtMethod: { fontSize: 10, color: ON_SURFACE_VARIANT, marginTop: 2 },
  paymentIdText: { fontSize: 9, color: ON_SURFACE_VARIANT, marginTop: 2, maxWidth: 180 },
  totalValue: { fontSize: 24, fontWeight: "800", color: PRIMARY },

  footer: {
    marginTop: 24,
    padding: 24,
    backgroundColor: SURFACE_CONTAINER_LOW,
    alignItems: "center",
    gap: 16,
  },
  disclaimer: { fontSize: 11, color: ON_SURFACE_VARIANT, lineHeight: 16, textAlign: "center" },
  footerActions: { flexDirection: "row", gap: 12 },
  footerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: SURFACE_LOWEST,
    borderWidth: 1,
    borderColor: `${SURFACE_VARIANT}`,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  footerBtnText: { fontSize: 10, fontWeight: "700", color: ON_SURFACE_VARIANT },
  brandFooter: { fontSize: 10, fontWeight: "700", color: `${ON_SURFACE_VARIANT}60`, letterSpacing: 0.5 },
});

export default ReceiptScreen;
