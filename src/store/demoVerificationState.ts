import { useEffect } from 'react';
import { useAuthStore } from './useAuthStore';

// ============================================================================
// TEMPORARY FRONTEND DEMO VERIFICATION FLOW
// ============================================================================
// IMPORTANT: REMOVE THIS MODULE WHEN REAL AUTH/KYC BACKEND INTEGRATION IS ENABLED.
// This module provides deterministic synthetic data to allow the frontend 
// onboarding and KYC flow to be tested without a backend.
// ============================================================================

export const DEMO_VERIFICATION_MODE = true;

export const DEMO_PHONE = '9876543210';
export const DEMO_OTP = '123456';

export const DEMO_DRIVER_PROFILE = {
  id: 'KC-DRV-8492',
  fullName: 'Babajide Samuel Adeleke',
  aadhaarNumber: '1234 5678 9012',
  panNumber: 'ABCDE1234F',
  dob: '15/08/1990',
  licenseNumber: 'TN-14 20230000001',
};

export const DEMO_VEHICLE_PROFILE = {
  registrationNumber: 'TN-14-AB-1234',
  vehicleType: 'Two Wheeler',
  make: 'Honda',
  model: 'Activa 6G',
};

// Synthetic local file structure mimicking a completed document selection
const DEMO_FILE = {
  uri: 'file:///demo/path/image.jpg',
  name: 'document_scan.jpg',
  size: '1.2 MB',
  type: 'image/jpeg'
};

export const DEMO_DOCUMENTS = {
  aadhaar: { front: DEMO_FILE, back: DEMO_FILE },
  pan: { front: DEMO_FILE, back: DEMO_FILE },
  drivingLicence: { front: DEMO_FILE, back: DEMO_FILE },
  vehicleRc: { front: DEMO_FILE, back: DEMO_FILE },
};

/**
 * Configure whether the demo timer resolves to APPROVED or REJECTED.
 * Change this value locally to test the rejected flow.
 */
export const DEMO_VERIFICATION_RESULT: 'APPROVED' | 'REJECTED' = 'REJECTED';

/**
 * TEMPORARY DEMO HOOK
 * Automatically resolves the pending state after 5 seconds to demonstrate the transition.
 */
export const useDemoVerificationTimer = () => {
  const setKycStatus = useAuthStore((state) => state.setKycStatus);

  useEffect(() => {
    if (!DEMO_VERIFICATION_MODE) return;
    
    // Simulate a 5-second backend verification process
    const timer = setTimeout(() => {
      setKycStatus(DEMO_VERIFICATION_RESULT);
    }, 5000);

    return () => clearTimeout(timer);
  }, [setKycStatus]);
};
