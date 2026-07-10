import { useEffect, useRef, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { verifyEmailOtp, resendOtp } from "../utils/api";

const C = {
    primary: "#FF6B35",
    primaryContainer: "#ff6b35",
    surface: "#fcf9f8",
    onSurface: "#1b1c1c",
    onSurfaceVariant: "#594139",
    surfaceContainerLowest: "#ffffff",
    outlineVariant: "#e1bfb5",
    primaryFixed: "#ffdbd0",
    onPrimary: "#ffffff",
    outline: "#8d7168",
    surfaceContainerHighest: "#e5e2e1",
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, "EmailOTPVerification">;

const EmailOTPVerificationScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRoute>();
    const { email } = route.params;

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft]);

    const handleOtpChange = (text: string, index: number) => {
        const digit = text.replace(/[^0-9]/g, "").slice(0, 1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        if (digit && index < 4) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join("");
        if (code.length !== 5) return;
        setLoading(true);
        try {
            const data = await verifyEmailOtp(email, code);
            if (data.success) {
                Alert.alert("Success", "Email verified! You can now login.", [
                    { text: "OK", onPress: () => navigation.navigate("Login") },
                ]);
            } else {
                Alert.alert("Error", data.message || "Invalid OTP");
            }
        } catch {
            Alert.alert("Error", "Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setTimeLeft(30);
        try {
            const data = await resendOtp(email, "signup");
            if (!data.success) {
                Alert.alert("Error", data.message || "Failed to resend OTP");
            }
        } catch {
            Alert.alert("Error", "Network error");
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: C.surface }}>
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
                <View
                    style={{
                        position: "absolute",
                        top: -100,
                        right: -100,
                        width: 400,
                        height: 400,
                        backgroundColor: C.primary,
                        borderRadius: 200,
                        opacity: 0.04,
                        transform: [{ scale: 1.1 }],
                    }}
                />
                <View
                    style={{
                        position: "absolute",
                        bottom: -80,
                        left: -80,
                        width: 300,
                        height: 300,
                        backgroundColor: C.primaryContainer,
                        borderRadius: 150,
                        opacity: 0.06,
                    }}
                />
            </View>

            {/* TopAppBar */}
            <View
                style={{
                    paddingTop: insets.top,
                    backgroundColor: "rgba(255,255,255,0.6)",
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 16,
                        height: 64,
                        borderBottomWidth: 1,
                        borderBottomColor: C.surfaceContainerHighest,
                        opacity: 0.3,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 999,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color={C.onSurfaceVariant}
                        />
                    </TouchableOpacity>
                    <Text
                        style={{
                            fontFamily: "Plus Jakarta Sans",
                            fontSize: 22,
                            fontWeight: "800",
                            letterSpacing: -0.5,
                            color: C.primary,
                        }}
                    >
                        CraveGo
                    </Text>
                    <View style={{ width: 40 }} />
                </View>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingHorizontal: 16,
                        paddingBottom: 48,
                        alignItems: "center",
                    }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Visual Anchor - Card Stack */}
                    <View
                        style={{
                            width: 224,
                            height: 224,
                            justifyContent: "center",
                            alignItems: "center",
                            marginTop: 32,
                            marginBottom: 24,
                        }}
                    >
                        <View
                            style={{
                                position: "absolute",
                                width: 176,
                                height: 176,
                                backgroundColor: "#fff",
                                borderRadius: 24,
                                transform: [{ rotate: "6deg" }, { scale: 0.95 }],
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 20 },
                                shadowOpacity: 0.1,
                                shadowRadius: 50,
                                elevation: 8,
                                borderWidth: 1,
                                borderColor: C.surfaceContainerHighest,
                            }}
                        />
                        <View
                            style={{
                                position: "absolute",
                                width: 176,
                                height: 176,
                                backgroundColor: C.primaryFixed,
                                borderRadius: 24,
                                transform: [{ rotate: "-3deg" }],
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <MaterialCommunityIcons
                                name="email-check"
                                size={64}
                                color={C.primary}
                            />
                        </View>
                        {/* Floating Badge */}
                        <View
                            style={{
                                position: "absolute",
                                bottom: -4,
                                right: -4,
                                width: 56,
                                height: 56,
                                borderRadius: 16,
                                backgroundColor: C.primary,
                                justifyContent: "center",
                                alignItems: "center",
                                borderWidth: 4,
                                borderColor: "#fff",
                                transform: [{ rotate: "6deg" }],
                                shadowColor: C.primary,
                                shadowOffset: { width: 0, height: 10 },
                                shadowOpacity: 0.3,
                                shadowRadius: 20,
                                elevation: 8,
                            }}
                        >
                            <MaterialCommunityIcons
                                name="check-decagram"
                                size={28}
                                color={C.onPrimary}
                            />
                        </View>
                    </View>

                    {/* Heading */}
                    <View style={{ alignItems: "center", marginBottom: 24 }}>
                        <Text
                            style={{
                                fontFamily: "Plus Jakarta Sans",
                                fontSize: 32,
                                lineHeight: 36,
                                fontWeight: "700",
                                color: C.onSurface,
                                marginBottom: 8,
                            }}
                        >
                            Verify Identity
                        </Text>
                        <Text
                            style={{
                                fontFamily: "Plus Jakarta Sans",
                                fontSize: 16,
                                lineHeight: 24,
                                color: C.onSurfaceVariant,
                                textAlign: "center",
                                paddingHorizontal: 24,
                            }}
                        >
                            Enter the 5-digit security code sent to{" "}
                            <Text
                                style={{ fontWeight: "700", color: C.primary }}
                            >
                                {email}
                            </Text>
                        </Text>
                    </View>

                    {/* OTP Inputs - Claymorphism */}
                    <View
                        style={{
                            flexDirection: "row",
                            gap: 16,
                            marginBottom: 24,
                        }}
                    >
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => {
                                    inputRefs.current[index] = ref;
                                }}
                                style={{
                                    width: 64,
                                    height: 80,
                                    borderRadius: 24,
                                    backgroundColor: "#ffffff",
                                    borderWidth: 2,
                                    borderColor: digit
                                        ? C.primary
                                        : "rgba(255,107,53,0.1)",
                                    textAlign: "center",
                                    fontFamily: "Plus Jakarta Sans",
                                    fontSize: 32,
                                    lineHeight: 40,
                                    fontWeight: "800",
                                    color: C.onSurface,
                                    shadowColor: digit ? C.primary : "#000",
                                    shadowOffset: { width: 0, height: 10 },
                                    shadowOpacity: digit ? 0.15 : 0.04,
                                    shadowRadius: digit ? 30 : 20,
                                    elevation: digit ? 6 : 2,
                                }}
                                keyboardType="number-pad"
                                maxLength={1}
                                value={digit}
                                onChangeText={(text) => handleOtpChange(text, index)}
                                onKeyPress={({ nativeEvent }) =>
                                    handleKeyPress(nativeEvent.key, index)
                                }
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    {/* Timer & Resend */}
                    <View style={{ alignItems: "center", marginBottom: 24 }}>
                        <Text
                            style={{
                                fontFamily: "Plus Jakarta Sans",
                                fontSize: 14,
                                lineHeight: 20,
                                letterSpacing: 0.1,
                                fontWeight: "600",
                                color: C.onSurfaceVariant,
                                opacity: 0.8,
                                marginBottom: 4,
                            }}
                        >
                            Didn't receive the code?
                        </Text>
                        {timeLeft > 0 ? (
                            <Text
                                style={{
                                    fontFamily: "Plus Jakarta Sans",
                                    fontSize: 14,
                                    lineHeight: 20,
                                    letterSpacing: 0.1,
                                    fontWeight: "600",
                                    color: C.primary,
                                }}
                            >
                                Resend available in{" "}
                                <Text style={{ fontVariant: ["tabular-nums"] }}>
                                    0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                                </Text>
                            </Text>
                        ) : (
                            <TouchableOpacity onPress={handleResend}>
                                <Text
                                    style={{
                                        fontFamily: "Plus Jakarta Sans",
                                        fontSize: 14,
                                        lineHeight: 20,
                                        letterSpacing: 0.1,
                                        fontWeight: "600",
                                        color: C.primary,
                                    }}
                                >
                                    Resend Code Now
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Verify Button */}
                    <View style={{ width: "100%", paddingHorizontal: 8 }}>
                        <TouchableOpacity
                            style={[
                                {
                                    flexDirection: "row",
                                    width: "100%",
                                    height: 56,
                                    borderRadius: 24,
                                    backgroundColor: C.primary,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 12,
                                    shadowColor: C.primary,
                                    shadowOffset: { width: 0, height: 12 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 24,
                                    elevation: 8,
                                },
                                (loading || otp.join("").length !== 5) && {
                                    opacity: 0.5,
                                },
                            ]}
                            onPress={handleVerify}
                            disabled={loading || otp.join("").length !== 5}
                            activeOpacity={0.97}
                        >
                            <Text
                                style={{
                                    fontFamily: "Plus Jakarta Sans",
                                    fontSize: 16,
                                    lineHeight: 24,
                                    fontWeight: "600",
                                    color: C.onPrimary,
                                }}
                            >
                                {loading ? "Verifying..." : "Verify & Proceed"}
                            </Text>
                            <MaterialCommunityIcons
                                name="arrow-right"
                                size={22}
                                color={C.onPrimary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Footer Help */}
                    <View style={{ marginTop: 24 }}>
                        <TouchableOpacity
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                                opacity: 0.7,
                            }}
                        >
                            <MaterialCommunityIcons
                                name="help-circle-outline"
                                size={16}
                                color={C.onSurfaceVariant}
                            />
                            <Text
                                style={{
                                    fontFamily: "Plus Jakarta Sans",
                                    fontSize: 11,
                                    lineHeight: 16,
                                    letterSpacing: 0.5,
                                    fontWeight: "500",
                                    color: C.onSurfaceVariant,
                                }}
                            >
                                Contact Support
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default EmailOTPVerificationScreen;