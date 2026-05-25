import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORY_COLORS } from '../data/jobs';
import { colors, spacing, radius, font } from '../theme';

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

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function JobDetailScreen({ route, navigation }) {
  const { job } = route.params;
  const palette = CATEGORY_COLORS[job.category] ?? { bg: '#EEEEEE', text: '#424242' };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Hero */}
      <View style={styles.hero}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <AvatarInitial name={job.employer} />
        <Text style={styles.heroEmployer}>{job.employer}</Text>
        <Text style={styles.heroTitle}>{job.title}</Text>
        <View style={[styles.categoryChip, { backgroundColor: palette.bg }]}>
          <Text style={[styles.categoryText, { color: palette.text }]}>{job.category}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Key info */}
        <View style={styles.infoGrid}>
          <InfoRow icon="💰" label="Budget" value={job.budget} />
          <InfoRow icon="📍" label="Location" value={job.location} />
          <InfoRow icon="⏱" label="Duration" value={job.duration} />
          <InfoRow icon="👥" label="Openings" value={String(job.openings)} />
        </View>

        <Text style={styles.sectionTitle}>Skills Required</Text>
        <View style={styles.skillsRow}>
          {job.skills.map((s) => (
            <View key={s} style={styles.skillChip}>
              <Text style={styles.skillChipText}>{s}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>About This Job</Text>
        <Text style={styles.description}>{job.description}</Text>

        <Text style={styles.sectionTitle}>Responsibilities</Text>
        {[
          'Report to the site supervisor / employer daily',
          'Complete assigned tasks to the agreed standard',
          'Maintain tools and equipment provided',
          'Follow all health and safety guidelines on site',
          'Communicate progress and any blockers promptly',
        ].map((r, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{r}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Requirements</Text>
        {[
          `Proven experience in ${job.category.toLowerCase()}`,
          'Valid national ID or passport',
          'Ability to start within 7 days',
          'Reliable and punctual',
        ].map((r, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bullet}>✓</Text>
            <Text style={styles.bulletText}>{r}</Text>
          </View>
        ))}

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Apply CTA */}
      <View style={styles.footer}>
        <View style={styles.footerMeta}>
          <Text style={styles.footerBudget}>{job.budget}</Text>
          <Text style={styles.footerLocation}>{job.location}</Text>
        </View>
        <TouchableOpacity style={styles.applyBtn} activeOpacity={0.85}>
          <Text style={styles.applyText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  backText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    ...font.medium,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 26,
    ...font.bold,
  },
  heroEmployer: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    ...font.medium,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 20,
    ...font.bold,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 26,
  },
  categoryChip: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  categoryText: {
    fontSize: 12,
    ...font.semibold,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },
  infoGrid: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  infoLabel: {
    fontSize: 11,
    color: colors.textMuted,
    ...font.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
    ...font.semibold,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 15,
    color: colors.textPrimary,
    ...font.bold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  skillChip: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  skillChipText: {
    fontSize: 13,
    color: colors.primaryLight,
    ...font.semibold,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  bullet: {
    fontSize: 14,
    color: colors.primaryLight,
    ...font.bold,
    width: 14,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  footer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 8,
  },
  footerMeta: { flex: 1 },
  footerBudget: {
    fontSize: 16,
    color: colors.primary,
    ...font.bold,
  },
  footerLocation: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  applyText: {
    color: '#fff',
    fontSize: 15,
    ...font.bold,
  },
});
