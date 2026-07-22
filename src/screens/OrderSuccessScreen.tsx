import { useEffect, useRef, useState, useCallback } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";

const PRIMARY = "#FF6B35";
const SECONDARY = "#006D37";
const BG = "#FCF9F8";
const AUTO_NAVIGATE_DELAY = 4000;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "OrderSuccess">;

const OrderSuccessScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { orderId, orderNumber, restaurantName, totalPrice, items } = route.params;
    const [countdown, setCountdown] = useState(4);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const navigatedRef = useRef(false);

    const handleTrackOrder = useCallback(() => {
        if (navigatedRef.current) return;
        navigatedRef.current = true;
        if (timerRef.current) clearInterval(timerRef.current);
        navigation.navigate("TrackMyOrder", {
            orderId,
            orderNumber,
            restaurantName,
            totalPrice,
            items,
        });
    }, [navigation, orderId, orderNumber, restaurantName, totalPrice, items]);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    handleTrackOrder();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [handleTrackOrder]);

    return (
        <View style={styles.container}>
            <View style={styles.bgGlow} />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.successImage}>
                    <View style={styles.checkCircle}>
                        <MaterialCommunityIcons
                            name="check"
                            size={56}
                            color="#FFF"
                        />
                    </View>
                </View>

                <Text style={styles.title}>Order Placed Successfully!</Text>
                <Text style={styles.subtitle}>
                    Restaurant has started preparing your order.
                </Text>
                <View style={styles.orderIdRow}>
                    <MaterialCommunityIcons name="receipt" size={16} color={PRIMARY} />
                    <Text style={styles.orderIdText}>Order #{orderNumber}</Text>
                </View>

                <View style={styles.summaryCard}>
                    <View style={styles.summaryLeft}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons
                                name="silverware"
                                size={24}
                                color={SECONDARY}
                            />
                        </View>
                        <View>
                            <Text style={styles.summaryLabel}>
                                Estimated Delivery
                            </Text>
                            <Text style={styles.summaryValue}>
                                25 - 35 mins
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.trackButton}
                    onPress={handleTrackOrder}
                >
                    <MaterialCommunityIcons
                        name="map"
                        size={20}
                        color="#FFF"
                    />
                    <Text style={styles.trackButtonText}>
                        Track My Order
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.homeButton}
                    onPress={() => {
                        if (timerRef.current) clearInterval(timerRef.current);
                        navigation.navigate("Home");
                    }}
                >
                    <Text style={styles.homeButtonText}>Back to Home</Text>
                </TouchableOpacity>

                <Text style={styles.autoHint}>
                    Auto-navigating in {countdown}s...
                </Text>
            </ScrollView>

            <Text style={styles.brandFooter}>CraveGo</Text>
        </View>
    );
};

export default OrderSuccessScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    bgGlow: {
        position: "absolute",
        top: "30%",
        left: "10%",
        right: "10%",
        height: 300,
        borderRadius: 150,
        backgroundColor: `${PRIMARY}0D`,
    },
    scrollContent: {
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 80,
        paddingBottom: 48,
    },
    successImage: {
        width: 160,
        height: 160,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    checkCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: SECONDARY,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1B1C1C",
        lineHeight: 36,
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#594139",
        lineHeight: 24,
        textAlign: "center",
        marginBottom: 16,
    },
    orderIdRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 32,
    },
    orderIdText: {
        fontSize: 16,
        fontWeight: "700",
        color: PRIMARY,
        lineHeight: 24,
    },
    summaryCard: {
        backgroundColor: "#F6F3F2",
        borderRadius: 12,
        padding: 16,
        width: "100%",
        marginBottom: 32,
    },
    summaryLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconBox: {
        backgroundColor: `${SECONDARY}33`,
        padding: 8,
        borderRadius: 8,
    },
    summaryLabel: {
        fontSize: 11,
        fontWeight: "500",
        color: "#594139",
        lineHeight: 16,
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1B1C1C",
        lineHeight: 28,
    },
    trackButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: PRIMARY,
        paddingVertical: 16,
        borderRadius: 12,
        width: "100%",
        marginBottom: 12,
    },
    trackButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFF",
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    homeButton: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 12,
        width: "100%",
        borderWidth: 1.5,
        borderColor: "#E1BFB5",
        marginBottom: 12,
    },
    homeButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1B1C1C",
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    autoHint: {
        fontSize: 13,
        color: "#8D7168",
        lineHeight: 18,
    },
    brandFooter: {
        textAlign: "center",
        fontSize: 24,
        fontWeight: "800",
        color: "#832600",
        letterSpacing: -0.5,
        paddingBottom: 24,
        opacity: 0.4,
    },
});
