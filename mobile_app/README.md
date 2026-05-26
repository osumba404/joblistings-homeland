# Homeland Jobs – Mobile App

React Native / Expo implementation of the Homeland Jobs feed screen.

---

## How to run

```bash
cd mobile_app
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your Android device, or press `a` to open an Android emulator.

---

## Approach

### Architecture

```
mobile_app/
├── App.js                        # Navigation root
├── babel.config.js               # Reanimated plugin
└── src/
    ├── theme.js                  # Colors, spacing, typography constants
    ├── data/
    │   └── jobs.js               # 15 mock jobs + category/location enums
    ├── components/
    │   ├── JobCard.js            # Individual job card
    │   ├── SkeletonCard.js       # Pulsing loading placeholder
    │   └── FilterBottomSheet.js  # @gorhom/bottom-sheet filter panel
    └── screens/
        ├── JobFeedScreen.js      # Screen 1 – feed, search, FAB
        └── JobDetailScreen.js    # Screen 2 – job detail + Apply CTA
```

### Key Features

**State management - local only**
All state lives in `JobFeedScreen` via `useState`/`useMemo`. No Redux or Context needed for a two-screen app. The filter sheet receives its current values as props and calls `onApply` — one-way data flow.

**Search - `useMemo` filter, no debounce needed**
Because filtering is purely in-memory over 15 items, `useMemo` recomputes on every keystroke with no perceptible lag. On a real dataset (1 000+ items) I would add a 200 ms `useCallback`-debounced dispatch instead.

**Skeleton loading**
`SkeletonCard` uses `Animated.loop` + `Animated.sequence` for a pulsing opacity shimmer - no third-party library. Five skeletons render during the simulated 1.5 s initial load, then swap out for the real `FlatList`.

**Pull-to-refresh**
`RefreshControl` triggers a `setTimeout` of 1 500 ms. In production this would call the API and replace state; here it bumps a `seedCounter` so `keyExtractor` produces new keys and React re-renders all cards (simulating new data arriving).

**Bottom sheet**
`@gorhom/bottom-sheet` v5 with `snapPoints` of `['60%', '85%']`. Opened via an imperative ref (`filterSheetRef.current.open()`) from the FAB. Local state (`localCategory`, `localLocation`) is initialised from the parent on each open so the sheet always reflects the current active filters without mutating parent state until Apply is tapped.

**FlatList performance**
`removeClippedSubviews`, `windowSize={5}`, `maxToRenderPerBatch={6}` and `initialNumToRender={6}` are tuned for a low-end Android device (Tecno SPARK class). `useCallback` on `renderItem` and `keyExtractor` prevents unnecessary re-renders.

**Avatar initials**
Each employer name is hashed to a consistent HSL hue — same employer always gets the same colour, no image requests needed.

**Navigation**
`@react-navigation/native-stack` (native screen transitions). `headerShown: false` on both screens — each screen owns its own header UI so it can match the green brand colour without fighting the default navigation bar.

---

## Features checklist

| Feature | Status |
|---|---|
| FlatList with 15 job cards | Complete! |
| Job card: title, employer avatar initial, coloured category chip, budget, location, posted date, skill tags | Complete! |
| Pull-to-refresh (1.5 s simulated) | Complete! |
| Real-time search bar (local filter, no API) | Complete! |
| Bottom sheet filter panel (FAB → category + location pickers → Apply / Reset) | Complete! |
| Skeleton loading on initial load | Complete! |
| Tap card → Job Detail screen | Complete! |
| Job Detail screen with full mock content + Apply CTA | Complete! |
