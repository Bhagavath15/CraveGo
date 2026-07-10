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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { forgotPassword } from "../utils/api";

const C = {
    primary: "#FF6B35",
    primaryContainer: "#ff6b35",
    secondaryFixed: "#6bfe9c",
    surface: "#fcf9f8",
    onSurface: "#1b1c1c",
    onSurfaceVariant: "#594139",
    surfaceContainerLowest: "#ffffff",
    outlineVariant: "#e1bfb5",
    outline: "#8d7168",
    primaryFixed: "#ffdbd0",
    onPrimary: "#ffffff",
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ForgotPasswordScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<Nav>();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!email.trim()) {
            Alert.alert("Error", "Please enter your email");
            return;
        }
        setLoading(true);
        try {
            const data = await forgotPassword(email.trim());
            if (data.success) {
                navigation.navigate("ForgotPasswordOTP", { email: email.trim() });
            } else {
                Alert.alert("Error", data.message || "Failed to send OTP");
            }
        } catch {
            Alert.alert("Error", "Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: C.surface }}>
            {/* Background Decorations */}
            <View
                style={{
                    position: "absolute",
                    top: -160,
                    right: -160,
                    width: 500,
                    height: 500,
                    backgroundColor: C.primary,
                    borderRadius: 250,
                    opacity: 0.05,
                }}
            />
            <View
                style={{
                    position: "absolute",
                    bottom: -160,
                    left: -120,
                    width: 400,
                    height: 400,
                    backgroundColor: C.secondaryFixed,
                    borderRadius: 200,
                    opacity: 0.05,
                }}
            />

            {/* TopAppBar */}
            <View
                style={{
                    paddingTop: insets.top,
                    backgroundColor: "rgba(255,255,255,0.8)",
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        height: 64,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{
                            padding: 8,
                            borderRadius: 999,
                            marginLeft: -8,
                        }}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color={C.onSurface}
                        />
                    </TouchableOpacity>
                    <Text
                        style={{
                            fontFamily: "Plus Jakarta Sans",
                            fontSize: 24,
                            fontWeight: "800",
                            letterSpacing: -0.5,
                            color: C.primary,
                            marginLeft: 4,
                        }}
                    >
                        CraveGo
                    </Text>
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
                        paddingTop: 32,
                        paddingBottom: 32,
                    }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Hero Icon */}
                    <View style={{ alignItems: "center", marginBottom: 24 }}>
                        <View
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 24,
                                backgroundColor: "rgba(171,53,0,0.1)",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <MaterialCommunityIcons
                                name={"lock-reset"}
                                size={40}
                                color={C.primary}
                            />
                        </View>
                    </View>

                    {/* Header Text */}
                    <View style={{ alignItems: "center", marginBottom: 24 }}>
                        <Text
                            style={{
                                fontFamily: "Plus Jakarta Sans",
                                fontSize: 28,
                                lineHeight: 36,
                                fontWeight: "700",
                                color: C.onSurface,
                                marginBottom: 8,
                            }}
                        >
                            Reset Password
                        </Text>
                        <Text
                            style={{
                                fontFamily: "Plus Jakarta Sans",
                                fontSize: 16,
                                lineHeight: 24,
                                color: C.onSurfaceVariant,
                                textAlign: "center",
                                paddingHorizontal: 16,
                            }}
                        >
                            Don't worry! Enter your email below to receive your password
                            reset instructions.
                        </Text>
                    </View>

                    {/* Card */}
                    <View
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: 24,
                            borderWidth: 1,
                            borderColor: "rgba(0,0,0,0.05)",
                            padding: 24,
                            shadowColor: C.primaryContainer,
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.1,
                            shadowRadius: 40,
                            elevation: 4,
                        }}
                    >
                        {/* Email Field */}
                        <View style={{ marginBottom: 24 }}>
                            <Text
                                style={{
                                    fontFamily: "Plus Jakarta Sans",
                                    fontSize: 14,
                                    lineHeight: 20,
                                    letterSpacing: 0.1,
                                    fontWeight: "600",
                                    color: C.onSurface,
                                    marginLeft: 4,
                                    marginBottom: 8,
                                }}
                            >
                                Email Address
                            </Text>
                            <View
                                style={{
                                    backgroundColor: C.surfaceContainerLowest,
                                    borderWidth: 1,
                                    borderColor: C.outlineVariant,
                                    borderRadius: 12,
                                }}
                            >
                                <TextInput
                                    style={{
                                        fontFamily: "Plus Jakarta Sans",
                                        fontSize: 16,
                                        lineHeight: 24,
                                        color: C.onSurface,
                                        paddingHorizontal: 16,
                                        paddingVertical: 14,
                                    }}
                                    placeholder="foodie@cravego.com"
                                    placeholderTextColor={C.outline + "66"}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        {/* Send Reset Code Button */}
                        <TouchableOpacity
                            activeOpacity={0.9}
                            disabled={loading}
                            onPress={handleSend}
                            style={[
                                {
                                    flexDirection: "row",
                                    height: 56,
                                    borderRadius: 12,
                                    backgroundColor: C.primary,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 8,
                                    shadowColor: C.primary,
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 8,
                                    elevation: 6,
                                },
                                loading && { opacity: 0.5 },
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
                                {loading ? "Sending..." : "Send Reset Code"}
                            </Text>
                            <MaterialCommunityIcons
                                name="arrow-right"
                                size={20}
                                color={C.onPrimary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Back to Login */}
                    <View style={{ alignItems: "center", marginTop: 24 }}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Login")}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                paddingVertical: 8,
                            }}
                        >
                            <MaterialCommunityIcons
                                name="arrow-left"
                                size={18}
                                color={C.onSurfaceVariant}
                            />
                            <Text
                                style={{
                                    fontFamily: "Plus Jakarta Sans",
                                    fontSize: 14,
                                    lineHeight: 20,
                                    letterSpacing: 0.1,
                                    fontWeight: "600",
                                    color: C.onSurfaceVariant,
                                }}
                            >
                                Back to Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default ForgotPasswordScreen;