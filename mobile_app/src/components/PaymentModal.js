/**
 * PaymentModal.js
 * M-Pesa STK-Push simulation for Homeland Jobs escrow funding.
 *
 * State machine:
 *   idle ──► sending (2 s spinner)
 *              ├─► pending (3 s "Check your phone")
 *              │     ├─► success  (green receipt)
 *              │     └─► failed   (red error + retry)  ← when simulateFailure is ON
 *              └─► failed (immediately after spinner)   ← when simulateFailure is ON
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
import { colors, spacing, radius, font } from '../theme';

// ─── helpers ────────────────────────────────────────────────────────────────
function generateReceipt() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

function isValidPhone(phone) {
  return /^(07|01)\d{8}$/.test(phone.replace(/\s/g, ''));
}

// ─── sub-views ───────────────────────────────────────────────────────────────
function SendingView() {
  return (
    <View style={styles.stateView}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.stateTitle}>Sending STK Push…</Text>
      <Text style={styles.stateSub}>Connecting to M-Pesa</Text>
    </View>
  );
}

function PendingView() {
  return (
    <View style={styles.stateView}>
      <Text style={styles.stateEmoji}>📲</Text>
      <Text style={styles.stateTitle}>Check your phone</Text>
      <Text style={styles.stateSub}>
        M-Pesa prompt sent — enter your PIN to confirm payment.
      </Text>
      <ActivityIndicator
        size="small"
        color={colors.textMuted}
        style={{ marginTop: spacing.md }}
      />
    </View>
  );
}

function SuccessView({ receipt, amount, onClose }) {
  return (
    <View style={styles.stateView}>
      <View style={styles.successCircle}>
        <Text style={styles.successIcon}>✓</Text>
      </View>
      <Text style={[styles.stateTitle, { color: '#2E7D32' }]}>
        Escrow Funded Successfully
      </Text>
      <Text style={styles.stateSub}>
        {amount} has been held in escrow. It will be released to the
        freelancer when the job is marked complete.
      </Text>

      <View style={styles.receiptBox}>
        <Text style={styles.receiptLabel}>M-Pesa Receipt</Text>
        <Text style={styles.receiptNumber}>{receipt}</Text>
        <Text style={styles.receiptSub}>Keep this for your records</Text>
      </View>

      <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
        <Text style={styles.doneBtnText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

function FailedView({ onRetry, onClose }) {
  return (
    <View style={styles.stateView}>
      <View style={styles.failCircle}>
        <Text style={styles.failIcon}>✕</Text>
      </View>
      <Text style={[styles.stateTitle, { color: colors.error }]}>
        Payment Failed
      </Text>
      <Text style={styles.stateSub}>
        Insufficient funds — your M-Pesa balance is too low to complete this
        transaction. Please top up and try again.
      </Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryBtnText}>Retry</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelLink} onPress={onClose}>
        <Text style={styles.cancelLinkText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── main component ──────────────────────────────────────────────────────────
export default function PaymentModal({ visible, job, onClose, onSuccess }) {
  const [phone, setPhone] = useState('0712345678');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [stage, setStage] = useState('idle'); // idle | sending | pending | success | failed
  const [receipt, setReceipt] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const timers = useRef([]);

  // Clear all pending timers on unmount or when modal closes
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => {
    if (!visible) {
      clearTimers();
      // Reset back to idle so modal is fresh next time (but keep phone number)
      if (stage !== 'success') setStage('idle');
    }
  }, [visible, clearTimers, stage]);

  const schedule = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay);
    timers.current.push(id);
    return id;
  }, []);

  const handlePay = useCallback(() => {
    if (!isValidPhone(phone)) {
      setPhoneError('Enter a valid Kenyan number (07XX or 01XX, 10 digits)');
      return;
    }
    setPhoneError('');
    setStage('sending');

    // After 2 s: move to pending (success path) or failed (failure path)
    schedule(() => {
      if (simulateFailure) {
        setStage('failed');
      } else {
        setStage('pending');
        // After 3 more seconds: success
        schedule(() => {
          const rec = generateReceipt();
          setReceipt(rec);
          setStage('success');
          onSuccess(rec); // notify parent so it persists funded state
        }, 3000);
      }
    }, 2000);
  }, [phone, simulateFailure, schedule, onSuccess]);

  const handleRetry = useCallback(() => {
    setStage('idle');
  }, []);

  const handleClose = useCallback(() => {
    clearTimers();
    if (stage !== 'success') setStage('idle');
    onClose();
  }, [clearTimers, stage, onClose]);

  // Derived: extract a clean number from budget string for display
  const amountDisplay = job?.budget ?? 'Amount';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={stage === 'idle' ? handleClose : undefined}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kavWrapper}
        >
          <Pressable style={styles.sheet}>
            {/* Drag handle */}
            <View style={styles.handle} />

            {/* ── IDLE FORM ─────────────────────────────────────── */}
            {stage === 'idle' && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Fund Escrow</Text>
                  <TouchableOpacity onPress={handleClose} hitSlop={12}>
                    <Text style={styles.closeX}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* M-Pesa branding row */}
                <View style={styles.mpesaBadge}>
                  <View style={styles.mpesaDot} />
                  <Text style={styles.mpesaLabel}>M-Pesa STK Push</Text>
                </View>

                {/* Amount */}
                <Text style={styles.fieldLabel}>Amount</Text>
                <View style={styles.amountRow}>
                  <Text style={styles.amountValue}>{amountDisplay}</Text>
                  <Text style={styles.amountNote}>held in escrow</Text>
                </View>

                {/* Phone */}
                <Text style={styles.fieldLabel}>M-Pesa Phone Number</Text>
                <TextInput
                  style={[styles.input, phoneError ? styles.inputError : null]}
                  value={phone}
                  onChangeText={(t) => {
                    setPhone(t);
                    if (phoneError) setPhoneError('');
                  }}
                  keyboardType="phone-pad"
                  maxLength={13}
                  placeholder="07XXXXXXXX"
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="done"
                />
                {phoneError ? (
                  <Text style={styles.errorText}>{phoneError}</Text>
                ) : null}

                {/* Simulate failure toggle */}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleTextGroup}>
                    <Text style={styles.toggleLabel}>Simulate Failure</Text>
                    <Text style={styles.toggleSub}>
                      Forces an "insufficient funds" error
                    </Text>
                  </View>
                  <Switch
                    value={simulateFailure}
                    onValueChange={setSimulateFailure}
                    trackColor={{ false: colors.border, true: '#FFCDD2' }}
                    thumbColor={simulateFailure ? colors.error : colors.textMuted}
                  />
                </View>

                {/* Pay button */}
                <TouchableOpacity
                  style={[styles.payBtn, simulateFailure && styles.payBtnDanger]}
                  onPress={handlePay}
                  activeOpacity={0.85}
                >
                  <Text style={styles.payBtnText}>
                    {simulateFailure ? '⚠ Pay via M-Pesa (will fail)' : 'Pay via M-Pesa'}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.disclaimer}>
                  This is a simulated payment. No real money is transferred.
                </Text>
              </>
            )}

            {/* ── SENDING ───────────────────────────────────────── */}
            {stage === 'sending' && <SendingView />}

            {/* ── PENDING ───────────────────────────────────────── */}
            {stage === 'pending' && <PendingView />}

            {/* ── SUCCESS ───────────────────────────────────────── */}
            {stage === 'success' && (
              <SuccessView
                receipt={receipt}
                amount={amountDisplay}
                onClose={handleClose}
              />
            )}

            {/* ── FAILED ────────────────────────────────────────── */}
            {stage === 'failed' && (
              <FailedView onRetry={handleRetry} onClose={handleClose} />
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  kavWrapper: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl + spacing.md,
    paddingTop: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },

  // ── modal header
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    color: colors.textPrimary,
    ...font.bold,
  },
  closeX: {
    fontSize: 18,
    color: colors.textMuted,
    padding: spacing.xs,
  },

  // ── M-Pesa branding
  mpesaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  mpesaDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: '#2E7D32',
  },
  mpesaLabel: {
    fontSize: 12,
    color: '#2E7D32',
    ...font.semibold,
  },

  // ── form fields
  fieldLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    ...font.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  amountValue: {
    fontSize: 28,
    color: colors.primary,
    ...font.bold,
  },
  amountNote: {
    fontSize: 13,
    color: colors.textMuted,
    ...font.medium,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 18,
    color: colors.textPrimary,
    ...font.medium,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginBottom: spacing.sm,
  },

  // ── simulate failure toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  toggleTextGroup: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    ...font.semibold,
  },
  toggleSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  // ── pay button
  payBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  payBtnDanger: {
    backgroundColor: '#C62828',
  },
  payBtnText: {
    color: '#fff',
    fontSize: 16,
    ...font.bold,
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },

  // ── shared state view
  stateView: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    minHeight: 280,
    justifyContent: 'center',
  },
  stateEmoji: {
    fontSize: 52,
    marginBottom: spacing.md,
  },
  stateTitle: {
    fontSize: 20,
    color: colors.textPrimary,
    ...font.bold,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  stateSub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 21,
  },

  // ── success
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: '#E8F5E9',
    borderWidth: 3,
    borderColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    fontSize: 32,
    color: '#2E7D32',
    ...font.bold,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: '#F1F8E9',
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: '#C5E1A5',
  },
  receiptLabel: {
    fontSize: 11,
    color: '#558B2F',
    ...font.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  receiptNumber: {
    fontSize: 26,
    color: '#2E7D32',
    ...font.bold,
    letterSpacing: 2,
    marginVertical: spacing.xs,
  },
  receiptSub: {
    fontSize: 11,
    color: '#558B2F',
  },
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl + spacing.md,
    marginTop: spacing.lg,
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 16,
    ...font.bold,
  },

  // ── failed
  failCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: '#FFEBEE',
    borderWidth: 3,
    borderColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  failIcon: {
    fontSize: 28,
    color: colors.error,
    ...font.bold,
  },
  retryBtn: {
    backgroundColor: colors.error,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    minWidth: 160,
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 16,
    ...font.bold,
  },
  cancelLink: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  cancelLinkText: {
    fontSize: 14,
    color: colors.textMuted,
    ...font.medium,
  },

  // ── error colours (referenced from theme but declared locally for clarity)
  error: colors.error,
});
