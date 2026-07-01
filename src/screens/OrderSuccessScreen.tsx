
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
import { useCart } from "../context/CartContext";

const PRIMARY = "#FF6B35";
const SECONDARY = "#006D37";
const BG = "#FCF9F8";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "OrderSuccess">;

const OrderSuccessScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { itemCount } = route.params;
    const cart = useCart();

    const handleBackToHome = () => {
        cart.clearCart();
        navigation.navigate("Home");
    };

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
                    Your delicious meal is being prepared.
                </Text>
                <Text style={styles.orderNumber}>Order #CG-88219</Text>

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
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRight}>
                        <Text style={styles.summaryLabel}>Items</Text>
                        <Text style={styles.summaryValue}>
                            {itemCount}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.trackButton}>
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
                    onPress={handleBackToHome}
                >
                    <Text style={styles.homeButtonText}>Back to Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.receiptButton}>
                    <Text style={styles.receiptButtonText}>View Receipt</Text>
                </TouchableOpacity>
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
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: "700",
        color: PRIMARY,
        lineHeight: 24,
        textAlign: "center",
        marginTop: 4,
        marginBottom: 32,
    },
    summaryCard: {
        flexDirection: "row",
        alignItems: "center",
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
        flex: 1,
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
    summaryDivider: {
        width: 1,
        height: 40,
        backgroundColor: "#E1BFB5",
        marginHorizontal: 16,
    },
    summaryRight: {
        alignItems: "center",
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
        marginBottom: 24,
    },
    homeButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1B1C1C",
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    receiptButton: {
        alignItems: "center",
        paddingVertical: 8,
    },
    receiptButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: PRIMARY,
        lineHeight: 20,
        letterSpacing: 0.1,
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
