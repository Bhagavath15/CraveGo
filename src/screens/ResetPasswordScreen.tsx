import { useRef, useState } from "react";
import {
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { resetPassword } from "../api/auth";
import Toast from "react-native-toast-message";
import { colors, spacing, typography, radius, shadows, sizes } from "../theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, "ResetPassword">;

const ResetPasswordScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRoute>();
    const { resetToken } = route.params;

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const confirmRef = useRef<TextInput>(null);

    const handleReset = async () => {
        if (!newPassword || !confirmPassword) {
            Toast.show({ text1: "All fields are required", type: "error" });
            return;
        }
        if (newPassword !== confirmPassword) {
            Toast.show({ text1: "Passwords do not match", type: "error" });
            return;
        }
        if (newPassword.length < 6) {
            Toast.show({ text1: "Password must be at least 6 characters", type: "error" });
            return;
        }
        setLoading(true);
        try {
            const data = await resetPassword(resetToken, newPassword);
            if (data.success) {
                Toast.show({ text1: "Password reset successfully!", type: "success" });
                setTimeout(() => navigation.navigate("Login"), 1000);
            } else {
                Toast.show({ text1: data.message || "Failed to reset password", type: "error" });
            }
        } catch {
            Toast.show({ text1: "Network error", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <ImageBackground
                source={require("../assets/images/welcome-screen.png")}
                style={styles.bgImage}
                resizeMode="cover"
            >
                <View style={styles.bgOverlay} />
            </ImageBackground>

            <SafeAreaView style={styles.flex}>
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.topSection}>
                                <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                    style={styles.backBtn}
                                >
                                    <MaterialCommunityIcons
                                        name="arrow-left"
                                        size={sizes.iconLg}
                                        color={colors.white}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.heroTitle}>
                                    Create New{'\n'}Password
                                </Text>
                                <Text style={styles.heroSubtitle}>
                                    Your new password must be different from previous ones.
                                </Text>
                            </View>

                            <View style={styles.card}>
                                <View style={styles.fieldGroup}>
                                    <Text style={styles.fieldLabel}>New Password</Text>
                                    <View style={styles.inputBox}>
                                        <MaterialCommunityIcons
                                            name="lock-outline"
                                            size={sizes.icon}
                                            color={colors.outline}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter new password"
                                            placeholderTextColor={colors.outline}
                                            secureTextEntry={!showNew}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            returnKeyType="next"
                                            onSubmitEditing={() => confirmRef.current?.focus()}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowNew(!showNew)}
                                            style={styles.eyeBtn}
                                        >
                                            <MaterialCommunityIcons
                                                name={showNew ? "eye-off-outline" : "eye-outline"}
                                                size={22}
                                                color={colors.textSecondary}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.fieldGroup}>
                                    <Text style={styles.fieldLabel}>Confirm New Password</Text>
                                    <View style={styles.inputBox}>
                                        <MaterialCommunityIcons
                                            name="lock-outline"
                                            size={sizes.icon}
                                            color={colors.outline}
                                        />
                                        <TextInput
                                            ref={confirmRef}
                                            style={styles.input}
                                            placeholder="Re-enter new password"
                                            placeholderTextColor={colors.outline}
                                            secureTextEntry={!showConfirm}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            returnKeyType="done"
                                            onSubmitEditing={handleReset}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowConfirm(!showConfirm)}
                                            style={styles.eyeBtn}
                                        >
                                            <MaterialCommunityIcons
                                                name={showConfirm ? "eye-off-outline" : "eye-outline"}
                                                size={22}
                                                color={colors.textSecondary}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.infoSection}>
                                    <MaterialCommunityIcons
                                        name="information-outline"
                                        size={sizes.iconSm}
                                        color={colors.textSecondary}
                                    />
                                    <Text style={styles.infoText}>
                                        You will be redirected to login after a successful reset.
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    disabled={loading}
                                    onPress={handleReset}
                                    style={[
                                        styles.button,
                                        loading && styles.buttonDisabled,
                                    ]}
                                >
                                    <Text style={styles.buttonText}>
                                        {loading ? "Resetting..." : "Reset Password"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ height: insets.bottom, backgroundColor: colors.surface }} />
                        </ScrollView>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    bgImage: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "80%",
    },
    bgOverlay: {
        flex: 1,
        backgroundColor: colors.overlay,
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "flex-end",
    },
    topSection: {
        paddingHorizontal: 28,
        paddingBottom: 12,
    },
    backBtn: {
        width: sizes.avatar,
        height: sizes.avatar,
        borderRadius: radius.xl,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: spacing.md,
    },
    heroTitle: {
        fontSize: typography.fontSize.hero,
        fontWeight: typography.fontWeight.bold,
        color: colors.white,
        lineHeight: typography.lineHeight.hero,
        marginBottom: spacing.sm,
    },
    heroSubtitle: {
        fontSize: typography.fontSize.lg,
        color: "rgba(255,255,255,0.8)",
        lineHeight: typography.lineHeight.xl,
    },
    card: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 28,
        paddingTop: 20,
        paddingBottom: spacing.lg,
    },
    fieldGroup: {
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
        letterSpacing: typography.letterSpacing.wide,
        marginBottom: 6,
    },
    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.transparent,
        borderRadius: radius.lg,
        height: sizes.inputHeightLg,
        paddingHorizontal: spacing.md,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: typography.fontWeight.medium,
        color: colors.textPrimary,
        padding: 0,
    },
    eyeBtn: {
        padding: spacing.xs,
    },
    infoSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        marginTop: spacing.xs,
        marginBottom: spacing.sm,
    },
    infoText: {
        fontSize: 13,
        color: colors.textSecondary,
        flex: 1,
        lineHeight: 18,
    },
    button: {
        height: sizes.inputHeightLg,
        borderRadius: radius.lg,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginTop: spacing.sm,
        ...shadows.button,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.white,
        letterSpacing: typography.letterSpacing.wide,
    },
});
