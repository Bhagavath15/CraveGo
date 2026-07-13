import { useRef, useState } from "react";
import {
    Alert,
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
import { resetPassword } from "../api/auth";

const C = {
    primary: "#FF6B35",
    primaryContainer: "#ff6b35",
    onPrimary: "#ffffff",
    surface: "#fcf9f8",
    onSurface: "#1b1c1c",
    onSurfaceVariant: "#594139",
    surfaceContainerLowest: "#ffffff",
    outline: "#8d7168",
    outlineVariant: "#e1bfb5",
    surfaceContainerLow: "#f6f3f2",
    surfaceContainerHighest: "#e5e2e1",
    tertiary: "#785900",
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
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const confirmRef = useRef<TextInput>(null);

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
            {/* Ambient blurs */}
            <View style={styles.blobTop} />
            <View style={styles.blobBottom} />

            <View style={[styles.safeWrap, { paddingTop: insets.top }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backBtn}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color={C.onSurfaceVariant}
                        />
                    </TouchableOpacity>
                    <Text style={styles.logo}>CraveGo</Text>
                    <View style={{ width: 40 }} />
                </View>

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Title section */}
                        <View style={styles.titleSection}>
                            <Text style={styles.title}>Create New Password</Text>
                            <Text style={styles.subtitle}>
                                Your new password must be different from previous ones.
                            </Text>
                        </View>

                        {/* New Password */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>New Password</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons
                                    name="lock"
                                    size={20}
                                    color={C.outline}
                                />
                                <TextInput
                                    ref={(ref) => {
                                        // first field ref not needed beyond focus
                                    }}
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor={C.outline}
                                    secureTextEntry={!showNew}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    returnKeyType="next"
                                    onSubmitEditing={() => confirmRef.current?.focus()}
                                />
                                <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                                    <MaterialCommunityIcons
                                        name={showNew ? "eye-off" : "eye"}
                                        size={20}
                                        color={C.outline}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Confirm New Password</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons
                                    name="lock-reset"
                                    size={20}
                                    color={C.outline}
                                />
                                <TextInput
                                    ref={confirmRef}
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor={C.outline}
                                    secureTextEntry={!showConfirm}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    returnKeyType="done"
                                    onSubmitEditing={handleReset}
                                />
                                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                    <MaterialCommunityIcons
                                        name={showConfirm ? "eye-off" : "eye"}
                                        size={20}
                                        color={C.outline}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Info text */}
                        <View style={styles.infoSection}>
                            <Text style={styles.infoText}>
                                You will be redirected to login after a successful reset.
                            </Text>
                        </View>

                        {/* Button */}
                        <TouchableOpacity
                            style={[styles.button, loading && { opacity: 0.5 }]}
                            onPress={handleReset}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? "Resetting..." : "Reset Password"}
                            </Text>
                            <MaterialCommunityIcons
                                name="arrow-right"
                                size={20}
                                color={C.onPrimary}
                            />
                        </TouchableOpacity>
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
        backgroundColor: C.surface,
    },
    blobTop: {
        position: "absolute",
        top: -80,
        left: -80,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: C.primary,
        opacity: 0.08,
    },
    blobBottom: {
        position: "absolute",
        bottom: -60,
        right: -60,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: C.tertiary,
        opacity: 0.06,
    },
    safeWrap: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        height: 64,
        borderBottomWidth: 1,
        borderBottomColor: C.surfaceContainerHighest,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 22,
        lineHeight: 28,
        fontWeight: "800",
        letterSpacing: -0.5,
        color: C.primary,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    titleSection: {
        alignItems: "center",
        marginBottom: 24,
        marginTop: 16,
    },
    title: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 24,
        lineHeight: 32,
        fontWeight: "700",
        color: C.onSurface,
        marginBottom: 4,
    },
    subtitle: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "400",
        color: C.onSurfaceVariant,
        textAlign: "center",
        maxWidth: 280,
    },
    fieldGroup: {
        marginBottom: 16,
    },
    label: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.1,
        fontWeight: "600",
        color: C.onSurfaceVariant,
        marginLeft: 4,
        marginBottom: 4,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: C.surfaceContainerLowest,
        borderWidth: 1,
        borderColor: C.outlineVariant,
        borderRadius: 12,
        height: 52,
        paddingHorizontal: 16,
        gap: 10,
    },
    input: {
        flex: 1,
        fontFamily: "Plus Jakarta Sans",
        fontSize: 16,
        lineHeight: 24,
        fontWeight: "400",
        color: C.onSurface,
    },
    infoSection: {
        alignItems: "center",
        marginVertical: 24,
    },
    infoText: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "400",
        color: C.onSurfaceVariant,
        textAlign: "center",
    },
    button: {
        flexDirection: "row",
        height: 56,
        borderRadius: 12,
        backgroundColor: C.primaryContainer,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 8,
    },
    buttonText: {
        fontFamily: "Plus Jakarta Sans",
        fontSize: 20,
        lineHeight: 28,
        fontWeight: "600",
        color: C.onPrimary,
    },
});
