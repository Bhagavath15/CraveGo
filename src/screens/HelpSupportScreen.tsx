import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PRIMARY = "#FF6B35";
const PRIMARY_CONTAINER = "#FF6B35";
const BG = "#FCF9F8";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";
const SURFACE_LOWEST = "#FFFFFF";
const SURFACE_CONTAINER = "#F0EDED";
const OUTLINE_VARIANT = "#E1BFB5";
const OUTLINE = "#8D7168";

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
                    <MaterialCommunityIcons name="arrow-left" size={24} color={ON_SURFACE} />
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
                    <MaterialCommunityIcons name="magnify" size={20} color={OUTLINE} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search help articles..."
                        placeholderTextColor={OUTLINE}
                        editable={false}
                    />
                </View>

                <Text style={styles.sectionTitle}>Browse Categories</Text>
                <View style={styles.categoriesSection}>
                    {CATEGORIES.map((cat, i) => (
                        <TouchableOpacity key={i} onPress={handleComingSoon} style={styles.categoryCard}>
                            <View style={styles.categoryIconBg}>
                                <MaterialCommunityIcons name={cat.icon} size={24} color={PRIMARY} />
                            </View>
                            <View style={styles.categoryInfo}>
                                <Text style={styles.categoryTitle}>{cat.title}</Text>
                                <Text style={styles.categoryDesc}>{cat.description}</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={OUTLINE_VARIANT} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.faqSection}>
                    <Text style={styles.sectionTitle}>Top FAQs</Text>
                    {FAQ_ITEMS.map((faq, i) => (
                        <TouchableOpacity key={i} onPress={handleComingSoon} style={styles.faqItem}>
                            <Text style={styles.faqQuestion}>{faq.question}</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={OUTLINE_VARIANT} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity onPress={handleComingSoon} style={styles.liveChatFab}>
                <MaterialCommunityIcons name="chat" size={22} color={SURFACE_LOWEST} />
                <Text style={styles.liveChatText}>Live Chat</Text>
            </TouchableOpacity>
        </View>
    );
};

export default HelpSupportScreen;

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
        paddingBottom: 100,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: ON_SURFACE,
        lineHeight: 36,
        marginTop: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        marginTop: 4,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        marginBottom: 24,
        opacity: 0.6,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: ON_SURFACE,
        lineHeight: 24,
        padding: 0,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 28,
        marginBottom: 12,
    },
    categoriesSection: {
        gap: 8,
        marginBottom: 24,
    },
    categoryCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: SURFACE_LOWEST,
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    categoryIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#FFDBD033",
        justifyContent: "center",
        alignItems: "center",
    },
    categoryInfo: {
        flex: 1,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 24,
    },
    categoryDesc: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        marginTop: 1,
    },
    faqSection: {
        marginBottom: 24,
    },
    faqItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: SURFACE_LOWEST,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    faqQuestion: {
        fontSize: 16,
        fontWeight: "400",
        color: ON_SURFACE,
        lineHeight: 24,
        flex: 1,
        marginRight: 8,
    },
    liveChatFab: {
        position: "absolute",
        bottom: 24,
        right: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: PRIMARY_CONTAINER,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 999,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    liveChatText: {
        fontSize: 16,
        fontWeight: "600",
        color: SURFACE_LOWEST,
        lineHeight: 24,
    },
});
