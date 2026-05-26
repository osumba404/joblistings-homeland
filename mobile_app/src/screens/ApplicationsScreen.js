import React from 'react';
import { View, Text, FlatList, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';

const PROPOSALS = [
  {
    id: '1',
    jobTitle: 'Site Foreman – Residential Block',
    employer: 'Kamau Electricals Ltd',
    appliedDate: '2026-05-20',
    budget: 'KES 4,500/day',
    status: 'Accepted',
  },
  {
    id: '2',
    jobTitle: 'Electrician – Solar Installation',
    employer: 'SunPower EA',
    appliedDate: '2026-05-22',
    budget: 'KES 3,000/day',
    status: 'Viewed',
  },
  {
    id: '3',
    jobTitle: 'CCTV & Access Control Installer',
    employer: 'TechShield Security',
    appliedDate: '2026-05-24',
    budget: 'KES 3,500/day',
    status: 'Pending',
  },
  {
    id: '4',
    jobTitle: 'IT Support Technician',
    employer: 'Equity Bank Kenya',
    appliedDate: '2026-05-18',
    budget: 'KES 6,000/day',
    status: 'Rejected',
  },
];

const STATUS_CONFIG = {
  Accepted: { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },
  Viewed:   { bg: '#E3F2FD', text: '#1565C0', border: '#90CAF9' },
  Pending:  { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082' },
  Rejected: { bg: '#FFEBEE', text: '#B71C1C', border: '#FFCDD2' },
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ProposalCard({ item }) {
  const { colors, spacing, radius, font } = useAppTheme();
  const cfg = STATUS_CONFIG[item.status];

  return (
    <View style={[card.wrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={card.row}>
        <View style={card.left}>
          <Text style={[card.title, { color: colors.textPrimary }]} numberOfLines={2}>
            {item.jobTitle}
          </Text>
          <Text style={[card.employer, { color: colors.textSecondary }]}>{item.employer}</Text>
        </View>
        <View style={[card.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
          <Text style={[card.badgeText, { color: cfg.text }]}>{item.status}</Text>
        </View>
      </View>

      <View style={[card.footer, { borderTopColor: colors.border }]}>
        <Text style={[card.meta, { color: colors.textMuted }]}>
          Applied {formatDate(item.appliedDate)}
        </Text>
        <Text style={[card.budget, { color: colors.primaryLight }]}>{item.budget}</Text>
      </View>
    </View>
  );
}

const card = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  left: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', lineHeight: 21, marginBottom: 4 },
  employer: { fontSize: 13, fontWeight: '500' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  meta: { fontSize: 12 },
  budget: { fontSize: 13, fontWeight: '600' },
});

export default function ApplicationsScreen() {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <StatusBar barStyle={colors.background === '#121212' ? 'light-content' : 'dark-content'} />

      <View style={[hdr.wrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[hdr.title, { color: colors.textPrimary }]}>My Applications</Text>
        <View style={hdr.countBadge}>
          <Text style={hdr.countText}>{PROPOSALS.length} proposals</Text>
        </View>
      </View>

      <FlatList
        data={PROPOSALS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProposalCard item={item} />}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const hdr = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 22, fontWeight: '700' },
  countBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  countText: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },
});
