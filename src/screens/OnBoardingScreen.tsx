import { useRef, useState } from "react";
import {
    Dimensions,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../types/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, spacing, typography, radius, shadows, sizes } from "../theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const onboardingData = [
    {
        image: require("../assets/images/onBoardingScreen_1.png"),
        title: "Freshly Cooked & Delivered",
        description:
            "Get your favorite Indian meals from the best local restaurants. Hot, spicy, and delivered to your doorstep.",
    },
    {
        image: require("../assets/images/onBoardingScreen_2.png"),
        title: "Authentic Flavors, Infinite Choices",
        description:
            "Explore a curated selection of traditional and contemporary Indian cuisine, brought to you from the finest kitchens across the country.",
    },
    {
        image: require("../assets/images/onBoardingScreen_3.png"),
        title: "Fast Delivery to Your Doorstep",
        description:
            "Track your order in real-time and enjoy hot meals delivered with care. Experience the future of food delivery.",
    },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const OnBoardingScreen = () => {
    const [step, setStep] = useState(0);
    const scrollRef = useRef<ScrollView>(null);
    const navigation = useNavigation<NavigationProp>();
    const isLastStep = step === onboardingData.length - 1;

    const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const newStep = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        setStep(newStep);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.skipTop} onPress={() => navigation.replace("Login")}>
                <Text style={styles.skipTopText}>Skip</Text>
            </TouchableOpacity>
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onMomentumScrollEnd={handleMomentumEnd}
                style={styles.scrollView}
            >
                {onboardingData.map((data, index) => (
                    <View key={index} style={styles.page}>
                        <Image source={data.image} resizeMode="cover" style={styles.bgImage} />
                        <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.1)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.8)"]}
                            locations={[0, 0.4, 0.7, 1]}
                            style={styles.bgOverlay}
                        />
                    </View>
                ))}
            </ScrollView>

            <View style={styles.bottomSheet}>
                <View style={styles.dotsRow}>
                    {onboardingData.map((_, dotIndex) => (
                        <View
                            key={dotIndex}
                            style={[styles.dot, dotIndex === step && styles.activeDot]}
                        />
                    ))}
                </View>

                <Text style={styles.title}>{onboardingData[step].title}</Text>
                <Text style={styles.description}>{onboardingData[step].description}</Text>

                <View style={styles.buttonSlot}>
                    {isLastStep ? (
                        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={() => navigation.replace("Login")}>
                            <Text style={styles.primaryButtonText}>Get Started</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.swipeHint}>Swipe to continue</Text>
                    )}
                </View>
            </View>
        </View>
    );
};

export default OnBoardingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
    },
    scrollView: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    page: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    bgImage: {
        width: "100%",
        height: "100%",
    },
    bgOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: SCREEN_HEIGHT * 0.6,
    },
    bottomSheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 28,
        paddingBottom: spacing.xxl,
        paddingTop: spacing.lg,
    },
    dotsRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: spacing.lg,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: radius.xs,
        backgroundColor: "rgba(255,255,255,0.4)",
        marginHorizontal: 5,
    },
    activeDot: {
        width: 28,
        backgroundColor: colors.white,
    },
    title: {
        fontSize: 30,
        fontWeight: typography.fontWeight.bold,
        textAlign: "center",
        color: colors.white,
        marginBottom: 12,
    },
    description: {
        color: "rgba(255,255,255,0.8)",
        fontSize: typography.fontSize.lg,
        textAlign: "center",
        lineHeight: typography.lineHeight.xl,
        marginBottom: 36,
        paddingHorizontal: spacing.sm,
    },
    buttonSlot: {
        height: sizes.buttonHeight,
        justifyContent: "center",
        alignItems: "center",
    },
    swipeHint: {
        color: "rgba(255,255,255,0.35)",
        fontSize: 13,
        fontWeight: typography.fontWeight.medium,
        letterSpacing: typography.letterSpacing.wider,
    },
    skipTop: {
        position: "absolute",
        top: 60,
        right: spacing.lg,
        zIndex: 10,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.xl,
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    skipTopText: {
        color: "rgba(255,255,255,0.8)",
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
    },
    primaryButton: {
        width: "100%",
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
    },
    primaryButtonText: {
        color: colors.white,
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.lg,
    },
});
