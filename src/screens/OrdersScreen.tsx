import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { connectSocket } from "../api/socket";
import { getOrders, reorder } from "../api/order";
import Skeleton from "../components/Skeleton";

const PRIMARY = "#FF6B35";
const ON_PRIMARY = "#ffffff";
const PRIMARY_TEXT = "#ab3500";
const SECONDARY = "#006d37";
const BG = "#fcf9f8";
const ON_SURFACE = "#1b1c1c";
const ON_SURFACE_VARIANT = "#594139";
const OUTLINE_VARIANT = "#e1bfb5";
const SURFACE_LOWEST = "#ffffff";
const SURFACE_CONTAINER_LOW = "#f6f3f2";
const SURFACE_CONTAINER = "#f0eded";
const SURFACE_CONTAINER_HIGH = "#eae7e7";
const SURFACE_VARIANT = "#e5e2e1";
const ERROR = "#ba1a1a";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface OrderItemData {
  id: string;
  name: string;
  quantity: number;
}

interface ActiveOrderData {
  id: string;
  orderNumber: string;
  restaurantName: string;
  image?: string;
  statusText: string;
  statusIcon: string;
  items: OrderItemData[];
  totalPrice: number;
  estimatedArrival?: string;
  paymentMethod?: string;
  paymentStatus?: string;
}

interface PastOrderData {
  id: string;
  restaurantName: string;
  image?: string;
  dateTime: string;
  status: "Delivered" | "Cancelled";
  items: OrderItemData[];
  totalPrice: number;
  rating?: number;
  paymentMethod?: string;
  paymentStatus?: string;
}

const ACTIVE_STATUS_CONFIG: Record<number, { text: string; icon: string }> = {
  0: { text: "Waiting for confirmation", icon: "clipboard-list-outline" },
  1: { text: "Order Accepted", icon: "check-circle" },
  2: { text: "Preparing your meal", icon: "bell" },
  3: { text: "Ready for pickup", icon: "silverware" },
  4: { text: "Picked up", icon: "motorbike" },
  5: { text: "On the way", icon: "map-marker" },
  6: { text: "Arriving", icon: "map-marker" },
};

const PaymentBadge = ({ method, status }: { method?: string; status?: string }) => {
  if (!method || method === "COD") return null;
  const label = status === "Paid" ? "Paid" : status === "Authorized" ? "Authorized" : status === "Refunded" ? "Refunded" : "Pending";
  const isPaid = status === "Paid";
  const isRefunded = status === "Refunded";
  const bg = isPaid ? `${SECONDARY}15` : isRefunded ? `${ERROR}15` : "#FFF3E0";
  const border = isPaid ? `${SECONDARY}30` : isRefunded ? `${ERROR}30` : "#FFE0B2";
  const color = isPaid ? SECONDARY : isRefunded ? ERROR : "#E65100";
  const icon = isPaid ? "shield-check" : isRefunded ? "refresh" : "clock-outline";
  return (
    <View style={[as.pill, { backgroundColor: bg, borderColor: border }]}>
      <MaterialCommunityIcons name={icon} size={14} color={color} />
      <Text style={[as.pillText, { color }]}>{label}</Text>
    </View>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const isDelivered = status === "Delivered";
  const isCancelled = status === "Cancelled";
  const color = isCancelled ? ERROR : SECONDARY;
  const icon = isCancelled ? "cancel" : "check-circle";
  return (
    <View style={[as.pill, { backgroundColor: isCancelled ? "#FFDAD6" : `${SECONDARY}15`, borderColor: isCancelled ? "#FFDAD699" : `${SECONDARY}30` }]}>
      <MaterialCommunityIcons name={icon} size={14} color={color} />
      <Text style={[as.pillText, { color }]}>{status}</Text>
    </View>
  );
};

const ActiveOrderCard = ({ order }: { order: ActiveOrderData }) => {
  const navigation = useNavigation<NavigationProp>();
  const itemsText = order.items.map(i => `${i.quantity}x ${i.name}`).join(", ");
  return (
    <View style={as.card}>
      <View style={as.cardTop}>
        <View style={as.cardHeader}>
          <View style={as.restaurantInfo}>
            <View style={as.imageBox}>
              {order.image ? (
                <Image source={{ uri: order.image }} style={as.image} />
              ) : (
                <MaterialCommunityIcons name="silverware" size={22} color={ON_SURFACE_VARIANT} />
              )}
            </View>
            <View>
              <Text style={as.restaurantName}>{order.restaurantName}</Text>
              <Text style={as.orderNumber}>{order.orderNumber}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={as.statusRow}>
        <View style={as.statusIconBox}>
          <MaterialCommunityIcons name={order.statusIcon as any} size={18} color={PRIMARY} />
        </View>
        <Text style={as.statusText}>{order.statusText}</Text>
      </View>

      <Text style={as.itemsText} numberOfLines={1}>{itemsText}</Text>

      <View style={as.metaRow}>
        <View>
          <Text style={as.metaLabel}>Estimated Arrival</Text>
          <Text style={as.metaValue}>{order.estimatedArrival || "25 - 30 mins"}</Text>
        </View>
        <View style={as.priceCol}>
          <Text style={as.metaLabel}>Total Price</Text>
          <Text style={as.metaValue}>₹{order.totalPrice}</Text>
          <PaymentBadge method={order.paymentMethod} status={order.paymentStatus} />
        </View>
      </View>

      <View style={as.cardActions}>
        <TouchableOpacity
          style={as.trackBtn}
          onPress={() => navigation.navigate("TrackMyOrder", {
            orderId: order.id,
            orderNumber: order.orderNumber,
            restaurantName: order.restaurantName,
            totalPrice: order.totalPrice,
            items: order.items,
          })}
        >
          <MaterialCommunityIcons name="map-marker" size={16} color={ON_PRIMARY} />
          <Text style={as.trackBtnText}>Track Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PastOrderCard = ({ order }: { order: PastOrderData }) => {
  const navigation = useNavigation<NavigationProp>();
  const itemsText = order.items.map(i => `${i.quantity}x ${i.name}`).join(", ");
  const isCancelled = order.status === "Cancelled";

  const handleReorder = async () => {
    const res = await reorder(order.id);
    if (res.success) navigation.navigate("Home");
  };

  const handleViewReceipt = () => {
    navigation.navigate("Receipt", { orderId: order.id });
  };

  return (
    <View style={as.card}>
      <View style={as.pastTopRow}>
        <View style={as.restaurantInfo}>
          <View style={[as.imageBox, as.pastImageBox]}>
            {order.image ? (
              <Image source={{ uri: order.image }} style={as.image} />
            ) : (
              <MaterialCommunityIcons name="silverware" size={22} color={ON_SURFACE_VARIANT} />
            )}
          </View>
          <Text style={as.restaurantName}>{order.restaurantName}</Text>
        </View>
        <Text style={as.pastPrice}>₹{order.totalPrice}</Text>
      </View>

      <View style={as.pastStatusRow}>
        <StatusBadge status={order.status} />
        <PaymentBadge method={order.paymentMethod} status={order.paymentStatus} />
        <Text style={as.pastDate}> • {order.dateTime}</Text>
      </View>

      <Text style={as.itemsText}>{itemsText}</Text>

      <View style={as.pastActions}>
        <TouchableOpacity style={as.reorderBtn} onPress={handleReorder}>
          <MaterialCommunityIcons name="replay" size={16} color={ON_PRIMARY} />
          <Text style={as.reorderBtnText}>Reorder</Text>
        </TouchableOpacity>
        <TouchableOpacity style={as.receiptBtn} onPress={handleViewReceipt}>
          <MaterialCommunityIcons name="receipt" size={16} color={PRIMARY_TEXT} />
          <Text style={as.receiptBtnText}>Receipt</Text>
        </TouchableOpacity>
        {isCancelled ? (
          <TouchableOpacity style={as.detailBtn}>
            <MaterialCommunityIcons name="information-outline" size={18} color={ON_SURFACE_VARIANT} />
          </TouchableOpacity>
        ) : order.rating ? (
          <View style={as.ratedBadge}>
            <MaterialCommunityIcons name="star" size={14} color={PRIMARY} />
            <Text style={as.ratedText}>{order.rating}.0</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={as.rateMealBtn}
            onPress={() => navigation.navigate("ReviewRating", {
              restaurantName: order.restaurantName,
              orderId: order.id,
              deliveredTime: order.dateTime,
              items: order.items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity })),
              totalPrice: order.totalPrice,
            })}
          >
            <MaterialCommunityIcons name="star" size={16} color={PRIMARY} />
            <Text style={as.rateMealText}>Rate Meal</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const OrdersScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<"Active" | "Past">("Active");
  const [filter, setFilter] = useState<string>("All Orders");
  const [apiActive, setApiActive] = useState<ActiveOrderData[]>([]);
  const [apiPast, setApiPast] = useState<PastOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const cleanupRef = useRef<(() => void) | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders();
      if (res.success && res.orders?.length) {
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
        const active: ActiveOrderData[] = [];
        const past: PastOrderData[] = [];
        for (const o of res.orders) {
          const orderItems = (o.items || []).map(i => ({ id: i.menuItemId, name: i.name, quantity: i.quantity }));
          const conf = ACTIVE_STATUS_CONFIG[o.orderStatus];
          const snap = o.restaurantSnapshot || {};
          const name = snap.name || o.restaurantName || "Restaurant";
          const image = snap.image || o.restaurantImage || "";
          const price = o.grandTotal ?? 0;
          if (o.orderStatus >= 7) {
            past.push({
              id: o._id, restaurantName: name, image,
              dateTime: fmtDate(o.createdAt),
              status: o.orderStatus === 8 ? "Cancelled" : "Delivered",
              items: orderItems, totalPrice: price, rating: o.isRated ? 5 : undefined,
              paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus,
            });
          } else {
            active.push({
              id: o._id, orderNumber: o.orderNumber, restaurantName: name, image,
              statusText: conf?.text || "Preparing your meal", statusIcon: conf?.icon || "cook",
              items: orderItems, totalPrice: price, estimatedArrival: o.estimatedTime || o.estimatedDeliveryTime ? `${o.estimatedDeliveryTime} mins` : undefined,
              paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus,
            });
          }
        }
        setApiActive(active);
        setApiPast(past);
      }
      } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const handler = () => { if (mounted) loadOrders(); };
    const init = async () => {
      const socket = await connectSocket();
      socket.off("order:update", handler);
      socket.on("order:update", handler);
    };
    cleanupRef.current = () => {
      connectSocket().then(s => s.off("order:update", handler));
    };
    loadOrders();
    init();
    return () => { mounted = false; cleanupRef.current?.(); };
  }, []);

  const filters = ["All Orders", "Active", "Cancelled"];
  const filteredPast =
    filter === "All Orders" ? apiPast
      : filter === "Cancelled" ? apiPast.filter(o => o.status === "Cancelled")
        : apiPast.filter(o => o.status === "Delivered");

  return (
    <View style={[s.wrapper, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={ON_SURFACE} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Orders</Text>
        <TouchableOpacity style={s.headerBtn}>
          <MaterialCommunityIcons name="magnify" size={24} color={ON_SURFACE} />
        </TouchableOpacity>
      </View>

      <View style={s.tabBar}>
        {(["Active", "Past"] as const).map(tab => (
          <TouchableOpacity key={tab} style={s.tabBtn} onPress={() => setActiveTab(tab)}>
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab === "Active" ? "Active" : "Past Orders"}</Text>
            {activeTab === tab && <View style={s.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollInner} showsVerticalScrollIndicator={false}>
        {loading ? (
          activeTab === "Active" ? (
            <>
              <View style={s.sectionHeader}>
                <Skeleton width="30%" height={18} />
                <Skeleton width={60} height={22} borderRadius={11} />
              </View>
              {Array.from({ length: 2 }).map((_, i) => (
                <View key={i} style={as.card}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Skeleton width={48} height={48} borderRadius={10} />
                    <View style={{ flex: 1 }}>
                      <Skeleton width="50%" height={16} />
                      <Skeleton width="35%" height={12} style={{ marginTop: 4 }} />
                    </View>
                  </View>
                  <Skeleton width="90%" height={14} style={{ marginTop: 12 }} />
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
                    <Skeleton width="30%" height={12} />
                    <Skeleton width="20%" height={12} />
                  </View>
                  <Skeleton width="40%" height={36} borderRadius={10} style={{ marginTop: 12 }} />
                </View>
              ))}
            </>
          ) : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={s.filterContent}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} width={100} height={34} borderRadius={17} />
                ))}
              </ScrollView>
              {Array.from({ length: 2 }).map((_, i) => (
                <View key={i} style={as.card}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <Skeleton width={40} height={40} borderRadius={8} />
                      <Skeleton width="40%" height={16} />
                    </View>
                    <Skeleton width={50} height={16} />
                  </View>
                  <Skeleton width={70} height={14} style={{ marginTop: 8 }} />
                  <Skeleton width="85%" height={14} style={{ marginTop: 4 }} />
                  <Skeleton width="30%" height={34} borderRadius={10} style={{ marginTop: 12 }} />
                </View>
              ))}
            </>
          )
        ) : activeTab === "Active" ? (
          <>
            {apiActive.length > 0 ? (
              <>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>In Progress</Text>
                  <View style={s.countBadge}>
                    <Text style={s.countText}>{apiActive.length} Order</Text>
                  </View>
                </View>
                {apiActive.map(o => <ActiveOrderCard key={o.id} order={o} />)}
              </>
            ) : (
              <View style={s.emptyState}>
                <MaterialCommunityIcons name="clipboard-list-outline" size={64} color={OUTLINE_VARIANT} />
                <Text style={s.emptyTitle}>No Active Orders</Text>
                <Text style={s.emptySub}>Your active orders will appear here</Text>
              </View>
            )}
            {apiPast.length > 0 && (
              <>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>Recent History</Text>
                  <TouchableOpacity onPress={() => setActiveTab("Past")}>
                    <Text style={s.viewAll}>View All</Text>
                  </TouchableOpacity>
                </View>
                {apiPast.slice(0, 2).map(o => <PastOrderCard key={o.id} order={o} />)}
              </>
            )}
          </>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={s.filterContent}>
              {filters.map(f => (
                <TouchableOpacity key={f} style={[s.filterChip, filter === f && s.filterChipActive]} onPress={() => setFilter(f)}>
                  <Text style={[s.filterChipText, filter === f && s.filterChipTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {filteredPast.length > 0 ? (
              filteredPast.map(o => <PastOrderCard key={o.id} order={o} />)
            ) : (
              <View style={s.emptyState}>
                <MaterialCommunityIcons name="clipboard-list-outline" size={64} color={OUTLINE_VARIANT} />
                <Text style={s.emptyTitle}>No {filter === "All Orders" ? "" : filter.toLowerCase()} orders</Text>
                <Text style={s.emptySub}>{filter === "All Orders" ? "You have no past orders yet" : filter === "Cancelled" ? "No cancelled orders found" : "No delivered orders found"}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

    </View>
  );
};

const as = StyleSheet.create({
  card: {
    backgroundColor: SURFACE_LOWEST, borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: SURFACE_VARIANT,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardTop: {},
  cardHeader: {},
  restaurantInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  imageBox: { width: 48, height: 48, borderRadius: 10, backgroundColor: SURFACE_CONTAINER, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  pastImageBox: { width: 40, height: 40, borderRadius: 8 },
  image: { width: "100%", height: "100%" },
  restaurantName: { fontSize: 16, fontWeight: "700", color: ON_SURFACE, lineHeight: 24 },
  orderNumber: { fontSize: 12, fontWeight: "500", color: ON_SURFACE_VARIANT, lineHeight: 16, letterSpacing: 0.5 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  statusIconBox: { width: 26, height: 26, borderRadius: 13, backgroundColor: `${PRIMARY}15`, alignItems: "center", justifyContent: "center" },
  statusText: { fontSize: 13, fontWeight: "600", color: PRIMARY, lineHeight: 18 },
  itemsText: { fontSize: 13, color: ON_SURFACE_VARIANT, lineHeight: 18, marginTop: 6 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: SURFACE_VARIANT },
  metaLabel: { fontSize: 10, fontWeight: "500", color: ON_SURFACE_VARIANT, lineHeight: 14, letterSpacing: 0.5, textTransform: "uppercase" },
  metaValue: { fontSize: 14, fontWeight: "700", color: ON_SURFACE, lineHeight: 20, marginTop: 2 },
  priceCol: { alignItems: "flex-end" },
  cardActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  trackBtn: {
    flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: PRIMARY,
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10,
  },
  trackBtnText: { fontSize: 13, fontWeight: "700", color: ON_PRIMARY, lineHeight: 18 },

  pastTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pastPrice: { fontSize: 16, fontWeight: "700", color: ON_SURFACE, lineHeight: 24 },
  pastStatusRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  pastDate: { fontSize: 11, fontWeight: "500", color: ON_SURFACE_VARIANT, lineHeight: 16, letterSpacing: 0.5 },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1,
  },
  pillText: { fontSize: 11, fontWeight: "600", lineHeight: 16 },
  pastActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  reorderBtn: {
    flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: PRIMARY,
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10,
  },
  receiptBtn: {
    flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: `${PRIMARY}15`,
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: `${PRIMARY}30`,
  },
  reorderBtnText: { fontSize: 12, fontWeight: "700", color: ON_PRIMARY, lineHeight: 16 },
  receiptBtnText: { fontSize: 12, fontWeight: "700", color: PRIMARY_TEXT, lineHeight: 16 },
  rateMealBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  rateMealText: { fontSize: 12, fontWeight: "600", color: PRIMARY, lineHeight: 16, letterSpacing: 0.1 },
  ratedBadge: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratedText: { fontSize: 12, fontWeight: "600", color: ON_SURFACE_VARIANT, lineHeight: 16 },
  detailBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: SURFACE_CONTAINER, alignItems: "center", justifyContent: "center" },
});

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  headerBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: ON_SURFACE, lineHeight: 24 },
  tabBar: {
    flexDirection: "row", borderBottomWidth: 1, borderBottomColor: SURFACE_VARIANT,
    paddingHorizontal: 16,
  },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: "center", position: "relative" },
  tabText: { fontSize: 14, fontWeight: "600", color: ON_SURFACE_VARIANT, lineHeight: 20, letterSpacing: 0.1 },
  tabTextActive: { color: PRIMARY },
  tabIndicator: { position: "absolute", bottom: -1, left: "25%", right: "25%", height: 3, backgroundColor: PRIMARY, borderRadius: 999 },
  scroll: { flex: 1 },
  scrollInner: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: ON_SURFACE, lineHeight: 24 },
  countBadge: { backgroundColor: `${SECONDARY}20`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  countText: { fontSize: 11, fontWeight: "600", color: SECONDARY, lineHeight: 16, letterSpacing: 0.5 },
  viewAll: { fontSize: 12, fontWeight: "700", color: PRIMARY, lineHeight: 16, letterSpacing: 0.1 },
  filterRow: { marginBottom: 12,marginTop:12 },
  filterContent: { gap: 8, flexDirection: "row", paddingVertical: 4 },
  filterChip: { paddingHorizontal: 24, paddingVertical: 8, backgroundColor: SURFACE_CONTAINER_HIGH, borderRadius: 999 },
  filterChipActive: { backgroundColor: PRIMARY, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  filterChipText: { fontSize: 13, fontWeight: "600", color: ON_SURFACE_VARIANT, lineHeight: 18, letterSpacing: 0.1 },
  filterChipTextActive: { color: ON_PRIMARY },
  emptyState: { alignItems: "center", paddingVertical: 48, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: ON_SURFACE, lineHeight: 24 },
  emptySub: { fontSize: 14, color: ON_SURFACE_VARIANT, lineHeight: 20 },
});

export default OrdersScreen;
