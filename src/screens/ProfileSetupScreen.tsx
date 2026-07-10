import { useState } from "react";
import {
    Alert,
    Image,
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
import { signUp as signUpApi } from "../utils/api";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, "ProfileSetup">;

const PRIMARY = "#ab3500";
const PRIMARY_CONTAINER = "#FF6B35";
const SECONDARY = "#006D37";
const BG = "#FCF9F8";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";
const OUTLINE_VARIANT = "#E1BFB5";
const SURFACE_CONTAINER_HIGHEST = "#E5E2E1";
const SURFACE_CONTAINER_LOW = "#F6F3F2";
const SURFACE_LOWEST = "#FFFFFF";
const SURFACE_VARIANT = "#E5E2E1";

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
            Alert.alert("Required", "Please enter your name.");
            return;
        }
        setSaving(true);
        try {
            const data = await signUpApi(fullName.trim(), phone);
            if (data.success) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Home" }],
                });
            } else {
                Alert.alert("Error", data.message || "Registration failed");
            }
        } catch {
            Alert.alert("Error", "Network error. Try again.");
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
                        color={PRIMARY}
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
                                    color={ON_SURFACE_VARIANT}
                                />
                            </View>
                            <TouchableOpacity style={styles.cameraBtn}>
                                <MaterialCommunityIcons
                                    name="camera"
                                    size={20}
                                    color="#FFF"
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
                                    color={ON_SURFACE_VARIANT}
                                />
                                <TextInput
                                    style={styles.fieldInput}
                                    placeholder="Enter your full name"
                                    placeholderTextColor={`${ON_SURFACE_VARIANT}99`}
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
                                    color={ON_SURFACE_VARIANT}
                                />
                                <TextInput
                                    style={styles.fieldInput}
                                    value={phone}
                                    editable={false}
                                />
                                <MaterialCommunityIcons
                                    name="check-circle"
                                    size={20}
                                    color={SECONDARY}
                                />
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Email Address</Text>
                            <View style={styles.fieldRow}>
                                <MaterialCommunityIcons
                                    name="email-outline"
                                    size={20}
                                    color={ON_SURFACE_VARIANT}
                                />
                                <TextInput
                                    style={styles.fieldInput}
                                    placeholder="name@example.com"
                                    placeholderTextColor={`${ON_SURFACE_VARIANT}99`}
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
                                        color={PRIMARY}
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
                                    false: SURFACE_CONTAINER_HIGHEST,
                                    true: "#FFDBD0",
                                }}
                                thumbColor={
                                    enableNotif ? PRIMARY : SURFACE_LOWEST
                                }
                            />
                        </View>

                        <View style={styles.toggleCard}>
                            <View style={styles.toggleLeft}>
                                <View
                                    style={[
                                        styles.toggleIconBg,
                                        { backgroundColor: `${SECONDARY}0D` },
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name="map-marker-outline"
                                        size={20}
                                        color={SECONDARY}
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
                                    false: SURFACE_CONTAINER_HIGHEST,
                                    true: "#FFDBD0",
                                }}
                                thumbColor={
                                    enableLocation ? PRIMARY : SURFACE_LOWEST
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
                        color="#FFF"
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
        backgroundColor: BG,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    brandName: {
        fontSize: 24,
        fontWeight: "700",
        color: PRIMARY,
        lineHeight: 32,
    },
    skipText: {
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 120,
    },
    heroSection: {
        alignItems: "center",
        marginBottom: 24,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: ON_SURFACE,
        lineHeight: 36,
        letterSpacing: -0.3,
    },
    heroDesc: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        marginTop: 4,
    },
    avatarSection: {
        alignItems: "center",
        marginBottom: 32,
    },
    avatarOuter: {
        position: "relative",
    },
    avatarPlaceholder: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: SURFACE_CONTAINER_LOW,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        borderColor: SURFACE_LOWEST,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 4,
    },
    cameraBtn: {
        position: "absolute",
        bottom: 4,
        right: 4,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: PRIMARY,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: SURFACE_LOWEST,
    },
    form: {
        gap: 16,
    },
    field: {},
    fieldLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        letterSpacing: 0.1,
        marginBottom: 4,
        paddingHorizontal: 4,
    },
    fieldRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: SURFACE_LOWEST,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 4,
    },
    fieldReadonly: {
        backgroundColor: SURFACE_CONTAINER_LOW,
        opacity: 0.8,
    },
    fieldInput: {
        flex: 1,
        fontSize: 16,
        color: ON_SURFACE,
        lineHeight: 24,
        padding: 0,
    },
    toggleSection: {
        marginTop: 16,
    },
    toggleSectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 28,
        marginBottom: 16,
    },
    toggleCard: {
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    toggleLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        flex: 1,
        marginRight: 12,
    },
    toggleIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${PRIMARY}0D`,
        justifyContent: "center",
        alignItems: "center",
    },
    toggleTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    toggleDesc: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
    },
    bottomBar: {
        backgroundColor: `${SURFACE_LOWEST}CC`,
        borderTopWidth: 1,
        borderTopColor: SURFACE_VARIANT,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    saveBtn: {
        backgroundColor: PRIMARY,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    saveBtnText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFF",
        lineHeight: 20,
        letterSpacing: 0.1,
    },
});
