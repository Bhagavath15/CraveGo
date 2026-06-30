import React, { useRef, useState } from "react";
import {
    Animated,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../types/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const onboardingData = [
    {
        image: require("../assets/images/onBoardingScreen_1.png"),
        title: "Freshly Cooked & Delivered",
        description:
            "Get your favorite Indian meals from the best local restaurants. Hot, spicy, and delivered to your doorstep.",
        buttonTitle: "Next",
    },
    {
        image: require("../assets/images/onBoardingScreen_2.png"),
        title: "Authentic Flavors, Infinite Choices",
        description:
            "Explore a curated selection of traditional and contemporary Indian cuisine, brought to you from the finest kitchens across the country.",
        buttonTitle: "Next",
    },
    {
        image: require("../assets/images/onBoardingScreen_3.png"),
        title: "Fast Delivery to Your Doorstep",
        description:
            "Track your order in real-time and enjoy hot meals delivered with care. Experience the future of food delivery.",
        buttonTitle: "Get Started",
    },
];

const OnBoardingScreen = () => {
    const [step, setStep] = useState(0);
    type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

    const navigation = useNavigation<NavigationProp>();

    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const current = onboardingData[step];
    const isLastStep = step === onboardingData.length - 1;

    const animateStep = (
        nextStep: number,
        direction: "next" | "back"
    ) => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
            }),
            Animated.timing(translateX, {
                toValue: direction === "next" ? -60 : 60,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setStep(nextStep);

            translateX.setValue(direction === "next" ? 60 : -60);

            Animated.parallel([
                Animated.spring(translateX, {
                    toValue: 0,
                    damping: 15,
                    stiffness: 120,
                    mass: 0.8,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    const handleNext = () => {
        if (isLastStep) {
            navigation.navigate("Login");
            return;
        }
        animateStep(step + 1, "next");
    };

    const handleBack = () => {
        if (step > 0) {
            animateStep(step - 1, "back");
        }
    };

    return (
        <View style={styles.container}>
            <Animated.View
                style={{
                    flex: 1,
                    opacity,
                    transform: [{ translateX }],
                }}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={current.image}
                        resizeMode="cover"
                        style={styles.image}
                    />

                    <LinearGradient
                        colors={[
                            "transparent",
                            "rgba(255,255,255,0.15)",
                            "rgba(255,255,255,0.7)",
                            "#FFFFFF",
                        ]}
                        locations={[0, 0.45, 0.75, 1]}
                        style={styles.overlay}
                    />
                </View>

                <View style={styles.content}>
                    <View style={styles.stepContainer}>
                        {onboardingData.map((_, index) => (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.dot,
                                    index === step && styles.activeDot,
                                ]}
                            />
                        ))}
                    </View>

                    <Text style={styles.title}>
                        {current.title}
                    </Text>

                    <Text style={styles.description}>
                        {current.description}
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            activeOpacity={0.85}
                            onPress={handleNext}
                        >
                            <Text style={styles.primaryButtonText}>
                                {current.buttonTitle}
                            </Text>
                        </TouchableOpacity>

                        {step > 0 && (
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={handleBack}
                            >
                                <Text style={styles.secondaryButtonText}>
                                    Back
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Animated.View>
        </View>
    );
};

export default OnBoardingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },

    imageContainer: {
        height: 480,
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

    content: {
        flex: 1,
        paddingHorizontal: 24,
        alignItems: "center",
        paddingTop: 25,
        gap: 25,
    },

    stepContainer: {
        flexDirection: "row",
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

    buttonContainer: {
        width: "100%",
        alignItems: "center",
        paddingBottom: 30,
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

    secondaryButton: {
        marginTop: 15,
    },

    secondaryButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },
});