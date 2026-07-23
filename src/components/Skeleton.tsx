import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { colors, radius } from "../theme";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export default function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ style }: { style?: any }) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton width="100%" height={160} borderRadius={16} />
      <View style={styles.cardBody}>
        <Skeleton width="70%" height={18} />
        <Skeleton width="50%" height={14} style={{ marginTop: 8 }} />
        <Skeleton width="40%" height={14} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  cardBody: {
    padding: 16,
  },
});
