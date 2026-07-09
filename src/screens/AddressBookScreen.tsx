import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

const PRIMARY = "#ab3500";
const PRIMARY_CONTAINER = "#FF6B35";
const BG = "#FCF9F8";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";
const SURFACE_LOWEST = "#FFFFFF";
const SURFACE_CONTAINER = "#F0EDED";
const SURFACE_CONTAINER_LOW = "#F6F3F2";
const OUTLINE_VARIANT = "#E1BFB5";
const OUTLINE = "#8D7168";
const SECONDARY = "#006D37";

interface Address {
    id: string;
    icon: string;
    type: string;
    label: string;
    address: string;
    isDefault?: boolean;
}

const ADDRESSES: Address[] = [
    {
        id: "1",
        icon: "home",
        type: "Home",
        label: "Home",
        address: "The Sunshine Apartment\nFlat 402, B-Wing, Heritage Residency, Golf Course Road, Gurgaon, Haryana - 122002",
        isDefault: true,
    },
    {
        id: "2",
        icon: "work",
        type: "Office",
        label: "Office",
        address: "Innovate Hub HQ\nFloor 12, Tower C, Cyber City, DLF Phase 3, Gurgaon, Haryana - 122008",
    },
    {
        id: "3",
        icon: "pin",
        type: "Other",
        label: "Mom & Dad's",
        address: "House No. 42, Green Avenue, Sector 15, Chandigarh - 160015",
    },
];

const AddressBookScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={ON_SURFACE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Address Book</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={styles.infoText}>
                    Manage your delivery locations for a faster checkout experience.
                </Text>

                <TouchableOpacity style={styles.addAddressBtn}>
                    <MaterialCommunityIcons name="map-marker-plus" size={22} color={PRIMARY} />
                    <Text style={styles.addAddressText}>Add New Address</Text>
                </TouchableOpacity>

                {ADDRESSES.map((addr) => (
                    <View key={addr.id} style={styles.addressCard}>
                        <View style={styles.addressHeader}>
                            <View style={styles.typeIconBg}>
                                <MaterialCommunityIcons name={addr.icon} size={20} color={PRIMARY} />
                            </View>
                            <View style={styles.addressInfo}>
                                <Text style={styles.addressLabel}>{addr.label}</Text>
                                <Text style={styles.addressDetail}>{addr.address}</Text>
                            </View>
                        </View>
                        <View style={styles.addressActions}>
                            <TouchableOpacity style={styles.actionBtn}>
                                <MaterialCommunityIcons name="pencil-outline" size={16} color={PRIMARY} />
                                <Text style={styles.actionText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn}>
                                <MaterialCommunityIcons name="delete-outline" size={16} color={OUTLINE} />
                                <Text style={[styles.actionText, { color: OUTLINE }]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <View style={styles.mapSection}>
                    <View style={styles.mapHeader}>
                        <MaterialCommunityIcons name="map-outline" size={20} color={ON_SURFACE} />
                        <Text style={styles.mapTitle}>Quick View</Text>
                        <Text style={styles.mapSubtitle}>Your Neighborhoods</Text>
                    </View>
                    <View style={styles.mapPlaceholder}>
                        <MaterialCommunityIcons name="map" size={48} color={OUTLINE_VARIANT} />
                        <Text style={styles.mapPlaceholderText}>Map View</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default AddressBookScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    headerBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: BG,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 28,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    infoText: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        marginBottom: 16,
    },
    addAddressBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: PRIMARY,
        borderStyle: "dashed",
        marginBottom: 16,
    },
    addAddressText: {
        fontSize: 16,
        fontWeight: "600",
        color: PRIMARY,
        lineHeight: 24,
    },
    addressCard: {
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    addressHeader: {
        flexDirection: "row",
        gap: 12,
    },
    typeIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FFDBD033",
        justifyContent: "center",
        alignItems: "center",
    },
    addressInfo: {
        flex: 1,
    },
    addressLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 24,
    },
    addressDetail: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        marginTop: 4,
    },
    addressActions: {
        flexDirection: "row",
        gap: 24,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: SURFACE_CONTAINER,
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    actionText: {
        fontSize: 14,
        fontWeight: "600",
        color: PRIMARY,
        lineHeight: 20,
    },
    mapSection: {
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 12,
        padding: 16,
        marginTop: 4,
    },
    mapHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    mapTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 24,
    },
    mapSubtitle: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
    },
    mapPlaceholder: {
        height: 160,
        borderRadius: 12,
        backgroundColor: SURFACE_CONTAINER_LOW,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    mapPlaceholderText: {
        fontSize: 14,
        color: OUTLINE,
        lineHeight: 20,
    },
});
