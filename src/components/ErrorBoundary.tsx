import { Component } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { colors, spacing, typography, radius } from "../theme";

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={64} color={colors.error} />
                    <Text style={styles.title}>Something went wrong</Text>
                    <Text style={styles.subtitle}>An unexpected error occurred. Please try again.</Text>
                    <TouchableOpacity style={styles.button} onPress={this.handleRetry} accessibilityLabel="Retry" accessibilityRole="button">
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
        padding: spacing.lg,
    },
    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginTop: spacing.md,
    },
    subtitle: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        textAlign: "center",
        marginTop: spacing.sm,
        lineHeight: typography.lineHeight.md,
    },
    button: {
        marginTop: spacing.lg,
        backgroundColor: colors.error,
        paddingHorizontal: spacing.xl,
        paddingVertical: 14,
        borderRadius: radius.full,
    },
    buttonText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: typography.fontWeight.semibold,
    },
});
