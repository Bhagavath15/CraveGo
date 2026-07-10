import { useState } from "react";
import {
    Alert,
    ImageBackground,
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
import { resetPassword } from "../utils/api";

const COLORS = {
    primary: "#FF6B35",
    primaryContainer: "#ff6b35",
    primaryFixed: "#ffdbd0",
    surface: "#fcf9f8",
    onSurface: "#1b1c1c",
    onSurfaceVariant: "#594139",
    surfaceContainerLowest: "#ffffff",
    outlineVariant: "#e1bfb5",
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, "ResetPassword">;

const ResetPasswordScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRoute>();
    const { resetToken } = route.params;

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert("Error", "All fields are required");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }
        setLoading(true);
        try {
            const data = await resetPassword(resetToken, newPassword);
            if (data.success) {
                Alert.alert("Success", "Password reset successfully!", [
                    { text: "OK", onPress: () => navigation.navigate("Login") },
                ]);
            } else {
                Alert.alert("Error", data.message || "Failed to reset password");
            }
        } catch {
            Alert.alert("Error", "Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <ImageBackground
                source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_2CLb1FsgjC47qxV-BX8Nm6iVFOIj48BCEjSgD6diWPjvy0DqOX1SB5juW5GaqUwdXPf98hDNqiy67vzPoTBsJQQRIUkxzVqCqz5ZF7qiQ8clS1YYewnMCHlEBFPbAMW2sGqoXAh0bRR7PGu8TqYFQWh_lHzKvUfMljFmSJ8P-Bz7Ml-2vUBrVuYsqf-Y5ST9bGIDZORuAMMvPB90oLOfA5B49dIrldVvpO_q4rSNhgwKu_RxxQLzj-NI" }}
                style={styles.headerBg}
            >
                <View style={styles.headerOverlay} />
            </ImageBackground>
            <View style={[styles.safeWrap, { paddingTop: insets.top }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.onSurface} />
                </TouchableOpacity>

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.glassPanel}>
                            <View style={styles.iconCircle}>
                                <MaterialCommunityIcons
                                    name="lock-reset"
                                    size={32}
                                    color={COLORS.primary}
                                />
                            </View>

                            <Text style={styles.title}>Reset Password</Text>
                            <Text style={styles.subtitle}>
                                Enter your new password
                            </Text>

                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="New Password"
                                    placeholderTextColor={COLORS.onSurfaceVariant}
                                    secureTextEntry={!showPassword}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <MaterialCommunityIcons
                                        name={showPassword ? "visibility-off" : "visibility"}
                                        size={22}
                                        color={COLORS.onSurfaceVariant}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm Password"
                                    placeholderTextColor={COLORS.onSurfaceVariant}
                                    secureTextEntry={!showPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.button, loading && styles.disabledButton]}
                                onPress={handleReset}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? "Resetting..." : "Reset Password"}
                                </Text>
                                <MaterialCommunityIcons
                                    name="arrow-right"
                                    size={20}
                                    color="#FFF"
                                />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </View>
    );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.surface,
    },
    headerBg: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "30%",
    },
    headerOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: COLORS.primary,
        opacity: 0.15,
    },
    safeWrap: {
        flex: 1,
    },
    backBtn: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        zIndex: 10,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        justifyContent: "flex-end",
        paddingBottom: 32,
    },
    glassPanel: {
        backgroundColor: "rgba(255,255,255,0.85)",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primaryFixed,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 28,
        lineHeight: 36,
        fontWeight: "700",
        color: COLORS.onSurface,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 16,
        lineHeight: 24,
        fontWeight: "400",
        color: COLORS.onSurfaceVariant,
        textAlign: "center",
        marginBottom: 24,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surfaceContainerLowest,
        borderWidth: 1.5,
        borderColor: COLORS.outlineVariant,
        borderRadius: 12,
        height: 56,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    input: {
        flex: 1,
        fontFamily: "Plus Jakarta Sans",
        fontSize: 16,
        lineHeight: 24,
        fontWeight: "400",
        color: COLORS.onSurface,
    },
    button: {
        flexDirection: "row",
        height: 56,
        borderRadius: 12,
        backgroundColor: COLORS.primaryContainer,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
        marginTop: 8,
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonText: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.1,
        fontWeight: "600",
        color: "#FFF",
    },
});