import { Component } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

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
                    <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#ba1a1a" />
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
        backgroundColor: "#FCF9F8",
        padding: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1c1b1f",
        marginTop: 16,
    },
    subtitle: {
        fontSize: 14,
        color: "#6b676e",
        textAlign: "center",
        marginTop: 8,
        lineHeight: 20,
    },
    button: {
        marginTop: 24,
        backgroundColor: "#ba1a1a",
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 100,
    },
    buttonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
});
