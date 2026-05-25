import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';

function SkeletonBox({ width, height, style }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius.sm, backgroundColor: colors.skeleton, opacity },
        style,
      ]}
    />
  );
}

export default function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SkeletonBox width={44} height={44} style={{ borderRadius: radius.full }} />
        <View style={{ flex: 1, marginLeft: spacing.sm, gap: 6 }}>
          <SkeletonBox width="70%" height={14} />
          <SkeletonBox width="45%" height={12} />
        </View>
        <SkeletonBox width={64} height={22} style={{ borderRadius: radius.full }} />
      </View>
      <SkeletonBox width="90%" height={18} style={{ marginTop: spacing.md }} />
      <SkeletonBox width="55%" height={13} style={{ marginTop: spacing.sm }} />
      <View style={styles.footer}>
        <SkeletonBox width={70} height={24} style={{ borderRadius: radius.full }} />
        <SkeletonBox width={70} height={24} style={{ borderRadius: radius.full }} />
        <SkeletonBox width={70} height={24} style={{ borderRadius: radius.full }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
