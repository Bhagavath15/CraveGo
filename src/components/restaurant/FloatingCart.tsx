import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme";

interface FloatingCartProps {
    itemCount: number;
    restaurantName: string;
    onViewCart?: () => void;
}


const FloatingCart = ({
    itemCount,
    restaurantName,
    onViewCart,
}: FloatingCartProps) => {
    const insets = useSafeAreaInsets();

    if (itemCount === 0) return null;

    return (
        <View
            style={[
                styles.container,
                { paddingBottom: insets.bottom + 12 },
            ]}
        >
            <TouchableOpacity
                style={styles.button}
                activeOpacity={0.9}
                onPress={onViewCart}
            >
                <View style={styles.left}>
                    <View style={styles.iconWrapper}>
                        <MaterialCommunityIcons
                            name="basket"
                            size={24}
                            color={colors.white}
                        />
                    </View>

                    <View>
                        <Text style={styles.countText}>
                            {itemCount} Item
                            {itemCount > 1 ? "s" : ""} added
                        </Text>
                        <Text style={styles.restaurantText}>
                            from {restaurantName}
                        </Text>
                    </View>
                </View>

                <View style={styles.right}>
                    <Text style={styles.ctaText}>View Cart</Text>
                    <MaterialCommunityIcons
                        name="arrow-right"
                        size={20}
                        color={colors.white}
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 24,
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        elevation: 12,
        shadowColor: colors.primary,
        shadowOpacity: 0.35,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
    },
    left: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    countText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.white,
        letterSpacing: 0.1,
    },
    restaurantText: {
        fontSize: 11,
        fontWeight: "500",
        color: "rgba(255,255,255,0.8)",
        letterSpacing: 0.5,
    },
    right: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ctaText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.white,
        letterSpacing: 0.1,
        textTransform: "uppercase",
    },
});

export default FloatingCart;
