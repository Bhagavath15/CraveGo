import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { updateProfile as updateProfileApi } from "../api/auth";
import Toast from "react-native-toast-message";
import { colors, spacing, typography, radius, shadows, sizes } from "../theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, "ProfileSetup">;

const ProfileSetupScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRoute>();
    const { fullName: initialName, email: initialEmail, phone: initialPhone } = route.params;

    const [fullName, setFullName] = useState(initialName);
    const [email, setEmail] = useState(initialEmail);
    const [phone] = useState(initialPhone);
    const [enableNotif, setEnableNotif] = useState(true);
    const [enableLocation, setEnableLocation] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (saving || !fullName.trim()) {
            Toast.show({ text1: "Please enter your name.", type: "error" });
            return;
        }
        setSaving(true);
        try {
            const data = await updateProfileApi(fullName.trim(), phone, email.trim());
            if (data.success) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Home" }],
                });
            } else {
                Toast.show({ text1: data.message || "Registration failed", type: "error" });
            }
        } catch {
            Toast.show({ text1: "Network error. Try again.", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View style={styles.brandRow}>
                    <MaterialCommunityIcons
                        name="silverware"
                        size={28}
                        color={colors.primary}
                    />
                    <Text style={styles.brandName}>CraveGo</Text>
                </View>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.heroSection}>
                        <Text style={styles.heroTitle}>
                            Finish setting up
                        </Text>
                        <Text style={styles.heroDesc}>
                            Help us personalize your dining experience.
                        </Text>
                    </View>

                    <View style={styles.avatarSection}>
                        <View style={styles.avatarOuter}>
                            <View style={styles.avatarPlaceholder}>
                                <MaterialCommunityIcons
                                    name="account-outline"
                                    size={48}
                                    color={colors.textSecondary}
                                />
                            </View>
                            <TouchableOpacity style={styles.cameraBtn}>
                                <MaterialCommunityIcons
                                    name="camera"
                                    size={20}
                                    color={colors.white}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Full Name</Text>
                            <View style={styles.fieldRow}>
                                <MaterialCommunityIcons
                                    name="account-outline"
                                    size={20}
                                    color={colors.textSecondary}
                                />
                                <TextInput
                                    style={styles.fieldInput}
                                    placeholder="Enter your full name"
                                    placeholderTextColor={`${colors.textSecondary}99`}
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Phone Number</Text>
                            <View style={[styles.fieldRow, styles.fieldReadonly]}>
                                <MaterialCommunityIcons
                                    name="phone-outline"
                                    size={20}
                                    color={colors.textSecondary}
                                />
                                <TextInput
                                    style={styles.fieldInput}
                                    value={phone}
                                    editable={false}
                                />
                                <MaterialCommunityIcons
                                    name="check-circle"
                                    size={20}
                                    color={colors.secondary}
                                />
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Email Address</Text>
                            <View style={styles.fieldRow}>
                                <MaterialCommunityIcons
                                    name="email-outline"
                                    size={20}
                                    color={colors.textSecondary}
                                />
                                <TextInput
                                    style={styles.fieldInput}
                                    placeholder="name@example.com"
                                    placeholderTextColor={`${colors.textSecondary}99`}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.toggleSection}>
                        <Text style={styles.toggleSectionTitle}>
                            Basic Setup
                        </Text>

                        <View style={styles.toggleCard}>
                            <View style={styles.toggleLeft}>
                                <View style={styles.toggleIconBg}>
                                    <MaterialCommunityIcons
                                        name="bell-outline"
                                        size={20}
                                        color={colors.primary}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.toggleTitle}>
                                        Enable Notifications
                                    </Text>
                                    <Text style={styles.toggleDesc}>
                                        Stay updated on your orders
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={enableNotif}
                                onValueChange={setEnableNotif}
                                trackColor={{
                                    false: colors.surfaceContainerHighest,
                                    true: colors.primaryLight,
                                }}
                                thumbColor={
                                    enableNotif ? colors.primary : colors.surface
                                }
                            />
                        </View>

                        <View style={styles.toggleCard}>
                            <View style={styles.toggleLeft}>
                                <View
                                    style={[
                                        styles.toggleIconBg,
                                        { backgroundColor: `${colors.secondary}0D` },
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name="map-marker-outline"
                                        size={20}
                                        color={colors.secondary}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.toggleTitle}>
                                        Location Permissions
                                    </Text>
                                    <Text style={styles.toggleDesc}>
                                        Find restaurants near you
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={enableLocation}
                                onValueChange={setEnableLocation}
                                trackColor={{
                                    false: colors.surfaceContainerHighest,
                                    true: colors.primaryLight,
                                }}
                                thumbColor={
                                    enableLocation ? colors.primary : colors.surface
                                }
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
                <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSave}
                >
                    <Text style={styles.saveBtnText}>Save & Continue</Text>
                    <MaterialCommunityIcons
                        name="arrow-right"
                        size={18}
                        color={colors.white}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ProfileSetupScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
    },
    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    brandName: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
        lineHeight: typography.lineHeight.xxxl,
    },
    skipText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.normal,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: 120,
    },
    heroSection: {
        alignItems: "center",
        marginBottom: spacing.lg,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        lineHeight: 36,
        letterSpacing: typography.letterSpacing.snug,
    },
    heroDesc: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.md,
        marginTop: spacing.xs,
    },
    avatarSection: {
        alignItems: "center",
        marginBottom: spacing.xl,
    },
    avatarOuter: {
        position: "relative",
    },
    avatarPlaceholder: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: colors.surfaceContainerLow,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        borderColor: colors.surface,
        ...shadows.floating,
    },
    cameraBtn: {
        position: "absolute",
        bottom: spacing.xs,
        right: spacing.xs,
        width: sizes.avatar,
        height: sizes.avatar,
        borderRadius: sizes.avatar / 2,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: colors.surface,
    },
    form: {
        gap: spacing.md,
    },
    field: {},
    fieldLabel: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.normal,
        marginBottom: spacing.xs,
        paddingHorizontal: spacing.xs,
    },
    fieldRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: 14,
        borderRadius: radius.md,
        ...shadows.floating,
    },
    fieldReadonly: {
        backgroundColor: colors.surfaceContainerLow,
        opacity: 0.8,
    },
    fieldInput: {
        flex: 1,
        fontSize: typography.fontSize.lg,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xl,
        padding: 0,
    },
    toggleSection: {
        marginTop: spacing.md,
    },
    toggleSectionTitle: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xxl,
        marginBottom: spacing.md,
    },
    toggleCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.sm,
    },
    toggleLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        flex: 1,
        marginRight: 12,
    },
    toggleIconBg: {
        width: sizes.avatar,
        height: sizes.avatar,
        borderRadius: sizes.avatar / 2,
        backgroundColor: `${colors.primary}0D`,
        justifyContent: "center",
        alignItems: "center",
    },
    toggleTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.normal,
    },
    toggleDesc: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.md,
    },
    bottomBar: {
        backgroundColor: `${colors.surface}CC`,
        borderTopWidth: 1,
        borderTopColor: colors.surfaceContainerHighest,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
    },
    saveBtn: {
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        paddingVertical: 14,
        borderRadius: radius.md,
    },
    saveBtnText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.normal,
    },
});
