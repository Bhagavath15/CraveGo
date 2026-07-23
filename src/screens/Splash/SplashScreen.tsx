import { Dimensions, Image, StyleSheet, View } from "react-native";
import { colors } from "../../theme";

const { width } = Dimensions.get("window");

const SplashScreen = () => (
    <View style={styles.container}>
        <Image
            source={require("../../assets/images/splash_logo.png")}
            style={[styles.logo, { width: width * 0.6 }]}
            resizeMode="contain"
        />
    </View>
);

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.surface,
    },
    logo: {
        aspectRatio: 487 / 1105,
    },
});