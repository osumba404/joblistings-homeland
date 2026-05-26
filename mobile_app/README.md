# Homeland Jobs – Mobile App

React Native / Expo implementation of the Homeland Jobs mobile experience, built across Q28–Q30.

---

## How to run

```bash
cd mobile_app
npm install
npx expo start --clear
```

Scan the QR code with **Expo Go** on your Android device.

> **Tested against Expo Go 54.0.8 (SDK 54).** If Metro reports an SDK mismatch, ensure your Expo Go app is updated to SDK 54.

---

## Project structure

```
mobile_app/
├── index.js                          # Entry point — gesture-handler import MUST be here
├── App.js                            # Root: GestureHandlerRootView → ThemeProvider → Navigation
├── babel.config.js                   # babel-preset-expo only (no reanimated plugin)
└── src/
    ├── theme.js                      # lightColors, darkColors, spacing, radius, font
    ├── context/
    │   └── ThemeContext.js           # ThemeProvider + useAppTheme() hook
    ├── navigation/
    │   └── AppNavigator.js           # Bottom tab navigator (4 tabs) + nested stacks
    ├── data/
    │   ├── jobs.js                   # 15 mock jobs, CATEGORIES, LOCATIONS, CATEGORY_COLORS
    │   └── messages.js               # 3 mock conversations with full message history
    ├── components/
    │   ├── JobCard.js                # Job card: avatar initial, category chip, skill tags
    │   ├── SkeletonCard.js           # Pulsing animated placeholder (pure RN Animated)
    │   ├── FilterBottomSheet.js      # Slide-up filter sheet (Modal + Animated — no reanimated)
    │   └── PaymentModal.js           # M-Pesa STK-push simulation modal
    └── screens/
        ├── JobFeedScreen.js          # Home tab: FlatList, search, pull-to-refresh, FAB
        ├── JobDetailScreen.js        # Job detail + Fund Escrow button + payment state
        ├── ApplicationsScreen.js     # My Applications: 4 proposals with status badges
        ├── MessagesScreen.js         # Conversation list with unread badges
        ├── ChatScreen.js             # Chat screen with sent/received message bubbles
        └── ProfileScreen.js          # Profile, stats, skills, dark/light mode toggle
```

---

## Approach

### Q28 — Job Feed Screen

**FlatList with skeleton loading**
`SkeletonCard` uses `Animated.loop` + `Animated.sequence` for a pulsing opacity shimmer — no third-party library. Five skeletons render during the simulated 1.5 s initial load, replaced by the real list once data arrives.

**Real-time search**
Filtering runs inside `useMemo` on every keystroke — no debounce, no API call. Over 15 local items this is imperceptible. On a real dataset (1 000+) I would add a 200 ms debounced dispatch instead.

**Pull-to-refresh**
`RefreshControl` triggers a 1.5 s `setTimeout`. It bumps a `seedCounter` so `keyExtractor` produces new keys and React re-renders all cards, simulating fresh data from the server.

**Filter bottom sheet**
Built with React Native's built-in `Modal` + `Animated.timing` — a `translateY` + `opacity` parallel animation gives the slide-up feel without any third-party native module dependency. Opened imperatively via `ref.current.open()` from the FAB. Local state (`localCategory`, `localLocation`) is copied from the parent on each open so the sheet always reflects current filters without mutating parent state until Apply is tapped.

**FlatList performance**
`removeClippedSubviews`, `windowSize={5}`, `maxToRenderPerBatch={6}`, `initialNumToRender={6}` tuned for low-end Android (Tecno SPARK class). `useCallback` on `renderItem` and `keyExtractor` prevents unnecessary re-renders.

**Avatar initials**
Employer names are hashed to a consistent HSL hue — same employer always gets the same colour, no image requests needed.

---

### Q29 — M-Pesa Payment Simulation

**5-stage state machine** inside `PaymentModal`:

| Stage | Duration | User sees |
|---|---|---|
| `idle` | — | Amount, editable phone number, Simulate Failure toggle |
| `sending` | 2 s | Spinner + "Sending STK Push…" |
| `pending` | 3 s | 📲 "Check your phone — M-Pesa prompt sent" |
| `success` | — | Green ✓, receipt number (e.g. `NLJ7RT61SV`), Done |
| `failed` | — | Red ✕, "Insufficient funds", Retry button |

- **Simulate Failure toggle** short-circuits `pending` — spinner runs for 2 s then jumps straight to `failed`
- **Timer refs** stored in an array and cleared on unmount — no setState on unmounted components
- **Escrow funded state** (`escrowFunded`, `receiptNumber`) lives in `JobDetailScreen` state, persists across modal open/close while the screen is mounted. The footer Fund Escrow button becomes a static  Funded tile once paid.

---

### Q30 — Bottom Tab Navigation + Theme

**Navigation structure**
```
Tab Navigator
 ├── Home        → HomeStack (JobFeed → JobDetail)
 ├── Applications → ApplicationsScreen
 ├── Messages    → MessagesStack (MessagesList → Chat)
 └── Profile     → ProfileScreen
```
Notification badge (`tabBarBadge: 2`) on the Applications tab.

**Theme system**
`ThemeContext` holds `isDark` state and exposes `toggleTheme()`. Every component calls `useAppTheme()` instead of importing static colours. The `NavigationContainer` receives a dynamic theme object (spread from `DefaultTheme` / `DarkTheme` so React Navigation's required `fonts` key is always present). Toggling the Switch in Profile → Settings instantly re-renders the entire app — tab bar, cards, modals, chat bubbles — with no restart.

**Chat screen**
`FlatList` of message bubbles, auto-scrolls to bottom on mount. Sent bubbles (right, green) and received bubbles (left, surface colour) adapt to light/dark mode via `colors.bubbleSent` / `colors.bubbleReceived`.

---

## Dependency decisions

| Package | Version | Reason |
|---|---|---|
| `expo` | `~54.0.0` | Matches Expo Go 54.0.8 on device |
| `babel-preset-expo` | `~54.0.10` | SDK 54 compatible Babel preset |
| `@react-navigation/native` | `^7.x` | Native stack + bottom tabs |
| `react-native-gesture-handler` | `~2.28.0` | Required by React Navigation |
| `react-native-screens` | `~4.16.0` | Required by React Navigation |
| `react-native-safe-area-context` | `~5.6.0` | Safe area insets |

> **react-native-reanimated and @gorhom/bottom-sheet were intentionally removed.** Expo Go 54.0.8 bundles a specific native build of reanimated; any JS version mismatch causes a `NullPointerException` in `NativeProxy.initHybrid`. The filter sheet was rewritten using `Modal` + `Animated` — functionally identical, zero native dependency.

---

## Features checklist

| Feature | Q | Status |
|---|---|---|
| FlatList with 15 job cards | Q28 | Completed! |
| Job card: title, employer avatar, category chip, budget, location, date, skill tags | Q28 | Completed! |
| Pull-to-refresh (1.5 s simulated) | Q28 | Completed! |
| Real-time search bar (local filter, no API) | Q28 | Completed! |
| Bottom sheet filter panel (FAB → category + location → Apply / Reset) | Q28 | Completed! |
| Skeleton loading on initial load | Q28 | Completed! |
| Tap card → Job Detail screen | Q28 | Completed! |
| Fund Escrow button → Payment Modal | Q29 | Completed! |
| M-Pesa STK-push simulation (spinner → pending → success) | Q29 | Completed! |
| Simulate Failure toggle → red error + Retry | Q29 | Completed! |
| Escrow funded state persists on detail screen | Q29 | Completed! |
| Bottom tab navigation (Home / Applications / Messages / Profile) | Q30 | Completed! |
| Applications tab: 4 proposals with colour-coded status badges | Q30 | Completed! |
| Notification badge (2) on Applications tab | Q30 | Completed! |
| Messages tab: 3 conversations with unread badges | Q30 | Completed! |
| Chat screen: sent/received message bubbles | Q30 | Completed! |
| Profile tab: avatar, stats, skills chips, member since, total earnings | Q30 | Completed! |
| Dark/light mode toggle that actually changes the app theme | Q30 | Completed! |
