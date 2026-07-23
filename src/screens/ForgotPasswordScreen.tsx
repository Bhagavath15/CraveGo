import { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { forgotPassword } from "../api/auth";
import Toast from "react-native-toast-message";
import { colors, spacing, typography, radius, shadows, sizes } from "../theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ForgotPasswordScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<Nav>();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!email.trim()) {
            Toast.show({ text1: "Please enter your email", type: "error" });
            return;
        }
        setLoading(true);
        try {
            const data = await forgotPassword(email.trim());
            if (data.success) {
                navigation.navigate("ForgotPasswordOTP", { email: email.trim() });
            } else {
                Toast.show({ text1: data.message || "Failed to send OTP", type: "error" });
            }
        } catch {
            Toast.show({ text1: "Network error", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <View style={styles.blobPrimary} />
            <View style={styles.blobSecondary} />

            <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.headerBtn}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={sizes.iconLg}
                            color={colors.textPrimary}
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
                    <View style={styles.heroSection}>
                        <View style={styles.iconWrap}>
                            <MaterialCommunityIcons
                                name="lock-reset"
                                size={sizes.avatarLg}
                                color={colors.primary}
                            />
                        </View>
                    </View>

                    <View style={styles.headingSection}>
                        <Text style={styles.headingTitle}>Reset Password</Text>
                        <Text style={styles.headingSubtitle}>
                            Don't worry! Enter your email below to receive your password
                            reset instructions.
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Email Address</Text>
                            <View style={styles.inputBox}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="foodie@cravego.com"
                                    placeholderTextColor={colors.outline + "66"}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.9}
                            disabled={loading}
                            onPress={handleSend}
                            style={[
                                styles.sendBtn,
                                loading && styles.sendBtnDisabled,
                            ]}
                        >
                            <Text style={styles.sendBtnText}>
                                {loading ? "Sending..." : "Send Reset Code"}
                            </Text>
                            <MaterialCommunityIcons
                                name="arrow-right"
                                size={sizes.icon}
                                color={colors.white}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Login")}
                            style={styles.footerBtn}
                        >
                            <MaterialCommunityIcons
                                name="arrow-left"
                                size={18}
                                color={colors.textSecondary}
                            />
                            <Text style={styles.footerText}>Back to Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    blobPrimary: {
        position: "absolute",
        top: -160,
        right: -160,
        width: 500,
        height: 500,
        backgroundColor: colors.primary,
        borderRadius: 250,
        opacity: 0.05,
    },
    blobSecondary: {
        position: "absolute",
        bottom: -160,
        left: -120,
        width: 400,
        height: 400,
        backgroundColor: colors.secondaryLight,
        borderRadius: 200,
        opacity: 0.05,
    },
    headerWrap: {
        backgroundColor: "rgba(255,255,255,0.8)",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        height: sizes.headerHeight,
    },
    headerBtn: {
        padding: spacing.sm,
        borderRadius: radius.full,
        marginLeft: -spacing.sm,
    },
    logo: {
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.extrabold,
        letterSpacing: typography.letterSpacing.tight,
        color: colors.primary,
        marginLeft: spacing.xs,
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl,
    },
    heroSection: {
        alignItems: "center",
        marginBottom: spacing.lg,
    },
    iconWrap: {
        width: 80,
        height: 80,
        borderRadius: radius.xxl,
        backgroundColor: "rgba(171,53,0,0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    headingSection: {
        alignItems: "center",
        marginBottom: spacing.lg,
    },
    headingTitle: {
        fontFamily: typography.fontFamily,
        fontSize: 28,
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
        paddingHorizontal: spacing.md,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.xxl,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
        padding: spacing.lg,
        ...shadows.medium,
    },
    fieldGroup: {
        marginBottom: spacing.lg,
    },
    fieldLabel: {
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize.md,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.normal,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        marginLeft: spacing.xs,
        marginBottom: spacing.sm,
    },
    inputBox: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.outlineVariant,
        borderRadius: radius.md,
    },
    input: {
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize.lg,
        lineHeight: typography.lineHeight.xl,
        color: colors.textPrimary,
        paddingHorizontal: spacing.md,
        paddingVertical: 14,
    },
    sendBtn: {
        flexDirection: "row",
        height: sizes.buttonHeightLg,
        borderRadius: radius.md,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        gap: spacing.sm,
        ...shadows.button,
    },
    sendBtnDisabled: {
        opacity: 0.5,
    },
    sendBtnText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize.md,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.normal,
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
    },
    footer: {
        alignItems: "center",
        marginTop: spacing.lg,
    },
    footerBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        paddingVertical: spacing.sm,
    },
    footerText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize.md,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.normal,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
    },
});
