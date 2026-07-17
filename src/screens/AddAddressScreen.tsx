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

const PRIMARY = "#FF6B35";
const PRIMARY_SOFT = "#FFDBD0";
const BG = "#FCF9F8";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";
const SURFACE_LOWEST = "#FFFFFF";
const SURFACE_CONTAINER_LOW = "#F6F3F2";
const SURFACE_CONTAINER = "#F0EDED";
const OUTLINE_VARIANT = "#E1BFB5";

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
        Alert.alert("Error", "Failed to load address");
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
      if (isEditing) {
        await updateAddress(addressId, data);
      } else {
        await addAddress(data);
      }
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <View style={styles.headerBtnInner}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={ON_SURFACE} />
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
            <View style={{ gap: 12, marginTop: 16 }}>
              <Skeleton width="100%" height={48} borderRadius={12} />
              <Skeleton width="100%" height={48} borderRadius={12} />
            </View>
          </View>
          <View style={styles.card}>
            <Skeleton width="40%" height={18} />
            <View style={{ gap: 12, marginTop: 16 }}>
              <Skeleton width="100%" height={48} borderRadius={12} />
              <Skeleton width="100%" height={48} borderRadius={12} />
              <Skeleton width="100%" height={48} borderRadius={12} />
              <Skeleton width="100%" height={48} borderRadius={12} />
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Skeleton width="48%" height={48} borderRadius={12} />
                <Skeleton width="48%" height={48} borderRadius={12} />
              </View>
            </View>
          </View>
          <Skeleton width="100%" height={52} borderRadius={14} style={{ marginTop: 24 }} />
        </ScrollView>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.heroSection}>
              <View style={styles.heroIcon}>
                <MaterialCommunityIcons name="map-marker-plus" size={28} color={PRIMARY} />
              </View>
              <Text style={styles.heroTitle}>Delivery Address</Text>
              <Text style={styles.heroSubtitle}>
                {isEditing ? "Update your delivery location details" : "Add a new delivery location"}
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="account-outline" size={18} color={PRIMARY} />
                <Text style={styles.cardTitle}>Contact Details</Text>
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="account" size={18} color={ON_SURFACE_VARIANT} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Full Name"
                    placeholderTextColor={ON_SURFACE_VARIANT}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="phone" size={18} color={ON_SURFACE_VARIANT} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    placeholder="Mobile Number"
                    placeholderTextColor={ON_SURFACE_VARIANT}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="home-outline" size={18} color={PRIMARY} />
                <Text style={styles.cardTitle}>Address Details</Text>
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="home" size={18} color={ON_SURFACE_VARIANT} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={houseNumber}
                    onChangeText={setHouseNumber}
                    placeholder="House / Flat No."
                    placeholderTextColor={ON_SURFACE_VARIANT}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="office-building" size={18} color={ON_SURFACE_VARIANT} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={apartment}
                    onChangeText={setApartment}
                    placeholder="Apartment / Building (Optional)"
                    placeholderTextColor={ON_SURFACE_VARIANT}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="sign-direction" size={18} color={ON_SURFACE_VARIANT} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={landmark}
                    onChangeText={setLandmark}
                    placeholder="Landmark (Optional)"
                    placeholderTextColor={ON_SURFACE_VARIANT}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="map" size={18} color={ON_SURFACE_VARIANT} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={area}
                    onChangeText={setArea}
                    placeholder="Area / Locality"
                    placeholderTextColor={ON_SURFACE_VARIANT}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputWrapper, styles.halfField]}>
                    <MaterialCommunityIcons name="city" size={18} color={ON_SURFACE_VARIANT} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={city}
                      onChangeText={setCity}
                      placeholder="City"
                      placeholderTextColor={ON_SURFACE_VARIANT}
                    />
                  </View>
                  <View style={[styles.inputWrapper, styles.halfField]}>
                    <MaterialCommunityIcons name="flag" size={18} color={ON_SURFACE_VARIANT} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={state}
                      onChangeText={setState}
                      placeholder="State"
                      placeholderTextColor={ON_SURFACE_VARIANT}
                    />
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="mailbox" size={18} color={ON_SURFACE_VARIANT} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={pincode}
                    onChangeText={setPincode}
                    placeholder="Pincode"
                    placeholderTextColor={ON_SURFACE_VARIANT}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="label-outline" size={18} color={PRIMARY} />
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
                          color={active ? "#fff" : PRIMARY}
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
              <MaterialCommunityIcons name="check-circle-outline" size={22} color="#fff" />
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
  container: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: BG,
  },
  headerBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: SURFACE_CONTAINER_LOW,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: ON_SURFACE, lineHeight: 24 },

  loader: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loaderText: { fontSize: 14, color: ON_SURFACE_VARIANT, lineHeight: 20 },

  scrollContent: { padding: 16, paddingBottom: 16 },

  heroSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY_SOFT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: ON_SURFACE,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 14,
    color: ON_SURFACE_VARIANT,
    lineHeight: 20,
    marginTop: 4,
    textAlign: "center",
  },

  card: {
    backgroundColor: SURFACE_LOWEST,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: SURFACE_CONTAINER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: SURFACE_CONTAINER,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: ON_SURFACE,
    lineHeight: 22,
  },

  fieldGroup: {
    gap: 12,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SURFACE_CONTAINER_LOW,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: ON_SURFACE,
    lineHeight: 20,
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
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: SURFACE_CONTAINER,
    backgroundColor: SURFACE_LOWEST,
    gap: 8,
  },
  labelCardActive: {
    borderColor: PRIMARY,
    backgroundColor: `${PRIMARY}08`,
  },
  labelIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY_SOFT,
    justifyContent: "center",
    alignItems: "center",
  },
  labelIconWrapActive: {
    backgroundColor: PRIMARY,
  },
  labelCardText: {
    fontSize: 13,
    fontWeight: "600",
    color: ON_SURFACE_VARIANT,
    lineHeight: 18,
  },
  labelCardTextActive: {
    color: PRIMARY,
  },

  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: SURFACE_CONTAINER,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { fontSize: 16, fontWeight: "600", color: "#fff", lineHeight: 22 },
});
