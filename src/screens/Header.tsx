import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
    back?: { title: string };
    navigation?: { goBack: () => void };
};

const Header = ({ back, navigation: backNav }: Props) => {
    const insets = useSafeAreaInsets()
    const navigation = useNavigation<NavigationProp>();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: 12 }]}>
            <View style={styles.content}>
                <View style={styles.left}>
                    {back && (
                        <TouchableOpacity
                            onPress={() => backNav?.goBack()}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <MaterialCommunityIcons
                                name="arrow-left"
                                size={24}
                                color="#de782a"
                            />
                        </TouchableOpacity>
                    )}
                    <View style={styles.locationContent}>
                        <MaterialCommunityIcons
                            name="map-marker"
                            size={20}
                            color="#de782a"
                        />
                        <Text>Location</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
                    <MaterialCommunityIcons
                        name="bell-outline"
                        size={26}
                        color="#de782a"
                    />
                </TouchableOpacity>
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
    left: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    locationContent: {
        flexDirection: 'row',
        gap: 5,
    },
});
