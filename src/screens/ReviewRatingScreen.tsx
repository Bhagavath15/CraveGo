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

type ScreenRoute = RouteProp<RootStackParamList, "ReviewRating">;

const PRIMARY = "#ab3500";
const PRIMARY_CONTAINER = "#FF6B35";
const ON_PRIMARY_CONTAINER = "#5F1900";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";
const OUTLINE_VARIANT = "#E1BFB5";
const SURFACE_LOWEST = "#FFFFFF";
const SURFACE_VARIANT = "#E5E2E1";
const SURFACE_CONTAINER_HIGHEST = "#E5E2E1";
const TERTIARY_FIXED_DIM = "#fabd00";
const STAR_INACTIVE = "#E1BFB5";

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
    const { restaurantName, orderNumber, deliveredTime } = route.params;

    const [overallRating, setOverallRating] = useState(0);
    const [foodRating, setFoodRating] = useState(0);
    const [speedRating, setSpeedRating] = useState(0);
    const [pkgRating, setPkgRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
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
                    color={s <= current ? TERTIARY_FIXED_DIM : STAR_INACTIVE}
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
                            color={PRIMARY}
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
                            Order #{orderNumber} • Delivered {deliveredTime}
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
                        placeholderTextColor={`${ON_SURFACE_VARIANT}80`}
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
                                color={PRIMARY}
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
                                        color={ON_SURFACE}
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.submitSection}>
                    <TouchableOpacity style={styles.submitBtn}>
                        <Text style={styles.submitText}>Submit Review</Text>
                        <MaterialCommunityIcons name="send" size={24} color={ON_PRIMARY_CONTAINER} />
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
        backgroundColor: "#FCF9F8",
    },
    header: {
        backgroundColor: "#FCF9F8",
        borderBottomWidth: 1,
        borderBottomColor: `${OUTLINE_VARIANT}33`,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
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
        color: PRIMARY,
        lineHeight: 28,
        flex: 1,
        marginLeft: 4,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: OUTLINE_VARIANT,
    },
    avatarImage: {
        width: "100%",
        height: "100%",
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 48,
    },
    restaurantCard: {
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 12,
        padding: 24,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: `${OUTLINE_VARIANT}33`,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    restaurantImage: {
        width: 64,
        height: 64,
        borderRadius: 8,
    },
    restaurantInfo: {
        flex: 1,
    },
    restaurantName: {
        fontSize: 24,
        fontWeight: "700",
        color: ON_SURFACE,
        lineHeight: 32,
    },
    orderInfo: {
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    card: {
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: `${OUTLINE_VARIANT}33`,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 28,
        marginBottom: 16,
    },
    bigStarsRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 4,
    },
    ratingLabel: {
        textAlign: "center",
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        fontStyle: "italic",
        marginTop: 8,
        height: 20,
    },
    ratingLabelActive: {
        color: PRIMARY,
        fontWeight: "700",
        fontStyle: "normal",
    },
    detailHeader: {
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 20,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    detailRowBorder: {
        borderTopWidth: 1,
        borderTopColor: `${SURFACE_VARIANT}80`,
    },
    detailLabel: {
        fontSize: 16,
        color: ON_SURFACE_VARIANT,
        lineHeight: 24,
    },
    detailStars: {
        flexDirection: "row",
        gap: 4,
    },
    textArea: {
        backgroundColor: `${PRIMARY}0D`,
        borderWidth: 1,
        borderColor: `${OUTLINE_VARIANT}4D`,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: ON_SURFACE,
        lineHeight: 24,
        minHeight: 120,
        textAlignVertical: "top",
    },
    photoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
    },
    uploadBtn: {
        width: 88,
        height: 88,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: OUTLINE_VARIANT,
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
    },
    uploadText: {
        fontSize: 11,
        fontWeight: "500",
        color: ON_SURFACE_VARIANT,
        lineHeight: 16,
        letterSpacing: 0.5,
        marginTop: 4,
    },
    photoPreview: {
        width: 88,
        height: 88,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
    },
    photoImage: {
        width: "100%",
        height: "100%",
    },
    photoClose: {
        position: "absolute",
        top: 4,
        right: 4,
        backgroundColor: `${SURFACE_CONTAINER_HIGHEST}CC`,
        borderRadius: 999,
        padding: 2,
    },
    submitSection: {
        marginTop: 8,
    },
    submitBtn: {
        backgroundColor: PRIMARY_CONTAINER,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        paddingVertical: 24,
        borderRadius: 12,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    submitText: {
        fontSize: 24,
        fontWeight: "700",
        color: ON_PRIMARY_CONTAINER,
        lineHeight: 32,
    },
    policyText: {
        textAlign: "center",
        fontSize: 11,
        fontWeight: "500",
        color: ON_SURFACE_VARIANT,
        lineHeight: 16,
        letterSpacing: 0.5,
        marginTop: 8,
        paddingHorizontal: 24,
    },
});
