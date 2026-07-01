import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface AnimatedHeaderProps {
    restaurantName: string;
    scrollY: Animated.Value;
    onBack: () => void;
    onSearch?: () => void;
    onShare?: () => void;
}

const AnimatedHeader = ({
    restaurantName,
    scrollY,
    onBack,
    onSearch,
    onShare,
}: AnimatedHeaderProps) => {
    const insets = useSafeAreaInsets();

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 80],
        outputRange: [0, 1],
        extrapolate: "clamp",
    });

    return (
        <Animated.View
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
                    color="#1B1C1C"
                />
            </TouchableOpacity>

            <Animated.Text
                numberOfLines={1}
                style={[styles.title, { opacity: headerOpacity }]}
            >
                {restaurantName}
            </Animated.Text>

            <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                    style={styles.btn}
                    onPress={onSearch}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons
                        name="magnify"
                        size={22}
                        color="#1B1C1C"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.btn}
                    onPress={onShare}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons
                        name="share-variant"
                        size={22}
                        color="#1B1C1C"
                    />
                </TouchableOpacity>
            </View>
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
        backgroundColor: "#FCF9F8",
    },
    btn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1B1C1C",
        flex: 1,
        textAlign: "center",
        marginHorizontal: 8,
    },
});

export default AnimatedHeader;
