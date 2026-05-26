/**
 * PaymentModal.js — M-Pesa STK-Push simulation
 *
 * State machine:
 *   idle → sending (2 s) → pending (3 s) → success
 *                        ↘ failed  (when simulateFailure ON)
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

function generateReceipt() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function isValidPhone(phone) {
  return /^(07|01)\d{8}$/.test(phone.replace(/\s/g, ''));
}

function SendingView({ colors }) {
  return (
    <View style={sv.wrap}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[sv.title, { color: colors.textPrimary }]}>Sending STK Push…</Text>
      <Text style={[sv.sub, { color: colors.textSecondary }]}>Connecting to M-Pesa</Text>
    </View>
  );
}

function PendingView({ colors }) {
  return (
    <View style={sv.wrap}>
      <Text style={sv.emoji}>📲</Text>
      <Text style={[sv.title, { color: colors.textPrimary }]}>Check your phone</Text>
      <Text style={[sv.sub, { color: colors.textSecondary }]}>
        M-Pesa prompt sent — enter your PIN to confirm.
      </Text>
      <ActivityIndicator size="small" color={colors.textMuted} style={{ marginTop: 16 }} />
    </View>
  );
}

function SuccessView({ receipt, amount, onClose, colors }) {
  return (
    <View style={sv.wrap}>
      <View style={[sv.circle, { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' }]}>
        <Text style={[sv.circleText, { color: '#2E7D32' }]}>✓</Text>
      </View>
      <Text style={[sv.title, { color: '#2E7D32' }]}>Escrow Funded Successfully</Text>
      <Text style={[sv.sub, { color: colors.textSecondary }]}>
        {amount} is held in escrow and released when the job is complete.
      </Text>
      <View style={sv.receiptBox}>
        <Text style={sv.receiptLabel}>M-Pesa Receipt</Text>
        <Text style={sv.receiptNumber}>{receipt}</Text>
        <Text style={sv.receiptSub}>Keep this for your records</Text>
      </View>
      <TouchableOpacity style={[sv.btn, { backgroundColor: colors.primary }]} onPress={onClose}>
        <Text style={sv.btnText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

function FailedView({ onRetry, onClose, colors }) {
  return (
    <View style={sv.wrap}>
      <View style={[sv.circle, { backgroundColor: '#FFEBEE', borderColor: colors.error }]}>
        <Text style={[sv.circleText, { color: colors.error }]}>✕</Text>
      </View>
      <Text style={[sv.title, { color: colors.error }]}>Payment Failed</Text>
      <Text style={[sv.sub, { color: colors.textSecondary }]}>
        Insufficient funds — your M-Pesa balance is too low. Please top up and try again.
      </Text>
      <TouchableOpacity style={[sv.btn, { backgroundColor: colors.error, marginTop: 24 }]} onPress={onRetry}>
        <Text style={sv.btnText}>Retry</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ marginTop: 12, padding: 8 }} onPress={onClose}>
        <Text style={{ fontSize: 14, color: colors.textMuted, fontWeight: '500' }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const sv = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 8, minHeight: 280, justifyContent: 'center' },
  emoji: { fontSize: 52, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 16 },
  sub: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 999,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleText: { fontSize: 30, fontWeight: '700' },
  receiptBox: {
    width: '100%',
    backgroundColor: '#F1F8E9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#C5E1A5',
  },
  receiptLabel: { fontSize: 11, color: '#558B2F', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  receiptNumber: { fontSize: 26, color: '#2E7D32', fontWeight: '700', letterSpacing: 2, marginVertical: 4 },
  receiptSub: { fontSize: 11, color: '#558B2F' },
  btn: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48, marginTop: 20 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default function PaymentModal({ visible, job, onClose, onSuccess }) {
  const { colors } = useAppTheme();
  const [phone, setPhone] = useState('0712345678');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [stage, setStage] = useState('idle');
  const [receipt, setReceipt] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const timers = useRef([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const schedule = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay);
    timers.current.push(id);
  }, []);

  useEffect(() => {
    if (!visible) {
      clearTimers();
      if (stage !== 'success') setStage('idle');
    }
  }, [visible, clearTimers, stage]);

  const handlePay = useCallback(() => {
    if (!isValidPhone(phone)) {
      setPhoneError('Enter a valid Kenyan number (07XX or 01XX, 10 digits)');
      return;
    }
    setPhoneError('');
    setStage('sending');

    schedule(() => {
      if (simulateFailure) {
        setStage('failed');
      } else {
        setStage('pending');
        schedule(() => {
          const rec = generateReceipt();
          setReceipt(rec);
          setStage('success');
          onSuccess(rec);
        }, 3000);
      }
    }, 2000);
  }, [phone, simulateFailure, schedule, onSuccess]);

  const handleClose = useCallback(() => {
    clearTimers();
    if (stage !== 'success') setStage('idle');
    onClose();
  }, [clearTimers, stage, onClose]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={stage === 'idle' ? handleClose : undefined}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ justifyContent: 'flex-end' }}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

            {stage === 'idle' && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Fund Escrow</Text>
                  <TouchableOpacity onPress={handleClose} hitSlop={12}>
                    <Text style={[styles.closeX, { color: colors.textMuted }]}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.mpesaBadge, { backgroundColor: '#E8F5E9' }]}>
                  <View style={styles.mpesaDot} />
                  <Text style={styles.mpesaLabel}>M-Pesa STK Push</Text>
                </View>

                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Amount</Text>
                <View style={styles.amountRow}>
                  <Text style={[styles.amountValue, { color: colors.primary }]}>{job?.budget ?? ''}</Text>
                  <Text style={[styles.amountNote, { color: colors.textMuted }]}>held in escrow</Text>
                </View>

                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>M-Pesa Phone Number</Text>
                <TextInput
                  style={[styles.input, { borderColor: phoneError ? colors.error : colors.border, color: colors.textPrimary, backgroundColor: colors.background }]}
                  value={phone}
                  onChangeText={(t) => { setPhone(t); if (phoneError) setPhoneError(''); }}
                  keyboardType="phone-pad"
                  maxLength={13}
                  placeholder="07XXXXXXXX"
                  placeholderTextColor={colors.textMuted}
                />
                {phoneError ? <Text style={[styles.errorText, { color: colors.error }]}>{phoneError}</Text> : null}

                <View style={[styles.toggleRow, { borderColor: colors.border }]}>
                  <View style={{ flex: 1, marginRight: 16 }}>
                    <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>Simulate Failure</Text>
                    <Text style={[styles.toggleSub, { color: colors.textMuted }]}>Forces an "insufficient funds" error</Text>
                  </View>
                  <Switch
                    value={simulateFailure}
                    onValueChange={setSimulateFailure}
                    trackColor={{ false: colors.border, true: '#FFCDD2' }}
                    thumbColor={simulateFailure ? colors.error : colors.textMuted}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.payBtn, { backgroundColor: simulateFailure ? '#C62828' : colors.primary }]}
                  onPress={handlePay}
                  activeOpacity={0.85}
                >
                  <Text style={styles.payBtnText}>
                    {simulateFailure ? '⚠ Pay via M-Pesa (will fail)' : 'Pay via M-Pesa'}
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
                  This is a simulated payment. No real money is transferred.
                </Text>
              </>
            )}

            {stage === 'sending'  && <SendingView colors={colors} />}
            {stage === 'pending'  && <PendingView colors={colors} />}
            {stage === 'success'  && <SuccessView receipt={receipt} amount={job?.budget} onClose={handleClose} colors={colors} />}
            {stage === 'failed'   && <FailedView onRetry={() => setStage('idle')} onClose={handleClose} colors={colors} />}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
  },
  handle: { width: 40, height: 4, borderRadius: 999, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  closeX: { fontSize: 18, padding: 4 },
  mpesaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 6,
  },
  mpesaDot: { width: 10, height: 10, borderRadius: 999, backgroundColor: '#2E7D32' },
  mpesaLabel: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },
  fieldLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 16 },
  amountValue: { fontSize: 28, fontWeight: '700' },
  amountNote: { fontSize: 13, fontWeight: '500' },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 1,
    marginBottom: 4,
  },
  errorText: { fontSize: 12, marginBottom: 8 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  toggleLabel: { fontSize: 14, fontWeight: '600' },
  toggleSub: { fontSize: 12, marginTop: 2 },
  payBtn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disclaimer: { textAlign: 'center', fontSize: 11, marginTop: 8 },
});
