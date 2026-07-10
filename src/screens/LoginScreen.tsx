import { useState } from "react";
import {
    Alert,
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
import { loginUser } from "../utils/api";
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
            const data = await loginUser(email.trim(), password);
            if (data.success) {
                await saveToken(data.token);
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
        <View style={{ flex: 1, backgroundColor: C.surface }}>
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{ flexGrow: 1 }}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 128, paddingBottom: 24 }}>
                                <View
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: "45%",
                                        zIndex: 0,
                                        overflow: "hidden",
                                        backgroundColor: C.primary,
                                        opacity: 0.15,
                                    }}
                                />

                                {/* Glass Panel Card */}
                                <View
                                    style={{
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
                                    }}
                                >
                                    {/* Heading */}
                                    <View style={{ marginBottom: 24, alignItems: "center" }}>
                                        <Text
                                            style={{
                                                fontFamily: "Plus Jakarta Sans",
                                                fontSize: 32,
                                                lineHeight: 40,
                                                letterSpacing: -0.01,
                                                fontWeight: "700",
                                                color: C.onSurface,
                                                marginBottom: 4,
                                            }}
                                        >
                                            Welcome Back
                                        </Text>
                                        <Text
                                            style={{
                                                fontFamily: "Plus Jakarta Sans",
                                                fontSize: 16,
                                                lineHeight: 24,
                                                color: C.onSurfaceVariant,
                                                textAlign: "center",
                                            }}
                                        >
                                            Sign in to continue your culinary journey.
                                        </Text>
                                    </View>

                                    {/* Email Input */}
                                    <View style={{ marginBottom: 24 }}>
                                        <Text
                                            style={{
                                                fontFamily: "Plus Jakarta Sans",
                                                fontSize: 16,
                                                lineHeight: 24,
                                                color: C.onSurfaceVariant,
                                                marginBottom: 6,
                                            }}
                                        >
                                            Email Address
                                        </Text>
                                        <View
                                            style={{
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
                                            }}
                                        >
                                            <TextInput
                                                style={{
                                                    flex: 1,
                                                    fontFamily: "Plus Jakarta Sans",
                                                    fontSize: 16,
                                                    lineHeight: 24,
                                                    color: C.onSurface,
                                                    padding: 0,
                                                }}
                                                placeholder="Email Address"
                                                placeholderTextColor={C.outline}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                value={email}
                                                onChangeText={setEmail}
                                            />
                                        </View>
                                    </View>

                                    {/* Password Input */}
                                    <View style={{ marginBottom: 16 }}>
                                        <Text
                                            style={{
                                                fontFamily: "Plus Jakarta Sans",
                                                fontSize: 16,
                                                lineHeight: 24,
                                                color: C.onSurfaceVariant,
                                                marginBottom: 6,
                                            }}
                                        >
                                            Password
                                        </Text>
                                        <View
                                            style={{
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
                                            }}
                                        >
                                            <TextInput
                                                style={{
                                                    flex: 1,
                                                    fontFamily: "Plus Jakarta Sans",
                                                    fontSize: 16,
                                                    lineHeight: 24,
                                                    color: C.onSurface,
                                                    padding: 0,
                                                }}
                                                placeholder="Password"
                                                placeholderTextColor={C.outline}
                                                secureTextEntry={!showPassword}
                                                value={password}
                                                onChangeText={setPassword}
                                            />
                                            <TouchableOpacity
                                                onPress={() => setShowPassword(!showPassword)}
                                                style={{ padding: 4 }}
                                            >
                                                <MaterialCommunityIcons
                                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                                    size={22}
                                                    color={C.onSurfaceVariant}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Forgot Password */}
                                    <View style={{ alignItems: "flex-end", marginBottom: 24 }}>
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate("ForgotPassword")}
                                        >
                                            <Text
                                                style={{
                                                    fontFamily: "Plus Jakarta Sans",
                                                    fontSize: 14,
                                                    lineHeight: 20,
                                                    letterSpacing: 0.1,
                                                    fontWeight: "600",
                                                    color: C.primaryContainer,
                                                }}
                                            >
                                                Forgot Password?
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Login Button */}
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        disabled={isDisabled || loading}
                                        onPress={handleLogin}
                                        style={[
                                            {
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
                                            (isDisabled || loading) && { opacity: 0.5 },
                                        ]}
                                    >
                                        <Text
                                            style={{
                                                fontFamily: "Plus Jakarta Sans",
                                                fontSize: 14,
                                                lineHeight: 20,
                                                letterSpacing: 0.1,
                                                fontWeight: "600",
                                                color: C.onPrimary,
                                            }}
                                        >
                                            {loading ? "Authenticating..." : "Login"}
                                        </Text>
                                        <MaterialCommunityIcons
                                            name="arrow-right"
                                            size={20}
                                            color={C.onPrimary}
                                        />
                                    </TouchableOpacity>

                                    {/* Divider */}
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            marginTop: 24,
                                        }}
                                    >
                                        <View
                                            style={{
                                                flex: 1,
                                                height: 1,
                                                backgroundColor: C.outlineVariant,
                                                opacity: 0.5,
                                            }}
                                        />
                                        <Text
                                            style={{
                                                fontFamily: "Plus Jakarta Sans",
                                                fontSize: 11,
                                                fontWeight: "600",
                                                color: C.onSurfaceVariant,
                                                textTransform: "uppercase",
                                                letterSpacing: 2,
                                                marginHorizontal: 16,
                                            }}
                                        >
                                            or continue with
                                        </Text>
                                        <View
                                            style={{
                                                flex: 1,
                                                height: 1,
                                                backgroundColor: C.outlineVariant,
                                                opacity: 0.5,
                                            }}
                                        />
                                    </View>

                                    {/* Social Buttons */}
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            gap: 16,
                                            marginTop: 24,
                                        }}
                                    >
                                        <TouchableOpacity
                                            style={{
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
                                            }}
                                        >
                                            <MaterialCommunityIcons
                                                name="google"
                                                size={20}
                                                color={C.onSurface}
                                            />
                                            <Text
                                                style={{
                                                    fontFamily: "Plus Jakarta Sans",
                                                    fontSize: 14,
                                                    lineHeight: 20,
                                                    letterSpacing: 0.1,
                                                    fontWeight: "600",
                                                    color: C.onSurface,
                                                }}
                                            >
                                                Google
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{
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
                                            }}
                                        >
                                            <MaterialCommunityIcons
                                                name="facebook"
                                                size={20}
                                                color="#1877F2"
                                            />
                                            <Text
                                                style={{
                                                    fontFamily: "Plus Jakarta Sans",
                                                    fontSize: 14,
                                                    lineHeight: 20,
                                                    letterSpacing: 0.1,
                                                    fontWeight: "600",
                                                    color: C.onSurface,
                                                }}
                                            >
                                                Facebook
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Sign Up Link */}
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "center",
                                            marginTop: 48,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontFamily: "Plus Jakarta Sans",
                                                fontSize: 14,
                                                lineHeight: 20,
                                                color: C.onSurfaceVariant,
                                            }}
                                        >
                                            Don't have an account?{" "}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate("SignUp")}
                                        >
                                            <Text
                                                style={{
                                                    fontFamily: "Plus Jakarta Sans",
                                                    fontSize: 14,
                                                    lineHeight: 20,
                                                    fontWeight: "600",
                                                    color: C.primaryContainer,
                                                    textDecorationLine: "underline",
                                                    textDecorationColor: C.primaryContainer,
                                                }}
                                            >
                                                Join the Feast
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* CraveGo Branding */}
                                <View
                                    style={{
                                        alignItems: "center",
                                        opacity: 0.3,
                                        marginTop: 24,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontFamily: "Plus Jakarta Sans",
                                            fontSize: 30,
                                            fontWeight: "900",
                                            color: C.primaryContainer,
                                            letterSpacing: -0.02,
                                        }}
                                    >
                                        CraveGo
                                    </Text>
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