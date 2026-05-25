import React, {
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { colors, spacing, radius, font } from '../theme';
import { CATEGORIES, LOCATIONS } from '../data/jobs';

function OptionPill({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={() => onPress(label)}
      style={[styles.pill, selected && styles.pillSelected]}
      activeOpacity={0.75}
    >
      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const FilterBottomSheet = forwardRef(function FilterBottomSheet(
  { selectedCategory, selectedLocation, onApply },
  ref
) {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['60%', '85%'], []);

  const [localCategory, setLocalCategory] = useState(selectedCategory);
  const [localLocation, setLocalLocation] = useState(selectedLocation);

  useImperativeHandle(ref, () => ({
    open() {
      setLocalCategory(selectedCategory);
      setLocalLocation(selectedLocation);
      bottomSheetRef.current?.snapToIndex(0);
    },
    close() {
      bottomSheetRef.current?.close();
    },
  }));

  const handleApply = useCallback(() => {
    onApply({ category: localCategory, location: localLocation });
    bottomSheetRef.current?.close();
  }, [localCategory, localLocation, onApply]);

  const handleReset = useCallback(() => {
    setLocalCategory('All');
    setLocalLocation('All');
    onApply({ category: 'All', location: 'All' });
    bottomSheetRef.current?.close();
  }, [onApply]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.sheetTitle}>Filter Jobs</Text>

        <Text style={styles.sectionLabel}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}
        >
          {CATEGORIES.map((cat) => (
            <OptionPill
              key={cat}
              label={cat}
              selected={localCategory === cat}
              onPress={setLocalCategory}
            />
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>Location</Text>
        <View style={styles.locationGrid}>
          {LOCATIONS.map((loc) => (
            <OptionPill
              key={loc}
              label={loc}
              selected={localLocation === loc}
              onPress={setLocalLocation}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default FilterBottomSheet;

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  handle: {
    backgroundColor: colors.border,
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  sheetTitle: {
    fontSize: 18,
    ...font.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  sectionLabel: {
    fontSize: 13,
    ...font.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  locationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  pillText: {
    fontSize: 13,
    color: colors.textSecondary,
    ...font.medium,
  },
  pillTextSelected: {
    color: '#fff',
    ...font.semibold,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  resetText: {
    fontSize: 15,
    color: colors.textSecondary,
    ...font.semibold,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyText: {
    fontSize: 15,
    color: '#fff',
    ...font.semibold,
  },
});
