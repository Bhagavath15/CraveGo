import { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { getAddresses, deleteAddress, setDefaultAddress, Address } from "../api/address";
import Skeleton from "../components/Skeleton";

const PRIMARY = "#FF6B35";
const PRIMARY_SOFT = "#FFDBD0";
const BG = "#FCF9F8";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";
const SURFACE_LOWEST = "#FFFFFF";
const SURFACE_CONTAINER = "#F0EDED";
const OUTLINE_VARIANT = "#E1BFB5";
const OUTLINE = "#8D7168";
const SECONDARY = "#2ECC71";
const SECONDARY_SOFT = "#2ECC7120";

const ICON_MAP: Record<string, string> = {
  Home: "home",
  Work: "briefcase",
  Other: "pin",
};

const ICON_BG: Record<string, string> = {
  Home: PRIMARY_SOFT,
  Work: "#E1EFFF",
  Other: "#FFF3E0",
};

const ICON_COLOR: Record<string, string> = {
  Home: PRIMARY,
  Work: "#1E6FFF",
  Other: "#F5A623",
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const getDisplayName = (a: Address) => a.apartment || a.houseNumber;

const formatFullAddress = (a: Address) =>
  [a.houseNumber, a.landmark, `${a.area}, ${a.city}, ${a.state} - ${a.pincode}`]
    .filter(Boolean)
    .join(", ");

const AddressBookScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAddresses();
      if (res && res.success) {
        setAddresses(res.addresses || []);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      loadAddresses();
    });
    return unsub;
  }, [navigation, loadAddresses]);

  const handleDelete = (id: string) => {
    Alert.alert("Delete Address", "Are you sure you want to delete this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAddress(id);
            setAddresses((prev) => prev.filter((a) => a._id !== id));
          } catch {
            Alert.alert("Error", "Failed to delete address");
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await setDefaultAddress(id);
      if (res.success) {
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            isDefault: a._id === id,
          }))
        );
      }
    } catch {
      Alert.alert("Error", "Failed to set default address");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={ON_SURFACE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Address Book</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AddAddress")} style={styles.headerBtn}>
          <MaterialCommunityIcons name="map-marker-plus" size={24} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="map-marker-plus" size={20} color={PRIMARY} />
          <Text style={styles.infoText}>
            Manage your delivery locations for a faster checkout experience.
          </Text>
        </View>

        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardTop}>
                <Skeleton width={44} height={44} borderRadius={22} />
                <View style={styles.cardInfo}>
                  <Skeleton width={80} height={16} />
                  <Skeleton width="60%" height={14} style={{ marginTop: 6 }} />
                  <Skeleton width="90%" height={14} style={{ marginTop: 4 }} />
                </View>
              </View>
              <View style={styles.cardActions}>
                <Skeleton width={60} height={14} />
                <Skeleton width={60} height={14} />
              </View>
            </View>
          ))
        ) : addresses.length === 0 ? (
          <View style={styles.centerState}>
            <MaterialCommunityIcons name="map-marker-off" size={48} color={OUTLINE_VARIANT} />
            <Text style={styles.emptyTitle}>No addresses yet</Text>
            <Text style={styles.emptySubtitle}>Tap below to add your first delivery location</Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => navigation.navigate("AddAddress")}
            >
              <MaterialCommunityIcons name="map-marker-plus" size={20} color="#fff" />
              <Text style={styles.emptyAddBtnText}>Add New Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((addr) => {
            const isDefault = addr.isDefault;
            const type = addr.addressType;
            return (
              <View key={addr._id} style={[styles.card, isDefault && styles.cardDefault]}>
                {isDefault && (
                  <View style={styles.defaultPill}>
                    <MaterialCommunityIcons name="check-circle" size={12} color={SECONDARY} />
                    <Text style={styles.defaultPillText}>Default</Text>
                  </View>
                )}

                <View style={styles.cardTop}>
                  <View style={[styles.typeCircle, { backgroundColor: ICON_BG[type] || PRIMARY_SOFT }]}>
                    <MaterialCommunityIcons
                      name={ICON_MAP[type] || "pin"}
                      size={22}
                      color={ICON_COLOR[type] || PRIMARY}
                    />
                  </View>

                  <View style={styles.cardInfo}>
                    <View style={styles.typeLabelRow}>
                      <Text style={styles.typeLabel}>{type}</Text>
                      <MaterialCommunityIcons name="map-marker" size={14} color={OUTLINE} />
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {getDisplayName(addr)}
                    </Text>
                    <Text style={styles.cardAddress} numberOfLines={2}>
                      {formatFullAddress(addr)}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate("AddAddress", { addressId: addr._id })}
                  >
                    <MaterialCommunityIcons name="pencil" size={16} color={PRIMARY} />
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>

                  {!isDefault && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleSetDefault(addr._id)}
                    >
                      <MaterialCommunityIcons name="check-circle-outline" size={16} color={SECONDARY} />
                      <Text style={styles.actionTextSecondary}>Set Default</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleDelete(addr._id)}
                  >
                    <MaterialCommunityIcons name="delete" size={16} color="#BA1A1A" />
                    <Text style={styles.actionTextDanger}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

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
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: BG,
  },
  headerBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: ON_SURFACE,
    lineHeight: 24,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 20,
    backgroundColor: PRIMARY_SOFT,
    padding: 14,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: ON_SURFACE,
    lineHeight: 20,
  },

  centerState: {
    alignItems: "center",
    paddingVertical: 64,
    gap: 10,
  },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    marginTop: 12,
  },
  emptyAddBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    lineHeight: 22,
  },
  loaderText: {
    fontSize: 14,
    color: ON_SURFACE_VARIANT,
    lineHeight: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: ON_SURFACE,
    lineHeight: 24,
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: ON_SURFACE_VARIANT,
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 32,
  },

  card: {
    backgroundColor: SURFACE_LOWEST,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: SURFACE_CONTAINER,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDefault: {
    borderColor: SECONDARY,
  },

  defaultPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: SECONDARY_SOFT,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomRightRadius: 12,
  },
  defaultPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: SECONDARY,
    lineHeight: 16,
  },

  cardTop: {
    flexDirection: "row",
    padding: 16,
    gap: 14,
  },
  typeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  typeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: ON_SURFACE_VARIANT,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: ON_SURFACE,
    lineHeight: 24,
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 14,
    color: ON_SURFACE_VARIANT,
    lineHeight: 20,
  },

  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: SURFACE_CONTAINER,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 24,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: PRIMARY,
    lineHeight: 18,
  },
  actionTextSecondary: {
    fontSize: 13,
    fontWeight: "600",
    color: SECONDARY,
    lineHeight: 18,
  },
  actionTextDanger: {
    fontSize: 13,
    fontWeight: "600",
    color: "#BA1A1A",
    lineHeight: 18,
  },

});
