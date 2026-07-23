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
import { colors, spacing, typography, radius, shadows } from "../theme";

const TYPE_ICONS: Record<string, string> = {
    ORDER: "clipboard-list-outline",
    PAYMENT: "credit-card-outline",
    COUPON: "brightness-percent",
    PROMOTION: "sale-outline",
    SYSTEM: "cog-outline",
};

const TYPE_COLORS: Record<string, string> = {
    ORDER: colors.primary,
    PAYMENT: colors.notification.payment,
    COUPON: colors.secondary,
    PROMOTION: colors.notification.promotion,
    SYSTEM: colors.textSecondary,
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
        const color = TYPE_COLORS[item.type] || colors.textSecondary;
        const isUnread = !item.isRead;
        return (
            <TouchableOpacity
                style={styles.notifCard}
                onPress={() => handlePress(item)}
                onLongPress={() => handleDelete(item._id)}
                activeOpacity={0.7}
            >
                {isUnread && <View style={styles.unreadAccent} />}
                <View style={styles.cardInner}>
                    <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
                        <MaterialCommunityIcons name={icon} size={20} color={color} />
                    </View>
                    <View style={styles.notifContent}>
                        <View style={styles.notifHeader}>
                            <Text
                                style={[styles.notifTitle, isUnread && styles.notifTitleUnread]}
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
                    {isUnread && <View style={styles.unreadDot} />}
                </View>
            </TouchableOpacity>
        );
    }, [handlePress, handleDelete]);

    const renderHeader = () => {
        if (notifications.length === 0) return null;
        return null;
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyState}>
                <MaterialCommunityIcons name="bell-off-outline" size={64} color={colors.outlineVariant} />
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
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity style={styles.headerBtn} onPress={handleMarkAllRead}>
                    <MaterialCommunityIcons name="check-all" size={22} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <View key={i} style={styles.skeletonRow}>
                            <Skeleton width={40} height={40} borderRadius={20} />
                            <View style={{ flex: 1, gap: spacing.xs }}>
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
                            colors={[colors.primary]}
                            tintColor={colors.primary}
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
        backgroundColor: colors.background,
    },
    headerBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        backgroundColor: colors.background,
    },
    headerBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    loadingContainer: {
        flex: 1,
        padding: spacing.md,
        gap: spacing.md,
    },
    skeletonRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: spacing.xs,
    },
    listContent: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.lg,
        flexGrow: 1,
    },
    notifCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        marginBottom: 10,
        overflow: "hidden",
        ...shadows.card,
        position: "relative",
    },
    unreadAccent: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        backgroundColor: colors.primary,
        borderTopLeftRadius: radius.md,
        borderBottomLeftRadius: radius.md,
    },
    cardInner: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        paddingLeft: 12,
    },
    iconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
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
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        flex: 1,
        marginRight: 8,
    },
    notifTitleUnread: {
        fontWeight: typography.fontWeight.bold,
    },
    notifTime: {
        fontSize: 11,
        color: colors.textTertiary,
        fontWeight: typography.fontWeight.medium,
    },
    notifMessage: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        lineHeight: 18,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        marginLeft: 8,
    },
    footerLoader: {
        paddingVertical: spacing.md,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.xl,
        gap: 12,
    },
    emptyTitle: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    emptySubtitle: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.md,
        textAlign: "center",
    },
});
