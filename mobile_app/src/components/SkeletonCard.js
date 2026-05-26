import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

function SkeletonBox({ width, height, style }) {
  const { colors } = useAppTheme();
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
        { width, height, borderRadius: 6, backgroundColor: colors.skeleton, opacity },
        style,
      ]}
    />
  );
}

export default function SkeletonCard() {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <SkeletonBox width={44} height={44} style={{ borderRadius: 999 }} />
        <View style={{ flex: 1, marginLeft: 8, gap: 6 }}>
          <SkeletonBox width="70%" height={14} />
          <SkeletonBox width="45%" height={12} />
        </View>
        <SkeletonBox width={64} height={22} style={{ borderRadius: 999 }} />
      </View>
      <SkeletonBox width="90%" height={18} style={{ marginTop: 16 }} />
      <SkeletonBox width="55%" height={13} style={{ marginTop: 8 }} />
      <View style={styles.footer}>
        <SkeletonBox width={70} height={24} style={{ borderRadius: 999 }} />
        <SkeletonBox width={70} height={24} style={{ borderRadius: 999 }} />
        <SkeletonBox width={70} height={24} style={{ borderRadius: 999 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  footer: { flexDirection: 'row', gap: 8, marginTop: 16 },
});
