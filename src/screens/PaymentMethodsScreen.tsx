import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

const PRIMARY = "#FF6B35";
const PRIMARY_CONTAINER = "#FF6B35";
const PRIMARY_FIXED = "#FFDBD0";
const BG = "#FCF9F8";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";
const SURFACE_LOWEST = "#FFFFFF";
const SURFACE_CONTAINER = "#F0EDED";
const SURFACE_CONTAINER_LOW = "#F6F3F2";
const OUTLINE_VARIANT = "#E1BFB5";
const OUTLINE = "#8D7168";
const ERROR = "#BA1A1A";

interface SavedCard {
    id: string;
    type: string;
    brand: string;
    lastFour: string;
    isDefault?: boolean;
}

interface Wallet {
    id: string;
    name: string;
    icon: string;
    balance?: string;
    status: string;
}

const SAVED_CARDS: SavedCard[] = [
    { id: "1", type: "visa", brand: "Visa Debit Card", lastFour: "4242", isDefault: true },
    { id: "2", type: "mastercard", brand: "Mastercard Credit", lastFour: "8812" },
];

const WALLETS: Wallet[] = [
    { id: "1", name: "PhonePe", icon: "phone", status: "Link Account" },
    { id: "2", name: "Google Pay", icon: "google", status: "", balance: "₹1,240.50" },
];

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
                <TouchableOpacity style={styles.backBtn}>
                    <MaterialCommunityIcons name="dots-vertical" size={24} color={ON_SURFACE} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Saved Cards</Text>
                    <TouchableOpacity>
                        <Text style={styles.manageText}>Manage</Text>
                    </TouchableOpacity>
                </View>

                {SAVED_CARDS.map((card) => (
                    <TouchableOpacity key={card.id} style={styles.cardItem}>
                        <View style={[styles.cardIconBg, { backgroundColor: `${PRIMARY_FIXED}4D` }]}>
                            <MaterialCommunityIcons
                                name={card.type === "visa" ? "credit-card" : "credit-card-multiple"}
                                size={24}
                                color={PRIMARY}
                            />
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardBrand}>{card.brand}</Text>
                            <Text style={styles.cardNumber}>•••• •••• •••• {card.lastFour}</Text>
                        </View>
                        {card.isDefault && (
                            <View style={styles.defaultBadge}>
                                <Text style={styles.defaultText}>Default</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>UPI Payments</Text>
                </View>

                <View style={styles.upiItem}>
                    <View style={styles.cardIconBg}>
                        <MaterialCommunityIcons name="bank" size={24} color={PRIMARY} />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardBrand}>siddharth@okaxis</Text>
                        <Text style={styles.cardNumber}>UPI ID</Text>
                    </View>
                    <MaterialCommunityIcons name="check-circle" size={22} color="#006D37" />
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Wallets</Text>
                </View>

                {WALLETS.map((wallet) => (
                    <TouchableOpacity key={wallet.id} style={styles.walletItem}>
                        <View style={[styles.cardIconBg, { backgroundColor: `${PRIMARY_FIXED}4D` }]}>
                            <MaterialCommunityIcons name={wallet.icon} size={24} color={PRIMARY} />
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardBrand}>{wallet.name}</Text>
                            {wallet.balance ? (
                                <Text style={styles.cardNumber}>Balance: {wallet.balance}</Text>
                            ) : null}
                        </View>
                        <Text style={[styles.linkText, wallet.balance ? { opacity: 0 } : {}]}>
                            {wallet.status}
                        </Text>
                        {wallet.balance ? null : (
                            <MaterialCommunityIcons name="chevron-right" size={20} color={OUTLINE_VARIANT} />
                        )}
                    </TouchableOpacity>
                ))}

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>More Options</Text>
                </View>

                <TouchableOpacity style={styles.moreOption}>
                    <MaterialCommunityIcons name="bank-outline" size={22} color={ON_SURFACE} />
                    <Text style={styles.moreOptionText}>Net Banking</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={OUTLINE_VARIANT} />
                </TouchableOpacity>

                <View style={styles.moreOption}>
                    <MaterialCommunityIcons name="cash" size={22} color={ON_SURFACE} />
                    <View style={styles.moreOptionInfo}>
                        <Text style={styles.moreOptionText}>Cash on Delivery</Text>
                        <Text style={styles.codDisabled}>Not available for this order</Text>
                    </View>
                    <MaterialCommunityIcons name="block-helper" size={20} color={ERROR} />
                </View>

                <TouchableOpacity style={styles.addPaymentBtn}>
                    <MaterialCommunityIcons name="plus" size={22} color={SURFACE_LOWEST} />
                    <Text style={styles.addPaymentText}>Add New Payment Method</Text>
                </TouchableOpacity>
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
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 24,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 28,
    },
    manageText: {
        fontSize: 14,
        fontWeight: "600",
        color: PRIMARY,
        lineHeight: 20,
    },
    cardItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: SURFACE_LOWEST,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        gap: 12,
    },
    cardIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#FFDBD033",
        justifyContent: "center",
        alignItems: "center",
    },
    cardInfo: {
        flex: 1,
    },
    cardBrand: {
        fontSize: 16,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 24,
    },
    cardNumber: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        marginTop: 1,
    },
    defaultBadge: {
        backgroundColor: "#006D371A",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
    },
    defaultText: {
        fontSize: 11,
        fontWeight: "500",
        color: "#006D37",
        lineHeight: 16,
        letterSpacing: 0.5,
    },
    upiItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: SURFACE_LOWEST,
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    walletItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: SURFACE_LOWEST,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        gap: 12,
    },
    linkText: {
        fontSize: 14,
        fontWeight: "600",
        color: PRIMARY,
        lineHeight: 20,
    },
    moreOption: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: SURFACE_LOWEST,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        gap: 12,
    },
    moreOptionInfo: {
        flex: 1,
    },
    moreOptionText: {
        fontSize: 16,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 24,
    },
    codDisabled: {
        fontSize: 12,
        color: ERROR,
        lineHeight: 16,
        marginTop: 2,
    },
    addPaymentBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: PRIMARY,
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 24,
    },
    addPaymentText: {
        fontSize: 16,
        fontWeight: "600",
        color: SURFACE_LOWEST,
        lineHeight: 24,
    },
});
