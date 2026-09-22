# KudiCart Driver App — Frontend Architecture

> **Purpose:** Detailed frontend architecture for the Driver App repository.

---

## 1. Context
This document defines the React Native frontend architecture for the KudiCart Delivery Partner Mobile Application, reflecting constraints from `SPEC.md`, `decisions.md`, and visual designs from Stitch.

---

## 2. Technology Stack
- **Framework**: React Native (TypeScript).
- **Navigation**: React Navigation (Native Stack, Bottom Tabs).
- **State Management**: Zustand (Auth, Availability, Delivery states).
- **Styling**: StyleSheet (Vanilla React Native) + Centralized Theme Primitives.
- **Maps**: `react-native-maps` for Google Maps integration.
- **Push Notifications**: `@react-native-firebase/messaging` (FCM).
- **Authentication**: `@react-native-firebase/auth` (Phone/OTP).
- **Error Tracking**: `@sentry/react-native`.

---

## 3. Directory Structure
```text
src/
├── api/             # API clients, mock endpoints (Frontend data boundary)
├── assets/          # Local static images, icons, and fonts
├── components/      # Reusable UI components (Buttons, Cards, Modals)
├── config/          # Environment variables, Sentry, Firebase configs
├── features/        # Feature modules
│   ├── auth/        # Login, OTP verification
│   ├── orders/      # Dashboard, Assigned, Details, History, Execution
│   ├── profile/     # Driver info, KYC states
│   └── map/         # Map view, directions handling
├── hooks/           # Custom React hooks (e.g., useAuth, useAvailability)
├── navigation/      # React Navigation setup and route types
├── store/           # Zustand store slices
├── theme/           # Global design system (colors, spacing, typography)
├── types/           # Global TypeScript definitions
└── utils/           # Helper functions, formatting, validation
```

---

## 4. Navigation Architecture
- **RootNavigator**:
  - Splash Screen
  - `AuthNavigator` (Phone Login → OTP)
  - `MainNavigator` (Requires Auth + Approved KYC)
  - `KYCNavigator` (Requires Auth, handles Pending/Rejected)

- **MainNavigator (Bottom Tabs)**:
  - Dashboard / Home
  - Assigned Orders
  - Order History
  - Profile

- **OrderExecutionNavigator (Nested)**:
  - Order Details
  - Navigate to Pickup (Map)
  - Navigate to Delivery (Map)

- **Modals / Overlays**:
  - Accept Order (Bottom Sheet)
  - Confirm Pickup / Delivery (Modals)
  - Foreground Assignment Banner

---

## 5. State Management Approach
- **Zustand**: Manages light global states:
  - `authStore`: User session, ID tokens.
  - `driverStore`: Availability toggle state, profile summary.
  - `orderStore`: Current active order state (Assigned, Picked Up, Out for Delivery).
- **Local State**: Managed via `useState`/`useReducer` within specific screens or forms.
- **Frontend-Only Data Strategy**: Since backend integration is excluded in this phase, mock functions in `src/api/` will serve realistic static data.

---

## 6. Shared Component Strategy (Global Design System)
A centralized theme (`src/theme/`) defines spacing, colors, and typography extracted directly from the Stitch designs.
- Reusable primitives: `PrimaryButton`, `Card`, `StatusBadge`, `Header`, `BottomSheet`.
- No ad-hoc styling for components that exist on multiple screens.

---

## 7. Third-Party Integration Points
- **Firebase Auth**: Used exclusively for Phone/OTP. Returns ID token to mock API.
- **FCM**: `onMessage` handles foreground banners; `setBackgroundMessageHandler` handles background push notifications.
- **Google Maps**: `react-native-maps` `MapView` and `Polyline` used for displaying directions to pickup/delivery. Follows NO auto-dispatch/zone matching constraints.

---

## 8. Hard Constraints Checked
- Presentation layer only. No database access. No authoritative state decisions.
- Manual assignment only (no auto-dispatch logic).
- No delivery zones, geo-fencing, or multi-stop route optimization engines.
- Android target only (Google Play Store).
