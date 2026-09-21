# KudiCart Driver App — Project Context

> **Purpose:** Durable project context for the KudiCart Delivery Partner Mobile Application.
>
> This file covers only the **Driver (Delivery Partner) Mobile Application**. For backend API, see `kudicart-backend/`. For customer mobile, see `kudicart-customer-app/`. For admin/vendor web, see `kudicart-admin-vendor-web/`.

---

# 1. Repository Overview

This repository contains the **KudiCart Delivery Partner Mobile Application** — a React Native application targeting Android (Google Play Store only for the current round).

The Driver App enables delivery partners to receive manually assigned orders and execute the pickup/delivery workflow. It includes Google Maps directions, order status updates, availability management, and push notifications.

All business logic, assignment decisions, and data persistence are handled by the **common KudiCart backend** (`kudicart-backend`). This application is a **presentation/client layer**.

---

# 2. System Position

```text
kudicart-customer-app
kudicart-driver-app     ← THIS REPOSITORY
kudicart-admin-vendor-web
        ↓
  Common KudiCart Backend (kudicart-backend)
        ↓
  Supabase PostgreSQL
```

---

# 3. Actor — Delivery Partner

The Delivery Partner is responsible for:

- Authenticating via phone/OTP.
- Managing profile information.
- Viewing KYC-related status.
- Managing availability/online status.
- Viewing orders manually assigned by Admin.
- Accepting assigned orders.
- Executing the pickup workflow.
- Executing the delivery workflow.
- Updating delivery/order statuses.
- Using Google Maps for directions.
- Using supported location/tracking functionality.
- Receiving relevant push notifications.

### Delivery Partner Does NOT:

- Assign themselves to orders.
- Automatically match to nearby orders.
- Perform vendor administration.
- Access customer account data.
- Access marketplace-wide reporting.
- Own authoritative assignment decisions (Admin does this).
- Own authoritative order-state validation.

### Critical Boundary — No Automatic Dispatch

Delivery-partner assignment is **manual and admin-driven**. The Driver App must NOT:

- Implement nearest-rider selection.
- Implement automatic rider dispatch.
- Implement rider-to-order matching.
- Implement automated geographical allocation.

---

# 4. Delivery Workflow

```text
Admin assigns order to Delivery Partner
        ↓
Push notification received
        ↓
Driver views assigned order
        ↓
Driver accepts order
        ↓
Driver navigates to pickup (Google Maps)
        ↓
Driver confirms pickup (PICKED_UP)
        ↓
Driver navigates to delivery (Google Maps)
        ↓
Driver confirms delivery (DELIVERED)
```

Order states relevant to the Driver:

```text
ASSIGNED → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
```

---

# 5. Technology Stack (Driver App)

| Concern | Technology |
|---|---|
| Framework | React Native |
| Language | TypeScript |
| Authentication | Firebase Authentication (Phone/OTP) |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Maps / Directions | Google Maps Platform (React Native Maps) |
| Error Tracking | Sentry |
| API Communication | REST API to kudicart-backend |
| Distribution Target | Google Play Store only |

---

# 6. Third-Party Integrations (Client-Side)

| Service | Driver App Responsibility |
|---|---|
| Firebase Auth | Phone/OTP login flow, token management |
| FCM | Notification token registration, push handling |
| Google Maps | Direction display, navigation links, location display |
| Sentry | Error capture and reporting |

Server-side integrations (Cloudinary, Razorpay, etc.) are handled by `kudicart-backend`.

---

# 7. Driver App Owns

- Delivery execution UX.
- Assigned-order visibility.
- Availability/status toggle UX.
- Pickup/delivery action UX.
- Maps/directions presentation.
- KYC status display.
- Profile management UX.
- Push notification handling.
- Firebase phone/OTP authentication flow.
- FCM token registration.
- Sentry client-side error capture.

---

# 8. Driver App Does NOT Own (Authoritative)

- Assignment decisions (Admin-driven).
- Payment state.
- Role authorization.
- Arbitrary order-state transitions.
- Business rule enforcement.
- Database access.

---

# 9. Shared Code with Customer App

The Driver App and Customer App (`kudicart-customer-app`) are both React Native applications. They may share:

- Common types and API client logic.
- Firebase phone/OTP authentication plumbing.
- FCM notification handling utilities.
- Sentry configuration patterns.
- Common UI components where genuinely reusable.

---

# 10. Hard Scope Exclusions (Driver App)

The Driver App must NOT implement:

- Automatic rider dispatch or matching.
- Delivery zone/serviceability logic.
- Route optimization engines.
- Distance Matrix / Route Matrix dependency.
- Customer shopping screens.
- Vendor/admin screens.
- Payment processing UI.
- Coupon/combo/loyalty UI.
- Live chat.
- Multi-language/multi-currency.

---

# 11. Maps Usage Boundary

Google Maps Platform is used for:

- Displaying directions to pickup location.
- Displaying directions to delivery location.
- Geocoding where required.

Google Maps is NOT used for:

- Delivery zone matching.
- Automatic nearest-rider selection.
- Route optimization.
- Distance Matrix as a system dependency.

---

# 12. Production Account Ownership

Production third-party accounts (Firebase, Google Maps, Sentry, Google Play Console) are **Client-owned**.

---

# 13. Environment Configuration

The Driver App requires:

- Firebase configuration.
- Backend API base URL.
- Google Maps API key (client key).
- Sentry DSN.
- FCM configuration.

**No production secrets in source control.**

---

# 14. Antigravity Instruction

Read this document before beginning work in a new Driver App session. Do not infer unrecorded requirements. Surface scope discrepancies before implementing.
