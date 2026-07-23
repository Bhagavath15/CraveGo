import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { connectSocket } from "../api/socket";
import { getOrders, reorder } from "../api/order";
import Skeleton from "../components/Skeleton";
import { colors, spacing, typography, radius, shadows, sizes } from "../theme";

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
  const bg = isPaid ? `${colors.secondary}15` : isRefunded ? `${colors.error}15` : "#FFF3E0";
  const border = isPaid ? `${colors.secondary}30` : isRefunded ? `${colors.error}30` : "#FFE0B2";
  const color = isPaid ? colors.secondary : isRefunded ? colors.error : "#E65100";
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
  const color = isCancelled ? colors.error : colors.secondary;
  const icon = isCancelled ? "cancel" : "check-circle";
  return (
    <View style={[as.pill, { backgroundColor: isCancelled ? colors.errorLight : `${colors.secondary}15`, borderColor: isCancelled ? `${colors.errorLight}99` : `${colors.secondary}30` }]}>
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
      <View style={as.cardHeader}>
        <View style={as.imageBox}>
          {order.image ? (
            <Image source={{ uri: order.image }} style={as.image} />
          ) : (
            <MaterialCommunityIcons name="silverware" size={22} color={colors.textSecondary} />
          )}
        </View>
        <View style={as.headerInfo}>
          <Text style={as.restaurantName}>{order.restaurantName}</Text>
          <Text style={as.orderNumber}>{order.orderNumber}</Text>
        </View>
      </View>

      <View style={as.statusRow}>
        <View style={as.statusIconBox}>
          <MaterialCommunityIcons name={order.statusIcon as any} size={16} color={colors.primary} />
        </View>
        <Text style={as.statusText}>{order.statusText}</Text>
      </View>

      <Text style={as.itemsText} numberOfLines={1}>{itemsText}</Text>

      <View style={as.metaRow}>
        <View style={as.metaCol}>
          <Text style={as.metaLabel}>Est. Arrival</Text>
          <Text style={as.metaValue}>{order.estimatedArrival || "25 - 30 mins"}</Text>
        </View>
        <View style={as.metaColRight}>
          <Text style={as.metaLabel}>Total</Text>
          <Text style={as.metaValue}>₹{order.totalPrice}</Text>
          <PaymentBadge method={order.paymentMethod} status={order.paymentStatus} />
        </View>
      </View>

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
        <MaterialCommunityIcons name="map-marker-path" size={18} color={colors.white} />
        <Text style={as.trackBtnText}>Track Order</Text>
        <MaterialCommunityIcons name="chevron-right" size={18} color={colors.white} />
      </TouchableOpacity>
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
        <View style={as.pastLeft}>
          <View style={[as.imageBox, as.pastImageBox]}>
            {order.image ? (
              <Image source={{ uri: order.image }} style={as.image} />
            ) : (
              <MaterialCommunityIcons name="silverware" size={20} color={colors.textSecondary} />
            )}
          </View>
          <View style={as.pastInfo}>
            <Text style={as.restaurantName}>{order.restaurantName}</Text>
            <View style={as.pastStatusRow}>
              <StatusBadge status={order.status} />
              <PaymentBadge method={order.paymentMethod} status={order.paymentStatus} />
              <Text style={as.pastDate}> • {order.dateTime}</Text>
            </View>
          </View>
        </View>
        <Text style={as.pastPrice}>₹{order.totalPrice}</Text>
      </View>

      <Text style={as.itemsText}>{itemsText}</Text>

      <View style={as.pastActions}>
        <TouchableOpacity style={as.reorderBtn} onPress={handleReorder}>
          <MaterialCommunityIcons name="replay" size={16} color={colors.white} />
          <Text style={as.reorderBtnText}>Reorder</Text>
        </TouchableOpacity>
        <TouchableOpacity style={as.receiptBtn} onPress={handleViewReceipt}>
          <MaterialCommunityIcons name="receipt" size={16} color={colors.primary} />
          <Text style={as.receiptBtnText}>Receipt</Text>
        </TouchableOpacity>
        {isCancelled ? (
          <TouchableOpacity style={as.detailBtn}>
            <MaterialCommunityIcons name="information-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : order.rating ? (
          <View style={as.ratedBadge}>
            <MaterialCommunityIcons name="star" size={14} color={colors.rating} />
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
            <MaterialCommunityIcons name="star" size={16} color={colors.rating} />
            <Text style={as.rateMealText}>Rate</Text>
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
  const [refreshing, setRefreshing] = useState(false);
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
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Orders</Text>
        <View style={s.headerBtn} />
      </View>

      <View style={s.tabBar}>
        {(["Active", "Past"] as const).map(tab => (
          <TouchableOpacity key={tab} style={s.tabBtn} onPress={() => setActiveTab(tab)}>
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab === "Active" ? "Active" : "Past Orders"}</Text>
            {activeTab === tab && <View style={s.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollInner} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadOrders(); setRefreshing(false); }} tintColor={colors.primary} />}
      >
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
                <MaterialCommunityIcons name="clipboard-list-outline" size={64} color={colors.outlineVariant} />
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
                <MaterialCommunityIcons name="clipboard-list-outline" size={64} color={colors.outlineVariant} />
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
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: 12,
    borderWidth: 1, borderColor: colors.surfaceContainerHighest,
    ...shadows.card,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerInfo: { flex: 1 },
  imageBox: { width: 48, height: 48, borderRadius: 10, backgroundColor: colors.surfaceContainer, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  pastImageBox: { width: sizes.avatar, height: sizes.avatar, borderRadius: radius.sm },
  image: { width: "100%", height: "100%" },
  restaurantName: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, lineHeight: typography.lineHeight.xl },
  orderNumber: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.textSecondary, lineHeight: typography.lineHeight.sm, letterSpacing: typography.letterSpacing.wider },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  statusIconBox: { width: 26, height: 26, borderRadius: 13, backgroundColor: `${colors.primary}15`, alignItems: "center", justifyContent: "center" },
  statusText: { fontSize: 13, fontWeight: typography.fontWeight.semibold, color: colors.primary, lineHeight: 18 },
  itemsText: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginTop: 6 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: colors.surfaceContainerHighest },
  metaCol: {},
  metaColRight: { alignItems: "flex-end" },
  metaLabel: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium, color: colors.textSecondary, lineHeight: typography.lineHeight.xs, letterSpacing: typography.letterSpacing.wider, textTransform: "uppercase" },
  metaValue: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, lineHeight: typography.lineHeight.md, marginTop: 2 },
  trackBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: colors.primary, marginTop: 12,
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10,
  },
  trackBtnText: { fontSize: 13, fontWeight: typography.fontWeight.bold, color: colors.white, lineHeight: 18 },

  pastTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  pastLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  pastInfo: { flex: 1 },
  pastPrice: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, lineHeight: typography.lineHeight.xl },
  pastStatusRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4, marginTop: 4 },
  pastDate: { fontSize: 11, fontWeight: typography.fontWeight.medium, color: colors.textSecondary, lineHeight: typography.lineHeight.sm, letterSpacing: typography.letterSpacing.wider },
  pill: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radius.sm, borderWidth: 1,
  },
  pillText: { fontSize: 11, fontWeight: typography.fontWeight.semibold, lineHeight: typography.lineHeight.sm },
  pastActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  reorderBtn: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: colors.primary,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 10,
  },
  receiptBtn: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: `${colors.primary}15`,
    paddingVertical: spacing.sm, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: `${colors.primary}30`,
  },
  reorderBtnText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.white, lineHeight: typography.lineHeight.sm },
  receiptBtnText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.primary, lineHeight: typography.lineHeight.sm },
  rateMealBtn: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  rateMealText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.primary, lineHeight: typography.lineHeight.sm, letterSpacing: typography.letterSpacing.normal },
  ratedBadge: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratedText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary, lineHeight: typography.lineHeight.sm },
  detailBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceContainer, alignItems: "center", justifyContent: "center" },
});

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.md, paddingVertical: 12,
  },
  headerBtn: { width: sizes.avatar, height: sizes.avatar, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, lineHeight: typography.lineHeight.xl },
  tabBar: {
    flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.surfaceContainerHighest,
    paddingHorizontal: spacing.md,
  },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: "center", position: "relative" },
  tabText: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary, lineHeight: typography.lineHeight.md, letterSpacing: typography.letterSpacing.normal },
  tabTextActive: { color: colors.primary },
  tabIndicator: { position: "absolute", bottom: -1, left: "25%", right: "25%", height: 3, backgroundColor: colors.primary, borderRadius: radius.full },
  scroll: { flex: 1 },
  scrollInner: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.lg, marginBottom: 12 },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, lineHeight: typography.lineHeight.xl },
  countBadge: { backgroundColor: `${colors.secondary}20`, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full },
  countText: { fontSize: 11, fontWeight: typography.fontWeight.semibold, color: colors.secondary, lineHeight: typography.lineHeight.sm, letterSpacing: typography.letterSpacing.wider },
  viewAll: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.primary, lineHeight: typography.lineHeight.sm, letterSpacing: typography.letterSpacing.normal },
  filterRow: { marginBottom: 12,marginTop:12 },
  filterContent: { gap: spacing.sm, flexDirection: "row", paddingVertical: spacing.xs },
  filterChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.surfaceContainerHigh, borderRadius: radius.full },
  filterChipActive: { backgroundColor: colors.primary, ...shadows.small },
  filterChipText: { fontSize: 13, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary, lineHeight: 18, letterSpacing: typography.letterSpacing.normal },
  filterChipTextActive: { color: colors.white },
  emptyState: { alignItems: "center", paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, lineHeight: typography.lineHeight.xl },
  emptySub: { fontSize: typography.fontSize.md, color: colors.textSecondary, lineHeight: typography.lineHeight.md },
});

export default OrdersScreen;
