# KudiCart Driver App — System Design

> **Purpose:** Define the product-level system design for the Delivery Partner Mobile Application.

---

# 1. Design Objectives

1. Enable delivery partners to execute assigned deliveries efficiently.
2. Provide clear pickup/delivery workflow UX.
3. Integrate Google Maps for directions.
4. Handle FCM push notifications for new assignments.
5. Delegate all business authority to the backend.
6. No automatic dispatch or rider matching.

---

# 2. Architecture Position

```text
┌──────────────────────────┐
│  KudiCart Driver App      │  ← React Native (this repo)
│  (Presentation Layer)     │
└──────────┬───────────────┘
           │ REST API
           ▼
┌──────────────────────────┐
│  KudiCart Backend         │  ← NestJS (kudicart-backend)
│  (Business Authority)     │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  PostgreSQL + Services    │
└──────────────────────────┘
```

---

# 3. Authentication Design

Same as Customer App — Firebase Phone/OTP:

```text
Driver opens app → Phone number → OTP → Firebase ID Token
→ Token sent to backend → User/role resolved → Driver session
```

---

# 4. Screen Flow Design

## 4.1 Auth Flow
```text
Splash → Login (Phone) → OTP Verification → Home
```

## 4.2 Main Flow
```text
Home Dashboard
  ├── Availability Toggle (Online/Offline)
  ├── Current Assigned Orders
  ├── Order History
  ├── Profile / KYC Status
  └── Notifications
```

## 4.3 Delivery Execution Flow
```text
New Assignment Notification
      ↓
View Assigned Order (details, pickup address, delivery address)
      ↓
Accept Order
      ↓
Navigate to Pickup (Google Maps)
      ↓
Confirm Pickup → Status: PICKED_UP
      ↓
Navigate to Delivery (Google Maps)
      ↓
Confirm Delivery → Status: DELIVERED
```

## 4.4 Maps Integration Flow
```text
Order Detail Screen
      ↓
"Navigate" button
      ↓
Open Google Maps with directions
  - To pickup location (vendor address)
  - To delivery location (customer address)
```

---

# 5. Order States (Driver Perspective)

The driver interacts with these order states:

| State | Driver Action |
|---|---|
| ASSIGNED | View order, Accept |
| PICKED_UP | Confirm pickup at vendor |
| OUT_FOR_DELIVERY | En route to customer |
| DELIVERED | Confirm delivery to customer |

States before ASSIGNED (PLACED, ACCEPTED, PREPARING, READY_FOR_PICKUP) are managed by Vendor/Admin and are not directly actionable by the driver.

---

# 6. Notification Design (Client-Side)

- **New Assignment:** Push notification when Admin assigns an order.
- **Status Updates:** Relevant order status changes.
- **FCM Token:** Register on login, update as needed.
- **Foreground:** In-app banner.
- **Background:** System notification with tap-to-navigate.

---

# 7. Location/Tracking Design

Within approved scope:

- Display driver's current location on map (if specified).
- Provide directions to pickup/delivery points.
- Geocoding for address display on map.

**NOT in scope:**
- Real-time continuous location streaming.
- Route optimization.
- Distance Matrix calculations.
- Delivery zone checks.

---

# 8. KYC Status Display

The Driver App shows KYC-related status:

```text
Profile Screen
      ↓
KYC Status Section
      ↓
Display current KYC status
  (Pending / Approved / Rejected — exact states TBD)
```

The app does NOT perform KYC verification — it only displays status from the backend.

---

# 9. Availability Management

```text
Driver toggles Online/Offline
      ↓
App sends status update to backend
      ↓
Backend records availability
      ↓
Admin sees available drivers when assigning
```

---

# 10. Error Handling Design

| Error Type | Handling |
|---|---|
| Auth errors | Redirect to login |
| Network errors | Retry/offline message |
| Status update errors | Show error, allow retry |
| Maps errors | Fallback message, retry |
| Unexpected errors | Sentry capture |

---

# 11. Scope Protection

The Driver App must NOT implement:
- Automatic dispatch/matching.
- Delivery zones/serviceability.
- Route optimization.
- Customer shopping flows.
- Vendor/admin flows.
- Payment processing.

---

# 12. Antigravity Instructions

Before implementing a driver app feature:
1. Identify the requirement it satisfies.
2. Confirm no excluded feature is involved.
3. Remember: assignment is admin-driven, not automatic.
4. Keep business logic on the backend.
