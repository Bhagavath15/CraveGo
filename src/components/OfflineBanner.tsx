import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { colors, spacing } from "../theme";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOffline(!(state.isConnected && state.isInternetReachable !== false));
    });
    return () => unsub();
  }, []);

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <MaterialCommunityIcons name="wifi-off" size={16} color={colors.white} />
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.error,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  text: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
});
