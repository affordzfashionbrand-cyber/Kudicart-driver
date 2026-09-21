# KudiCart Driver App — Decisions

> **Purpose:** Record decisions approved for the Driver App repository.
>
> For the full project decision record, see the master `KudiCart_decisions.md`.

---

# 1. Technology Decisions

## D-DRIVER-01 — Mobile Framework
**Status:** `LOCKED`
The Delivery Partner mobile application will be built with **React Native** using **TypeScript**.

## D-DRIVER-02 — Authentication
**Status:** `LOCKED`
Driver authentication uses **Firebase Authentication** with **Phone / OTP** login.

## D-DRIVER-03 — Push Notifications
**Status:** `LOCKED`
**Firebase Cloud Messaging (FCM)** is the push notification provider.

## D-DRIVER-04 — Maps Provider
**Status:** `LOCKED`
**Google Maps Platform** is used for directions and geocoding. Distance Matrix / Route Matrix is NOT required.

## D-DRIVER-05 — Error Tracking
**Status:** `LOCKED`
**Sentry** is the error-tracking service.

## D-DRIVER-06 — API Communication
**Status:** `LOCKED`
The Driver App communicates with the **common KudiCart NestJS Backend** via REST API. No direct database access.

## D-DRIVER-07 — Distribution Target
**Status:** `LOCKED`
**Google Play Store only.** iOS is NOT part of the current target.

---

# 2. Scope Decisions

## D-DRIVER-08 — Manual Assignment Only
**Status:** `LOCKED`
Delivery-partner assignment is **manual and admin-driven**. The Driver App does NOT implement:
- Nearest-rider selection.
- Automatic rider dispatch.
- Automatic rider-to-order matching.
- Automated geographical rider allocation.

## D-DRIVER-09 — No Route Optimization
**Status:** `LOCKED`
No advanced route optimization, automated multi-stop routing, or route optimization engines.

## D-DRIVER-10 — No Delivery Zones
**Status:** `LOCKED`
No delivery zones, radius configuration, catchment areas, or geofence-based logic.

## D-DRIVER-11 — Presentation Layer Only
**Status:** `LOCKED`
The Driver App does NOT own authoritative business logic. Assignment decisions, order-state validation, and role authorization are backend responsibilities.

## D-DRIVER-12 — Excluded Features
**Status:** `LOCKED`
The Driver App must NOT implement:
- Customer shopping screens.
- Vendor/admin screens.
- Payment UI.
- Coupon/combo/loyalty UI.
- Live chat.
- Multi-language/multi-currency.

## D-DRIVER-13 — Shared Code
**Status:** `LOCKED`
The Driver App and Customer App may share appropriate reusable code where it improves maintainability without creating unnecessary coupling.

---

# 3. Account Ownership

## D-DRIVER-14 — Production Accounts
**Status:** `LOCKED`
Production third-party accounts (Firebase, Google Maps, Sentry, Google Play Console) must be **Client-owned**.

---

# 4. Open Decisions

| ID | Decision still required |
|---|---|
| O-DRIVER-01 | Exact delivery partner profile fields |
| O-DRIVER-02 | Exact KYC fields and status states |
| O-DRIVER-03 | Exact delivery tracking model and update frequency |
| O-DRIVER-04 | Exact notification events for drivers |
| O-DRIVER-05 | Exact availability status states |

---

# 5. Decision Precedence

1. Master `KudiCart_decisions.md`
2. This file's locked decisions
3. Approved specification
4. Design/plan
5. Prototype behavior
6. AI assumptions
