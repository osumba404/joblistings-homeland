import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

function avatarHue(name) {
  return name ? name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360 : 0;
}

function formatDate(dateStr) {
  const diff = Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff}d ago`;
}

function AvatarInitial({ name }) {
  return (
    <View style={[styles.avatar, { backgroundColor: `hsl(${avatarHue(name)}, 55%, 42%)` }]}>
      <Text style={styles.avatarText}>{(name ?? '?').charAt(0).toUpperCase()}</Text>
    </View>
  );
}

function CategoryChip({ category }) {
  const { CATEGORY_COLORS } = useAppTheme();
  const palette = CATEGORY_COLORS[category] ?? { bg: '#EEEEEE', text: '#424242' };
  return (
    <View style={[styles.chip, { backgroundColor: palette.bg }]}>
      <Text style={[styles.chipText, { color: palette.text }]}>{category}</Text>
    </View>
  );
}

function SkillTag({ label, colors }) {
  return (
    <View style={[styles.skillTag, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.skillText, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

export default function JobCard({ job, onPress }) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={() => onPress(job)}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <AvatarInitial name={job.employer} />
        <View style={styles.headerText}>
          <Text style={[styles.employer, { color: colors.textPrimary }]} numberOfLines={1}>
            {job.employer}
          </Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {job.location} · {formatDate(job.postedDate)}
          </Text>
        </View>
        <CategoryChip category={job.category} />
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
        {job.title}
      </Text>

      <View style={styles.infoRow}>
        <Text style={[styles.budget, { color: colors.primaryLight }]}>{job.budget}</Text>
        {job.openings > 1 && (
          <Text style={[styles.openings, { color: colors.textMuted }]}>{job.openings} openings</Text>
        )}
      </View>

      <View style={styles.tags}>
        {job.skills.slice(0, 3).map((s) => (
          <SkillTag key={s} label={s} colors={colors} />
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerText: { flex: 1 },
  employer: { fontSize: 13, fontWeight: '600' },
  meta: { fontSize: 11, marginTop: 2 },
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  chipText: { fontSize: 11, fontWeight: '600' },
  title: { fontSize: 16, fontWeight: '700', marginTop: 8, lineHeight: 22 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  budget: { fontSize: 13, fontWeight: '600' },
  openings: { fontSize: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  skillTag: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  skillText: { fontSize: 11, fontWeight: '500' },
});
