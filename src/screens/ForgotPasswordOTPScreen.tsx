import { useEffect, useRef, useState } from "react";
import {
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
import Toast from "react-native-toast-message";
import { colors, spacing, typography, radius, shadows, sizes } from "../theme";

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
                Toast.show({ text1: data.message || "Invalid OTP", type: "error" });
            }
        } catch {
            Toast.show({ text1: "Something went wrong. Try again.", type: "error" });
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
                Toast.show({ text1: data.message || "Failed to resend OTP", type: "error" });
            }
        } catch {
            Toast.show({ text1: "Network error", type: "error" });
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
                            size={sizes.iconLg}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                    <Text style={styles.logo}>CraveGo</Text>
                    <View style={{ width: sizes.avatar }} />
                </View>
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
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
                                color={colors.primary}
                            />
                        </View>
                        <View style={styles.badge}>
                            <MaterialCommunityIcons
                                name="check-decagram"
                                size={sizes.iconXl}
                                color={colors.white}
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
                                color={colors.white}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.footerBtn}>
                            <MaterialCommunityIcons
                                name="help-circle-outline"
                                size={sizes.iconSm}
                                color={colors.textSecondary}
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
        backgroundColor: colors.background,
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
        backgroundColor: colors.primary,
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
        backgroundColor: colors.primary,
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
        paddingHorizontal: spacing.md,
        height: sizes.headerHeight,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceContainerHighest,
    },
    headerBtn: {
        width: sizes.avatar,
        height: sizes.avatar,
        borderRadius: radius.full,
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.extrabold,
        letterSpacing: typography.letterSpacing.tight,
        color: colors.primary,
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xxl,
        alignItems: "center",
    },
    cardStack: {
        width: 224,
        height: 224,
        justifyContent: "center",
        alignItems: "center",
        marginTop: spacing.xl,
        marginBottom: spacing.lg,
    },
    cardBack: {
        position: "absolute",
        width: 176,
        height: 176,
        backgroundColor: colors.surface,
        borderRadius: radius.xxl,
        transform: [{ rotate: "6deg" }, { scale: 0.95 }],
        borderWidth: 1,
        borderColor: colors.surfaceContainerHighest,
        ...shadows.modal,
    },
    cardFront: {
        position: "absolute",
        width: 176,
        height: 176,
        backgroundColor: colors.primaryLight,
        borderRadius: radius.xxl,
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
        borderRadius: radius.lg,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        borderColor: colors.surface,
        transform: [{ rotate: "6deg" }],
        ...shadows.floating,
    },
    headingSection: {
        alignItems: "center",
        marginBottom: spacing.lg,
    },
    headingTitle: {
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize.display,
        lineHeight: typography.lineHeight.display,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    headingSubtitle: {
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize.lg,
        lineHeight: typography.lineHeight.xl,
        color: colors.textSecondary,
        textAlign: "center",
        paddingHorizontal: spacing.lg,
    },
    headingEmail: {
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
    },
    otpRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: spacing.lg,
    },
    otpInput: {
        width: sizes.buttonHeight,
        height: 72,
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: "rgba(255,107,53,0.1)",
        textAlign: "center",
        fontFamily: typography.fontFamily,
        fontSize: 28,
        lineHeight: typography.lineHeight.display,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.04,
        shadowRadius: 20,
        elevation: 2,
    },
    otpInputFilled: {
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 6,
    },
    resendSection: {
        alignItems: "center",
        marginBottom: spacing.lg,
    },
    resendTimer: {
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize.md,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.normal,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
    },
    resendTimerUrgent: {
        color: colors.error,
    },
    resendActive: {
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize.md,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.normal,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
    },
    buttonWrap: {
        width: "100%",
        paddingHorizontal: spacing.sm,
    },
    button: {
        flexDirection: "row",
        width: "100%",
        height: sizes.buttonHeightLg,
        borderRadius: radius.xxl,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        ...shadows.button,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize.lg,
        lineHeight: typography.lineHeight.xl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
    },
    footer: {
        marginTop: spacing.lg,
    },
    footerBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        opacity: 0.7,
    },
    footerText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize.xs,
        lineHeight: typography.lineHeight.sm,
        letterSpacing: typography.letterSpacing.wider,
        fontWeight: typography.fontWeight.medium,
        color: colors.textSecondary,
    },
});
