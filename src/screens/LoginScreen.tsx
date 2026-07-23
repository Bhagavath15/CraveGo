import { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../types/types";
import { login } from "../api/auth";
import { setAuthToken } from "../api/client";
import Toast from "react-native-toast-message";
import { saveToken } from "../utils/authStore";
import { colors, spacing, typography, radius, shadows, sizes } from "../theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
    const navigation = useNavigation<Nav>();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const isDisabled = !email.trim() || !password.trim();

    const handleLogin = async () => {
        if (isDisabled || loading) return;
        setLoading(true);
        try {
            const data = await login(email.trim(), password);
            if (data.success) {
                await saveToken(data.token);
                setAuthToken(data.token);
                navigation.reset({ index: 0, routes: [{ name: "Home" }] });
            } else {
                Toast.show({ text1: data.message || "Login failed", type: "error" });
            }
        } catch (e: any) {
            Toast.show({ text1: e?.message || "Network error. Please try again.", type: "error" });
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
                                <Text style={styles.heroTitle}>
                                    Welcome{'\n'}Back
                                </Text>
                                <Text style={styles.heroSubtitle}>
                                    Sign in to continue your culinary journey.
                                </Text>
                            </View>

                            <View style={styles.card}>
                                <View style={styles.fieldGroup}>
                                    <Text style={styles.fieldLabel}>Email Address</Text>
                                    <View style={styles.inputBox}>
                                        <MaterialCommunityIcons
                                            name="email-outline"
                                            size={sizes.icon}
                                            color={colors.outline}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter your email"
                                            placeholderTextColor={colors.outline}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            value={email}
                                            onChangeText={setEmail}
                                        />
                                    </View>
                                </View>

                                <View style={styles.fieldGroup}>
                                    <Text style={styles.fieldLabel}>Password</Text>
                                    <View style={styles.inputBox}>
                                        <MaterialCommunityIcons
                                            name="lock-outline"
                                            size={sizes.icon}
                                            color={colors.outline}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter your password"
                                            placeholderTextColor={colors.outline}
                                            secureTextEntry={!showPassword}
                                            value={password}
                                            onChangeText={setPassword}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowPassword(!showPassword)}
                                            style={styles.eyeBtn}
                                        >
                                            <MaterialCommunityIcons
                                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                                size={22}
                                                color={colors.textSecondary}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate("ForgotPassword")}
                                        style={styles.forgotRow}
                                    >
                                        <Text style={styles.forgotText}>Forgot Password?</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    disabled={isDisabled || loading}
                                    onPress={handleLogin}
                                    style={[
                                        styles.loginBtn,
                                        (isDisabled || loading) && styles.loginBtnDisabled,
                                    ]}
                                >
                                    <Text style={styles.loginBtnText}>
                                        {loading ? "Authenticating..." : "Login"}
                                    </Text>
                                </TouchableOpacity>

                                <View style={styles.divider}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>or</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                <TouchableOpacity style={styles.googleBtn}>
                                    <MaterialCommunityIcons
                                        name="google"
                                        size={sizes.icon}
                                        color={colors.textPrimary}
                                    />
                                    <Text style={styles.googleBtnText}>Continue with Google</Text>
                                </TouchableOpacity>

                                <View style={styles.signupRow}>
                                    <Text style={styles.signupPrefix}>
                                        Don't have an account?{" "}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate("SignUp")}
                                    >
                                        <Text style={styles.signupLink}>Join the Feast</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ height: insets.bottom, backgroundColor: colors.surface }} />
                        </ScrollView>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

export default LoginScreen;

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
        marginBottom: spacing.lg,
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
    forgotRow: {
        alignSelf: "flex-end",
        marginTop: spacing.sm,
    },
    forgotText: {
        fontSize: 13,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
    },
    loginBtn: {
        height: sizes.inputHeightLg,
        borderRadius: radius.lg,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginTop: spacing.sm,
        ...shadows.button,
    },
    loginBtnDisabled: {
        opacity: 0.5,
    },
    loginBtnText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.white,
        letterSpacing: typography.letterSpacing.wide,
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.divider,
    },
    dividerText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
        textTransform: "uppercase",
        letterSpacing: typography.letterSpacing.xl,
        marginHorizontal: spacing.md,
    },
    googleBtn: {
        flexDirection: "row",
        height: 50,
        backgroundColor: colors.inputBackground,
        borderRadius: radius.lg,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        marginTop: 20,
    },
    googleBtnText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    signupRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 28,
    },
    signupPrefix: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
    },
    signupLink: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
    },
});
