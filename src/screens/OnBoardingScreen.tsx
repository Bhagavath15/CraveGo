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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
                        <View style={styles.imageContainer}>
                            <Image source={data.image} resizeMode="cover" style={styles.image} />
                            <LinearGradient
                                colors={["transparent", "rgba(255,255,255,0.15)", "rgba(255,255,255,0.7)", "#FFFFFF"]}
                                locations={[0, 0.45, 0.75, 1]}
                                style={styles.overlay}
                            />
                        </View>

                        <View style={styles.dotsRow}>
                            {onboardingData.map((_, dotIndex) => (
                                <View
                                    key={dotIndex}
                                    style={[styles.dot, dotIndex === step && styles.activeDot]}
                                />
                            ))}
                        </View>

                        <View style={styles.content}>
                            <Text style={styles.title}>{data.title}</Text>
                            <Text style={styles.description}>{data.description}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {isLastStep && (
                <View style={styles.bottomArea}>
                    <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={() => navigation.replace("Login")}>
                        <Text style={styles.primaryButtonText}>Get Started</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default OnBoardingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    scrollView: {
        flex: 1,
    },
    page: {
        width: SCREEN_WIDTH,
    },
    imageContainer: {
        height: 520,
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    overlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 220,
    },
    dotsRow: {
        flexDirection: "row",
        justifyContent: "center",
        paddingVertical: 20,
    },
    dot: {
        width: 10,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#E5E5E5",
        marginHorizontal: 4,
    },
    activeDot: {
        width: 30,
        backgroundColor: "#D9480F",
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        alignItems: "center",
        gap: 16,
    },
    title: {
        fontSize: 30,
        fontWeight: "700",
        textAlign: "center",
    },
    description: {
        color: "#6B7280",
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
    },
    bottomArea: {
        width: "100%",
        alignItems: "center",
        paddingBottom: 30,
        paddingHorizontal: 24,
    },
    primaryButton: {
        width: "75%",
        backgroundColor: "#D9480F",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
    },
    primaryButtonText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 16,
    },
});
