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
import { verifyEmailOtp, resendOtp } from "../api/auth";
import Toast from "react-native-toast-message";
import { colors, spacing, typography, radius, shadows, sizes } from "../theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, "EmailOTPVerification">;

const EmailOTPVerificationScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRoute>();
    const { email } = route.params;


    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(30);
    const [otpExpiry, setOtpExpiry] = useState(300);
    const [otpExpired, setOtpExpired] = useState(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setTimeout(() => setResendCooldown((t) => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    useEffect(() => {
        if (otpExpiry <= 0) {
            setOtpExpired(true);
            return;
        }
        const timer = setTimeout(() => setOtpExpiry((t) => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [otpExpiry]);

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
            const data = await verifyEmailOtp(email, code);
            if (data.success) {
                Toast.show({ text1: "Email verified successfully!", type: "success" });
                navigation.navigate("Login");
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
        setResendCooldown(30);
        setOtpExpiry(300);
        setOtpExpired(false);
        try {
            const data = await resendOtp(email, "signup");
            if (data.success) {
                Toast.show({ text1: "OTP resent successfully", type: "success" });
            } else {
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
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.cardStack}>
                        <View style={styles.cardBack} />
                        <View style={styles.cardFront}>
                            <MaterialCommunityIcons
                                name="email-check"
                                size={48}
                                color={colors.primary}
                            />
                        </View>
                        <View style={styles.badge}>
                            <MaterialCommunityIcons
                                name="check-decagram"
                                size={sizes.icon}
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
                        {otpExpired ? (
                            <Text style={styles.expiredText}>OTP has expired. Request a new one.</Text>
                        ) : (
                            <Text style={styles.resendTimer}>
                                OTP expires in{" "}
                                <Text style={{ fontVariant: ["tabular-nums"] }}>
                                    {Math.floor(otpExpiry / 60)}:{otpExpiry % 60 < 10 ? `0${otpExpiry % 60}` : otpExpiry % 60}
                                </Text>
                            </Text>
                        )}
                        <Text style={styles.resendLabel}>Didn't receive the code?</Text>
                        {resendCooldown > 0 ? (
                            <Text style={styles.resendTimer}>
                                Resend available in{" "}
                                <Text style={{ fontVariant: ["tabular-nums"] }}>
                                    0:{resendCooldown < 10 ? `0${resendCooldown}` : resendCooldown}
                                </Text>
                            </Text>
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
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default EmailOTPVerificationScreen;

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
        height: sizes.headerHeightSm,
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
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xxl,
        alignItems: "center",
    },
    cardStack: {
        width: 160,
        height: 160,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    cardBack: {
        position: "absolute",
        width: 128,
        height: 128,
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        transform: [{ rotate: "6deg" }, { scale: 0.95 }],
        borderWidth: 1,
        borderColor: colors.surfaceContainerHighest,
        ...shadows.modal,
    },
    cardFront: {
        position: "absolute",
        width: 128,
        height: 128,
        backgroundColor: colors.primaryLight,
        borderRadius: radius.xl,
        transform: [{ rotate: "-3deg" }],
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    badge: {
        position: "absolute",
        bottom: -2,
        right: -2,
        width: sizes.avatar,
        height: sizes.avatar,
        borderRadius: radius.md,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: colors.surface,
        transform: [{ rotate: "6deg" }],
        ...shadows.floating,
    },
    headingSection: {
        alignItems: "center",
        marginBottom: 28,
    },
    headingTitle: {
        fontFamily: typography.fontFamily,
        fontSize: 28,
        lineHeight: typography.lineHeight.display,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: 6,
    },
    headingSubtitle: {
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize.md,
        lineHeight: typography.lineHeight.md,
        color: colors.textSecondary,
        textAlign: "center",
        paddingHorizontal: spacing.sm,
    },
    headingEmail: {
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
    },
    otpRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 28,
    },
    otpInput: {
        width: 48,
        height: 60,
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: "rgba(255,107,53,0.1)",
        textAlign: "center",
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize.xxxl,
        lineHeight: 28,
        fontWeight: typography.fontWeight.extrabold,
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
        marginBottom: 28,
    },
    resendLabel: {
        fontFamily: typography.fontFamily,
        fontSize: 13,
        lineHeight: 18,
        letterSpacing: typography.letterSpacing.normal,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
        opacity: 0.8,
        marginBottom: spacing.xs,
    },
    resendTimer: {
        fontFamily: typography.fontFamily,
        fontSize: 13,
        lineHeight: 18,
        letterSpacing: typography.letterSpacing.normal,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
    },
    resendActive: {
        fontFamily: typography.fontFamily,
        fontSize: 13,
        lineHeight: 18,
        letterSpacing: typography.letterSpacing.normal,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
    },
    expiredText: {
        fontFamily: typography.fontFamily,
        fontSize: 13,
        lineHeight: 18,
        letterSpacing: typography.letterSpacing.normal,
        fontWeight: typography.fontWeight.semibold,
        color: colors.error,
        marginBottom: spacing.sm,
    },
    buttonWrap: {
        width: "100%",
    },
    button: {
        flexDirection: "row",
        width: "100%",
        height: sizes.buttonHeight,
        borderRadius: radius.xl,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        ...shadows.button,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontFamily: typography.fontFamily,
        fontSize: 15,
        lineHeight: 22,
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
    },
});
