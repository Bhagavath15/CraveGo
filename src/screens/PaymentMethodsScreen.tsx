import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, typography, radius } from "../theme";

const PaymentMethodsScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payments</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.infoBanner}>
                    <MaterialCommunityIcons name="lock-outline" size={20} color={colors.secondary} />
                    <Text style={styles.infoBannerText}>
                        Your payments are processed securely through Stripe. We do not store your card details.
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Available Options</Text>

                <View style={styles.optionCard}>
                    <View style={styles.optionIconBg}>
                        <MaterialCommunityIcons name="cash" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.optionInfo}>
                        <Text style={styles.optionLabel}>Cash on Delivery</Text>
                        <Text style={styles.optionDesc}>Pay when your order arrives</Text>
                    </View>
                </View>

                <View style={styles.optionCard}>
                    <View style={styles.optionIconBg}>
                        <MaterialCommunityIcons name="credit-card-outline" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.optionInfo}>
                        <Text style={styles.optionLabel}>Credit / Debit Card</Text>
                        <Text style={styles.optionDesc}>Visa, Mastercard, Rupay</Text>
                    </View>
                </View>

                <View style={styles.optionCard}>
                    <View style={styles.optionIconBg}>
                        <MaterialCommunityIcons name="bank-outline" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.optionInfo}>
                        <Text style={styles.optionLabel}>UPI</Text>
                        <Text style={styles.optionDesc}>Google Pay, PhonePe, Paytm</Text>
                    </View>
                </View>

                <View style={styles.noteCard}>
                    <MaterialCommunityIcons name="information-outline" size={18} color={colors.textSecondary} />
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
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xxl,
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
    },
    infoBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: colors.secondary + "12",
        padding: spacing.sm,
        borderRadius: radius.md,
        marginTop: spacing.sm,
        marginBottom: spacing.lg,
    },
    infoBannerText: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.sm,
    },
    sectionTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
        lineHeight: 26,
    },
    optionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: radius.md,
        marginBottom: spacing.sm,
        gap: 12,
    },
    optionIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary + "18",
        justifyContent: "center",
        alignItems: "center",
    },
    optionInfo: {
        flex: 1,
    },
    optionLabel: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xl,
    },
    optionDesc: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.md,
        marginTop: 1,
    },
    noteCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        backgroundColor: colors.surfaceContainer,
        padding: spacing.sm,
        borderRadius: radius.md,
        marginTop: spacing.md,
    },
    noteText: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.sm,
    },
});
