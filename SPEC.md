# KudiCart Driver App — Product Specification

> **Purpose:** Define the approved product requirements for the Delivery Partner Mobile Application.
>
> Backend API and server-side logic are specified in `kudicart-backend/SPEC.md`.

---

# 1. Product Goal (Driver App)

The Driver App is the delivery-partner-facing React Native mobile application. It enables delivery partners to manage their availability, receive manually assigned orders, execute pickup and delivery workflows, use Google Maps for directions, and receive push notifications.

---

# 2. Functional Requirements

## 2.1 Authentication

### R-RIDER-01 — Phone/OTP Authentication
Delivery partners shall authenticate using Firebase Authentication with phone/OTP login.

---

## 2.2 Profile and Status

### R-RIDER-02 — Profile
Delivery partners shall have access to their supported profile information.

### R-RIDER-03 — KYC Status
Delivery partners shall be able to view/interact with the KYC-related status functionality included in scope.

### R-RIDER-04 — Availability/Status
Delivery partners shall be able to manage the availability/status controls (online/offline toggle).

---

## 2.3 Order Assignment and Execution

### R-RIDER-05 — Assigned Orders
Delivery partners shall be able to view orders manually assigned to them.

### R-RIDER-06 — Order Acceptance
Delivery partners shall be able to perform the supported order-acceptance action for an assigned order.

### R-RIDER-07 — Pickup Workflow
Delivery partners shall be able to execute the supported pickup workflow.

### R-RIDER-08 — Delivery Workflow
Delivery partners shall be able to execute the supported delivery workflow.

### R-RIDER-09 — Delivery Status Updates
Delivery partners shall be able to update the supported delivery/order statuses during execution:

```text
ASSIGNED → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
```

---

## 2.4 Maps and Location

### R-RIDER-10 — Location and Directions
Delivery partners shall have the supported location/tracking functionality and Google Maps directions functionality.

---

## 2.5 Notifications

### R-RIDER-11 — Push Notifications
Delivery partners shall receive relevant push notifications (new assignment, status updates).

---

## 2.6 Manual Assignment Boundary

### R-RIDER-12 — No Automatic Dispatch
The product shall NOT automatically select or dispatch a rider. Assignment remains admin-driven/manual.

---

# 3. Maps Requirements (Client-Side)

### R-MAPS-CLIENT-01 — Directions Display
The Driver App shall display Google Maps directions to pickup and delivery locations.

### R-MAPS-CLIENT-02 — Navigation
The Driver App shall enable opening directions in external maps app or displaying in-app.

### R-MAPS-CLIENT-03 — No Zone Logic
The Driver App shall NOT implement delivery zone, serviceability, or radius-based logic.

---

# 4. Platform Requirements

### R-PLAT-DRIVER-01 — React Native
The Driver App shall be built with React Native.

### R-PLAT-DRIVER-02 — Android Target
Current distribution target: **Google Play Store only**.

### R-PLAT-DRIVER-03 — Sentry
The Driver App shall integrate Sentry for error tracking.

---

# 5. Hard Constraints

1. Assignment is admin-driven — NO automatic dispatch.
2. The app is a presentation layer — no authoritative business logic.
3. No direct database access.
4. No excluded features (delivery zones, route optimization, auto-matching).
5. Google Play Store only.

---

# 6. Acceptance Criteria (Driver App)

- [ ] AC-01: Delivery Partner can authenticate using phone/OTP.
- [ ] AC-02: Delivery Partner can view their profile and KYC status.
- [ ] AC-03: Delivery Partner can toggle availability/status.
- [ ] AC-04: Delivery Partner can view assigned orders.
- [ ] AC-05: Delivery Partner can accept an assigned order.
- [ ] AC-06: Delivery Partner can execute pickup workflow (PICKED_UP status).
- [ ] AC-07: Delivery Partner can execute delivery workflow (OUT_FOR_DELIVERY → DELIVERED).
- [ ] AC-08: Google Maps directions work for pickup and delivery.
- [ ] AC-09: Push notifications are received for new assignments.
- [ ] AC-10: No automatic dispatch or rider matching exists.
- [ ] AC-11: Sentry captures client-side errors.
- [ ] AC-12: App targets Google Play Store only.

---

# 7. Open Questions (Driver App)

1. Exact delivery partner profile fields.
2. Exact KYC fields, documents, and status states.
3. Exact delivery tracking model and update frequency.
4. Exact notification events for delivery partner.
5. Exact availability status states.

---

# 8. Scope Change Rule

Any requirement not represented here or explicitly approved must be treated as a scope change.
