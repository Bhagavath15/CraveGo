import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/types";
import { colors, spacing, typography, radius, shadows } from "../theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Category {
    icon: string;
    title: string;
    description: string;
}

const CATEGORIES: Category[] = [
    { icon: "package-variant-closed", title: "Order Issues", description: "Missing items, late delivery, or incorrect orders." },
    { icon: "wallet-outline", title: "Payment & Refunds", description: "Refund status, double charges, or coupon issues." },
    { icon: "star-circle-outline", title: "CraveGo Gold", description: "Membership benefits, renewal, and exclusive offers." },
    { icon: "account-cog-outline", title: "Account Settings", description: "Privacy, address management, and login issues." },
];

const FAQ_ITEMS: { question: string }[] = [
    { question: "How do I track my delivery executive?" },
    { question: "What is the '60% OFF' CraveGo promise?" },
    { question: "Can I change my delivery address after ordering?" },
    { question: "How can I become a CraveGo Partner?" },
];

const HelpSupportScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<Nav>();

    const handleComingSoon = () => {
        Alert.alert("Coming Soon", "This feature will be available soon.");
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help Center</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={styles.heroTitle}>How can we help?</Text>
                <Text style={styles.heroSubtitle}>Browse topics below or visit Orders for order-specific help.</Text>

                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color={colors.outline} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search help articles..."
                        placeholderTextColor={colors.outline}
                        editable={false}
                    />
                </View>

                <Text style={styles.sectionTitle}>Browse Categories</Text>
                <View style={styles.categoriesSection}>
                    {CATEGORIES.map((cat, i) => (
                        <TouchableOpacity key={i} onPress={handleComingSoon} style={styles.categoryCard}>
                            <View style={styles.categoryIconBg}>
                                <MaterialCommunityIcons name={cat.icon} size={24} color={colors.primary} />
                            </View>
                            <View style={styles.categoryInfo}>
                                <Text style={styles.categoryTitle}>{cat.title}</Text>
                                <Text style={styles.categoryDesc}>{cat.description}</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.outlineVariant} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.faqSection}>
                    <Text style={styles.sectionTitle}>Top FAQs</Text>
                    {FAQ_ITEMS.map((faq, i) => (
                        <TouchableOpacity key={i} onPress={handleComingSoon} style={styles.faqItem}>
                            <Text style={styles.faqQuestion}>{faq.question}</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.outlineVariant} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity onPress={handleComingSoon} style={styles.liveChatFab}>
                <MaterialCommunityIcons name="chat" size={22} color={colors.surface} />
                <Text style={styles.liveChatText}>Live Chat</Text>
            </TouchableOpacity>
        </View>
    );
};

export default HelpSupportScreen;

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
        paddingBottom: 100,
    },
    heroTitle: {
        fontSize: typography.fontSize.display,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.display,
        marginTop: spacing.sm,
    },
    heroSubtitle: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.md,
        marginTop: spacing.xs,
        marginBottom: spacing.md,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        gap: 12,
        marginBottom: spacing.lg,
        opacity: 0.6,
    },
    searchInput: {
        flex: 1,
        fontSize: typography.fontSize.lg,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xl,
        padding: 0,
    },
    sectionTitle: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xxl,
        marginBottom: 12,
    },
    categoriesSection: {
        gap: 8,
        marginBottom: spacing.lg,
    },
    categoryCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: radius.md,
        gap: 12,
    },
    categoryIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primaryLight + "33",
        justifyContent: "center",
        alignItems: "center",
    },
    categoryInfo: {
        flex: 1,
    },
    categoryTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xl,
    },
    categoryDesc: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.md,
        marginTop: 1,
    },
    faqSection: {
        marginBottom: spacing.lg,
    },
    faqItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: radius.md,
        marginBottom: spacing.sm,
    },
    faqQuestion: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.regular,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xl,
        flex: 1,
        marginRight: 8,
    },
    liveChatFab: {
        position: "absolute",
        bottom: spacing.lg,
        right: spacing.md,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: radius.full,
        ...shadows.floating,
    },
    liveChatText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.surface,
        lineHeight: typography.lineHeight.xl,
    },
});
