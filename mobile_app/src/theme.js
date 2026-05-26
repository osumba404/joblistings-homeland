// ─── Light palette ────────────────────────────────────────────────────────────
export const lightColors = {
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  accent: '#F9A825',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F9F9F9',
  textPrimary: '#212121',
  textSecondary: '#757575',
  textMuted: '#9E9E9E',
  border: '#E0E0E0',
  skeleton: '#E0E0E0',
  error: '#B71C1C',
  // chat
  bubbleSent: '#1B5E20',
  bubbleSentText: '#FFFFFF',
  bubbleReceived: '#EEEEEE',
  bubbleReceivedText: '#212121',
};

// ─── Dark palette ─────────────────────────────────────────────────────────────
export const darkColors = {
  primary: '#2E7D32',
  primaryLight: '#43A047',
  accent: '#F9A825',
  background: '#121212',
  surface: '#1E1E1E',
  surfaceAlt: '#252525',
  textPrimary: '#F5F5F5',
  textSecondary: '#BDBDBD',
  textMuted: '#757575',
  border: '#333333',
  skeleton: '#2C2C2C',
  error: '#EF5350',
  // chat
  bubbleSent: '#2E7D32',
  bubbleSentText: '#FFFFFF',
  bubbleReceived: '#2C2C2C',
  bubbleReceivedText: '#F5F5F5',
};

// ─── Shared constants (unchanged by theme) ────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 999,
};

export const font = {
  regular: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  semibold: { fontWeight: '600' },
  bold: { fontWeight: '700' },
};

export const CATEGORY_COLORS = {
  Construction: { bg: '#FFF3E0', text: '#E65100' },
  Electrical:   { bg: '#E3F2FD', text: '#1565C0' },
  Plumbing:     { bg: '#E8F5E9', text: '#2E7D32' },
  Cleaning:     { bg: '#F3E5F5', text: '#6A1B9A' },
  Driving:      { bg: '#E0F7FA', text: '#00695C' },
  Security:     { bg: '#FCE4EC', text: '#880E4F' },
  Catering:     { bg: '#FFF8E1', text: '#F57F17' },
  'IT & Tech':  { bg: '#EDE7F6', text: '#4527A0' },
  Tailoring:    { bg: '#E8EAF6', text: '#283593' },
};

// Legacy default export so any file that imported `colors` still compiles
// (will be replaced by useAppTheme() in each component)
export const colors = lightColors;
