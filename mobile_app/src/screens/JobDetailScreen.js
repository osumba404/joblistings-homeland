import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORY_COLORS } from '../theme';
import { useAppTheme } from '../context/ThemeContext';
import PaymentModal from '../components/PaymentModal';

function AvatarInitial({ name }) {
  const hue = name ? name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360 : 0;
  return (
    <View style={[styles.avatar, { backgroundColor: `hsl(${hue}, 55%, 42%)` }]}>
      <Text style={styles.avatarText}>{(name ?? '?').charAt(0).toUpperCase()}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value, colors }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View>
        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value}</Text>
      </View>
    </View>
  );
}

function EscrowBanner({ receipt, colors }) {
  return (
    <View style={[styles.escrowBanner, { backgroundColor: '#E8F5E9', borderBottomColor: '#C8E6C9' }]}>
      <View style={styles.escrowBannerLeft}>
        <Text style={styles.escrowBannerIcon}>🔒</Text>
        <View>
          <Text style={styles.escrowBannerTitle}>Escrow Funded</Text>
          <Text style={styles.escrowBannerReceipt}>Receipt: {receipt}</Text>
        </View>
      </View>
      <View style={styles.escrowBadge}>
        <Text style={styles.escrowBadgeText}>PAID</Text>
      </View>
    </View>
  );
}

export default function JobDetailScreen({ route, navigation }) {
  const { job } = route.params;
  const { colors } = useAppTheme();
  const palette = CATEGORY_COLORS[job.category] ?? { bg: '#EEEEEE', text: '#424242' };

  const [modalVisible, setModalVisible] = useState(false);
  const [escrowFunded, setEscrowFunded] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');

  const handlePaymentSuccess = useCallback((receipt) => {
    setEscrowFunded(true);
    setReceiptNumber(receipt);
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
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

      {escrowFunded && <EscrowBanner receipt={receiptNumber} colors={colors} />}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.infoGrid, { backgroundColor: colors.surface }]}>
          <InfoRow icon="💰" label="Budget"   value={job.budget}           colors={colors} />
          <InfoRow icon="📍" label="Location" value={job.location}         colors={colors} />
          <InfoRow icon="⏱" label="Duration" value={job.duration}         colors={colors} />
          <InfoRow icon="👥" label="Openings" value={String(job.openings)} colors={colors} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Skills Required</Text>
        <View style={styles.skillsRow}>
          {job.skills.map((s) => (
            <View key={s} style={[styles.skillChip, { backgroundColor: colors.surface, borderColor: colors.primaryLight }]}>
              <Text style={[styles.skillChipText, { color: colors.primaryLight }]}>{s}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>About This Job</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{job.description}</Text>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Responsibilities</Text>
        {[
          'Report to the site supervisor / employer daily',
          'Complete assigned tasks to the agreed standard',
          'Maintain tools and equipment provided',
          'Follow all health and safety guidelines on site',
          'Communicate progress and any blockers promptly',
        ].map((r, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={[styles.bullet, { color: colors.primaryLight }]}>•</Text>
            <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{r}</Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Requirements</Text>
        {[
          `Proven experience in ${job.category.toLowerCase()}`,
          'Valid national ID or passport',
          'Ability to start within 7 days',
          'Reliable and punctual',
        ].map((r, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={[styles.bullet, { color: colors.primaryLight }]}>✓</Text>
            <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{r}</Text>
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={styles.footerMeta}>
          <Text style={[styles.footerBudget, { color: colors.primary }]}>{job.budget}</Text>
          <Text style={[styles.footerLocation, { color: colors.textMuted }]}>{job.location}</Text>
        </View>
        <View style={styles.footerBtns}>
          <TouchableOpacity style={[styles.applyBtn, { backgroundColor: colors.primary }]} activeOpacity={0.85}>
            <Text style={styles.btnText}>Apply Now</Text>
          </TouchableOpacity>
          {escrowFunded ? (
            <View style={styles.fundedBtn}>
              <Text style={styles.fundedText}>🔒 Funded</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.escrowBtn}
              activeOpacity={0.85}
              onPress={() => setModalVisible(true)}
            >
              <Text style={[styles.btnText, { color: '#333' }]}>Fund Escrow</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <PaymentModal
        visible={modalVisible}
        job={job}
        onClose={() => setModalVisible(false)}
        onSuccess={handlePaymentSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '500' },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: '700' },
  heroEmployer: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 4, lineHeight: 26 },
  categoryChip: { marginTop: 8, paddingHorizontal: 16, paddingVertical: 5, borderRadius: 999 },
  categoryText: { fontSize: 12, fontWeight: '600' },
  escrowBanner: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  escrowBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  escrowBannerIcon: { fontSize: 20 },
  escrowBannerTitle: { fontSize: 13, color: '#2E7D32', fontWeight: '700' },
  escrowBannerReceipt: { fontSize: 11, color: '#558B2F', fontWeight: '500', letterSpacing: 0.5 },
  escrowBadge: { backgroundColor: '#2E7D32', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  escrowBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  infoGrid: {
    borderRadius: 12,
    padding: 16,
    gap: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  infoIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  infoLabel: { fontSize: 11, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, fontWeight: '600', marginTop: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginTop: 24, marginBottom: 8 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { borderWidth: 1.5, borderRadius: 6, paddingHorizontal: 16, paddingVertical: 4 },
  skillChipText: { fontSize: 13, fontWeight: '600' },
  description: { fontSize: 14, lineHeight: 22 },
  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  bullet: { fontSize: 14, fontWeight: '700', width: 14 },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 21 },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 8,
    gap: 8,
  },
  footerMeta: { flex: 1 },
  footerBudget: { fontSize: 16, fontWeight: '700' },
  footerLocation: { fontSize: 12, marginTop: 2 },
  footerBtns: { flexDirection: 'row', gap: 8 },
  applyBtn: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10 },
  escrowBtn: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, backgroundColor: '#F9A825' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  fundedBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    borderWidth: 1.5,
    borderColor: '#A5D6A7',
  },
  fundedText: { color: '#2E7D32', fontSize: 14, fontWeight: '700' },
});
