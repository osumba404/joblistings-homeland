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
import { useAppTheme } from '../context/ThemeContext';
import { CATEGORIES, LOCATIONS } from '../data/jobs';

function OptionPill({ label, selected, onPress, colors }) {
  return (
    <TouchableOpacity
      onPress={() => onPress(label)}
      style={[
        styles.pill,
        { borderColor: colors.border, backgroundColor: colors.surface },
        selected && { borderColor: colors.primary, backgroundColor: colors.primary },
      ]}
      activeOpacity={0.75}
    >
      <Text style={[styles.pillText, { color: colors.textSecondary }, selected && { color: '#fff', fontWeight: '600' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const FilterBottomSheet = forwardRef(function FilterBottomSheet(
  { selectedCategory, selectedLocation, onApply },
  ref
) {
  const { colors } = useAppTheme();
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
      backgroundStyle={{ backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
    >
      <BottomSheetView style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Filter Jobs</Text>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
          {CATEGORIES.map((cat) => (
            <OptionPill key={cat} label={cat} selected={localCategory === cat} onPress={setLocalCategory} colors={colors} />
          ))}
        </ScrollView>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Location</Text>
        <View style={styles.locationGrid}>
          {LOCATIONS.map((loc) => (
            <OptionPill key={loc} label={loc} selected={localLocation === loc} onPress={setLocalLocation} colors={colors} />
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.resetBtn, { borderColor: colors.border }]}
            onPress={handleReset}
          >
            <Text style={[styles.resetText, { color: colors.textSecondary }]}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: colors.primary }]}
            onPress={handleApply}
          >
            <Text style={styles.applyText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default FilterBottomSheet;

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 16, paddingBottom: 32 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 16, marginTop: 4 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 16,
  },
  pillRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  locationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  pillText: { fontSize: 13, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 16, marginTop: 32 },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  resetText: { fontSize: 15, fontWeight: '600' },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyText: { fontSize: 15, color: '#fff', fontWeight: '600' },
});
