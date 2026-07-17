import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  LayoutChangeEvent,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import MapView, { Marker } from "react-native-maps";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { getOrderById, advanceOrderStatus, cancelOrder } from "../api/order";
import { connectSocket, getSocket } from "../api/socket";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY = "#ff6b35";
const ON_PRIMARY = "#ffffff";
const ON_SURFACE = "#1b1c1c";
const ON_SURFACE_VARIANT = "#594139";
const OUTLINE_VARIANT = "#e1bfb5";
const SURFACE_LOWEST = "#ffffff";
const ERROR = "#ba1a1a";
const GREEN = "#006D37";
const SURFACE_CONTAINER = "#f0eded";
const SURFACE_CONTAINER_HIGH = "#eae7e7";
const GREY = "#9E9E9E";

const PATH: { label: string; pct: { x: number; y: number }; icon: string; completedIcon: string; serverKey: number }[] = [
  { label: "Placed", pct: { x: 10, y: 6 }, icon: "clipboard-list-outline", completedIcon: "check", serverKey: 0 },
  { label: "Accepted", pct: { x: 50, y: 3 }, icon: "check", completedIcon: "check", serverKey: 1 },
  { label: "Preparing", pct: { x: 82, y: 10 }, icon: "bell", completedIcon: "check", serverKey: 2 },
  { label: "Ready", pct: { x: 85, y: 38 }, icon: "silverware", completedIcon: "check", serverKey: 3 },
  { label: "Picked Up", pct: { x: 55, y: 52 }, icon: "motorbike", completedIcon: "check", serverKey: 4 },
  { label: "Out for Del.", pct: { x: 22, y: 46 }, icon: "map-marker", completedIcon: "check", serverKey: 5 },
  { label: "Arriving", pct: { x: 10, y: 68 }, icon: "map-marker", completedIcon: "check", serverKey: 6 },
  { label: "Delivered", pct: { x: 80, y: 86 }, icon: "check", completedIcon: "check", serverKey: 7 },
];

const stitchStep = (s: number) => {
  let idx = 0;
  for (let i = 0; i < PATH.length; i++) {
    if (PATH[i].serverKey <= s) idx = i;
  }
  return idx;
};

const STATUS_LABELS: Record<number, string> = {
  0: "Order Placed", 1: "Order Accepted", 2: "Preparing your meal", 3: "Ready for pickup",
  4: "On the way", 5: "Out for delivery", 6: "Arriving soon", 7: "Delivered", 8: "Cancelled",
};
const STATUS_DESC: Record<number, string> = {
  0: "Your order has been placed successfully", 1: "Restaurant has accepted your order",
  2: "Your food is being prepared", 3: "Your order is ready",
  4: "Rider is heading your way", 5: "Rider has picked up your order",
  6: "Rider is arriving soon",
  7: "Your order has been delivered", 8: "Order has been cancelled",
};

type Restaurant = { id: string; name: string; rating: number; time: string; coords: [number, number]; };
const RESTAURANTS: Restaurant[] = [
  { id: "1", name: "Biryani House", rating: 4.5, time: "30-40 min", coords: [80.2707, 13.0827] },
  { id: "2", name: "Pizza Corner", rating: 4.2, time: "25-35 min", coords: [80.2810, 13.0750] },
  { id: "3", name: "Burger Spot", rating: 4.1, time: "20-30 min", coords: [80.2650, 13.0900] },
];

type TrackMyOrderRouteProps = RouteProp<RootStackParamList, "TrackMyOrder">;

export default function TrackMyOrderScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<TrackMyOrderRouteProps>();
  const { orderId, orderNumber, restaurantName, totalPrice, items } = route.params;
  const itemsDisplay = items.map(i => `${i.quantity}x ${i.name}`).join(", ");
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["30%", "65%", "80%"], []);

  const [liveOrder, setLiveOrder] = useState<{
    orderStatus: number; riderName: string; riderRating: number;
    deliveryAddress: string; estimatedTime?: string; createdAt?: string;
  } | null>(null);

  const loadOrder = useCallback(() => {
    if (!orderId) return;
    getOrderById(orderId).then(res => {
      if (res.success && res.order) {
        setLiveOrder({
          orderStatus: res.order.orderStatus,
          riderName: res.order.riderName || "Arjun K.",
          riderRating: res.order.riderRating ?? 4.8,
          deliveryAddress: typeof res.order.deliveryAddress === "string" ? res.order.deliveryAddress : "",
          estimatedTime: res.order.estimatedTime,
          createdAt: res.order.createdAt,
        });
      }
    }).catch(() => {});
  }, [orderId]);

  useEffect(() => { loadOrder(); }, [loadOrder]);

  useEffect(() => {
    let mounted = true;
    const socketCleanup = () => {
      const s = getSocket();
      if (s) s.off("order:update", socketHandler);
    };
    const socketHandler = () => { if (mounted) loadOrder(); };
    const initSocket = async () => {
      const socket = await connectSocket();
      socket.off("order:update", socketHandler);
      socket.on("order:update", socketHandler);
    };
    initSocket();

    statusRef.current = liveOrder?.orderStatus ?? 0;

    const advanceTimer = setInterval(async () => {
      if (!mounted || cancellingRef.current) return;
      const res = await advanceOrderStatus(orderId).catch(() => undefined);
      if (res?.success && res.order) {
        const newStatus = res.order.orderStatus;
        if (newStatus > statusRef.current) {
          statusRef.current = newStatus;
          setLiveOrder(prev => prev ? { ...prev, orderStatus: newStatus } : prev);
        }
        if (newStatus >= 7) clearInterval(advanceTimer);
      } else {
        loadOrder();
      }
    }, 10000);
    timerRef.current = advanceTimer;

    return () => {
      mounted = false;
      socketCleanup();
      clearInterval(advanceTimer);
    };
  }, [loadOrder, orderId]);

  useEffect(() => { requestUserLocation(); }, []);

  const requestUserLocation = async () => {
    if (Platform.OS !== "android") return;
    try { await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION); } catch { }
  };

  const [isCancelled, setIsCancelled] = useState(false);
  const [cancelledFromStatus, setCancelledFromStatus] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancellingRef = useRef(false);
  const statusRef = useRef(0);
  const deliveredRef = useRef(false);

  const orderStatus = liveOrder?.orderStatus ?? 0;
  const riderName_ = liveOrder?.riderName ?? "Arjun K.";
  const riderRating_ = liveOrder?.riderRating ?? 4.8;
  const estimatedTime = liveOrder?.estimatedTime;
  const activeIdx = stitchStep(isCancelled ? (cancelledFromStatus ?? orderStatus) : orderStatus);

  const handleDelivered = useCallback(() => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    navigation.navigate("DeliveryCompleted", {
      orderId, restaurantName, items: itemsDisplay, totalPrice, deliveredTime: time, riderName: riderName_,
    });
  }, [navigation, restaurantName, itemsDisplay, totalPrice, riderName_, orderId]);

  useEffect(() => {
    const rawStatus = liveOrder?.orderStatus;
    if (!isCancelled && rawStatus === 7 && liveOrder && !deliveredRef.current) {
      deliveredRef.current = true;
      handleDelivered();
    }
  }, [liveOrder?.orderStatus, isCancelled, handleDelivered]);

  const handleCancel = useCallback(() => {
    if (cancelling || cancellingRef.current) return;
    const statusAtCancel = liveOrder?.orderStatus ?? 0;
    setCancelledFromStatus(statusAtCancel);
    cancellingRef.current = true;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsCancelled(true);
    setCancelling(true);
    cancelOrder(orderId).then(res => {
      if (!res.success) {
        setIsCancelled(false);
        setCancelledFromStatus(null);
        cancellingRef.current = false;
      }
    }).catch(err => {
      setIsCancelled(false);
      setCancelledFromStatus(null);
      cancellingRef.current = false;
    }).finally(() => setCancelling(false));
  }, [orderId, cancelling, liveOrder]);

  const statusDesc = isCancelled ? "Order has been cancelled" : STATUS_DESC[orderStatus] || STATUS_DESC[0];
  const accentColor = isCancelled ? ERROR : orderStatus >= 7 ? GREEN : PRIMARY;

  const [layout, setLayout] = useState({ w: 360, h: 400 });

  const onPathLayout = useCallback((e: LayoutChangeEvent) => {
    setLayout({ w: e.nativeEvent.layout.width || 360, h: e.nativeEvent.layout.height || 400 });
  }, []);

  const toPx = useCallback((pct: { x: number; y: number }) => ({
    x: (pct.x / 100) * layout.w,
    y: (pct.y / 100) * layout.h,
  }), [layout]);

  const segmentPath = useCallback((pts: { x: number; y: number }[], i: number) => {
    if (i < 0 || i >= pts.length - 1) return "";
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const t = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * t;
    const cp1y = p1.y + (p2.y - p0.y) * t;
    const cp2x = p2.x - (p3.x - p1.x) * t;
    const cp2y = p2.y - (p3.y - p1.y) * t;
    return `M ${p1.x} ${p1.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }, []);

  return (
    <View style={s.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        showsUserLocation
        showsMyLocationButton
        initialRegion={{ latitude: 13.0827, longitude: 80.2707, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
      >
        {RESTAURANTS.map(r => (
          <Marker key={r.id} coordinate={{ latitude: r.coords[1], longitude: r.coords[0] }} />
        ))}
      </MapView>

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        handleIndicatorStyle={s.handleIndicator}
        backgroundStyle={s.sheetBackground}
      >
        <BottomSheetView style={s.sheetContent}>
          <View style={s.headerSection}>
            <View style={s.headerLeft}>
              <Text style={[s.headerTitle, { color: isCancelled ? ERROR : accentColor }]}>
                {isCancelled ? "Order Cancelled" : "On its way!"}
              </Text>
              <Text style={s.headerSub}>Order #{orderNumber} • {statusDesc}</Text>
            </View>
            <View style={[s.headerIconBox, { backgroundColor: PRIMARY }]}>              
              <MaterialCommunityIcons
                name={isCancelled ? "cancel" : "motorbike"}
                size={32}
                color={ON_PRIMARY}
              />
            </View>
          </View>

          <View style={s.pathContainer} onLayout={onPathLayout}>
            <Svg style={StyleSheet.absoluteFill}>
              {(() => {
                const pts = PATH.map(p => toPx(p.pct));
                return PATH.slice(0, -1).map((_, i) => {
                  const d = segmentPath(pts, i);
                  return (
                    <Path
                      key={`seg-${i}`}
                      d={d}
                      stroke={i < activeIdx ? PRIMARY : SURFACE_CONTAINER_HIGH}
                      strokeWidth={7}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                });
              })()}
            </Svg>

            {PATH.map((p, i) => {
              const pos = toPx(p.pct);
              const isCompleted = i <= activeIdx;
              const isFuture = i > activeIdx;
              const dotSize = isCompleted ? 34 : 28;
              const icon = isCompleted ? p.completedIcon : p.icon;
              const dotRadius = dotSize / 2;
              const isLeftSide = p.pct.x <= 50;
              const isTopHalf = p.pct.y <= 35;
              const isActive = i === activeIdx;
              const labelAbove = isActive && p.pct.y >= 15 ? true : !isTopHalf;
              const gap = 6;
              const labelW = 100;
              const lblLeft = isLeftSide
                ? pos.x + dotRadius + gap
                : pos.x - labelW - dotRadius - gap;
              const lblTop = labelAbove ? pos.y - dotRadius - gap - 20 : pos.y + dotRadius + gap;
              return (
                <React.Fragment key={p.label}>
                  <View
                    style={[
                      s.stepDot,
                      {
                        left: pos.x - dotSize / 2,
                        top: pos.y - dotSize / 2,
                        width: dotSize,
                        height: dotSize,
                        borderRadius: dotSize / 2,
                        backgroundColor: isCompleted ? PRIMARY : SURFACE_CONTAINER_HIGH,
                        borderColor: isCompleted ? PRIMARY : SURFACE_CONTAINER_HIGH,
                        borderWidth: 0,
                      },
                    ]}
                  >
                    {isCompleted && (
                      <MaterialCommunityIcons name={icon as any} size={22} color={ON_PRIMARY} />
                    )}
                    {isFuture && (
                      <MaterialCommunityIcons name={icon as any} size={22} color={GREY} />
                    )}
                  </View>
                  <View
                    style={[
                      s.stepLabelWrap,
                      { left: lblLeft, top: lblTop, width: labelW },
                      !isLeftSide && { alignItems: "flex-end" },
                    ]}
                  >
                    <Text style={[s.stepLabel, { color: isCompleted ? ON_SURFACE : GREY }]} numberOfLines={1}>
                      {p.label}
                    </Text>
                  </View>
                </React.Fragment>
              );
            })}

            {orderStatus >= 4 && !isCancelled && (
              <View style={s.riderCard}>
                <View style={s.riderAvatarWrap}>
                  <View style={s.riderAvatarSmall}>
                    <MaterialCommunityIcons name="account-circle" size={24} color={PRIMARY} />
                  </View>
                  <View style={s.riderRatingBadge}>
                    <MaterialCommunityIcons name="star" size={7} color="#FFD700" />
                    <Text style={s.riderRatingMini}>{riderRating_}</Text>
                  </View>
                </View>
                <View style={s.riderInfoCol}>
                  <Text style={s.riderNameSmall}>{riderName_}</Text>
                  <View style={s.riderActionRow}>
                    <TouchableOpacity style={s.chatMini}>
                      <MaterialCommunityIcons name="message-text" size={12} color={PRIMARY} />
                    </TouchableOpacity>
                    <TouchableOpacity style={s.callMini}>
                      <MaterialCommunityIcons name="phone" size={12} color={ON_PRIMARY} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>

          <View style={s.actionRow}>
            {!isCancelled && (
              <TouchableOpacity style={s.helpBtn}>
                <MaterialCommunityIcons name="help-circle-outline" size={22} color={ON_SURFACE_VARIANT} />
                <Text style={s.helpBtnText}>Get Help</Text>
              </TouchableOpacity>
            )}
            {isCancelled ? (
              <>
                <TouchableOpacity style={s.postCancelBtn} onPress={() => navigation.navigate("Home")}>
                  <MaterialCommunityIcons name="home-outline" size={22} color={PRIMARY} />
                  <Text style={[s.postCancelBtnText, { color: PRIMARY }]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.postCancelBtn} onPress={() => navigation.navigate("Home", { screen: "Orders" })}>
                  <MaterialCommunityIcons name="clipboard-list-outline" size={22} color={PRIMARY} />
                  <Text style={[s.postCancelBtnText, { color: PRIMARY }]}>Order History</Text>
                </TouchableOpacity>
              </>
            ) : (
              orderStatus < 4 && (
                <TouchableOpacity style={s.cancelBtn} onPress={handleCancel} disabled={cancelling}>
                  <MaterialCommunityIcons name="close" size={22} color={ERROR} />
                  <Text style={s.cancelBtnText}>{cancelling ? "Cancelling..." : "Cancel"}</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  handleIndicator: { width: 48, height: 6, backgroundColor: "#e5e2e1", borderRadius: 3, opacity: 0.5 },
  sheetBackground: { backgroundColor: "#fcf9f8", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetContent: { flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48 },
  scrollInner: { paddingBottom: 24 },

  headerSection: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: { flex: 1, marginRight: 12 },
  headerTitle: { fontSize: 26, fontWeight: "800", lineHeight: 32, letterSpacing: -0.3 },
  headerSub: { fontSize: 13, color: ON_SURFACE_VARIANT, lineHeight: 18, marginTop: 2 },
  headerIconBox: {
    width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center",
  },

  pathContainer: {
    position: "relative",
    height: 500,
    marginBottom: 12,
    overflow: "visible",
    zIndex: 2,
  },

  stepDot: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 4,
  },

  stepLabelWrap: { position: "absolute", width: 100, zIndex: 5 },
  stepLabel: { fontSize: 11, fontWeight: "600", lineHeight: 15 },

  riderCard: {
    position: "absolute", left: 16, bottom: 16,
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: SURFACE_LOWEST,
    borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
    zIndex: 7,
  },
  riderAvatarWrap: { position: "relative" },
  riderAvatarSmall: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: `${PRIMARY}15`, alignItems: "center", justifyContent: "center",
  },
  riderRatingBadge: {
    position: "absolute", bottom: -3, right: -3,
    backgroundColor: SURFACE_LOWEST, borderRadius: 6,
    flexDirection: "row", alignItems: "center", gap: 1,
    paddingHorizontal: 4, paddingVertical: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  riderRatingMini: { fontSize: 8, fontWeight: "800", color: ON_SURFACE, lineHeight: 10 },
  riderInfoCol: { gap: 4 },
  riderNameSmall: { fontSize: 12, fontWeight: "700", color: ON_SURFACE, lineHeight: 16 },
  riderActionRow: { flexDirection: "row", gap: 6 },
  chatMini: { width: 26, height: 26, borderRadius: 8, backgroundColor: PRIMARY + "12", alignItems: "center", justifyContent: "center" },
  callMini: { width: 26, height: 26, borderRadius: 8, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center" },

  actionRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  helpBtn: {
    flex: 1, height: 54, borderRadius: 16, borderWidth: 1, borderColor: `${OUTLINE_VARIANT}80`,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: SURFACE_LOWEST,
  },
  helpBtnText: { fontSize: 15, fontWeight: "700", color: ON_SURFACE_VARIANT, lineHeight: 22 },
  cancelBtn: {
    flex: 1, height: 54, borderRadius: 16, borderWidth: 1, borderColor: `${ERROR}33`,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: SURFACE_LOWEST,
  },
  cancelBtnText: { fontSize: 15, fontWeight: "700", color: ERROR, lineHeight: 22 },

  finalIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  finalTitle: { fontSize: 24, fontWeight: "800", lineHeight: 32, marginBottom: 8, textAlign: "center" },
  finalSubtext: { fontSize: 14, color: ON_SURFACE_VARIANT, lineHeight: 20, textAlign: "center", marginBottom: 24 },

  cancelledContainer: { flex: 1, justifyContent: "flex-end", paddingHorizontal: 24 },
  postCancelRow: { flexDirection: "row", gap: 12, paddingBottom: 24 },
  postCancelBtn: {
    flex: 1, height: 54, borderRadius: 16, borderWidth: 1, borderColor: `${OUTLINE_VARIANT}80`,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: SURFACE_LOWEST,
  },
  postCancelBtnText: { fontSize: 15, fontWeight: "700", color: PRIMARY, lineHeight: 22 },
});
