import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import Skeleton from "../components/Skeleton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { addAddress, updateAddress, getAddressById } from "../api/address";
import Toast from "react-native-toast-message";
import { colors, spacing, typography, radius, shadows, sizes } from "../theme";

const LABELS = [
  { key: "Home", icon: "home" },
  { key: "Work", icon: "briefcase" },
  { key: "Other", icon: "pin" },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "AddAddress">;

export default function AddAddressScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const addressId = route.params?.addressId;
  const isEditing = !!addressId;

  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [apartment, setApartment] = useState("");
  const [landmark, setLandmark] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressType, setAddressType] = useState("Home");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!addressId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAddressById(addressId);
        if (res.success && res.address) {
          const a = res.address;
          setFullName(a.fullName || "");
          setMobileNumber(a.mobileNumber || "");
          setHouseNumber(a.houseNumber || "");
          setApartment(a.apartment || "");
          setLandmark(a.landmark || "");
          setArea(a.area || "");
          setCity(a.city || "");
          setState(a.state || "");
          setPincode(a.pincode || "");
          setAddressType(a.addressType || "Home");
        }
      } catch {
        Toast.show({ type: "error", text1: "Failed to load address" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addressId]);

  const handleSave = async () => {
    if (!fullName.trim()) { Alert.alert("Required", "Please enter your full name"); return; }
    if (!mobileNumber.trim() || mobileNumber.length < 10) { Alert.alert("Required", "Please enter a valid 10-digit mobile number"); return; }
    if (!houseNumber.trim()) { Alert.alert("Required", "Please enter house / flat number"); return; }
    if (!area.trim()) { Alert.alert("Required", "Please enter your area / locality"); return; }
    if (!city.trim()) { Alert.alert("Required", "Please enter your city"); return; }
    if (!state.trim()) { Alert.alert("Required", "Please enter your state"); return; }
    if (!pincode.trim() || pincode.length < 6) { Alert.alert("Required", "Please enter a valid 6-digit pincode"); return; }

    setSaving(true);
    try {
      const data = {
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        houseNumber: houseNumber.trim(),
        apartment: apartment.trim(),
        landmark: landmark.trim(),
        area: area.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        addressType,
      };
      let res;
      if (isEditing) {
        res = await updateAddress(addressId, data);
      } else {
        res = await addAddress(data);
      }
      if (!res.success) {
        Toast.show({ type: "error", text1: res.message || "Failed to save address" });
        return;
      }
      navigation.goBack();
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <View style={styles.headerBtnInner}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.textPrimary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? "Edit Address" : "Add Address"}</Text>
        <View style={styles.headerBtn} />
      </View>

      {loading ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <Skeleton width={56} height={56} borderRadius={28} />
            <Skeleton width="50%" height={22} style={{ marginTop: 12 }} />
            <Skeleton width="70%" height={14} style={{ marginTop: 6 }} />
          </View>
          <View style={styles.card}>
            <Skeleton width="40%" height={18} />
            <View style={{ gap: 12, marginTop: spacing.md }}>
              <Skeleton width="100%" height={sizes.inputHeight} borderRadius={radius.md} />
              <Skeleton width="100%" height={sizes.inputHeight} borderRadius={radius.md} />
            </View>
          </View>
          <View style={styles.card}>
            <Skeleton width="40%" height={18} />
            <View style={{ gap: 12, marginTop: spacing.md }}>
              <Skeleton width="100%" height={sizes.inputHeight} borderRadius={radius.md} />
              <Skeleton width="100%" height={sizes.inputHeight} borderRadius={radius.md} />
              <Skeleton width="100%" height={sizes.inputHeight} borderRadius={radius.md} />
              <Skeleton width="100%" height={sizes.inputHeight} borderRadius={radius.md} />
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Skeleton width="48%" height={sizes.inputHeight} borderRadius={radius.md} />
                <Skeleton width="48%" height={sizes.inputHeight} borderRadius={radius.md} />
              </View>
            </View>
          </View>
          <Skeleton width="100%" height={sizes.buttonHeightLg} borderRadius={14} style={{ marginTop: spacing.lg }} />
        </ScrollView>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.heroSection}>
              <View style={styles.heroIcon}>
                <MaterialCommunityIcons name="map-marker-plus" size={28} color={colors.primary} />
              </View>
              <Text style={styles.heroTitle}>Delivery Address</Text>
              <Text style={styles.heroSubtitle}>
                {isEditing ? "Update your delivery location details" : "Add a new delivery location"}
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="account-outline" size={18} color={colors.primary} />
                <Text style={styles.cardTitle}>Contact Details</Text>
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="account" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Full Name"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="phone" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    placeholder="Mobile Number"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="home-outline" size={18} color={colors.primary} />
                <Text style={styles.cardTitle}>Address Details</Text>
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="home" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={houseNumber}
                    onChangeText={setHouseNumber}
                    placeholder="House / Flat No."
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="office-building" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={apartment}
                    onChangeText={setApartment}
                    placeholder="Apartment / Building (Optional)"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="sign-direction" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={landmark}
                    onChangeText={setLandmark}
                    placeholder="Landmark (Optional)"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="map" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={area}
                    onChangeText={setArea}
                    placeholder="Area / Locality"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputWrapper, styles.halfField]}>
                    <MaterialCommunityIcons name="city" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={city}
                      onChangeText={setCity}
                      placeholder="City"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                  <View style={[styles.inputWrapper, styles.halfField]}>
                    <MaterialCommunityIcons name="flag" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={state}
                      onChangeText={setState}
                      placeholder="State"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="mailbox" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={pincode}
                    onChangeText={setPincode}
                    placeholder="Pincode"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="label-outline" size={18} color={colors.primary} />
                <Text style={styles.cardTitle}>Address Label</Text>
              </View>

              <View style={styles.labelRow}>
                {LABELS.map((l) => {
                  const active = addressType === l.key;
                  return (
                    <TouchableOpacity
                      key={l.key}
                      style={[styles.labelCard, active && styles.labelCardActive]}
                      onPress={() => setAddressType(l.key)}
                    >
                      <View style={[styles.labelIconWrap, active && styles.labelIconWrapActive]}>
                        <MaterialCommunityIcons
                          name={l.icon}
                          size={22}
                          color={active ? colors.white : colors.primary}
                        />
                      </View>
                      <Text style={[styles.labelCardText, active && styles.labelCardTextActive]}>
                        {l.key}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveBtn, (saving || loading) && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving || loading}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="check-circle-outline" size={22} color={colors.white} />
              <Text style={styles.saveBtnText}>
                {saving ? "Saving..." : isEditing ? "Update Address" : "Save Address"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  headerBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerBtnInner: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, lineHeight: typography.lineHeight.xl },

  loader: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loaderText: { fontSize: typography.fontSize.md, color: colors.textSecondary, lineHeight: typography.lineHeight.md },

  scrollContent: { padding: spacing.md, paddingBottom: spacing.md },

  heroSection: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  heroIcon: {
    width: sizes.buttonHeightLg,
    height: sizes.buttonHeightLg,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.xxl,
  },
  heroSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.md,
    marginTop: spacing.xs,
    textAlign: "center",
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainer,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    lineHeight: 22,
  },

  fieldGroup: {
    gap: 12,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.transparent,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.md,
  },

  row: { flexDirection: "row", gap: 12 },
  halfField: { flex: 1 },

  labelRow: {
    flexDirection: "row",
    gap: 12,
  },
  labelCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.surfaceContainer,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  labelCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "08",
  },
  labelIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  labelIconWrapActive: {
    backgroundColor: colors.primary,
  },
  labelCardText: {
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  labelCardTextActive: {
    color: colors.primary,
  },

  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 14,
    ...shadows.button,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.white, lineHeight: typography.lineHeight.lg },
});
