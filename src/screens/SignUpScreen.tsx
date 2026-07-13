import { useState } from "react";
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
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { register } from "../api/auth";

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

const SignUpScreen = () => {
    const navigation = useNavigation<Nav>();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        if (!name.trim() || !email.trim() || !password) {
            Alert.alert("Error", "All fields are required");
            return;
        }
        setLoading(true);
        try {
            const data = await register(name.trim(), email.trim(), password);
            if (data.success) {
                navigation.navigate("EmailOTPVerification", { email: email.trim() });
            } else {
                Alert.alert("Error", data.message || "Registration failed");
            }
        } catch (e: any) {
            Alert.alert("Error", e?.message || "Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: C.surface }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: "center",
                        paddingHorizontal: 24,
                        paddingVertical: 32,
                    }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Brand Mark */}
                    <View style={{ alignItems: "center", marginBottom: 24 }}>
                        <Text
                            style={{
                                fontFamily: "Plus Jakarta Sans",
                                fontSize: 40,
                                lineHeight: 48,
                                letterSpacing: -0.02,
                                fontWeight: "800",
                                color: C.primary,
                            }}
                        >
                            CraveGo
                        </Text>
                        <View
                            style={{
                                width: 48,
                                height: 4,
                                backgroundColor: C.primary,
                                borderRadius: 999,
                                marginTop: 4,
                            }}
                        />
                    </View>

                    {/* Header */}
                    <View style={{ alignItems: "center", marginBottom: 24 }}>
                        <Text
                            style={{
                                fontFamily: "Plus Jakarta Sans",
                                fontSize: 24,
                                lineHeight: 32,
                                fontWeight: "700",
                                color: C.onSurface,
                                letterSpacing: -0.3,
                            }}
                        >
                            Join the Family
                        </Text>
                        <Text
                            style={{
                                fontFamily: "Plus Jakarta Sans",
                                fontSize: 14,
                                lineHeight: 20,
                                color: C.onSurfaceVariant,
                                textAlign: "center",
                                maxWidth: 280,
                                marginTop: 4,
                            }}
                        >
                            Premium dining experiences curated just for you.
                        </Text>
                    </View>

                    {/* Full Name */}
                    <View style={{ marginBottom: 16 }}>
                        <Text
                            style={{
                                fontFamily: "Plus Jakarta Sans",
                                fontSize: 14,
                                lineHeight: 20,
                                letterSpacing: 0.1,
                                fontWeight: "600",
                                color: C.onSurfaceVariant,
                                marginLeft: 4,
                                marginBottom: 4,
                            }}
                        >
                            Full Name
                        </Text>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: "rgba(255,255,255,0.9)",
                                borderWidth: 1,
                                borderColor: "rgba(225,191,181,0.4)",
                                borderRadius: 12,
                                height: 52,
                                paddingLeft: 12,
                                paddingRight: 16,
                            }}
                        >
                            <MaterialCommunityIcons
                                name="account-outline"
                                size={20}
                                color={C.outline + "99"}
                            />
                            <TextInput
                                style={{
                                    flex: 1,
                                    fontFamily: "Plus Jakarta Sans",
                                    fontSize: 14,
                                    lineHeight: 20,
                                    color: C.onSurface,
                                    marginLeft: 8,
                                    padding: 0,
                                }}
                                placeholder="Arjun Sharma"
                                placeholderTextColor={C.outline + "66"}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={{ marginBottom: 16 }}>
                        <Text
                            style={{
                                fontFamily: "Plus Jakarta Sans",
                                fontSize: 14,
                                lineHeight: 20,
                                letterSpacing: 0.1,
                                fontWeight: "600",
                                color: C.onSurfaceVariant,
                                marginLeft: 4,
                                marginBottom: 4,
                            }}
                        >
                            Email Address
                        </Text>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: "rgba(255,255,255,0.9)",
                                borderWidth: 1,
                                borderColor: "rgba(225,191,181,0.4)",
                                borderRadius: 12,
                                height: 52,
                                paddingLeft: 12,
                                paddingRight: 16,
                            }}
                        >
                            <MaterialCommunityIcons
                                name="email"
                                size={20}
                                color={C.outline + "99"}
                            />
                            <TextInput
                                style={{
                                    flex: 1,
                                    fontFamily: "Plus Jakarta Sans",
                                    fontSize: 14,
                                    lineHeight: 20,
                                    color: C.onSurface,
                                    marginLeft: 12,
                                    padding: 0,
                                }}
                                placeholder="arjun@example.com"
                                placeholderTextColor={C.outline + "66"}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={{ marginBottom: 16 }}>
                        <Text
                            style={{
                                fontFamily: "Plus Jakarta Sans",
                                fontSize: 14,
                                lineHeight: 20,
                                letterSpacing: 0.1,
                                fontWeight: "600",
                                color: C.onSurfaceVariant,
                                marginLeft: 4,
                                marginBottom: 4,
                            }}
                        >
                            Password
                        </Text>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: "rgba(255,255,255,0.9)",
                                borderWidth: 1,
                                borderColor: "rgba(225,191,181,0.4)",
                                borderRadius: 12,
                                height: 52,
                                paddingLeft: 12,
                                paddingRight: 12,
                            }}
                        >
                            <MaterialCommunityIcons
                                name="lock"
                                size={20}
                                color={C.outline + "99"}
                            />
                            <TextInput
                                style={{
                                    flex: 1,
                                    fontFamily: "Plus Jakarta Sans",
                                    fontSize: 14,
                                    lineHeight: 20,
                                    color: C.onSurface,
                                    marginLeft: 12,
                                    padding: 0,
                                }}
                                placeholder="••••••••"
                                placeholderTextColor={C.outline + "66"}
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <MaterialCommunityIcons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color={C.outline + "99"}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Sign Up Button */}
                    <View style={{ paddingTop: 4 }}>
                        <TouchableOpacity
                            activeOpacity={0.98}
                            disabled={loading}
                            onPress={handleSignUp}
                            style={[
                                {
                                    flexDirection: "row",
                                    height: 52,
                                    borderRadius: 12,
                                    backgroundColor: C.primaryContainer,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 8,
                                    shadowColor: C.primaryContainer,
                                    shadowOffset: { width: 0, height: 12 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 24,
                                    elevation: 8,
                                },
                                loading && { opacity: 0.5 },
                            ]}
                        >
                            <Text
                                style={{
                                    fontFamily: "Plus Jakarta Sans",
                                    fontSize: 20,
                                    lineHeight: 28,
                                    fontWeight: "600",
                                    color: C.onPrimary,
                                }}
                            >
                                {loading ? "Creating account..." : "Sign Up"}
                            </Text>
                            <MaterialCommunityIcons
                                name="arrow-right"
                                size={20}
                                color={C.onPrimary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 32,
                        }}
                    >
                        <View
                            style={{
                                flex: 1,
                                borderTopWidth: 1,
                                borderColor: C.outlineVariant,
                                opacity: 0.3,
                            }}
                        />
                        <Text
                            style={{
                                fontFamily: "Plus Jakarta Sans",
                                fontSize: 11,
                                lineHeight: 16,
                                letterSpacing: 1.7,
                                fontWeight: "600",
                                color: C.outline,
                                textTransform: "uppercase",
                                marginHorizontal: 16,
                                opacity: 0.6,
                            }}
                        >
                            Or continue with
                        </Text>
                        <View
                            style={{
                                flex: 1,
                                borderTopWidth: 1,
                                borderColor: C.outlineVariant,
                                opacity: 0.3,
                            }}
                        />
                    </View>

                    {/* Social Buttons */}
                    <View style={{ flexDirection: "row", gap: 16 }}>
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                height: 52,
                                borderWidth: 1,
                                borderColor: C.outlineVariant,
                                opacity: 0.3,
                                borderRadius: 12,
                                backgroundColor: "rgba(255,255,255,0.5)",
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
                                height: 52,
                                borderWidth: 1,
                                borderColor: C.outlineVariant,
                                opacity: 0.3,
                                borderRadius: 12,
                                backgroundColor: "rgba(255,255,255,0.5)",
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

                    {/* Footer */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            marginTop: 24,
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
                            Already have an account?{" "}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                            <Text
                                style={{
                                    fontFamily: "Plus Jakarta Sans",
                                    fontSize: 14,
                                    lineHeight: 20,
                                    fontWeight: "700",
                                    color: C.primaryContainer,
                                    textDecorationLine: "underline",
                                    textDecorationColor: C.primaryContainer + "4D",
                                }}
                            >
                                Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default SignUpScreen;