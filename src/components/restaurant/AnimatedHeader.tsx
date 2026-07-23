import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { colors } from "../../theme";

interface AnimatedHeaderProps {
    restaurantName: string;
    scrollY: Animated.Value;
    onBack: () => void;
    onFavourite?: () => void;
    isFavourite?: boolean;
}

const AnimatedHeader = ({
    restaurantName,
    scrollY,
    onBack,
    onFavourite,
    isFavourite,
}: AnimatedHeaderProps) => {
    const insets = useSafeAreaInsets();
    const [showContent, setShowContent] = useState(false);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const id = scrollY.addListener(({ value }) => {
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                setShowContent(value > 40);
            });
        });
        return () => {
            scrollY.removeListener(id);
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        };
    }, [scrollY]);

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 80],
        outputRange: [0, 1],
        extrapolate: "clamp",
    });

    return (
        <Animated.View
            pointerEvents={showContent ? "auto" : "none"}
            style={[
                styles.container,
                {
                    paddingTop: insets.top + 8,
                    opacity: headerOpacity,
                    elevation: headerOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 6],
                    }),
                    shadowOpacity: headerOpacity,
                },
            ]}
        >
            <TouchableOpacity
                style={styles.btn}
                onPress={onBack}
                activeOpacity={0.8}
            >
                <MaterialCommunityIcons
                    name="arrow-left"
                    size={22}
                    color={colors.textPrimary}
                />
            </TouchableOpacity>

            <Animated.Text
                numberOfLines={1}
                style={[styles.title, { opacity: headerOpacity }]}
            >
                {restaurantName}
            </Animated.Text>

            {onFavourite && (
                <TouchableOpacity
                    style={styles.btn}
                    onPress={onFavourite}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons
                        name={isFavourite ? "heart" : "heart-outline"}
                        size={22}
                        color={isFavourite ? colors.primary : colors.textPrimary}
                    />
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingBottom: 10,
        backgroundColor: colors.background,
    },
    btn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        elevation: 2,
        shadowColor: colors.shadow,
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textPrimary,
        flex: 1,
        textAlign: "center",
        marginHorizontal: 8,
    },
});

export default AnimatedHeader;
