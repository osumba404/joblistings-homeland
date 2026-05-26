/**
 * FilterBottomSheet — pure React Native implementation.
 * Uses Modal + Animated.timing for the slide-up sheet.
 * No react-native-reanimated or @gorhom/bottom-sheet required.
 */
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { CATEGORIES, LOCATIONS } from '../data/jobs';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.65;

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
      <Text
        style={[
          styles.pillText,
          { color: colors.textSecondary },
          selected && { color: '#fff', fontWeight: '600' },
        ]}
      >
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
  const [visible, setVisible] = useState(false);
  const [localCategory, setLocalCategory] = useState(selectedCategory);
  const [localLocation, setLocalLocation] = useState(selectedLocation);
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const slideIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const slideOut = useCallback((onDone) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      if (onDone) onDone();
    });
  }, [slideAnim, fadeAnim]);

  useImperativeHandle(ref, () => ({
    open() {
      setLocalCategory(selectedCategory);
      setLocalLocation(selectedLocation);
      slideAnim.setValue(SHEET_HEIGHT);
      fadeAnim.setValue(0);
      setVisible(true);
    },
    close() {
      slideOut();
    },
  }));

  useEffect(() => {
    if (visible) slideIn();
  }, [visible, slideIn]);

  const handleApply = useCallback(() => {
    slideOut(() => onApply({ category: localCategory, location: localLocation }));
  }, [localCategory, localLocation, onApply, slideOut]);

  const handleReset = useCallback(() => {
    slideOut(() => {
      setLocalCategory('All');
      setLocalLocation('All');
      onApply({ category: 'All', location: 'All' });
    });
  }, [onApply, slideOut]);

  const handleBackdropPress = useCallback(() => slideOut(), [slideOut]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => slideOut()}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: colors.surface, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        <Text style={[styles.title, { color: colors.textPrimary }]}>Filter Jobs</Text>

        {/* Category */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Category</Text>
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
              colors={colors}
            />
          ))}
        </ScrollView>

        {/* Location */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Location</Text>
        <View style={styles.locationGrid}>
          {LOCATIONS.map((loc) => (
            <OptionPill
              key={loc}
              label={loc}
              selected={localLocation === loc}
              onPress={setLocalLocation}
              colors={colors}
            />
          ))}
        </View>

        {/* Actions */}
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
      </Animated.View>
    </Modal>
  );
});

export default FilterBottomSheet;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 16,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  locationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
});
