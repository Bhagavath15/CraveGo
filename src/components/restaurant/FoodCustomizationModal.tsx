import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useEffect, useState } from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { MenuItem } from "../../data/restaurantData";
import { CustomizationGroup } from "../../types/types";

const PRIMARY = "#FF6B35";
const SECONDARY = "#006D37";

type Props = {
    visible: boolean;
    selectedItem: MenuItem | null;
    customizationGroups: CustomizationGroup[];
    onAddToCart: (item: MenuItem, selections: Record<string, string[]>, totalPrice: number) => void;
    onClose: () => void;
};

const isMultiSelect = (group: CustomizationGroup) =>
    group.maxSelect === 0 || (group.maxSelect && group.maxSelect > 1);

const FoodCustomizationModal = ({ visible, selectedItem, customizationGroups, onAddToCart, onClose }: Props) => {
    const [selections, setSelections] = useState<Record<string, string[]>>({});

    useEffect(() => {
        setSelections({});
    }, [selectedItem]);

    const handleSheetChanges = (index: number) => {
        if (index === -1) {
            onClose();
        }
    };

    const handleSelect = (groupId: string, optionId: string) => {
        const group = customizationGroups.find((g) => g.id === groupId);
        if (!group) return;

        if (isMultiSelect(group)) {
            setSelections((prev) => {
                const current = prev[groupId] || [];
                if (current.includes(optionId)) {
                    return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
                }
                if (group.maxSelect && group.maxSelect > 0 && current.length >= group.maxSelect) {
                    return prev;
                }
                return { ...prev, [groupId]: [...current, optionId] };
            });
        } else {
            setSelections((prev) => ({ ...prev, [groupId]: [optionId] }));
        }
    };

    if (!selectedItem || !visible) return null;

    const getOptionPrice = (groupId: string, optionId: string): number => {
        const group = customizationGroups.find((g) => g.id === groupId);
        if (!group) return 0;
        const option = group.options.find((o) => o.id === optionId);
        return option?.price || 0;
    };

    const optionsPrice = customizationGroups
        .flatMap((g) => (selections[g.id] || []).map((oid) => getOptionPrice(g.id, oid)))
        .reduce((sum, p) => sum + p, 0);

    const totalPrice = selectedItem.price + optionsPrice;

    const allRequiredSelected = customizationGroups
        .filter((g) => g.maxSelect !== 0)
        .every((g) => (selections[g.id] || []).length > 0);

    const renderOption = (group: CustomizationGroup, option: typeof group.options[0]) => {
        const multi = isMultiSelect(group);
        const selectedIds = selections[group.id] || [];
        const isSelected = selectedIds.includes(option.id);

        return (
            <TouchableOpacity
                key={option.id}
                style={[
                    styles.optionRow,
                    isSelected && styles.optionRowSelected,
                ]}
                activeOpacity={0.7}
                onPress={() => handleSelect(group.id, option.id)}
            >
                <View style={styles.optionLeft}>
                    {multi ? (
                        <View
                            style={[
                                styles.checkbox,
                                isSelected && styles.checkboxSelected,
                            ]}
                        >
                            {isSelected && (
                                <MaterialCommunityIcons
                                    name="check"
                                    size={14}
                                    color="#FFF"
                                />
                            )}
                        </View>
                    ) : (
                        <View
                            style={[
                                styles.radio,
                                isSelected && styles.radioSelected,
                            ]}
                        >
                            {isSelected && (
                                <View style={styles.radioInner} />
                            )}
                        </View>
                    )}
                    <Text
                        style={[
                            styles.optionName,
                            isSelected && styles.optionNameSelected,
                        ]}
                    >
                        {option.name}
                    </Text>
                </View>
                {option.price > 0 && (
                    <Text
                        style={[
                            styles.optionPrice,
                            isSelected && styles.optionPriceSelected,
                        ]}
                    >
                        +₹{option.price}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <BottomSheet
            index={0}
            snapPoints={["75%"]}
            onChange={handleSheetChanges}
            enablePanDownToClose={true}
            handleIndicatorStyle={styles.handle}
            backgroundStyle={styles.sheetBackground}
        >
            <BottomSheetScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <Image source={selectedItem.image} style={styles.itemImage} />
                        <View style={styles.headerInfo}>
                            <Text style={styles.itemName}>{selectedItem.name}</Text>
                            {selectedItem.isBestseller && (
                                <View style={styles.bestsellerBadge}>
                                    <MaterialCommunityIcons
                                        name="leaf"
                                        size={12}
                                        color={SECONDARY}
                                    />
                                    <Text style={styles.bestsellerText}>BESTSELLER</Text>
                                </View>
                            )}
                            <Text style={styles.basePrice}>
                                ₹{selectedItem.price}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.description} numberOfLines={3}>
                        {selectedItem.description}
                    </Text>
                </View>

                <View style={styles.divider} />

                {customizationGroups.map((group) => (
                    <View key={group.id} style={styles.group}>
                        <Text style={styles.groupTitle}>{group.title}</Text>
                        {group.options.map((option) => renderOption(group, option))}
                    </View>
                ))}

                <View style={styles.footer}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalPrice}>₹{totalPrice}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.addButton, !allRequiredSelected && styles.addButtonDisabled]}
                        activeOpacity={0.8}
                        disabled={!allRequiredSelected}
                        onPress={() => onAddToCart(selectedItem, selections, totalPrice)}
                    >
                        <Text style={styles.addButtonText}>
                            Add to Cart • ₹{totalPrice}
                        </Text>
                    </TouchableOpacity>
                </View>
            </BottomSheetScrollView>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    sheetBackground: {
        backgroundColor: "#FCF9F8",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    handle: {
        backgroundColor: "#E1BFB5",
        width: 40,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
    },
    header: {
        marginBottom: 4,
    },
    headerRow: {
        flexDirection: "row",
        gap: 16,
        alignItems: "center",
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 16,
    },
    headerInfo: {
        flex: 1,
        gap: 4,
    },
    itemName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1B1C1C",
        lineHeight: 28,
    },
    bestsellerBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    bestsellerText: {
        fontSize: 11,
        fontWeight: "700",
        color: SECONDARY,
        letterSpacing: 0.5,
    },
    basePrice: {
        fontSize: 16,
        fontWeight: "600",
        color: "#594139",
        marginTop: 2,
    },
    description: {
        fontSize: 14,
        fontWeight: "400",
        color: "#594139",
        lineHeight: 20,
        marginTop: 12,
    },
    divider: {
        height: 1,
        backgroundColor: "#E1BFB5",
        opacity: 0.3,
        marginVertical: 16,
    },
    group: {
        marginBottom: 20,
    },
    groupTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1B1C1C",
        marginBottom: 12,
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 6,
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "rgba(225,191,181,0.12)",
    },
    optionRowSelected: {
        borderColor: PRIMARY,
        backgroundColor: "#FFF5F0",
    },
    optionLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#8D7168",
        alignItems: "center",
        justifyContent: "center",
    },
    radioSelected: {
        borderColor: PRIMARY,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: PRIMARY,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: "#8D7168",
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxSelected: {
        borderColor: PRIMARY,
        backgroundColor: PRIMARY,
    },
    optionName: {
        fontSize: 14,
        fontWeight: "400",
        color: "#1B1C1C",
    },
    optionNameSelected: {
        fontWeight: "600",
    },
    optionPrice: {
        fontSize: 13,
        fontWeight: "500",
        color: "#594139",
    },
    optionPriceSelected: {
        color: PRIMARY,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 32,
        marginHorizontal: -20,
        backgroundColor: "#FCF9F8",
        borderTopWidth: 1,
        borderTopColor: "rgba(225,191,181,0.3)",
        marginTop: 16,
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1B1C1C",
    },
    totalPrice: {
        fontSize: 20,
        fontWeight: "700",
        color: PRIMARY,
    },
    addButton: {
        backgroundColor: PRIMARY,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: "center",
    },
    addButtonDisabled: {
        opacity: 0.5,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFF",
        letterSpacing: 0.5,
    },
});

export default FoodCustomizationModal;
