import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

const PRIMARY = "#FF6B35";
const BG = "#FCF9F8";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";
const SURFACE_LOWEST = "#FFFFFF";
const OUTLINE_VARIANT = "#E1BFB5";
const SECONDARY = "#006D37";
const SURFACE_CONTAINER = "#F0EDED";

const PaymentMethodsScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={ON_SURFACE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payments</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.infoBanner}>
                    <MaterialCommunityIcons name="lock-outline" size={20} color={SECONDARY} />
                    <Text style={styles.infoBannerText}>
                        Your payments are processed securely through Stripe. We do not store your card details.
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Available Options</Text>

                <View style={styles.optionCard}>
                    <View style={styles.optionIconBg}>
                        <MaterialCommunityIcons name="cash" size={24} color={PRIMARY} />
                    </View>
                    <View style={styles.optionInfo}>
                        <Text style={styles.optionLabel}>Cash on Delivery</Text>
                        <Text style={styles.optionDesc}>Pay when your order arrives</Text>
                    </View>
                </View>

                <View style={styles.optionCard}>
                    <View style={styles.optionIconBg}>
                        <MaterialCommunityIcons name="credit-card-outline" size={24} color={PRIMARY} />
                    </View>
                    <View style={styles.optionInfo}>
                        <Text style={styles.optionLabel}>Credit / Debit Card</Text>
                        <Text style={styles.optionDesc}>Visa, Mastercard, Rupay</Text>
                    </View>
                </View>

                <View style={styles.optionCard}>
                    <View style={styles.optionIconBg}>
                        <MaterialCommunityIcons name="bank-outline" size={24} color={PRIMARY} />
                    </View>
                    <View style={styles.optionInfo}>
                        <Text style={styles.optionLabel}>UPI</Text>
                        <Text style={styles.optionDesc}>Google Pay, PhonePe, Paytm</Text>
                    </View>
                </View>

                <View style={styles.noteCard}>
                    <MaterialCommunityIcons name="information-outline" size={18} color={ON_SURFACE_VARIANT} />
                    <Text style={styles.noteText}>
                        Payment method selection is available at checkout. All online payments are processed via Stripe.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default PaymentMethodsScreen;

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
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 28,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    infoBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: `${SECONDARY}12`,
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 24,
    },
    infoBannerText: {
        flex: 1,
        fontSize: 13,
        fontWeight: "400",
        color: ON_SURFACE_VARIANT,
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: ON_SURFACE,
        marginBottom: 12,
        lineHeight: 26,
    },
    optionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: SURFACE_LOWEST,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        gap: 12,
    },
    optionIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${PRIMARY}18`,
        justifyContent: "center",
        alignItems: "center",
    },
    optionInfo: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 24,
    },
    optionDesc: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        marginTop: 1,
    },
    noteCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        backgroundColor: SURFACE_CONTAINER,
        padding: 12,
        borderRadius: 12,
        marginTop: 16,
    },
    noteText: {
        flex: 1,
        fontSize: 12,
        fontWeight: "400",
        color: ON_SURFACE_VARIANT,
        lineHeight: 16,
    },
});
