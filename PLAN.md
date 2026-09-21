# KudiCart Driver App — Implementation Plan

> **Purpose:** Bounded execution plan for the Driver App repository.

---

# 1. Plan Status
**Status:** PRE-ARCHITECTURE PLAN

---

# 2. Dependency Order

```text
Final Architecture Approved
        ↓
Project / Dev Foundation Setup
        ↓
Firebase Auth (Phone/OTP)
        ↓
Driver Profile + KYC Status Screens
        ↓
Availability/Status Toggle
        ↓
Assigned Orders List
        ↓
Order Detail Screen
        ↓
Order Acceptance Flow
        ↓
Google Maps Directions Integration
        ↓
Pickup Workflow (PICKED_UP status)
        ↓
Delivery Workflow (OUT_FOR_DELIVERY → DELIVERED)
        ↓
FCM Push Notification Integration
        ↓
Sentry Integration
        ↓
Integration Testing
        ↓
Build / Release (APK / Play Store)
```

---

# 3. Phase 1 — Project Foundation
**Status:** [ ]
- [ ] React Native project initialization (TypeScript).
- [ ] Navigation setup.
- [ ] State management setup.
- [ ] API client foundation.
- [ ] Environment configuration.
- [ ] Linting / formatting.

---

# 4. Phase 2 — Firebase Authentication
**Status:** [ ]
- [ ] Firebase SDK setup.
- [ ] Phone/OTP login/verify screens.
- [ ] Token management and API header injection.
- [ ] Auth state persistence.
- [ ] Logout flow.

---

# 5. Phase 3 — Profile and KYC
**Status:** [ ]
- [ ] Profile screen.
- [ ] KYC status display.
- [ ] Profile edit (where applicable).

---

# 6. Phase 4 — Availability Management
**Status:** [ ]
- [ ] Online/Offline toggle.
- [ ] Status persistence via backend API.

---

# 7. Phase 5 — Assigned Orders
**Status:** [ ]
- [ ] Assigned orders list screen.
- [ ] Order detail screen (pickup address, delivery address, items).
- [ ] Order acceptance action.

---

# 8. Phase 6 — Google Maps Integration
**Status:** [ ]
- [ ] React Native Maps setup.
- [ ] Google Maps API key configuration.
- [ ] Directions to pickup location.
- [ ] Directions to delivery location.
- [ ] Open in external maps app option.

---

# 9. Phase 7 — Pickup and Delivery Workflow
**Status:** [ ]
- [ ] Confirm pickup action → PICKED_UP status.
- [ ] Out for delivery state display.
- [ ] Confirm delivery action → DELIVERED status.
- [ ] Status update confirmation/error handling.

---

# 10. Phase 8 — Push Notifications
**Status:** [ ]
- [ ] FCM SDK setup.
- [ ] Token registration with backend.
- [ ] New assignment notification handling.
- [ ] Foreground + background push handling.
- [ ] Notification tap navigation.

---

# 11. Phase 9 — Sentry Integration
**Status:** [ ]
- [ ] Sentry SDK setup.
- [ ] Error capture.
- [ ] Environment configuration.

---

# 12. Phase 10 — Integration Testing
**Status:** [ ]
- [ ] Full delivery flow: Assignment → Accept → Pickup → Deliver.
- [ ] Maps/directions testing.
- [ ] Push notification testing.
- [ ] Error handling review.

---

# 13. Phase 11 — Build and Release
**Status:** [ ]
- [ ] Android release build.
- [ ] Play Store configuration.
- [ ] Production environment setup.

---

# 14. Implementation Gate

Before implementing any phase:
1. Confirm final architecture is approved.
2. Identify requirements being implemented.
3. Confirm no automatic dispatch is being introduced.
4. Implement only the bounded unit.
5. Verify before marking complete.
