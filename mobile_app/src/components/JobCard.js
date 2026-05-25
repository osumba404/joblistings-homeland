import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, font } from '../theme';
import { CATEGORY_COLORS } from '../data/jobs';

function AvatarInitial({ name }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const hue = name
    ? name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
    : 0;
  return (
    <View style={[styles.avatar, { backgroundColor: `hsl(${hue}, 55%, 42%)` }]}>
      <Text style={styles.avatarText}>{initial}</Text>
    </View>
  );
}

function CategoryChip({ category }) {
  const palette = CATEGORY_COLORS[category] ?? { bg: '#EEEEEE', text: '#424242' };
  return (
    <View style={[styles.chip, { backgroundColor: palette.bg }]}>
      <Text style={[styles.chipText, { color: palette.text }]}>{category}</Text>
    </View>
  );
}

function SkillTag({ label }) {
  return (
    <View style={styles.skillTag}>
      <Text style={styles.skillText}>{label}</Text>
    </View>
  );
}

function formatDate(dateStr) {
  const diff = Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff}d ago`;
}

export default function JobCard({ job, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(job)} activeOpacity={0.85}>
      <View style={styles.header}>
        <AvatarInitial name={job.employer} />
        <View style={styles.headerText}>
          <Text style={styles.employer} numberOfLines={1}>{job.employer}</Text>
          <Text style={styles.meta}>{job.location} · {formatDate(job.postedDate)}</Text>
        </View>
        <CategoryChip category={job.category} />
      </View>

      <Text style={styles.title} numberOfLines={2}>{job.title}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.budget}>{job.budget}</Text>
        {job.openings > 1 && (
          <Text style={styles.openings}>{job.openings} openings</Text>
        )}
      </View>

      <View style={styles.tags}>
        {job.skills.slice(0, 3).map((s) => (
          <SkillTag key={s} label={s} />
        ))}
      </View>
    </TouchableOpacity>
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
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    ...font.bold,
  },
  headerText: {
    flex: 1,
  },
  employer: {
    fontSize: 13,
    color: colors.textPrimary,
    ...font.semibold,
  },
  meta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  chipText: {
    fontSize: 11,
    ...font.semibold,
  },
  title: {
    fontSize: 16,
    color: colors.textPrimary,
    ...font.bold,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  budget: {
    fontSize: 13,
    color: colors.primaryLight,
    ...font.semibold,
  },
  openings: {
    fontSize: 12,
    color: colors.textMuted,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  skillTag: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  skillText: {
    fontSize: 11,
    color: colors.textSecondary,
    ...font.medium,
  },
});
