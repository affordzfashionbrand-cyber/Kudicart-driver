# KudiCart Driver App — AGENTS.md (Repository Operating Directive)

> **Authority level:** This is the repo-level operating directive for `kudicart-driver-app/`. It **inherits** all rules from the workspace-root `.agents/AGENTS.md` and adds driver-app-specific constraints. If a rule here conflicts with the root directive, the root directive wins.

---

## 1. Repository Identity

| Property | Value |
|---|---|
| Repository | `kudicart-driver-app` |
| Technology | React Native (TypeScript) |
| Role | **Delivery partner execution workflow** — presentation layer |
| Distribution | Google Play Store only (D-028) |

This is a **presentation layer**. The backend owns assignment decisions, order-state validation, and all business authority.

---

## 2. Repository-Level Document Map

```text
kudicart-driver-app/
├── AGENTS.md                ← THIS FILE
├── project_context.md       ← Driver app context
├── SPEC.md                  ← Driver-specific requirements
├── decisions.md             ← Driver-app locked decisions
├── design.md                ← Delivery workflow design
├── PLAN.md                  ← Driver app plan (11 phases)
├── progress.md              ← Driver app progress tracker
├── architecture_prompt.md   ← Driver app architecture guidance
└── src/                     ← Application code (gated by §3)
```

### Context Loading Order

```text
1. .agents/AGENTS.md                 → workspace-wide rules
2. kudicart-driver-app/AGENTS.md     → THIS FILE (repo rules)
3. kudicart-driver-app/progress.md   → current phase, blockers
4. kudicart-driver-app/decisions.md  → locked tech + open decisions
5. kudicart-driver-app/PLAN.md       → active work package
6. KudiCart_progress.md              → master project state
```

---

## 3. Code-Creation Gate (Driver App)

No driver app code may be created until:

1. The master `architecture.md` is approved.
2. The active phase in `kudicart-driver-app/PLAN.md` is bound to concrete file paths.
3. Backend API contracts for delivery/assignment endpoints exist in `kudicart-backend/`.

---

## 4. Driver App Technology Stack (Locked)

| Concern | Technology | Decision ID |
|---|---|---|
| Framework | React Native (TypeScript) | D-013 |
| Authentication | Firebase Auth (Phone/OTP) | D-017 |
| Push Notifications | FCM (client-side) | D-019 |
| Maps / Directions | Google Maps Platform | D-021 |
| Error Tracking | Sentry | D-023 |
| API | REST to kudicart-backend | D-015 |
| Distribution | Google Play Store only | D-028 |

---

## 5. Critical Boundary: NO AUTOMATIC DISPATCH

This is the **most important rule** for this repository:

### 5.1 Manual Assignment Only (D-006)
Delivery-partner assignment is **manual and admin-driven**. The Driver App must **NEVER**:

- Implement nearest-rider selection or matching.
- Implement automatic rider dispatch.
- Implement geo-based rider allocation.
- Show "available nearby orders" for self-selection.
- Contain any background service that auto-assigns.
- Implement distance-based order matching.

The driver **receives** assignments made by Admin. The driver does NOT **find** or **claim** orders.

### 5.2 No Delivery Zones (D-005)
- No zone matching logic.
- No serviceability checks.
- No radius-based filtering.
- No geofencing for delivery areas.

### 5.3 No Route Optimization (D-007)
- No multi-stop route optimization.
- No automated route planning engines.
- Google Maps is for **directions display only**, not route optimization.

---

## 6. Presentation Layer Rules

### 6.1 No Authoritative Business Logic
- The driver app does NOT validate order-state transitions — the backend does.
- The driver app does NOT decide which orders to show — the backend returns assigned orders.
- The driver app does NOT calculate earnings — the backend handles ledger.

### 6.2 No Direct Database Access
- REST API to `kudicart-backend` only.
- No Supabase client SDK.

### 6.3 No Second Auth System
- Firebase Phone/OTP only.

---

## 7. Driver App Scope

### What This App Does

| Feature | Requirement |
|---|---|
| Phone/OTP login | R-RIDER-01 |
| Profile view/edit | R-RIDER-02 |
| KYC status display | R-RIDER-03 |
| Availability toggle (online/offline) | R-RIDER-04 |
| View assigned orders | R-RIDER-05 |
| Accept assigned order | R-RIDER-06 |
| Execute pickup workflow | R-RIDER-07 |
| Execute delivery workflow | R-RIDER-08 |
| Update delivery statuses | R-RIDER-09 |
| Google Maps directions | R-RIDER-10 |
| Push notifications | R-RIDER-11 |
| Sentry error capture | R-PLAT-DRIVER-03 |

### Driver-Relevant Order States

```text
ASSIGNED → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
```

States before ASSIGNED are managed by Vendor/Admin and are not actionable by the driver.

### What This App Must NEVER Implement

| Excluded | Decision | Why It's Critical |
|---|---|---|
| Automatic dispatch / self-assignment | D-006 | **Primary exclusion for this repo** |
| Nearest-rider matching | D-006 | No geo-matching logic |
| Delivery zone/serviceability | D-005 | No zone/radius logic |
| Route optimization | D-007 | Google Maps for display only |
| Customer shopping screens | Out of scope | Wrong actor |
| Vendor/admin screens | Out of scope | Wrong actor |
| Payment processing UI | Out of scope | Drivers don't handle payment |
| Coupon/combo/loyalty UI | D-003, D-004, D-009 | Excluded features |
| Live chat | D-010 | Excluded |
| Multi-language/currency | D-011 | Excluded |

---

## 8. Google Maps Usage Boundary

Google Maps is used for:

| Allowed | Not Allowed |
|---|---|
| Display directions to pickup location | Delivery zone matching |
| Display directions to delivery location | Automatic nearest-rider selection |
| Geocoding for address display | Route optimization engines |
| Opening external maps app for navigation | Distance Matrix as system dependency |
| Showing driver position on map | Real-time continuous location streaming (unless architecture specifies) |

---

## 9. Driver App Open Decisions

Stop and ask the user — do NOT invent resolutions:

| ID | Decision | Impact |
|---|---|---|
| O-DRIVER-01 | Exact delivery partner profile fields | Profile screen |
| O-DRIVER-02 | Exact KYC fields/statuses | KYC status display |
| O-DRIVER-03 | Delivery tracking model/frequency | Tracking behavior |
| O-DRIVER-04 | Notification events for drivers | Push handling |
| O-DRIVER-05 | Availability status states | Toggle behavior |

---

## 10. Shared Code with Customer App

The driver app and `kudicart-customer-app` may share:

- Common TypeScript types / interfaces
- API client utilities
- Firebase auth plumbing
- FCM notification handling
- Sentry configuration patterns

Shared code location is TBD by architecture.

---

## 11. API Dependency Rule

Before implementing any driver app screen:

1. **Verify** the backend endpoint exists (assignment, status update, etc.).
2. **Match** the response shape from the backend contract.
3. **Include** Firebase ID token in every request.
4. If the endpoint does not exist → **STOP**. Backend must be built first.

---

## 12. Environment & Secrets

Required:
- Firebase config (`google-services.json`)
- Backend API base URL
- Google Maps API key (client key)
- Sentry DSN
- FCM sender ID

**No production secrets in source control. No server-side API keys on client.**

---

## 13. Testing Requirements

| Test Type | Required |
|---|---|
| Component tests | Screen rendering, interactions |
| Auth flow tests | Login, OTP, token handling |
| Delivery flow tests | Accept → Pickup → Deliver workflow |
| Maps tests | Direction rendering, navigation links |
| Push notification tests | FCM token registration, tap handling |

Evidence must be recorded in `kudicart-driver-app/progress.md`.

---

## 14. Sync Rules

After completing any driver app work unit, update:

| File | What |
|---|---|
| `kudicart-driver-app/progress.md` | Phase status, checklist, evidence |
| `KudiCart_progress.md` | Master progress (if phase-level change) |
| `KudiCart_PLAN.md` | Phase status (if phase-level change) |

---

## 15. Self-Check (Driver App)

Before completing any turn:

- [ ] Did I implement any form of automatic dispatch or self-assignment? → **DELETE IMMEDIATELY.**
- [ ] Did I add delivery zone/serviceability/radius logic? → Delete.
- [ ] Did I add route optimization? → Delete. Maps is for display only.
- [ ] Did I implement authoritative business logic? → Move to backend.
- [ ] Did I add direct database access? → Remove.
- [ ] Did I create customer/vendor/admin screens? → Wrong repo.
- [ ] Did I add payment processing UI? → Drivers don't handle payment.
- [ ] Did I create iOS build infrastructure? → Remove (Play Store only).
- [ ] Did I silently decide an OPEN item? → Surface to user.
- [ ] Did I update progress.md with evidence? → Do it now.
