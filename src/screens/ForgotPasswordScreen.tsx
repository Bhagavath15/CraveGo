import { useRef, useState } from "react";
import {
    Alert,
    Animated,
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
import { Dropdown } from "react-native-element-dropdown";
import { RootStackParamList } from "../types/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PRIMARY = "#ab3500";
const PRIMARY_CONTAINER = "#FF6B35";
const SECONDARY = "#006D37";
const BG = "#FCF9F8";
const ON_SURFACE = "#1B1C1C";
const ON_SURFACE_VARIANT = "#594139";
const OUTLINE_VARIANT = "#E1BFB5";
const SURFACE_LOWEST = "#FFFFFF";

const COUNTRY_CODES = [
    { label: "+91", value: "+91" },
    { label: "+1", value: "+1" },
    { label: "+44", value: "+44" },
];

const ForgotPasswordScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const [countryCode, setCountryCode] = useState("+91");
    const [phone, setPhone] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handleSend = () => {
        if (phone.length < 10) {
            Alert.alert("Invalid", "Please enter a valid 10-digit phone number.");
            return;
        }

        setSending(true);
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.96,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        setTimeout(() => {
            setSending(false);
            setSent(true);
            Alert.alert(
                "Reset Link Sent",
                `A password reset link has been sent to ${countryCode} ${phone}.`
            );
        }, 1500);
    };

    const handleRetry = () => {
        setSent(false);
        setPhone("");
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
                <Text style={styles.headerTitle}>Forgot Password</Text>
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
                    <View style={styles.illustrationSection}>
                        <View style={styles.glow} />
                        <View style={styles.illustrationBox}>
                            <MaterialCommunityIcons
                                name="lock-outline"
                                size={120}
                                color={PRIMARY_CONTAINER}
                            />
                        </View>
                    </View>

                    <View style={styles.contentSection}>
                        <Text style={styles.title}>Recover Your Account</Text>
                        <Text style={styles.desc}>
                            Enter your registered phone number to receive a
                            password reset link.
                        </Text>
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <View style={styles.phoneRow}>
                            <Dropdown
                                style={styles.dropdown}
                                data={COUNTRY_CODES}
                                labelField="label"
                                valueField="value"
                                value={countryCode}
                                onChange={(item) =>
                                    setCountryCode(item.value)
                                }
                                fontFamily="Plus Jakarta Sans"
                            />
                            <TextInput
                                style={styles.phoneInput}
                                placeholder="Enter your phone number"
                                placeholderTextColor={`${ON_SURFACE_VARIANT}80`}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                        </View>
                    </View>

                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <TouchableOpacity
                            style={[
                                styles.sendBtn,
                                sent && styles.sendBtnSuccess,
                            ]}
                            onPress={sent ? handleRetry : handleSend}
                            disabled={sending && !sent}
                        >
                            {sending ? (
                                <View style={styles.sendingRow}>
                                    <MaterialCommunityIcons
                                        name="loading"
                                        size={20}
                                        color="#FFF"
                                    />
                                    <Text style={styles.sendText}>
                                        Sending...
                                    </Text>
                                </View>
                            ) : sent ? (
                                <View style={styles.sendingRow}>
                                    <MaterialCommunityIcons
                                        name="check-circle"
                                        size={20}
                                        color="#FFF"
                                    />
                                    <Text style={styles.sendText}>
                                        Link Sent! Tap to resend
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.sendingRow}>
                                    <Text style={styles.sendText}>
                                        Send Reset Link
                                    </Text>
                                    <MaterialCommunityIcons
                                        name="send"
                                        size={20}
                                        color="#FFF"
                                    />
                                </View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Remember your password?{" "}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.footerLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.supportFooter}>
                <View style={styles.supportLine} />
                <View style={styles.supportRow}>
                    <Text style={styles.supportText}>
                        Need more help?{" "}
                    </Text>
                    <TouchableOpacity style={styles.supportLink}>
                        <Text style={styles.supportLinkText}>
                            Contact Support
                        </Text>
                        <MaterialCommunityIcons
                            name="headset"
                            size={18}
                            color={SECONDARY}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default ForgotPasswordScreen;

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
        color: PRIMARY,
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
    illustrationSection: {
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 32,
        position: "relative",
    },
    glow: {
        position: "absolute",
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: `${PRIMARY_CONTAINER}1A`,
        opacity: 0.5,
    },
    illustrationBox: {
        width: 240,
        height: 240,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 32,
    },
    contentSection: {
        alignItems: "center",
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: ON_SURFACE,
        lineHeight: 32,
        marginBottom: 8,
    },
    desc: {
        fontSize: 16,
        color: ON_SURFACE_VARIANT,
        lineHeight: 24,
        textAlign: "center",
        maxWidth: 320,
    },
    inputSection: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
        letterSpacing: 0.1,
        marginBottom: 8,
        marginLeft: 4,
    },
    phoneRow: {
        flexDirection: "row",
        gap: 12,
    },
    dropdown: {
        width: 100,
        height: 56,
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: OUTLINE_VARIANT,
        paddingHorizontal: 12,
    },
    phoneInput: {
        flex: 1,
        height: 56,
        backgroundColor: SURFACE_LOWEST,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: OUTLINE_VARIANT,
        paddingHorizontal: 16,
        fontSize: 16,
        color: ON_SURFACE,
    },
    sendBtn: {
        backgroundColor: PRIMARY_CONTAINER,
        height: 56,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    sendBtnSuccess: {
        backgroundColor: SECONDARY,
    },
    sendingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sendText: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFF",
        lineHeight: 28,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 32,
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
    supportFooter: {
        alignItems: "center",
        paddingVertical: 16,
    },
    supportLine: {
        width: 48,
        height: 1,
        backgroundColor: `${OUTLINE_VARIANT}4D`,
        marginBottom: 8,
    },
    supportRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    supportText: {
        fontSize: 14,
        color: ON_SURFACE_VARIANT,
        lineHeight: 20,
    },
    supportLink: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    supportLinkText: {
        fontSize: 14,
        fontWeight: "600",
        color: SECONDARY,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
});
