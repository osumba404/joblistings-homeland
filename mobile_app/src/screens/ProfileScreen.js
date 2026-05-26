import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';

const USER = {
  name: 'Brian Otieno',
  role: 'Freelance Electrician & Solar Technician',
  location: 'Nairobi, Kenya',
  memberSince: 'March 2024',
  totalEarnings: 'KES 127,500',
  jobsCompleted: 14,
  rating: '4.8',
  skills: ['Electrical Wiring', 'Solar PV', 'Site Management', 'DC Systems', 'Safety Compliance', 'BOQ Reading'],
};

function AvatarLarge({ name, colors }) {
  const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <View style={[av.wrap, { backgroundColor: `hsl(${hue}, 50%, 38%)` }]}>
      <Text style={av.text}>{name.charAt(0)}</Text>
    </View>
  );
}
const av = StyleSheet.create({
  wrap: {
    width: 88,
    height: 88,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  text: { color: '#fff', fontSize: 36, fontWeight: '700' },
});

function StatCard({ label, value, colors }) {
  return (
    <View style={[stat.wrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[stat.value, { color: colors.primary }]}>{value}</Text>
      <Text style={[stat.label, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}
const stat = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  value: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 11, fontWeight: '500', marginTop: 2, textAlign: 'center' },
});

function SettingsRow({ label, subtitle, right, colors }) {
  return (
    <View style={[sr.wrap, { borderBottomColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[sr.label, { color: colors.textPrimary }]}>{label}</Text>
        {subtitle ? <Text style={[sr.sub, { color: colors.textMuted }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
const sr = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  label: { fontSize: 15, fontWeight: '500' },
  sub: { fontSize: 12, marginTop: 2 },
});

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Hero bar */}
      <View style={[ph.hero, { backgroundColor: colors.primary }]}>
        <AvatarLarge name={USER.name} colors={colors} />
        <Text style={ph.name}>{USER.name}</Text>
        <Text style={ph.role}>{USER.role}</Text>
        <Text style={ph.location}>📍 {USER.location}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Stats row */}
        <View style={[ph.statsRow, { paddingHorizontal: 16, paddingTop: 16, gap: 10 }]}>
          <StatCard label="Total Earnings" value={USER.totalEarnings} colors={colors} />
          <StatCard label="Jobs Done" value={String(USER.jobsCompleted)} colors={colors} />
          <StatCard label="Rating" value={`⭐ ${USER.rating}`} colors={colors} />
        </View>

        {/* Member since */}
        <View style={[ph.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={ph.sectionRow}>
            <Text style={[ph.sectionLabel, { color: colors.textMuted }]}>Member Since</Text>
            <Text style={[ph.sectionValue, { color: colors.textPrimary }]}>{USER.memberSince}</Text>
          </View>
        </View>

        {/* Skills */}
        <Text style={[ph.heading, { color: colors.textPrimary }]}>Skills</Text>
        <View style={ph.skillsWrap}>
          {USER.skills.map((s) => (
            <View key={s} style={[ph.skillChip, { backgroundColor: colors.surface, borderColor: colors.primaryLight }]}>
              <Text style={[ph.skillChipText, { color: colors.primaryLight }]}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Settings section */}
        <Text style={[ph.heading, { color: colors.textPrimary }]}>Settings</Text>
        <View style={[ph.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingsRow
            label="Dark Mode"
            subtitle={isDark ? 'Dark theme active' : 'Light theme active'}
            colors={colors}
            right={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: '#43A047' }}
                thumbColor={isDark ? colors.primary : '#fff'}
              />
            }
          />
          <SettingsRow
            label="Push Notifications"
            subtitle="New job alerts, messages"
            colors={colors}
            right={<Switch value={true} disabled trackColor={{ true: '#43A047' }} thumbColor="#fff" />}
          />
          <SettingsRow
            label="Email Alerts"
            subtitle="Weekly job digest"
            colors={colors}
            right={<Switch value={false} disabled trackColor={{ false: colors.border }} thumbColor="#fff" />}
          />
        </View>

        {/* Account actions */}
        <Text style={[ph.heading, { color: colors.textPrimary }]}>Account</Text>
        <View style={[ph.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {['Edit Profile', 'Change Password', 'Help & Support'].map((label, i, arr) => (
            <TouchableOpacity
              key={label}
              style={[
                sr.wrap,
                { borderBottomColor: colors.border, borderBottomWidth: i < arr.length - 1 ? 1 : 0 },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[sr.label, { color: colors.textPrimary, flex: 1 }]}>{label}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[ph.logoutBtn, { borderColor: colors.error }]}>
          <Text style={[ph.logoutText, { color: colors.error }]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const ph = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 6,
  },
  name: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 8 },
  role: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500', textAlign: 'center' },
  location: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  statsRow: { flexDirection: 'row' },
  section: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  sectionLabel: { fontSize: 13, fontWeight: '500' },
  sectionValue: { fontSize: 14, fontWeight: '600' },
  heading: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
  },
  skillChip: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  skillChipText: { fontSize: 13, fontWeight: '600' },
  settingsCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 24,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { fontSize: 15, fontWeight: '700' },
});
