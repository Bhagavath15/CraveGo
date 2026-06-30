import { StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const Header = () => {
    const insets = useSafeAreaInsets()

    return (
        <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: 12 }]}>
            <View style={styles.content}>
                <Text style={styles.title}>Header</Text>
                <MaterialCommunityIcons
                    name="bell-outline"
                    size={26}
                    color="#222"
                />
            </View>
        </View>
    )
}

export default Header;

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111",
    },
});
