import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { colors, shadows } from "../../theme";

interface RestaurantInfoCardProps {
    name: string;
    cuisinesLabel: string;
    vegLabel: string;
    rating: number;
    deliveryTime: string;
    distance: string;
    offer?: string;
    offerDescription?: string;
}


const RestaurantInfoCard = ({
    name,
    cuisinesLabel,
    vegLabel,
    rating,
    deliveryTime,
    distance,
    offer,
    offerDescription,
}: RestaurantInfoCardProps) => {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.cuisines}>
                        {cuisinesLabel} • {vegLabel}
                    </Text>
                </View>

                <View style={styles.ratingBadge}>
                    <MaterialCommunityIcons
                        name="star"
                        size={16}
                        color={colors.white}
                    />
                    <Text style={styles.ratingText}>{rating}</Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <MaterialCommunityIcons
                        name="clock-outline"
                        size={18}
                        color={colors.primary}
                    />
                    <Text style={styles.infoItemText}>
                        {deliveryTime}
                    </Text>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoItem}>
                    <MaterialCommunityIcons
                        name="map-marker"
                        size={18}
                        color={colors.primary}
                    />
                    <Text style={styles.infoItemText}>{distance}</Text>
                </View>
            </View>

            {offer && (
                <TouchableOpacity
                    style={styles.offerCard}
                    activeOpacity={0.7}
                >
                    <View style={styles.offerIcon}>
                        <MaterialCommunityIcons
                            name="brightness-percent"
                            size={20}
                            color={colors.white}
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={styles.offerTitle}>{offer}</Text>
                        {offerDescription && (
                            <Text style={styles.offerSubtitle}>
                                {offerDescription}
                            </Text>
                        )}
                    </View>

                    <MaterialCommunityIcons
                        name="chevron-right"
                        size={20}
                        color={colors.textSecondary}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginTop: -48,
        marginHorizontal: 16,
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 16,
        ...shadows.card,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    name: {
        fontSize: 28,
        fontWeight: "700",
        color: colors.textPrimary,
        lineHeight: 36,
    },
    cuisines: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textSecondary,
        marginTop: 4,
        letterSpacing: 0.1,
    },
    ratingBadge: {
        backgroundColor: "rgba(0,109,55,0.12)",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingText: {
        color: colors.secondary,
        fontWeight: "700",
        fontSize: 14,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        marginTop: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "rgba(225,191,181,0.25)",
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    infoDivider: {
        width: 1,
        height: 20,
        backgroundColor: "rgba(225,191,181,0.25)",
        marginHorizontal: 16,
    },
    infoItemText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    offerCard: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
        backgroundColor: "rgba(255,107,53,0.06)",
        borderRadius: 12,
        padding: 12,
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "rgba(255,107,53,0.25)",
    },
    offerIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    offerTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.primary,
        letterSpacing: 0.1,
    },
    offerSubtitle: {
        fontSize: 11,
        fontWeight: "500",
        color: colors.textSecondary,
        marginTop: 2,
        letterSpacing: 0.5,
    },
});

export default RestaurantInfoCard;
