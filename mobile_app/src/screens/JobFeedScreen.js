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
import JobCard from '../components/JobCard';
import SkeletonCard from '../components/SkeletonCard';
import FilterBottomSheet from '../components/FilterBottomSheet';
import { generateJobs } from '../data/jobs';
import { useAppTheme } from '../context/ThemeContext';

const SKELETON_COUNT = 5;

export default function JobFeedScreen({ navigation }) {
  const { colors } = useAppTheme();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLocation, setActiveLocation] = useState('All');
  const [seedCounter, setSeedCounter] = useState(0);
  const filterSheetRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setJobs(generateJobs(0));
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const nextSeed = seedCounter + 1;
    setTimeout(() => {
      setSeedCounter(nextSeed);
      setJobs(generateJobs(nextSeed));
      setRefreshing(false);
    }, 1500);
  }, [seedCounter]);

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
  const renderItem = useCallback(({ item }) => <JobCard job={item} onPress={handleCardPress} />, [handleCardPress]);
  const keyExtractor = useCallback((item) => item.id + String(item._seed), []);

  const ListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={[styles.resultCount, { color: colors.textMuted }]}>
        {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
      </Text>
      {hasActiveFilters && (
        <TouchableOpacity onPress={() => handleFilterApply({ category: 'All', location: 'All' })}>
          <Text style={[styles.clearFilters, { color: colors.primary }]}>Clear filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No jobs found</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Try adjusting your search or filters</Text>
    </View>
  );

  return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.primary }]} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

        <View style={[styles.appBar, { backgroundColor: colors.primary }]}>
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

        <View style={[styles.searchContainer, { backgroundColor: colors.primary }]}>
          <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
            <Text style={styles.searchIcon}>🔎</Text>
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search jobs, skills, employers…"
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {loading ? (
          <FlatList
            data={Array.from({ length: SKELETON_COUNT }, (_, i) => i)}
            keyExtractor={(i) => String(i)}
            renderItem={() => <SkeletonCard />}
            contentContainerStyle={[styles.listContent, { backgroundColor: colors.background }]}
            scrollEnabled={false}
          />
        ) : (
          <FlatList
            data={filteredJobs}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListHeaderComponent={<ListHeader />}
            ListEmptyComponent={<ListEmpty />}
            contentContainerStyle={[styles.listContent, { backgroundColor: colors.background }]}
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

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: hasActiveFilters ? '#F9A825' : colors.primary }]}
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
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  appBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appBarTitle: { fontSize: 20, color: '#fff', fontWeight: '700' },
  appBarSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  filterBadge: {
    backgroundColor: '#F9A825',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  filterBadgeText: { fontSize: 11, color: '#333', fontWeight: '600' },
  searchContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    height: 44,
    gap: 4,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, height: '100%' },
  listContent: { paddingTop: 8, paddingBottom: 100 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultCount: { fontSize: 13, fontWeight: '500' },
  clearFilters: { fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  fabIcon: { fontSize: 18, color: '#fff' },
  fabLabel: { fontSize: 14, color: '#fff', fontWeight: '600' },
});
