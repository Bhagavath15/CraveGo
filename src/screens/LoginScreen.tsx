import { useState } from "react";
import {
    Alert,
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
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../types/types";
import { login } from "../api/auth";
import { setAuthToken } from "../api/client";
import { saveToken } from "../utils/authStore";

const C = {
    primary: "#FF6B35",
    primaryContainer: "#ff6b35",
    onPrimary: "#ffffff",
    surface: "#fcf9f8",
    onSurface: "#1b1c1c",
    onSurfaceVariant: "#594139",
    surfaceContainerLowest: "#ffffff",
    outlineVariant: "#e1bfb5",
    outline: "#8d7168",
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
    const navigation = useNavigation<Nav>();
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
                Alert.alert("Error", data.message || "Login failed");
            }
        } catch (e: any) {
            Alert.alert("Error", e?.message || "Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
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
                            <View style={styles.mainContent}>
                                <ImageBackground
                                    source={require("../assets/images/welcome-screen.png")}
                                    style={styles.bgImage}
                                    resizeMode="cover"
                                />

                                <View style={styles.glassCard}>
                                    <View style={styles.headingSection}>
                                        <Text style={styles.headingTitle}>Welcome Back</Text>
                                        <Text style={styles.headingSubtitle}>
                                            Sign in to continue your culinary journey.
                                        </Text>
                                    </View>

                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Email Address</Text>
                                        <View style={styles.inputBox}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Email Address"
                                                placeholderTextColor={C.outline}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                value={email}
                                                onChangeText={setEmail}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.fieldGroupCompact}>
                                        <Text style={styles.fieldLabel}>Password</Text>
                                        <View style={styles.inputBox}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Password"
                                                placeholderTextColor={C.outline}
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
                                                    color={C.onSurfaceVariant}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.forgotRow}>
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate("ForgotPassword")}
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
                                        <MaterialCommunityIcons
                                            name="arrow-right"
                                            size={20}
                                            color={C.onPrimary}
                                        />
                                    </TouchableOpacity>

                                    <View style={styles.divider}>
                                        <View style={styles.dividerLine} />
                                        <Text style={styles.dividerText}>or continue with</Text>
                                        <View style={styles.dividerLine} />
                                    </View>

                                    <View style={styles.socialRow}>
                                        <TouchableOpacity style={styles.socialBtn}>
                                            <MaterialCommunityIcons
                                                name="google"
                                                size={20}
                                                color={C.onSurface}
                                            />
                                            <Text style={styles.socialBtnText}>Google</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.socialBtn}>
                                            <MaterialCommunityIcons
                                                name="facebook"
                                                size={20}
                                                color="#1877F2"
                                            />
                                            <Text style={styles.socialBtnText}>Facebook</Text>
                                        </TouchableOpacity>
                                    </View>

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

                                <View style={styles.branding}>
                                    <Text style={styles.brandingText}>CraveGo</Text>
                                </View>
                            </View>
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
        backgroundColor: C.surface,
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    mainContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 128,
        paddingBottom: 24,
    },
    bgImage: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "65%",
        zIndex: 0,
        overflow: "hidden",
    },
    glassCard: {
        position: "relative",
        zIndex: 10,
        backgroundColor: "rgba(255,255,255,0.9)",
        borderRadius: 32,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.4)",
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.1,
        shadowRadius: 50,
        elevation: 8,
    },
    headingSection: {
        marginBottom: 24,
        alignItems: "center",
    },
    headingTitle: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 32,
        lineHeight: 40,
        letterSpacing: -0.01,
        fontWeight: "700",
        color: C.onSurface,
        marginBottom: 4,
    },
    headingSubtitle: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 16,
        lineHeight: 24,
        color: C.onSurfaceVariant,
        textAlign: "center",
    },
    fieldGroup: {
        marginBottom: 24,
    },
    fieldGroupCompact: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 16,
        lineHeight: 24,
        color: C.onSurfaceVariant,
        marginBottom: 6,
    },
    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: C.outlineVariant,
        borderRadius: 16,
        height: 56,
        paddingHorizontal: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    input: {
        flex: 1,
        fontFamily: "Plus Jakarta Sans",
        fontSize: 16,
        lineHeight: 24,
        color: C.onSurface,
        padding: 0,
    },
    eyeBtn: {
        padding: 4,
    },
    forgotRow: {
        alignItems: "flex-end",
        marginBottom: 24,
    },
    forgotText: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.1,
        fontWeight: "600",
        color: C.primaryContainer,
    },
    loginBtn: {
        flexDirection: "row",
        height: 56,
        borderRadius: 16,
        backgroundColor: C.primaryContainer,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        shadowColor: C.primaryContainer,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    loginBtnDisabled: {
        opacity: 0.5,
    },
    loginBtnText: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.1,
        fontWeight: "600",
        color: C.onPrimary,
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: C.outlineVariant,
        opacity: 0.5,
    },
    dividerText: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 11,
        fontWeight: "600",
        color: C.onSurfaceVariant,
        textTransform: "uppercase",
        letterSpacing: 2,
        marginHorizontal: 16,
    },
    socialRow: {
        flexDirection: "row",
        gap: 16,
        marginTop: 24,
    },
    socialBtn: {
        flex: 1,
        flexDirection: "row",
        height: 48,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: C.outlineVariant,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    socialBtnText: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.1,
        fontWeight: "600",
        color: C.onSurface,
    },
    signupRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 48,
    },
    signupPrefix: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 14,
        lineHeight: 20,
        color: C.onSurfaceVariant,
    },
    signupLink: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "600",
        color: C.primaryContainer,
        textDecorationLine: "underline",
        textDecorationColor: C.primaryContainer,
    },
    branding: {
        alignItems: "center",
        opacity: 0.3,
        marginTop: 24,
    },
    brandingText: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 30,
        fontWeight: "900",
        color: C.primaryContainer,
        letterSpacing: -0.02,
    },
});
