import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

import {
    NotificationItem,
    getNotificationsList,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
} from "../api/notification";
import Skeleton from "../components/Skeleton";

const PRIMARY = "#FF6B35";
const SECONDARY = "#006D37";
const BG = "#FCF9F8";
const SURFACE_LOWEST = "#FFFFFF";
const SURFACE_CONTAINER_HIGH = "#EAE7E7";
const OUTLINE_VARIANT = "#E1BFB5";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";

const TYPE_ICONS: Record<string, string> = {
    ORDER: "clipboard-list-outline",
    PAYMENT: "credit-card-outline",
    COUPON: "brightness-percent",
    PROMOTION: "sale-outline",
    SYSTEM: "cog-outline",
};

const TYPE_COLORS: Record<string, string> = {
    ORDER: PRIMARY,
    PAYMENT: "#1976D2",
    COUPON: SECONDARY,
    PROMOTION: "#E91E63",
    SYSTEM: ON_SURFACE_VARIANT,
};

const timeAgo = (dateStr: string) => {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = Math.max(0, now - then);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const NotificationsScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const pageRef = useRef(1);
    const hasMoreRef = useRef(true);

    const fetchPage = useCallback(async (page: number, isRefresh = false) => {
        try {
            const res = await getNotificationsList(page, 20);
            if (res.success) {
                if (page === 1) {
                    setNotifications(res.data);
                } else {
                    setNotifications(prev => [...prev, ...res.data]);
                }
                hasMoreRef.current = page < (res.pagination?.pages ?? 1);
                pageRef.current = page;
            }
        } catch { }
    }, []);

    const loadInitial = useCallback(async () => {
        setLoading(true);
        await fetchPage(1);
        setLoading(false);
    }, [fetchPage]);

    useEffect(() => { loadInitial(); }, [loadInitial]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchPage(1);
        setRefreshing(false);
    }, [fetchPage]);

    const onEndReached = useCallback(async () => {
        if (loadingMore || !hasMoreRef.current) return;
        setLoadingMore(true);
        await fetchPage(pageRef.current + 1);
        setLoadingMore(false);
    }, [loadingMore, fetchPage]);

    const handlePress = useCallback(async (item: NotificationItem) => {
        if (!item.isRead) {
            try { await markNotificationRead(item._id); } catch { }
            setNotifications(prev =>
                prev.map(n => n._id === item._id ? { ...n, isRead: true } : n)
            );
        }
        if (item.type === "ORDER" || item.type === "PAYMENT") {
            const orderId = item.data?.orderId || item.data?.order;
            if (orderId) {
                (navigation as any).navigate("TrackMyOrder", { orderId });
            }
        }
    }, []);

    const handleMarkAllRead = useCallback(() => {
        Alert.alert("Mark all as read", "Mark all notifications as read?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Mark All",
                onPress: async () => {
                    try {
                        await markAllNotificationsRead();
                        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                    } catch { }
                },
            },
        ]);
    }, []);

    const handleDelete = useCallback((id: string) => {
        Alert.alert("Delete", "Delete this notification?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteNotification(id);
                        setNotifications(prev => prev.filter(n => n._id !== id));
                    } catch { }
                },
            },
        ]);
    }, []);

    const renderItem = useCallback(({ item }: { item: NotificationItem }) => {
        const icon = TYPE_ICONS[item.type] || "bell-outline";
        const color = TYPE_COLORS[item.type] || ON_SURFACE_VARIANT;
        return (
            <TouchableOpacity
                style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}
                onPress={() => handlePress(item)}
                onLongPress={() => handleDelete(item._id)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
                    <MaterialCommunityIcons name={icon} size={22} color={color} />
                </View>
                <View style={styles.notifContent}>
                    <View style={styles.notifHeader}>
                        <Text
                            style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]}
                            numberOfLines={1}
                        >
                            {item.title}
                        </Text>
                        <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
                    </View>
                    <Text style={styles.notifMessage} numberOfLines={2}>
                        {item.message}
                    </Text>
                </View>
                {!item.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    }, [handlePress, handleDelete]);

    const renderHeader = () => {
        if (notifications.length === 0) return null;
        return (
            <TouchableOpacity style={styles.markAllRow} onPress={handleMarkAllRead}>
                <MaterialCommunityIcons name="check-all" size={18} color={PRIMARY} />
                <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={PRIMARY} />
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyState}>
                <MaterialCommunityIcons name="bell-off-outline" size={64} color={OUTLINE_VARIANT} />
                <Text style={styles.emptyTitle}>No notifications</Text>
                <Text style={styles.emptySubtitle}>
                    You're all caught up! We'll notify you when something happens.
                </Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={ON_SURFACE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.headerBtn} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <View key={i} style={styles.skeletonRow}>
                            <Skeleton width={40} height={40} borderRadius={20} />
                            <View style={{ flex: 1, gap: 4 }}>
                                <Skeleton width="70%" height={14} />
                                <Skeleton width="40%" height={12} />
                            </View>
                        </View>
                    ))}
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    ListHeaderComponent={renderHeader}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[PRIMARY]}
                            tintColor={PRIMARY}
                        />
                    }
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.3}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    headerBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: BG,
        borderBottomWidth: 1,
        borderBottomColor: `${OUTLINE_VARIANT}33`,
    },
    headerBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
    },
    loadingContainer: {
        flex: 1,
        padding: 16,
        gap: 16,
    },
    skeletonRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 4,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 24,
        flexGrow: 1,
    },
    markAllRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
        marginBottom: 4,
    },
    markAllText: {
        fontSize: 13,
        fontWeight: "600",
        color: PRIMARY,
    },
    notifCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: `${OUTLINE_VARIANT}33`,
    },
    notifCardUnread: {
        backgroundColor: `${PRIMARY}08`,
        borderColor: `${PRIMARY}33`,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    notifContent: {
        flex: 1,
    },
    notifHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    notifTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE,
        flex: 1,
        marginRight: 8,
    },
    notifTitleUnread: {
        fontWeight: "700",
        color: ON_SURFACE,
    },
    notifTime: {
        fontSize: 11,
        color: ON_SURFACE_VARIANT,
    },
    notifMessage: {
        fontSize: 13,
        color: ON_SURFACE_VARIANT,
        marginTop: 4,
        lineHeight: 18,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: PRIMARY,
        marginLeft: 8,
    },
    footerLoader: {
        paddingVertical: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
    },
    emptySubtitle: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        textAlign: "center",
    },
});
