# Temporary Frontend Demo Verification Flow

**STATUS: TEMPORARY**  
**ACTION REQUIRED: REMOVE WHEN REAL BACKEND AUTH/KYC INTEGRATION IS ENABLED.**

This project currently includes a temporary demo state boundary to enable testing the entire Driver onboarding, KYC, and approval flow end-to-end purely on the frontend. The architecture isolates the "fake" data to ensure the actual screen UI components remain reusable and production-ready.

## How to Disable Demo Mode

To disable this demo mode and require actual data, locate `src/store/demoVerificationState.ts` and set:

```ts
export const DEMO_VERIFICATION_MODE = false;
```

## How It Works

### 1. Centralized Data Source
- **File**: `src/store/demoVerificationState.ts`
- **Purpose**: Stores the hardcoded deterministic synthetic data for the phone number, OTP, driver profile, vehicle profile, and mock document references. It also houses the `useDemoVerificationTimer` hook.

### 2. Form Auto-population
The demo system uses Dependency Injection via Zustand to populate the initial state. The individual screens do not contain `if (demoMode)` logic.

- **Phone Number (`PhoneLoginScreen.tsx`)**: Reads `initialPhone` from `useAuthStore`.
- **OTP (`OtpVerificationScreen.tsx`)**: Reads `initialOtp` from `useAuthStore`.
- **Driver / Vehicle / Documents**: `useDriverStore.ts` checks `DEMO_VERIFICATION_MODE` and initializes its default state with the synthetic demo data. Because the screens (`DriverDetailsScreen`, `VehicleDetailsScreen`, `DocumentUploadsScreen`) natively bind to `useDriverStore`, they automatically appear pre-filled and completed without knowing the data is fake.

### 3. Verification Approval/Rejection Timer
- **File**: `src/features/kyc/VerificationPendingScreen.tsx` & `src/store/demoVerificationState.ts`
- **Behavior**: Calls the `useDemoVerificationTimer()` hook. This hook waits exactly 5 seconds, then sets the global `kycStatus` to the value of `DEMO_VERIFICATION_RESULT` (either `APPROVED` or `REJECTED`).
- **How to Test REJECTED**: In `src/store/demoVerificationState.ts`, change `export const DEMO_VERIFICATION_RESULT = 'APPROVED';` to `'REJECTED'`. When the pending timer finishes, it will seamlessly route to the new `VerificationRejectedScreen`. Pressing "Review & Resubmit" drops the user back into the editable KYC flow.

## Files to Modify/Remove Later

When the real backend is integrated, perform the following cleanup:

1. **Delete**: `src/store/demoVerificationState.ts` completely.
2. **Delete**: `demo_verification_flow.md` (this file).
3. **Update `src/store/useAuthStore.ts`**:
   - Remove `initialPhone` and `initialOtp` variables and types.
   - Remove the import for `demoVerificationState.ts`.
4. **Update `src/store/useDriverStore.ts`**:
   - Remove the import for `demoVerificationState.ts`.
   - Revert the `profile`, `vehicle`, and `documents` initial states to empty strings and `null` values.
5. **Update `src/features/auth/PhoneLoginScreen.tsx`**:
   - Remove the use of `initialPhone`. Change `useState(initialPhone || '')` back to `useState('')`.
6. **Update `src/features/auth/OtpVerificationScreen.tsx`**:
   - Remove the use of `initialOtp`. Change the `useState` initialization back to `['', '', '', '', '', '']`.
7. **Update `src/features/kyc/VerificationPendingScreen.tsx`**:
   - Remove the `useDemoVerificationTimer();` hook and its import. Real polling or push notifications should trigger the `kycStatus` change instead.
