import { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
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
import { RootStackParamList } from "../types/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PRIMARY = "#ab3500";
const PRIMARY_CONTAINER = "#FF6B35";
const BG = "#FCF9F8";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";
const OUTLINE_VARIANT = "#E1BFB5";
const SURFACE_LOWEST = "#FFFFFF";
const SURFACE_VARIANT = "#E5E2E1";

const SignUpScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);

    const handleSignUp = () => {
        navigation.navigate("ProfileSetup", {
            fullName,
            email,
            phone: "+91 98765 43210",
        });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={24}
                        color={PRIMARY}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Account</Text>
                <View style={styles.headerSpacer} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.heroSection}>
                        <Text style={styles.heroTitle}>
                            Join the CraveGo family.
                        </Text>
                        <Text style={styles.heroDesc}>
                            Unlock a world of delicious local flavors delivered
                            to your doorstep.
                        </Text>
                    </View>

                    <Image
                        source={require("../assets/images/southIndian.png")}
                        style={styles.heroImage}
                    />

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <View style={styles.inputRow}>
                                <MaterialCommunityIcons
                                    name="account-outline"
                                    size={20}
                                    color={ON_SURFACE_VARIANT}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name"
                                    placeholderTextColor={`${ON_SURFACE_VARIANT}99`}
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.inputRow}>
                                <MaterialCommunityIcons
                                    name="email-outline"
                                    size={20}
                                    color={ON_SURFACE_VARIANT}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email Address"
                                    placeholderTextColor={`${ON_SURFACE_VARIANT}99`}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.inputRow}>
                                <MaterialCommunityIcons
                                    name="lock-outline"
                                    size={20}
                                    color={ON_SURFACE_VARIANT}
                                />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Password"
                                    placeholderTextColor={`${ON_SURFACE_VARIANT}99`}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPass}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPass(!showPass)}
                                >
                                    <MaterialCommunityIcons
                                        name={
                                            showPass
                                                ? "eye-off-outline"
                                                : "eye-outline"
                                        }
                                        size={20}
                                        color={ON_SURFACE_VARIANT}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.signUpBtn}
                            onPress={handleSignUp}
                        >
                            <Text style={styles.signUpText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.socialSection}>
                        <View style={styles.dividerRow}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>
                                Or sign up with
                            </Text>
                            <View style={styles.divider} />
                        </View>
                        <View style={styles.socialRow}>
                            <TouchableOpacity style={styles.socialBtn}>
                                <MaterialCommunityIcons
                                    name="google"
                                    size={20}
                                    color={ON_SURFACE}
                                />
                                <Text style={styles.socialText}>Google</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialBtn}>
                                <MaterialCommunityIcons
                                    name="facebook"
                                    size={20}
                                    color="#1877F2"
                                />
                                <Text style={styles.socialText}>Facebook</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Already have an account?{" "}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.footerLink}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 28,
        flex: 1,
        marginLeft: 4,
    },
    headerSpacer: {
        width: 40,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    heroSection: {
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: ON_SURFACE,
        lineHeight: 36,
    },
    heroDesc: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        marginTop: 4,
    },
    heroImage: {
        width: "100%",
        height: 140,
        borderRadius: 12,
        marginBottom: 24,
    },
    form: {
        gap: 16,
    },
    inputGroup: {
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: OUTLINE_VARIANT,
        overflow: "hidden",
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
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
    signUpBtn: {
        backgroundColor: PRIMARY_CONTAINER,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
    },
    signUpText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFF",
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    socialSection: {
        marginTop: 24,
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: OUTLINE_VARIANT,
    },
    dividerText: {
        fontSize: 11,
        fontWeight: "500",
        color: ON_SURFACE_VARIANT,
        lineHeight: 16,
        letterSpacing: 0.5,
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
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: OUTLINE_VARIANT,
    },
    socialText: {
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 24,
    },
    footerText: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
    },
    footerLink: {
        fontSize: 14,
        fontWeight: "600",
        color: PRIMARY,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
});
