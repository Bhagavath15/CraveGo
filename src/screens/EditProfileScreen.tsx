import { useState, useEffect, useRef } from "react";
import {
    Image,
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
import { useNavigation } from "@react-navigation/native";
import { getProfile, updateProfile } from "../api/auth";
import Toast from "react-native-toast-message";
import { getAddresses } from "../api/address";
import { colors, spacing, typography, radius, shadows, sizes } from "../theme";

interface AddressItem {
    _id: string;
    fullName: string;
    houseNumber: string;
    apartment?: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    addressType: string;
    isDefault?: boolean;
}

const ProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const [profile, setProfile] = useState({ fullName: "", email: "", phone: "" });
    const [addresses, setAddresses] = useState<AddressItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [orderUpdates, setOrderUpdates] = useState(true);
    const [offersDisc, setOffersDisc] = useState(true);
    const [sysNotif, setSysNotif] = useState(false);
    const navigation = useNavigation();
    const nameRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);
    const phoneRef = useRef<TextInput>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [profileRes, addrRes] = await Promise.all([
                    getProfile(),
                    getAddresses(),
                ]);
                if (profileRes.success) {
                    setProfile({
                        fullName: profileRes.user.name || "",
                        email: profileRes.user.email || "",
                        phone: profileRes.user.phone || "",
                    });
                    if (profileRes.user.notifPref) {
                        setOrderUpdates(profileRes.user.notifPref.orderUpdates ?? true);
                        setOffersDisc(profileRes.user.notifPref.offersDisc ?? true);
                        setSysNotif(profileRes.user.notifPref.sysNotif ?? true);
                    }
                }
                if (addrRes.success) {
                    setAddresses(addrRes.addresses || []);
                }
            } catch {}
        };
        load();
    }, []);

    const handleSave = async () => {
        if (saving) return;
        setSaving(true);
        try {
            const res = await updateProfile(profile.fullName.trim(), profile.phone.trim(), profile.email.trim(), {
                orderUpdates,
                offersDisc,
                sysNotif,
            });
            if (res.success) {
                Toast.show({ text1: "Profile updated successfully.", type: "success" });
            } else {
                Toast.show({ text1: res.message || "Failed to update profile", type: "error" });
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
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <TouchableOpacity
                        style={[styles.saveBtn, saving && { opacity: 0.5 }]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        <Text style={styles.saveText}>{saving ? "Saving..." : "Save"}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={require("../assets/images/rider-arjun.png")}
                            style={styles.avatarImage}
                        />
                        <TouchableOpacity style={styles.cameraBtn}>
                            <MaterialCommunityIcons
                                name="camera"
                                size={16}
                                color={colors.white}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.avatarName}>{profile.fullName}</Text>
                    <Text style={styles.avatarBadge}>
                        Premium Member since 2023
                    </Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons
                            name="account"
                            size={20}
                            color={colors.primary}
                        />
                        <Text style={styles.sectionTitle}>
                            Personal Information
                        </Text>
                    </View>
                    <View style={styles.card}>
                        <View style={styles.fieldRow}>
                            <View style={styles.field}>
                                <Text style={styles.fieldLabel}>Full Name</Text>
                                <TextInput
                                    ref={nameRef}
                                    style={styles.fieldInput}
                                    value={profile.fullName}
                                    onChangeText={v => setProfile(p => ({...p, fullName: v}))}
                                />
                            </View>
                            <TouchableOpacity onPress={() => nameRef.current?.focus()}>
                                <MaterialCommunityIcons
                                    name="pencil"
                                    size={18}
                                    color={colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.fieldRow}>
                            <View style={styles.field}>
                                <Text style={styles.fieldLabel}>
                                    Email Address
                                </Text>
                                <TextInput
                                    ref={emailRef}
                                    style={styles.fieldInput}
                                    value={profile.email}
                                    onChangeText={v => setProfile(p => ({...p, email: v}))}
                                    keyboardType="email-address"
                                />
                            </View>
                            <TouchableOpacity onPress={() => emailRef.current?.focus()}>
                                <MaterialCommunityIcons
                                    name="pencil"
                                    size={18}
                                    color={colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.fieldRow}>
                            <View style={styles.field}>
                                <Text style={styles.fieldLabel}>
                                    Phone Number
                                </Text>
                                <TextInput
                                    ref={phoneRef}
                                    style={styles.fieldInput}
                                    value={profile.phone}
                                    onChangeText={v => setProfile(p => ({...p, phone: v}))}
                                    keyboardType="phone-pad"
                                />
                            </View>
                            <TouchableOpacity onPress={() => phoneRef.current?.focus()}>
                                <MaterialCommunityIcons
                                    name="pencil"
                                    size={18}
                                    color={colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons
                            name="map-marker"
                            size={20}
                            color={colors.primary}
                        />
                        <Text style={styles.sectionTitle}>
                            Manage Addresses
                        </Text>
                        <TouchableOpacity>
                            <Text style={styles.addNewText} onPress={() => navigation.navigate("AddAddress" as any)}>Add New</Text>
                        </TouchableOpacity>
                    </View>
                    {addresses.length === 0 && (
                        <View style={styles.addressCard}>
                            <Text style={styles.addressText}>No addresses saved yet.</Text>
                        </View>
                    )}
                    {addresses.map((addr) => (
                        <View
                            key={addr._id}
                            style={[styles.addressCard, addr.isDefault && styles.addressCardActive]}
                        >
                            <View style={addr.isDefault ? styles.addressIconBg : styles.addressIconBgMuted}>
                                <MaterialCommunityIcons
                                    name={addr.addressType === "Home" ? "home" : addr.addressType === "Work" ? "briefcase" : "map-marker"}
                                    size={20}
                                    color={addr.isDefault ? colors.primary : colors.textSecondary}
                                />
                            </View>
                            <View style={styles.addressInfo}>
                                <Text style={styles.addressLabel}>{addr.addressType}</Text>
                                <Text style={styles.addressText}>
                                    {addr.houseNumber}{addr.apartment ? `, ${addr.apartment}` : ""}, {addr.area}, {addr.city}, {addr.state} {addr.pincode}
                                </Text>
                            </View>
                            <MaterialCommunityIcons
                                name="dots-vertical"
                                size={20}
                                color={colors.textSecondary}
                            />
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons
                            name="bell"
                            size={20}
                            color={colors.primary}
                        />
                        <Text style={styles.sectionTitle}>Notifications</Text>
                    </View>
                    <View style={styles.card}>
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleInfo}>
                                <Text style={styles.toggleTitle}>
                                    Order Updates
                                </Text>
                                <Text style={styles.toggleDesc}>
                                    Status, tracking, and delivery alerts
                                </Text>
                            </View>
                            <Switch
                                value={orderUpdates}
                                onValueChange={setOrderUpdates}
                                trackColor={{
                                    false: colors.surfaceContainerHighest,
                                    true: colors.primaryLight,
                                }}
                                thumbColor={
                                    orderUpdates ? colors.primary : colors.surface
                                }
                            />
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleInfo}>
                                <Text style={styles.toggleTitle}>
                                    Offers & Discounts
                                </Text>
                                <Text style={styles.toggleDesc}>
                                    Exclusive deals and seasonal vouchers
                                </Text>
                            </View>
                            <Switch
                                value={offersDisc}
                                onValueChange={setOffersDisc}
                                trackColor={{
                                    false: colors.surfaceContainerHighest,
                                    true: colors.primaryLight,
                                }}
                                thumbColor={
                                    offersDisc ? colors.primary : colors.surface
                                }
                            />
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleInfo}>
                                <Text style={styles.toggleTitle}>
                                    System Notifications
                                </Text>
                                <Text style={styles.toggleDesc}>
                                    Privacy, security, and account updates
                                </Text>
                            </View>
                            <Switch
                                value={sysNotif}
                                onValueChange={setSysNotif}
                                trackColor={{
                                    false: colors.surfaceContainerHighest,
                                    true: colors.primaryLight,
                                }}
                                thumbColor={
                                    sysNotif ? colors.primary : colors.surface
                                }
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons
                            name="shield-lock"
                            size={20}
                            color={colors.primary}
                        />
                        <Text style={styles.sectionTitle}>
                            Account Security
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.securityRow}>
                        <View style={styles.securityLeft}>
                            <View style={styles.securityIconBg}>
                                <MaterialCommunityIcons
                                    name="lock"
                                    size={20}
                                    color={colors.textSecondary}
                                />
                            </View>
                            <Text style={styles.securityLabel}>
                                Change Password
                            </Text>
                        </View>
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.deleteSection}>
                    <TouchableOpacity style={styles.deleteBtn}>
                        <MaterialCommunityIcons
                            name="delete-forever"
                            size={20}
                            color={colors.error}
                        />
                        <Text style={styles.deleteText}>Delete Account</Text>
                    </TouchableOpacity>
                    <Text style={styles.deleteWarning}>
                        Once deleted, your account data and order history cannot
                        be recovered.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: `${colors.outlineVariant}4D`,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
    },
    backBtn: {
        width: sizes.avatar,
        height: sizes.avatar,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
        lineHeight: typography.lineHeight.xxxl,
        flex: 1,
        marginLeft: 4,
    },
    saveBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
    },
    saveText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.normal,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: "center",
        marginBottom: spacing.lg,
    },
    avatarWrapper: {
        position: "relative",
        marginBottom: spacing.sm,
    },
    avatarImage: {
        width: 128,
        height: 128,
        borderRadius: 64,
        borderWidth: 4,
        borderColor: colors.surface,
        ...shadows.floating,
    },
    cameraBtn: {
        position: "absolute",
        bottom: spacing.xs,
        right: spacing.xs,
        width: sizes.iconXxl,
        height: sizes.iconXxl,
        borderRadius: sizes.iconXxl / 2,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        ...shadows.medium,
    },
    avatarName: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xxl,
    },
    avatarBadge: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.md,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xxl,
        flex: 1,
    },
    addNewText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.normal,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.lg,
        ...shadows.card,
    },
    fieldRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    field: {
        flex: 1,
        marginRight: spacing.sm,
    },
    fieldLabel: {
        fontSize: 11,
        fontWeight: typography.fontWeight.medium,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.sm,
        letterSpacing: typography.letterSpacing.wider,
    },
    fieldInput: {
        fontSize: typography.fontSize.lg,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.xl,
        padding: 0,
    },
    divider: {
        height: 1,
        backgroundColor: colors.surfaceContainerHighest,
        marginVertical: spacing.md,
    },
    addressCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.lg,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.card,
    },
    addressCardActive: {
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    addressIconBg: {
        backgroundColor: `${colors.primary}1A`,
        padding: spacing.sm,
        borderRadius: radius.sm,
    },
    addressIconBgMuted: {
        backgroundColor: colors.surfaceContainerHighest,
        padding: spacing.sm,
        borderRadius: radius.sm,
    },
    addressInfo: {
        flex: 1,
    },
    addressLabel: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.normal,
        marginBottom: spacing.xs,
    },
    addressText: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.md,
    },
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    toggleInfo: {
        flex: 1,
        marginRight: 12,
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
    securityRow: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        ...shadows.card,
    },
    securityLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
    },
    securityIconBg: {
        backgroundColor: colors.surfaceContainerHighest,
        padding: spacing.sm,
        borderRadius: radius.sm,
    },
    securityLabel: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.normal,
    },
    deleteSection: {
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
    },
    deleteBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: `${colors.error}33`,
    },
    deleteText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.error,
        lineHeight: typography.lineHeight.md,
        letterSpacing: typography.letterSpacing.normal,
    },
    deleteWarning: {
        textAlign: "center",
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.md,
        marginTop: 12,
        paddingHorizontal: spacing.md,
    },
});

