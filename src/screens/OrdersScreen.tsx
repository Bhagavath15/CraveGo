import { useState } from "react";
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";

const PRIMARY = "#ab3500";
const PRIMARY_CONTAINER = "#FF6B35";
const SECONDARY = "#006D37";
const BG = "#FCF9F8";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";
const OUTLINE_VARIANT = "#E1BFB5";
const SURFACE_LOWEST = "#FFFFFF";
const SURFACE_CONTAINER_HIGH = "#EAE7E7";
const SURFACE_CONTAINER = "#F0EDED";
const SURFACE_VARIANT = "#E5E2E1";
const SURFACE_CONTAINER_LOW = "#F6F3F2";
const SECONDARY_CONTAINER = "#6BFE9C";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
}

interface ActiveOrder {
    id: string;
    orderNumber: string;
    restaurantName: string;
    status: "Preparing" | "On the Way" | "Delivered" | "Cancelled";
    items: OrderItem[];
    totalPrice: number;
    estimatedArrival?: string;
    date: string;
}

interface PastOrder {
    id: string;
    restaurantName: string;
    dateTime: string;
    status: "Delivered" | "Cancelled";
    items: OrderItem[];
    totalPrice: number;
    rating?: number;
}

const ACTIVE_ORDERS: ActiveOrder[] = [
    {
        id: "1",
        orderNumber: "CG-88219",
        restaurantName: "Spice Garden",
        status: "Preparing",
        items: [
            { id: "101", name: "Special Chicken Biryani", quantity: 2 },
            { id: "102", name: "Raita", quantity: 1 },
        ],
        totalPrice: 450,
        estimatedArrival: "25 - 30 Mins",
        date: "Oct 15, 2023",
    },
];

const PAST_ORDERS: PastOrder[] = [
    {
        id: "2",
        restaurantName: "Madras Meals",
        dateTime: "24 Oct 2023 • 12:45 PM",
        status: "Delivered",
        items: [
            { id: "201", name: "Ghee Podi Idli", quantity: 1 },
            { id: "202", name: "Filter Coffee", quantity: 1 },
            { id: "203", name: "Mini Tiffin Combo", quantity: 1 },
        ],
        totalPrice: 450,
    },
    {
        id: "3",
        restaurantName: "Biryani Blues",
        dateTime: "21 Oct 2023 • 08:30 PM",
        status: "Delivered",
        items: [
            { id: "301", name: "Chicken Dum Biryani", quantity: 2 },
            { id: "302", name: "Mirchi ka Salan", quantity: 1 },
            { id: "303", name: "Double ka Meetha", quantity: 1 },
        ],
        totalPrice: 890,
        rating: 4,
    },
    {
        id: "4",
        restaurantName: "Burger King",
        dateTime: "15 Oct 2023 • 01:15 PM",
        status: "Delivered",
        items: [
            { id: "401", name: "Whopper Jr. Veg", quantity: 1 },
            { id: "402", name: "Large Fries", quantity: 1 },
            { id: "403", name: "Pepsi", quantity: 1 },
        ],
        totalPrice: 320,
    },
    {
        id: "5",
        restaurantName: "Punjabi Dhaba",
        dateTime: "10 Oct 2023 • 07:00 PM",
        status: "Cancelled",
        items: [
            { id: "501", name: "Paneer Butter Masala", quantity: 1 },
            { id: "502", name: "Garlic Naan", quantity: 2 },
        ],
        totalPrice: 540,
    },
];

const STATUS_COLORS: Record<string, string> = {
    Preparing: PRIMARY_CONTAINER,
    "On the Way": "#2196F3",
    Delivered: SECONDARY,
    Cancelled: "#BA1A1A",
};

const OrderStatusBadge = ({ status }: { status: string }) => (
    <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[status] }]} />
        <Text style={[styles.statusBadgeText, { color: STATUS_COLORS[status] }]}>
            {status}
        </Text>
    </View>
);

const ActiveOrderCard = ({ order }: { order: ActiveOrder }) => {
    const navigation = useNavigation<NavigationProp>();
    const itemsText = order.items
        .map((item) => `${item.quantity}x ${item.name}`)
        .join(", ");

    return (
        <View style={styles.orderCard}>
            <View style={styles.orderBody}>
                <View style={styles.activeImage}>
                    <MaterialCommunityIcons
                        name="silverware"
                        size={32}
                        color={ON_SURFACE_VARIANT}
                    />
                </View>
                <View style={styles.orderInfo}>
                    <View style={styles.orderHeaderRow}>
                        <Text style={styles.restaurantName}>
                            {order.restaurantName}
                        </Text>
                    </View>
                    <OrderStatusBadge status={order.status} />
                    <Text style={styles.itemsText} numberOfLines={1}>
                        {itemsText}
                    </Text>
                </View>
            </View>
            <View style={styles.cardDivider} />
            <View style={styles.etaRow}>
                <View>
                    <Text style={styles.etaLabel}>ESTIMATED ARRIVAL</Text>
                    <Text style={styles.etaValue}>
                        {order.estimatedArrival}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.trackButton}
                    onPress={() => navigation.navigate("TrackMyOrder")}
                >
                    <Text style={styles.trackButtonText}>Track Order</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const PastOrderCard = ({ order }: { order: PastOrder }) => {
    const navigation = useNavigation<NavigationProp>();
    const itemsText = order.items
        .map((item) => `${item.quantity}x ${item.name}`)
        .join(", ");
    const isCancelled = order.status === "Cancelled";

    return (
        <View style={[styles.orderCard, isCancelled && styles.cancelledCard]}>
            <View style={styles.pastTopRow}>
                <View style={styles.pastLeft}>
                    <View style={[styles.pastImage, isCancelled && styles.cancelledImage]}>
                        <MaterialCommunityIcons
                            name="silverware"
                            size={24}
                            color={ON_SURFACE_VARIANT}
                        />
                    </View>
                    <View>
                        <Text style={styles.restaurantName}>
                            {order.restaurantName}
                        </Text>
                        <Text style={styles.pastDate}>
                            {order.dateTime}
                        </Text>
                    </View>
                </View>
                <View style={styles.pastRight}>
                    <View
                        style={[
                            styles.statusBadgePill,
                            {
                                backgroundColor: isCancelled
                                    ? "#FFDAD6"
                                    : `${SECONDARY_CONTAINER}33`,
                                borderColor: isCancelled
                                    ? "#FFDAD699"
                                    : `${SECONDARY_CONTAINER}66`,
                            },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={
                                isCancelled
                                    ? "cancel"
                                    : "check-circle"
                            }
                            size={14}
                            color={
                                isCancelled ? "#BA1A1A" : SECONDARY
                            }
                        />
                        <Text
                            style={[
                                styles.statusPillText,
                                {
                                    color: isCancelled
                                        ? "#BA1A1A"
                                        : SECONDARY,
                                },
                            ]}
                        >
                            {order.status}
                        </Text>
                    </View>
                    <Text style={styles.pastPrice}>₹{order.totalPrice}</Text>
                </View>
            </View>

            <View style={styles.pastDivider}>
                <Text style={styles.itemsText}>{itemsText}</Text>
            </View>

            <View style={styles.pastActions}>
                {order.rating ? (
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                            <MaterialCommunityIcons
                                key={s}
                                name={s <= order.rating! ? "star" : "star-outline"}
                                size={16}
                                color={
                                    s <= order.rating!
                                        ? PRIMARY_CONTAINER
                                        : OUTLINE_VARIANT
                                }
                            />
                        ))}
                        <Text style={styles.ratedText}>
                            Rated {order.rating}.0
                        </Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.rateButton}
                        onPress={() =>
                            !isCancelled &&
                            navigation.navigate("ReviewRating", {
                                restaurantName: order.restaurantName,
                                orderNumber: order.id,
                                deliveredTime: order.dateTime,
                                items: order.items,
                                totalPrice: order.totalPrice,
                            })
                        }
                    >
                        <MaterialCommunityIcons
                            name="star"
                            size={16}
                            color={PRIMARY_CONTAINER}
                        />
                        <Text style={styles.rateButtonText}>
                            {isCancelled ? "" : "Rate your experience"}
                        </Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.reorderBtn}>
                    <MaterialCommunityIcons
                        name="replay"
                        size={18}
                        color="#5F1900"
                    />
                    <Text style={styles.reorderBtnText}>
                        {isCancelled ? "Retry" : "Reorder"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const OrdersScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const [activeTab, setActiveTab] = useState<"Active" | "Past">("Active");
    const [filter, setFilter] = useState<string>("All Orders");

    const filters = ["All Orders", "Active", "Cancelled"];

    const filteredOrders =
        filter === "All Orders"
            ? PAST_ORDERS
            : filter === "Cancelled"
              ? PAST_ORDERS.filter((o) => o.status === "Cancelled")
              : PAST_ORDERS.filter((o) => o.status === "Delivered");

    const renderActiveTab = () => (
        <View style={styles.tabContent}>
            {ACTIVE_ORDERS.length > 0 ? (
                <>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Text style={styles.sectionTitle}>
                                In Progress
                            </Text>
                            <View style={styles.orderCountBadge}>
                                <Text style={styles.orderCountText}>
                                    {ACTIVE_ORDERS.length} Order
                                </Text>
                            </View>
                        </View>
                    </View>
                    {ACTIVE_ORDERS.map((order) => (
                        <ActiveOrderCard key={order.id} order={order} />
                    ))}
                </>
            ) : (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons
                        name="clipboard-list-outline"
                        size={64}
                        color={OUTLINE_VARIANT}
                    />
                    <Text style={styles.emptyTitle}>No Active Orders</Text>
                    <Text style={styles.emptySubtitle}>
                        Your active orders will appear here
                    </Text>
                </View>
            )}

            <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>Recent History</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {PAST_ORDERS.slice(0, 2).map((order) => (
                <PastOrderCard key={order.id} order={order} />
            ))}
        </View>
    );

    const renderPastTab = () => (
        <View style={styles.tabContent}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterRow}
                contentContainerStyle={styles.filterContent}
            >
                {filters.map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[
                            styles.filterChip,
                            filter === f && styles.filterChipActive,
                        ]}
                        onPress={() => setFilter(f)}
                    >
                        <Text
                            style={[
                                styles.filterChipText,
                                filter === f && styles.filterChipTextActive,
                            ]}
                        >
                            {f}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            {filteredOrders.map((order) => (
                <PastOrderCard key={order.id} order={order} />
            ))}
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.headerBtn}
                >
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={24}
                        color={ON_SURFACE}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Orders</Text>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.headerBtn}>
                        <MaterialCommunityIcons
                            name="magnify"
                            size={24}
                            color={ON_SURFACE}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerBtn}>
                        <MaterialCommunityIcons
                            name="bell-outline"
                            size={24}
                            color={ON_SURFACE}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => setActiveTab("Active")}
                >
                    <Text
                        style={[
                            styles.tabButtonText,
                            activeTab === "Active" &&
                                styles.tabButtonTextActive,
                        ]}
                    >
                        Active
                    </Text>
                    {activeTab === "Active" && (
                        <View style={styles.tabActiveIndicator} />
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => setActiveTab("Past")}
                >
                    <Text
                        style={[
                            styles.tabButtonText,
                            activeTab === "Past" &&
                                styles.tabButtonTextActive,
                        ]}
                    >
                        Past
                    </Text>
                    {activeTab === "Past" && (
                        <View style={styles.tabActiveIndicator} />
                    )}
                </TouchableOpacity>
            </View>

            <FlatList
                data={["content"]}
                renderItem={() =>
                    activeTab === "Active"
                        ? renderActiveTab()
                        : renderPastTab()
                }
                keyExtractor={() => "content"}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

export default OrdersScreen;

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
    },
    headerBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 28,
    },
    tabBar: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: SURFACE_VARIANT,
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        position: "relative",
    },
    tabButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    tabButtonTextActive: {
        color: PRIMARY,
    },
    tabActiveIndicator: {
        position: "absolute",
        bottom: -1,
        left: "25%",
        right: "25%",
        height: 3,
        backgroundColor: PRIMARY,
        borderRadius: 999,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    tabContent: {
        gap: 0,
    },
    sectionHeader: {
        marginTop: 24,
        marginBottom: 12,
    },
    sectionTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 28,
    },
    orderCountBadge: {
        backgroundColor: SECONDARY_CONTAINER,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
    },
    orderCountText: {
        fontSize: 11,
        fontWeight: "500",
        color: ON_SURFACE,
        letterSpacing: 0.5,
        lineHeight: 16,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: "600",
        color: PRIMARY,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    orderCard: {
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: SURFACE_VARIANT,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    cancelledCard: {
        opacity: 0.8,
    },
    orderBody: {
        flexDirection: "row",
        gap: 12,
    },
    activeImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: SURFACE_CONTAINER,
        justifyContent: "center",
        alignItems: "center",
    },
    orderInfo: {
        flex: 1,
    },
    orderHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    restaurantName: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 28,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusBadgeText: {
        fontSize: 14,
        fontWeight: "600",
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    itemsText: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        marginTop: 4,
    },
    cardDivider: {
        height: 1,
        backgroundColor: SURFACE_VARIANT,
        marginVertical: 12,
    },
    etaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    etaLabel: {
        fontSize: 11,
        fontWeight: "500",
        color: ON_SURFACE_VARIANT,
        lineHeight: 16,
        letterSpacing: 0.5,
    },
    etaValue: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 28,
    },
    trackButton: {
        backgroundColor: PRIMARY_CONTAINER,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: PRIMARY_CONTAINER,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    trackButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#5F1900",
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    filterRow: {
        marginBottom: 12,
    },
    filterContent: {
        gap: 8,
        flexDirection: "row",
    },
    filterChip: {
        paddingHorizontal: 24,
        paddingVertical: 8,
        backgroundColor: SURFACE_CONTAINER_HIGH,
        borderRadius: 999,
    },
    filterChipActive: {
        backgroundColor: PRIMARY_CONTAINER,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    filterChipTextActive: {
        color: "#5F1900",
    },
    pastTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    pastLeft: {
        flexDirection: "row",
        gap: 12,
        flex: 1,
    },
    pastImage: {
        width: 64,
        height: 64,
        borderRadius: 8,
        backgroundColor: SURFACE_CONTAINER,
        justifyContent: "center",
        alignItems: "center",
    },
    cancelledImage: {
        opacity: 0.5,
    },
    pastDate: {
        fontSize: 11,
        fontWeight: "500",
        color: ON_SURFACE_VARIANT,
        lineHeight: 16,
        letterSpacing: 0.5,
        marginTop: 4,
    },
    pastRight: {
        alignItems: "flex-end",
        marginLeft: 12,
    },
    statusBadgePill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    statusPillText: {
        fontSize: 11,
        fontWeight: "500",
        lineHeight: 16,
        letterSpacing: 0.5,
    },
    pastPrice: {
        fontSize: 20,
        fontWeight: "700",
        color: ON_SURFACE,
        lineHeight: 28,
        marginTop: 8,
    },
    pastDivider: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: SURFACE_VARIANT,
        marginTop: 12,
        paddingVertical: 12,
        marginBottom: 12,
    },
    pastActions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    starsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },
    ratedText: {
        fontSize: 11,
        fontWeight: "500",
        color: ON_SURFACE_VARIANT,
        lineHeight: 16,
        letterSpacing: 0.5,
        marginLeft: 4,
    },
    rateButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    rateButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: PRIMARY_CONTAINER,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    reorderBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: PRIMARY_CONTAINER,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        shadowColor: PRIMARY_CONTAINER,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    reorderBtnText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#5F1900",
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 48,
        gap: 8,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 28,
    },
    emptySubtitle: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
    },
});
