import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import LinearGradient from "react-native-linear-gradient";
import { RootStackParamList } from "../types/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PRIMARY = "#ab3500";
const PRIMARY_CONTAINER = "#FF6B35";
const BG = "#FCF9F8";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";
const OUTLINE_VARIANT = "#E1BFB5";
const SURFACE_LOWEST = "#FFFFFF";
const OUTLINE = "#8D7168";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SignUpScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleSignUp = () => {
        navigation.navigate("ProfileSetup", {
            fullName,
            email: "",
            phone: phone ? `+91 ${phone}` : "",
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <View style={[styles.header, { height: Dimensions.get("window").height * 0.4 }]}>
                <Image
                    source={require("../assets/images/allFood.png")}
                    resizeMode="cover"
                    style={styles.headerImage}
                />
                <LinearGradient
                    colors={["rgba(0,0,0,0.3)", "rgba(252,249,248,0.4)", BG]}
                    locations={[0, 0.5, 1]}
                    style={styles.headerGradient}
                />

                <TouchableOpacity
                    style={[styles.backBtn, { top: insets.top + 8 }]}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="arrow-left" size={22} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.headerText}>
                    <Text style={styles.heroTitle}>Join the CraveGo family.</Text>
                    <Text style={styles.heroDesc}>
                        Unlock a world of delicious local flavors delivered directly to your doorstep.
                    </Text>
                </View>
            </View>

            <Animated.View
                style={[
                    styles.formWrapper,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <MaterialCommunityIcons
                                    name="account-outline"
                                    size={20}
                                    color={OUTLINE_VARIANT}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name"
                                    placeholderTextColor={`${OUTLINE}99`}
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <MaterialCommunityIcons
                                    name="phone"
                                    size={20}
                                    color={OUTLINE_VARIANT}
                                />
                                <View style={styles.countryCodeRow}>
                                    <TouchableOpacity style={styles.countryCode}>
                                        <Text style={styles.countryCodeText}>+91</Text>
                                        <MaterialCommunityIcons
                                            name="chevron-down"
                                            size={16}
                                            color={OUTLINE}
                                        />
                                    </TouchableOpacity>
                                    <View style={styles.codeDivider} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Phone Number"
                                    placeholderTextColor={`${OUTLINE}99`}
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                            </View>

                            <TouchableOpacity style={styles.signUpBtn} activeOpacity={0.95} onPress={handleSignUp}>
                                <Text style={styles.signUpText}>Sign Up</Text>
                                <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.socialSection}>
                            <View style={styles.dividerRow}>
                                <View style={styles.divider} />
                                <Text style={styles.dividerText}>Or sign up with</Text>
                                <View style={styles.divider} />
                            </View>

                            <View style={styles.socialRow}>
                                <TouchableOpacity style={styles.socialBtn}>
                                    <MaterialCommunityIcons name="google" size={20} color="#4285F4" />
                                    <Text style={styles.socialText}>Google</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.socialBtn}>
                                    <MaterialCommunityIcons name="facebook" size={20} color="#1877F2" />
                                    <Text style={styles.socialText}>Facebook</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account?{" "}</Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.footerLink}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Animated.View>
        </View>
    );
};

export default SignUpScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    header: {
        width: "100%",
        overflow: "hidden",
    },
    headerImage: {
        width: "100%",
        height: "100%",
        position: "absolute",
    },
    headerGradient: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
    },
    backBtn: {
        position: "absolute",
        left: 24,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        zIndex: 10,
    },
    headerText: {
        position: "absolute",
        bottom: 24,
        left: 24,
        right: 24,
    },
    heroTitle: {
        fontSize: 30,
        fontWeight: "800",
        color: ON_SURFACE,
        lineHeight: 38,
    },
    heroDesc: {
        fontSize: 15,
        color: ON_SURFACE_VARIANT,
        lineHeight: 22,
        marginTop: 4,
        maxWidth: "85%",
    },
    formWrapper: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 32,
    },
    form: {
        gap: 16,
    },
    inputGroup: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: SURFACE_LOWEST,
        borderWidth: 1,
        borderColor: OUTLINE_VARIANT,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: ON_SURFACE,
        lineHeight: 24,
        padding: 0,
    },
    countryCodeRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    countryCode: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        paddingRight: 12,
    },
    countryCodeText: {
        fontSize: 16,
        fontWeight: "600",
        color: ON_SURFACE,
    },
    codeDivider: {
        width: 1,
        height: 20,
        backgroundColor: OUTLINE_VARIANT,
        marginRight: 12,
    },
    signUpBtn: {
        flexDirection: "row",
        backgroundColor: PRIMARY_CONTAINER,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 8,
        shadowColor: PRIMARY_CONTAINER,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    signUpText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFF",
        lineHeight: 24,
    },
    socialSection: {
        marginTop: 32,
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: OUTLINE_VARIANT,
    },
    dividerText: {
        fontSize: 10,
        fontWeight: "500",
        color: OUTLINE,
        lineHeight: 16,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        marginHorizontal: 16,
    },
    socialRow: {
        flexDirection: "row",
        gap: 16,
    },
    socialBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: OUTLINE_VARIANT,
        backgroundColor: SURFACE_LOWEST,
    },
    socialText: {
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 48,
        marginBottom: 16,
    },
    footerText: {
        fontSize: 15,
        color: ON_SURFACE_VARIANT,
        lineHeight: 22,
    },
    footerLink: {
        fontSize: 15,
        fontWeight: "600",
        color: PRIMARY_CONTAINER,
        lineHeight: 22,
    },
});
