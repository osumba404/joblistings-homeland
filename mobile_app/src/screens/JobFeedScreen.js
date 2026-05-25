import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import JobCard from '../components/JobCard';
import SkeletonCard from '../components/SkeletonCard';
import FilterBottomSheet from '../components/FilterBottomSheet';
import { generateJobs } from '../data/jobs';
import { colors, spacing, radius, font } from '../theme';

const SKELETON_COUNT = 5;

export default function JobFeedScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLocation, setActiveLocation] = useState('All');
  const [seedCounter, setSeedCounter] = useState(0);

  const filterSheetRef = useRef(null);

  // Simulate initial 1.5s load
  useEffect(() => {
    const timer = setTimeout(() => {
      setJobs(generateJobs(0));
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Pull-to-refresh: 1.5s simulated reload
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const nextSeed = seedCounter + 1;
    setTimeout(() => {
      setSeedCounter(nextSeed);
      setJobs(generateJobs(nextSeed));
      setRefreshing(false);
    }, 1500);
  }, [seedCounter]);

  // Local filter — no API call, runs on every keystroke
  const filteredJobs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return jobs.filter((job) => {
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.employer.toLowerCase().includes(q) ||
        job.skills.some((s) => s.toLowerCase().includes(q)) ||
        job.location.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'All' || job.category === activeCategory;
      const matchesLocation = activeLocation === 'All' || job.location === activeLocation;
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [jobs, searchQuery, activeCategory, activeLocation]);

  const handleCardPress = useCallback(
    (job) => navigation.navigate('JobDetail', { job }),
    [navigation]
  );

  const handleFilterApply = useCallback(({ category, location }) => {
    setActiveCategory(category);
    setActiveLocation(location);
  }, []);

  const hasActiveFilters = activeCategory !== 'All' || activeLocation !== 'All';

  const renderItem = useCallback(
    ({ item }) => <JobCard job={item} onPress={handleCardPress} />,
    [handleCardPress]
  );

  const keyExtractor = useCallback((item) => item.id + String(item._seed), []);

  const ListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.resultCount}>
        {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
      </Text>
      {hasActiveFilters && (
        <TouchableOpacity onPress={() => handleFilterApply({ category: 'All', location: 'All' })}>
          <Text style={styles.clearFilters}>Clear filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>No jobs found</Text>
      <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

        {/* App bar */}
        <View style={styles.appBar}>
          <View>
            <Text style={styles.appBarTitle}>Homeland Jobs</Text>
            <Text style={styles.appBarSub}>Find your next opportunity</Text>
          </View>
          {hasActiveFilters && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>Filtered</Text>
            </View>
          )}
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔎</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs, skills, employers…"
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* Job list or skeletons */}
        {loading ? (
          <FlatList
            data={Array.from({ length: SKELETON_COUNT }, (_, i) => i)}
            keyExtractor={(i) => String(i)}
            renderItem={() => <SkeletonCard />}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
          />
        ) : (
          <FlatList
            data={filteredJobs}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListHeaderComponent={<ListHeader />}
            ListEmptyComponent={<ListEmpty />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            removeClippedSubviews
            windowSize={5}
            maxToRenderPerBatch={6}
            initialNumToRender={6}
          />
        )}

        {/* FAB – opens filter bottom sheet */}
        <TouchableOpacity
          style={[styles.fab, hasActiveFilters && styles.fabActive]}
          onPress={() => filterSheetRef.current?.open()}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>⚙</Text>
          <Text style={styles.fabLabel}>{hasActiveFilters ? 'Filters on' : 'Filter'}</Text>
        </TouchableOpacity>

        <FilterBottomSheet
          ref={filterSheetRef}
          selectedCategory={activeCategory}
          selectedLocation={activeLocation}
          onApply={handleFilterApply}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  appBar: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appBarTitle: {
    fontSize: 20,
    color: '#fff',
    ...font.bold,
  },
  appBarSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  filterBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  filterBadgeText: {
    fontSize: 11,
    color: '#333',
    ...font.semibold,
  },
  searchContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    height: 44,
    gap: spacing.xs,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    height: '100%',
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: 100,
    backgroundColor: colors.background,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  resultCount: {
    fontSize: 13,
    color: colors.textMuted,
    ...font.medium,
  },
  clearFilters: {
    fontSize: 13,
    color: colors.primary,
    ...font.semibold,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    ...font.bold,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  fabActive: {
    backgroundColor: colors.accent,
  },
  fabIcon: {
    fontSize: 18,
    color: '#fff',
  },
  fabLabel: {
    fontSize: 14,
    color: '#fff',
    ...font.semibold,
  },
});
