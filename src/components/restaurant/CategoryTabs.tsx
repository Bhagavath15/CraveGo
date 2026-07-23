import { useRef, useEffect } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    LayoutChangeEvent,
} from "react-native";
import { colors } from "../../theme";

interface CategoryTabsProps {
    categories: string[];
    selectedCategory: string;
    onSelect: (category: string) => void;
}


const CategoryTabs = ({
    categories,
    selectedCategory,
    onSelect,
}: CategoryTabsProps) => {
    const scrollRef = useRef<ScrollView>(null);
    const tabRefs = useRef<{ [key: string]: number }>({});

    const handleLayout = (title: string, event: LayoutChangeEvent) => {
        tabRefs.current[title] = event.nativeEvent.layout.x;
    };

    useEffect(() => {
        const x = tabRefs.current[selectedCategory];
        if (x !== undefined && scrollRef.current) {
            scrollRef.current.scrollTo({ x: Math.max(0, x - 32), animated: true });
        }
    }, [selectedCategory]);

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {categories.map((title) => (
                    <TouchableOpacity
                        key={title}
                        activeOpacity={0.7}
                        onPress={() => onSelect(title)}
                        onLayout={(e) => handleLayout(title, e)}
                        style={[
                            styles.tab,
                            selectedCategory === title && styles.tabActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                selectedCategory === title &&
                                    styles.tabTextActive,
                            ]}
                        >
                            {title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        borderBottomColor: "rgba(225,191,181,0.2)",
    },
    content: {
        paddingHorizontal: 16,
        gap: 16,
    },
    tab: {
        paddingVertical: 10,
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textSecondary,
        letterSpacing: 0.1,
    },
    tabTextActive: {
        color: colors.primary,
    },
});

export default CategoryTabs;
