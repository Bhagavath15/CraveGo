import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { MenuItem } from "../../types/types";
import { imageSource } from "../../utils/imageUtils";
import { colors, shadows } from "../../theme";

interface MenuItemCardProps {
    item: MenuItem;
    quantity: number;
    onAdd: (item: MenuItem) => void;
    onIncrement: (item: MenuItem) => void;
    onDecrement: (item: MenuItem) => void;
}


const MenuItemCard = ({ item, quantity, onAdd, onIncrement, onDecrement }: MenuItemCardProps) => {
    return (
        <View style={styles.card}>
            <View style={styles.content}>
                <View style={{ flex: 1 }}>
                    {item.isBestseller && (
                        <View style={styles.bestsellerBadge}>
                            <MaterialCommunityIcons
                                name="leaf"
                                size={14}
                                color={colors.secondary}
                            />
                            <Text style={styles.bestsellerText}>
                                BESTSELLER
                            </Text>
                        </View>
                    )}

                    <Text style={styles.name}>{item.name}</Text>

                    <Text style={styles.description} numberOfLines={2}>
                        {item.description}
                    </Text>

                    <Text style={styles.price}>₹{item.price}</Text>

                    {item.customizable && (
                        <Text style={styles.customizableText}>
                            Customizable
                        </Text>
                    )}
                </View>

                <View style={styles.imageWrapper}>
                    <Image
                        source={imageSource(item.image)}
                        style={styles.image}
                    />

                    {quantity > 0 ? (
                        <View style={styles.stepper}>
                            <TouchableOpacity
                                style={styles.stepperBtn}
                                activeOpacity={0.7}
                                onPress={() => onDecrement(item)}
                            >
                                <MaterialCommunityIcons
                                    name="minus"
                                    size={14}
                                    color={colors.white}
                                />
                            </TouchableOpacity>
                            <Text style={styles.stepperQty}>{quantity}</Text>
                            <TouchableOpacity
                                style={styles.stepperBtn}
                                activeOpacity={0.7}
                                onPress={() => onIncrement(item)}
                            >
                                <MaterialCommunityIcons
                                    name="plus"
                                    size={14}
                                    color={colors.white}
                                />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.addButton}
                            activeOpacity={0.8}
                            onPress={() => onAdd(item)}
                        >
                            <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(225,191,181,0.12)",
        ...shadows.card,
    },
    content: {
        flexDirection: "row",
        gap: 12,
    },
    bestsellerBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 6,
    },
    bestsellerText: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.secondary,
        letterSpacing: 0.5,
    },
    name: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.textPrimary,
        lineHeight: 26,
    },
    description: {
        fontSize: 14,
        fontWeight: "400",
        color: colors.textSecondary,
        marginTop: 4,
        lineHeight: 20,
    },
    price: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.textPrimary,
        marginTop: 8,
    },
    customizableText: {
        fontSize: 11,
        fontWeight: "500",
        color: colors.primary,
        marginTop: 4,
        letterSpacing: 0.5,
    },
    imageWrapper: {
        position: "relative",
        width: 120,
        height: 120,
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 12,
    },
    addButton: {
        position: "absolute",
        bottom: -8,
        left: "50%",
        transform: [{ translateX: -32 }],
        backgroundColor: colors.white,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
        ...shadows.card,
        borderWidth: 1,
        borderColor: "rgba(225,191,181,0.2)",
    },
    addButtonText: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.primary,
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    stepper: {
        position: "absolute",
        bottom: -8,
        left: "50%",
        transform: [{ translateX: -44 }],
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary,
        borderRadius: 8,
        ...shadows.card,
    },
    stepperBtn: {
        width: 36,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
    },
    stepperQty: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.white,
        minWidth: 24,
        textAlign: "center",
    },
});

export default MenuItemCard;
