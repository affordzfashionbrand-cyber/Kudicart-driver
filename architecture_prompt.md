# KudiCart Driver App — Architecture Prompt

> **Purpose:** Guide the creation of the Driver App's detailed architecture.

---

# 1. Context
The Driver App is a React Native mobile application for delivery partners. It is one of four KudiCart repositories.

---

# 2. Architecture Decisions Required

## React Native Project Structure
- Folder/module organization.
- Screen organization.
- Component organization.
- Navigation structure.

## State Management
- Availability state, order state, auth state.
- API caching strategy.

## API Client
- HTTP client, auth headers, error handling.
- Type-safe API contracts.

## Authentication
- Firebase Phone/OTP integration.
- Token lifecycle.

## Google Maps Integration
- React Native Maps library.
- Direction rendering.
- Navigation to external maps.
- API key management.

## Push Notifications
- FCM React Native integration.
- New assignment notification flow.

## Error Tracking
- Sentry React Native setup.

## Shared Code Strategy
- Shared code with kudicart-customer-app.

---

# 3. Screen Architecture

### Auth Flow
Splash → Login → OTP → Home Dashboard

### Main Flow
- Dashboard (availability toggle, current orders)
- Assigned Orders List
- Order Detail (with maps/directions)
- Order History
- Profile / KYC Status
- Notifications

### Delivery Execution Flow
- Accept Order → Navigate to Pickup → Confirm Pickup → Navigate to Delivery → Confirm Delivery

---

# 4. Constraints
1. No automatic dispatch or rider matching.
2. No delivery zones or route optimization.
3. Presentation layer only — backend owns business logic.
4. Google Play Store only.
5. No excluded feature UI.

---

# 5. Architecture Output Expected
1. Folder structure with responsibilities.
2. Navigation architecture.
3. State management approach.
4. API client architecture.
5. Google Maps integration architecture.
6. FCM notification architecture.
7. Testing strategy.
8. Build/release process.
9. Shared code strategy with customer app.
