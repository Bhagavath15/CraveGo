import { useState } from "react";
import {
    Alert,
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

const PRIMARY = "#ab3500";
const PRIMARY_CONTAINER = "#FF6B35";
const ON_PRIMARY_CONTAINER = "#5F1900";
const SECONDARY = "#006D37";
const BG = "#FCF9F8";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";
const OUTLINE_VARIANT = "#E1BFB5";
const SURFACE_LOWEST = "#FFFFFF";
const SURFACE_VARIANT = "#E5E2E1";
const SURFACE_CONTAINER_HIGH = "#EAE7E7";
const ERROR = "#BA1A1A";
const ERROR_CONTAINER = "#FFDAD6";

const ProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const [fullName, setFullName] = useState("Rahul Sharma");
    const [email, setEmail] = useState("rahul.sharma@example.com");
    const [phone, setPhone] = useState("+91 98765 43210");
    const [orderUpdates, setOrderUpdates] = useState(true);
    const [offersDisc, setOffersDisc] = useState(true);
    const [sysNotif, setSysNotif] = useState(false);
    const navigation = useNavigation();

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
                            color={PRIMARY}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={() => Alert.alert("Saved", "Profile updated successfully.")}
                    >
                        <Text style={styles.saveText}>Save</Text>
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
                                color="#FFF"
                            />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.avatarName}>{fullName}</Text>
                    <Text style={styles.avatarBadge}>
                        Premium Member since 2023
                    </Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons
                            name="account"
                            size={20}
                            color={PRIMARY}
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
                                    style={styles.fieldInput}
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            </View>
                            <TouchableOpacity>
                                <MaterialCommunityIcons
                                    name="pencil"
                                    size={18}
                                    color={ON_SURFACE_VARIANT}
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
                                    style={styles.fieldInput}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                />
                            </View>
                            <TouchableOpacity>
                                <MaterialCommunityIcons
                                    name="pencil"
                                    size={18}
                                    color={ON_SURFACE_VARIANT}
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
                                    style={styles.fieldInput}
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>
                            <TouchableOpacity>
                                <MaterialCommunityIcons
                                    name="pencil"
                                    size={18}
                                    color={ON_SURFACE_VARIANT}
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
                            color={PRIMARY}
                        />
                        <Text style={styles.sectionTitle}>
                            Manage Addresses
                        </Text>
                        <TouchableOpacity>
                            <Text style={styles.addNewText}>Add New</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.addressCard, styles.addressCardActive]}>
                        <View style={styles.addressIconBg}>
                            <MaterialCommunityIcons
                                name="home"
                                size={20}
                                color={PRIMARY}
                            />
                        </View>
                        <View style={styles.addressInfo}>
                            <Text style={styles.addressLabel}>Home</Text>
                            <Text style={styles.addressText}>
                                A-402, Green Valley Apartments, Sector 56,
                                Gurgaon, Haryana 122011
                            </Text>
                        </View>
                        <MaterialCommunityIcons
                            name="dots-vertical"
                            size={20}
                            color={ON_SURFACE_VARIANT}
                        />
                    </View>
                    <View style={styles.addressCard}>
                        <View style={styles.addressIconBgMuted}>
                            <MaterialCommunityIcons
                                name="briefcase"
                                size={20}
                                color={ON_SURFACE_VARIANT}
                            />
                        </View>
                        <View style={styles.addressInfo}>
                            <Text style={styles.addressLabel}>Work</Text>
                            <Text style={styles.addressText}>
                                Cyber Hub, Building 10, DLF Phase 2, Gurgaon,
                                Haryana 122002
                            </Text>
                        </View>
                        <MaterialCommunityIcons
                            name="dots-vertical"
                            size={20}
                            color={ON_SURFACE_VARIANT}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons
                            name="bell"
                            size={20}
                            color={PRIMARY}
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
                                    false: SURFACE_VARIANT,
                                    true: "#FFDBD0",
                                }}
                                thumbColor={
                                    orderUpdates ? PRIMARY : SURFACE_LOWEST
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
                                    false: SURFACE_VARIANT,
                                    true: "#FFDBD0",
                                }}
                                thumbColor={
                                    offersDisc ? PRIMARY : SURFACE_LOWEST
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
                                    false: SURFACE_VARIANT,
                                    true: "#FFDBD0",
                                }}
                                thumbColor={
                                    sysNotif ? PRIMARY : SURFACE_LOWEST
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
                            color={PRIMARY}
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
                                    color={ON_SURFACE_VARIANT}
                                />
                            </View>
                            <Text style={styles.securityLabel}>
                                Change Password
                            </Text>
                        </View>
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={ON_SURFACE_VARIANT}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.deleteSection}>
                    <TouchableOpacity style={styles.deleteBtn}>
                        <MaterialCommunityIcons
                            name="delete-forever"
                            size={20}
                            color={ERROR}
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
        backgroundColor: BG,
    },
    header: {
        backgroundColor: BG,
        borderBottomWidth: 1,
        borderBottomColor: `${OUTLINE_VARIANT}4D`,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: PRIMARY,
        lineHeight: 32,
        flex: 1,
        marginLeft: 4,
    },
    saveBtn: {
        backgroundColor: PRIMARY_CONTAINER,
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 12,
    },
    saveText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFF",
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: "center",
        marginBottom: 24,
    },
    avatarWrapper: {
        position: "relative",
        marginBottom: 8,
    },
    avatarImage: {
        width: 128,
        height: 128,
        borderRadius: 64,
        borderWidth: 4,
        borderColor: SURFACE_LOWEST,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 4,
    },
    cameraBtn: {
        position: "absolute",
        bottom: 4,
        right: 4,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: PRIMARY,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarName: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 28,
    },
    avatarBadge: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 28,
        flex: 1,
    },
    addNewText: {
        fontSize: 14,
        fontWeight: "600",
        color: PRIMARY,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    card: {
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 12,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    fieldRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    field: {
        flex: 1,
        marginRight: 8,
    },
    fieldLabel: {
        fontSize: 11,
        fontWeight: "500",
        color: ON_SURFACE_VARIANT,
        lineHeight: 16,
        letterSpacing: 0.5,
    },
    fieldInput: {
        fontSize: 16,
        color: ON_SURFACE,
        lineHeight: 24,
        padding: 0,
    },
    divider: {
        height: 1,
        backgroundColor: SURFACE_VARIANT,
        marginVertical: 16,
    },
    addressCard: {
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 12,
        padding: 24,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 16,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    addressCardActive: {
        borderLeftWidth: 4,
        borderLeftColor: PRIMARY,
    },
    addressIconBg: {
        backgroundColor: `${PRIMARY}1A`,
        padding: 8,
        borderRadius: 8,
    },
    addressIconBgMuted: {
        backgroundColor: SURFACE_VARIANT,
        padding: 8,
        borderRadius: 8,
    },
    addressInfo: {
        flex: 1,
    },
    addressLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 20,
        letterSpacing: 0.1,
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
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
    securityRow: {
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 12,
        padding: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    securityLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    securityIconBg: {
        backgroundColor: SURFACE_VARIANT,
        padding: 8,
        borderRadius: 8,
    },
    securityLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    deleteSection: {
        paddingTop: 16,
        paddingBottom: 16,
    },
    deleteBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: `${ERROR}33`,
    },
    deleteText: {
        fontSize: 14,
        fontWeight: "600",
        color: ERROR,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    deleteWarning: {
        textAlign: "center",
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        marginTop: 12,
        paddingHorizontal: 16,
    },
});

