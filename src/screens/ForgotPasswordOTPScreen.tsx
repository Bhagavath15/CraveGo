import { useEffect, useRef, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
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
import { verifyForgotPasswordOtp, resendOtp } from "../api/auth";

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
type ScreenRoute = RouteProp<RootStackParamList, "ForgotPasswordOTP">;

const ForgotPasswordOTPScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRoute>();
    const { email } = route.params;

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [expiryTime, setExpiryTime] = useState(300);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        if (expiryTime <= 0) return;
        const timer = setTimeout(() => setExpiryTime((t) => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [expiryTime]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? `0${s}` : s}`;
    };

    const handleOtpChange = (text: string, index: number) => {
        const digit = text.replace(/[^0-9]/g, "").slice(0, 1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        if (digit && index < 5) {
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
        if (code.length !== 6) return;
        setLoading(true);
        try {
            const data = await verifyForgotPasswordOtp(email, code);
            if (data.success) {
                navigation.navigate("ResetPassword", { resetToken: data.resetToken });
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
        setExpiryTime(300);
        setOtp(["", "", "", "", "", ""]);
        try {
            const data = await resendOtp(email, "forgot_password");
            if (!data.success) {
                Alert.alert("Error", data.message || "Failed to resend OTP");
            }
        } catch {
            Alert.alert("Error", "Network error");
        }
    };

    return (
        <View style={styles.root}>
            <View style={styles.blobContainer}>
                <View style={styles.blobPrimary} />
                <View style={styles.blobSecondary} />
            </View>

            <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.headerBtn}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color={C.onSurfaceVariant}
                        />
                    </TouchableOpacity>
                    <Text style={styles.logo}>CraveGo</Text>
                    <View style={{ width: 40 }} />
                </View>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.cardStack}>
                        <View style={styles.cardBack} />
                        <View style={styles.cardFront}>
                            <MaterialCommunityIcons
                                name="lock-reset"
                                size={64}
                                color={C.primary}
                            />
                        </View>
                        <View style={styles.badge}>
                            <MaterialCommunityIcons
                                name="check-decagram"
                                size={28}
                                color={C.onPrimary}
                            />
                        </View>
                    </View>

                    <View style={styles.headingSection}>
                        <Text style={styles.headingTitle}>Verify Identity</Text>
                        <Text style={styles.headingSubtitle}>
                            Enter the 6-digit security code sent to{" "}
                            <Text style={styles.headingEmail}>{email}</Text>
                        </Text>
                    </View>

                    <View style={styles.otpRow}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => {
                                    inputRefs.current[index] = ref;
                                }}
                                style={[
                                    styles.otpInput,
                                    digit && styles.otpInputFilled,
                                ]}
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

                    <View style={styles.resendSection}>
                        {expiryTime > 0 ? (
                            <TouchableOpacity onPress={handleResend}>
                                <Text
                                    style={[
                                        styles.resendTimer,
                                        expiryTime <= 60 && styles.resendTimerUrgent,
                                    ]}
                                >
                                    Resend code in{" "}
                                    <Text style={{ fontVariant: ["tabular-nums"] }}>
                                        {formatTime(expiryTime)}
                                    </Text>
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={handleResend}>
                                <Text style={styles.resendActive}>Resend Code Now</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.buttonWrap}>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                (loading || otp.join("").length !== 6) && styles.buttonDisabled,
                            ]}
                            onPress={handleVerify}
                            disabled={loading || otp.join("").length !== 6}
                            activeOpacity={0.97}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? "Verifying..." : "Verify & Proceed"}
                            </Text>
                            <MaterialCommunityIcons
                                name="arrow-right"
                                size={22}
                                color={C.onPrimary}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.footerBtn}>
                            <MaterialCommunityIcons
                                name="help-circle-outline"
                                size={16}
                                color={C.onSurfaceVariant}
                            />
                            <Text style={styles.footerText}>Contact Support</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default ForgotPasswordOTPScreen;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: C.surface,
    },
    blobContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    blobPrimary: {
        position: "absolute",
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        backgroundColor: C.primary,
        borderRadius: 200,
        opacity: 0.04,
        transform: [{ scale: 1.1 }],
    },
    blobSecondary: {
        position: "absolute",
        bottom: -80,
        left: -80,
        width: 300,
        height: 300,
        backgroundColor: C.primaryContainer,
        borderRadius: 150,
        opacity: 0.06,
    },
    headerWrap: {
        backgroundColor: "rgba(255,255,255,0.6)",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        height: 64,
        borderBottomWidth: 1,
        borderBottomColor: C.surfaceContainerHighest,
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 22,
        fontWeight: "800",
        letterSpacing: -0.5,
        color: C.primary,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingBottom: 48,
        alignItems: "center",
    },
    cardStack: {
        width: 224,
        height: 224,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 32,
        marginBottom: 24,
    },
    cardBack: {
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
    },
    cardFront: {
        position: "absolute",
        width: 176,
        height: 176,
        backgroundColor: C.primaryFixed,
        borderRadius: 24,
        transform: [{ rotate: "-3deg" }],
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    badge: {
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
    },
    headingSection: {
        alignItems: "center",
        marginBottom: 24,
    },
    headingTitle: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 32,
        lineHeight: 36,
        fontWeight: "700",
        color: C.onSurface,
        marginBottom: 8,
    },
    headingSubtitle: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 16,
        lineHeight: 24,
        color: C.onSurfaceVariant,
        textAlign: "center",
        paddingHorizontal: 24,
    },
    headingEmail: {
        fontWeight: "700",
        color: C.primary,
    },
    otpRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    otpInput: {
        width: 52,
        height: 72,
        borderRadius: 16,
        backgroundColor: "#ffffff",
        borderWidth: 2,
        borderColor: "rgba(255,107,53,0.1)",
        textAlign: "center",
        fontFamily: "Plus Jakarta Sans",
        fontSize: 28,
        lineHeight: 36,
        fontWeight: "700",
        color: C.onSurface,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.04,
        shadowRadius: 20,
        elevation: 2,
    },
    otpInputFilled: {
        borderColor: C.primary,
        shadowColor: C.primary,
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 6,
    },
    resendSection: {
        alignItems: "center",
        marginBottom: 24,
    },
    resendTimer: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.1,
        fontWeight: "600",
        color: C.primary,
    },
    resendTimerUrgent: {
        color: "#D32F2F",
    },
    resendActive: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.1,
        fontWeight: "600",
        color: C.primary,
    },
    buttonWrap: {
        width: "100%",
        paddingHorizontal: 8,
    },
    button: {
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
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 16,
        lineHeight: 24,
        fontWeight: "600",
        color: C.onPrimary,
    },
    footer: {
        marginTop: 24,
    },
    footerBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        opacity: 0.7,
    },
    footerText: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 11,
        lineHeight: 16,
        letterSpacing: 0.5,
        fontWeight: "500",
        color: C.onSurfaceVariant,
    },
});
