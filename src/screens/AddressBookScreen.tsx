import { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { getAddresses, deleteAddress, setDefaultAddress, Address } from "../api/address";
import Skeleton from "../components/Skeleton";
import { colors, spacing, typography, radius, shadows } from "../theme";

const ICON_MAP: Record<string, string> = {
  Home: "home",
  Work: "briefcase",
  Other: "pin",
};

const ICON_BG: Record<string, string> = {
  Home: colors.primaryLight,
  Work: colors.addressTag.workBg,
  Other: colors.tertiaryLight,
};

const ICON_COLOR: Record<string, string> = {
  Home: colors.primary,
  Work: colors.addressTag.work,
  Other: colors.warning,
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
      console.warn("Failed to load addresses", err);} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [loadAddresses])
  );

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
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Address Book</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AddAddress")} style={styles.headerBtn}>
          <MaterialCommunityIcons name="map-marker-plus" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="map-marker-plus" size={20} color={colors.primary} />
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
            <MaterialCommunityIcons name="map-marker-off" size={48} color={colors.outlineVariant} />
            <Text style={styles.emptyTitle}>No addresses yet</Text>
            <Text style={styles.emptySubtitle}>Tap below to add your first delivery location</Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => navigation.navigate("AddAddress")}
            >
              <MaterialCommunityIcons name="map-marker-plus" size={20} color={colors.white} />
              <Text style={styles.emptyAddBtnText}>Add New Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((addr) => {
            const isDefault = addr.isDefault;
            const type = addr.addressType;
            return (
              <View key={addr._id} style={[styles.card, isDefault && styles.cardDefault]}>
                {isDefault && <View style={styles.defaultAccent} />}

                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <View style={[styles.typeCircle, { backgroundColor: ICON_BG[type] || colors.primaryLight }]}>
                      <MaterialCommunityIcons
                        name={ICON_MAP[type] || "pin"}
                        size={20}
                        color={ICON_COLOR[type] || colors.primary}
                      />
                    </View>

                    <View style={styles.cardInfo}>
                      <View style={styles.typeLabelRow}>
                        <Text style={styles.typeLabel}>{type}</Text>
                        {isDefault && (
                          <View style={styles.defaultChip}>
                            <MaterialCommunityIcons name="check-circle" size={10} color={colors.success} />
                            <Text style={styles.defaultChipText}>Default</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {getDisplayName(addr)}
                      </Text>
                      <Text style={styles.cardAddress} numberOfLines={2}>
                        {formatFullAddress(addr)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate("AddAddress", { addressId: addr._id })}
                  >
                    <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.primary} />
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>

                  {!isDefault && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleSetDefault(addr._id)}
                    >
                      <MaterialCommunityIcons name="check-circle-outline" size={16} color={colors.secondary} />
                      <Text style={[styles.actionText, { color: colors.secondary }]}>Set Default</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDelete(addr._id)}
                  >
                    <MaterialCommunityIcons name="delete-outline" size={16} color={colors.error} />
                    <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
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
    backgroundColor: colors.background,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  headerBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.xl,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 20,
    backgroundColor: colors.primaryLight,
    padding: 14,
    borderRadius: radius.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.md,
  },

  centerState: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
    gap: 10,
  },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    marginTop: 12,
  },
  emptyAddBtnText: {
    fontSize: 15,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    lineHeight: 22,
  },
  loaderText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.xl,
    marginTop: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.md,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: 14,
    ...shadows.card,
    overflow: "hidden",
    position: "relative",
  },
  cardDefault: {},
  defaultAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.success,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },

  defaultChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  defaultChipText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
    lineHeight: typography.lineHeight.sm,
  },

  cardBody: {
    padding: spacing.md,
  },
  cardTop: {
    flexDirection: "row",
    gap: 14,
  },
  typeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  typeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 2,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.sm,
    letterSpacing: typography.letterSpacing.wider,
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.xl,
    marginBottom: spacing.xs,
  },
  cardAddress: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.md,
  },

  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
  },
  deleteBtn: {
    marginLeft: "auto",
  },
  actionText: {
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    lineHeight: 18,
  },

});
