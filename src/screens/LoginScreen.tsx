import { useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "react-native-element-dropdown";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../types/types";

const PRIMARY = "#FF6B35";

const COUNTRY_CODES = [
    { label: "+91", value: "+91" },
    { label: "+1", value: "+1" },
    { label: "+44", value: "+44" },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SocialButton = ({
    icon,
    title,
}: {
    icon: string;
    title: string;
}) => (
    <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
        <MaterialCommunityIcons
            name={icon}
            size={26}
            color="#222"
        />

        <Text style={styles.socialText}>{title}</Text>
    </TouchableOpacity>
);

const LoginScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    const [countryCode, setCountryCode] = useState("+91");
    const [mobileNumber, setMobileNumber] = useState("");

    const isDisabled = mobileNumber.trim().length !== 10;

    const handleContinue = () => {
        if (isDisabled) return;

        navigation.replace("Home");
    };

    const handleMobileChange = (text: string) => {
        setMobileNumber(text.replace(/[^0-9]/g, ""));
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.container}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Logo */}
                        <View style={styles.logoContainer}>
                            <MaterialCommunityIcons
                                name="silverware-fork-knife"
                                size={42}
                                color="#FFF"
                            />
                        </View>

                        {/* Title */}
                        <Text style={styles.title}>
                            Welcome to CraveGo
                        </Text>

                        <Text style={styles.subtitle}>
                            Delicious food delivered to your doorstep.
                        </Text>

                        {/* Phone Number */}
                        <View style={styles.phoneInputContainer}>
                            <Dropdown
                                style={styles.dropdown}
                                data={COUNTRY_CODES}
                                labelField="label"
                                valueField="value"
                                value={countryCode}
                                onChange={(item) => setCountryCode(item.value)}
                            />

                            <View style={styles.verticalDivider} />

                            <TextInput
                                style={styles.input}
                                placeholder="Mobile Number"
                                placeholderTextColor="#888"
                                keyboardType="number-pad"
                                value={mobileNumber}
                                onChangeText={handleMobileChange}
                                maxLength={10}
                                returnKeyType="done"
                                autoComplete="tel"
                            />
                        </View>

                        {/* Continue */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            disabled={isDisabled}
                            onPress={handleContinue}
                            style={[
                                styles.continueButton,
                                isDisabled && styles.disabledButton,
                            ]}
                        >
                            <Text style={styles.continueText}>
                                Continue
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.forgotRow}
                            onPress={() => navigation.navigate("ForgotPassword")}
                        >
                            <Text style={styles.forgotText}>
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.line} />

                            <Text style={styles.dividerText}>
                                OR CONNECT WITH
                            </Text>

                            <View style={styles.line} />
                        </View>

                        {/* Social Login */}
                        <View style={styles.socialContainer}>
                            <SocialButton
                                icon="google"
                                title="Google"
                            />

                            <Text style={styles.orText}>OR</Text>

                            <SocialButton
                                icon="apple"
                                title="Apple"
                            />
                        </View>

                        {/* Signup */}
                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>
                                Don't have an account?
                            </Text>

                            <TouchableOpacity
                                onPress={() => navigation.navigate("SignUp")}
                            >
                                <Text style={styles.link}>
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Terms */}
                        <Text style={styles.terms}>
                            By continuing, you agree to our{" "}
                            <Text style={styles.link}>
                                Terms & Conditions
                            </Text>
                        </Text>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFF",
    },

    container: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 20,
    },

    logoContainer: {
        alignSelf: "center",
        backgroundColor: PRIMARY,
        padding: 22,
        borderRadius: 24,
    },

    title: {
        marginTop: 25,
        fontSize: 34,
        fontWeight: "700",
        color: "#111",
        textAlign: "center",
    },

    subtitle: {
        marginTop: 10,
        marginBottom: 35,
        textAlign: "center",
        color: "#666",
        fontSize: 16,
        lineHeight: 24,
    },

    phoneInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9F9F9",
        borderBottomWidth: 2,
        borderBottomColor: "#8C6C61",
        borderRadius: 10,
        height: 60,
        paddingHorizontal: 12,
    },

    dropdown: {
        width: 75,
    },

    verticalDivider: {
        width: 1,
        height: 28,
        backgroundColor: "#DDD",
        marginHorizontal: 12,
    },

    input: {
        flex: 1,
        fontSize: 17,
        color: "#222",
    },

    continueButton: {
        marginTop: 30,
        height: 56,
        borderRadius: 12,
        backgroundColor: PRIMARY,
        justifyContent: "center",
        alignItems: "center",
    },

    disabledButton: {
        opacity: 0.5,
    },

    continueText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 16,
    },

    forgotRow: {
        alignItems: "center",
        marginTop: 16,
    },
    forgotText: {
        fontSize: 14,
        fontWeight: "600",
        color: PRIMARY,
        lineHeight: 20,
        letterSpacing: 0.1,
    },

    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 35,
    },

    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#E5E5E5",
    },

    dividerText: {
        marginHorizontal: 14,
        color: "#777",
        fontSize: 13,
        fontWeight: "600",
    },

    socialContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
    },

    socialButton: {
        alignItems: "center",
    },

    socialText: {
        marginTop: 6,
        fontWeight: "600",
        color: "#222",
    },

    orText: {
        fontWeight: "700",
        color: "#666",
    },

    signupContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 35,
    },

    signupText: {
        color: "#666",
        fontSize: 15,
    },

    terms: {
        marginTop: "auto",
        textAlign: "center",
        color: "#555",
        fontSize: 14,
        lineHeight: 24,
        paddingTop: 30,
        paddingBottom: 10,
    },

    link: {
        color: PRIMARY,
        fontWeight: "700",
    },
});