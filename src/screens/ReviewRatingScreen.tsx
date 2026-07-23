import { useRef, useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types/types";
import { rateOrder } from "../api/order";
import { colors, spacing, typography, radius, shadows, sizes } from "../theme";

type ScreenRoute = RouteProp<RootStackParamList, "ReviewRating">;

const RATING_LABELS: Record<number, string> = {
    1: "Very Poor",
    2: "Poor",
    3: "Average",
    4: "Very Good",
    5: "Excellent!",
};

const ReviewRatingScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute<ScreenRoute>();
    const { restaurantName, orderId, deliveredTime } = route.params;

    const [overallRating, setOverallRating] = useState(0);
    const [foodRating, setFoodRating] = useState(0);
    const [speedRating, setSpeedRating] = useState(0);
    const [pkgRating, setPkgRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            await rateOrder(orderId, {
                overallRating,
                foodRating,
                speedRating,
                packagingRating: pkgRating,
                reviewText,
            });
            navigation.goBack();
        } finally {
            setSubmitting(false);
        }
    };
    const [photos, setPhotos] = useState<string[]>([
        "../assets/images/southIndian.png",
        "../assets/images/chickenBriyani.jpg",
    ]);

    const renderStars = (
        current: number,
        setter: (v: number) => void,
        size: number
    ) => {
        return [1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity key={s} onPress={() => setter(s === current ? 0 : s)}>
                <MaterialCommunityIcons
                    name={s <= current ? "star" : "star-outline"}
                    size={size}
                    color={s <= current ? colors.rating : colors.outlineVariant}
                />
            </TouchableOpacity>
        ));
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Rate Your Order</Text>
                    <View style={styles.avatar}>
                        <Image
                            source={require("../assets/images/rider-arjun.png")}
                            style={styles.avatarImage}
                        />
                    </View>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.restaurantCard}>
                    <Image
                        source={require("../assets/images/southIndian.png")}
                        style={styles.restaurantImage}
                    />
                    <View style={styles.restaurantInfo}>
                        <Text style={styles.restaurantName}>{restaurantName}</Text>
                        <Text style={styles.orderInfo}>
                            Order #{orderId} • Delivered {deliveredTime}
                        </Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>How was your meal?</Text>
                    <View style={styles.bigStarsRow}>
                        {renderStars(overallRating, setOverallRating, 36)}
                    </View>
                    <Text
                        style={[
                            styles.ratingLabel,
                            overallRating > 0 && styles.ratingLabelActive,
                        ]}
                    >
                        {overallRating > 0
                            ? RATING_LABELS[overallRating]
                            : "Tap to rate"}
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.detailHeader}>Detailed Feedback</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Food Quality</Text>
                        <View style={styles.detailStars}>
                            {renderStars(foodRating, setFoodRating, 20)}
                        </View>
                    </View>
                    <View style={[styles.detailRow, styles.detailRowBorder]}>
                        <Text style={styles.detailLabel}>Delivery Speed</Text>
                        <View style={styles.detailStars}>
                            {renderStars(speedRating, setSpeedRating, 20)}
                        </View>
                    </View>
                    <View style={[styles.detailRow, styles.detailRowBorder]}>
                        <Text style={styles.detailLabel}>Packaging</Text>
                        <View style={styles.detailStars}>
                            {renderStars(pkgRating, setPkgRating, 20)}
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Write a review</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder={`Tell us what you loved about ${restaurantName}...`}
                        placeholderTextColor={`${colors.textSecondary}80`}
                        multiline
                        numberOfLines={5}
                        value={reviewText}
                        onChangeText={setReviewText}
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Add photos of your food</Text>
                    <View style={styles.photoGrid}>
                        <TouchableOpacity style={styles.uploadBtn}>
                            <MaterialCommunityIcons
                                name="camera-plus-outline"
                                size={32}
                                color={colors.primary}
                            />
                            <Text style={styles.uploadText}>Upload</Text>
                        </TouchableOpacity>
                        {photos.map((_, i) => (
                            <View key={i} style={styles.photoPreview}>
                                <Image
                                    source={
                                        i === 0
                                            ? require("../assets/images/southIndian.png")
                                            : require("../assets/images/chickenBriyani.jpg")
                                    }
                                    style={styles.photoImage}
                                />
                                <TouchableOpacity
                                    style={styles.photoClose}
                                    onPress={() =>
                                        setPhotos((p) => p.filter((_, j) => j !== i))
                                    }
                                >
                                    <MaterialCommunityIcons
                                        name="close"
                                        size={14}
                                        color={colors.textPrimary}
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.submitSection}>
                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
                        <Text style={styles.submitText}>{submitting ? "Submitting..." : "Submit Review"}</Text>
                        <MaterialCommunityIcons name="send" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.policyText}>
                        By submitting, you agree to CraveGo's Content Policy.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default ReviewRatingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: `${colors.outlineVariant}33`,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
    },
    backBtn: {
        width: sizes.avatar,
        height: sizes.avatar,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
        lineHeight: typography.lineHeight.xxl,
        flex: 1,
        marginLeft: 4,
    },
    avatar: {
        width: sizes.avatar,
        height: sizes.avatar,
        borderRadius: sizes.avatar / 2,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.outlineVariant,
    },
    avatarImage: {
        width: "100%",
        height: "100%",
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    restaurantCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.lg,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: `${colors.outlineVariant}33`,
        ...shadows.small,
    },
    restaurantImage: {
        width: sizes.avatarLg - sizes.iconXxl,
        height: sizes.avatarLg - sizes.iconXxl,
        borderRadius: radius.sm,
    },
    restaurantInfo: {
        flex: 1,
    },
    restaurantName: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xxxl,
    },
    orderInfo: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.normal,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: `${colors.outlineVariant}33`,
        ...shadows.small,
    },
    cardTitle: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xxl,
        marginBottom: spacing.md,
    },
    bigStarsRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: spacing.xs,
    },
    ratingLabel: {
        textAlign: "center",
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.md,
        fontStyle: "italic",
        marginTop: spacing.sm,
        height: 20,
    },
    ratingLabelActive: {
        color: colors.primary,
        fontWeight: typography.fontWeight.bold,
        fontStyle: "normal",
    },
    detailHeader: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.wider,
        textTransform: "uppercase",
        marginBottom: spacing.md,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: spacing.sm,
    },
    detailRowBorder: {
        borderTopWidth: 1,
        borderTopColor: `${colors.surfaceContainerHighest}80`,
    },
    detailLabel: {
        fontSize: typography.fontSize.lg,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.xl,
    },
    detailStars: {
        flexDirection: "row",
        gap: spacing.xs,
    },
    textArea: {
        backgroundColor: `${colors.primary}0D`,
        borderWidth: 1,
        borderColor: `${colors.outlineVariant}4D`,
        borderRadius: radius.md,
        padding: spacing.md,
        fontSize: typography.fontSize.lg,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xl,
        minHeight: 120,
        textAlignVertical: "top",
    },
    photoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.md,
    },
    uploadBtn: {
        width: 88,
        height: 88,
        borderRadius: radius.md,
        borderWidth: 2,
        borderColor: colors.outlineVariant,
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
    },
    uploadText: {
        fontSize: 11,
        fontWeight: typography.fontWeight.medium,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.sm,
        letterSpacing: typography.letterSpacing.wider,
        marginTop: spacing.xs,
    },
    photoPreview: {
        width: 88,
        height: 88,
        borderRadius: radius.md,
        overflow: "hidden",
        position: "relative",
    },
    photoImage: {
        width: "100%",
        height: "100%",
    },
    photoClose: {
        position: "absolute",
        top: spacing.xs,
        right: spacing.xs,
        backgroundColor: `${colors.surfaceContainerHighest}CC`,
        borderRadius: radius.full,
        padding: 2,
    },
    submitSection: {
        marginTop: spacing.sm,
    },
    submitBtn: {
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.md,
        paddingVertical: spacing.lg,
        borderRadius: radius.md,
        ...shadows.button,
    },
    submitText: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xxxl,
    },
    policyText: {
        textAlign: "center",
        fontSize: 11,
        fontWeight: typography.fontWeight.medium,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.sm,
        letterSpacing: typography.letterSpacing.wider,
        marginTop: spacing.sm,
        paddingHorizontal: spacing.lg,
    },
});
