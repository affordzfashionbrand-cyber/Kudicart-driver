import { create } from 'zustand';
import { DEMO_VERIFICATION_MODE, DEMO_PHONE, DEMO_OTP } from './demoVerificationState';

export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

interface AuthState {
  isAuthenticated: boolean;
  phoneNumber: string | null;
  kycStatus: KycStatus | null;
  initialPhone: string;
  initialOtp: string;
  login: (token: string, phone: string) => void;
  logout: () => void;
  setKycStatus: (status: KycStatus) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // --- ORIGINAL STATE (Uncomment for production/testing flow) ---
  // isAuthenticated: false,
  // phoneNumber: null,
  // kycStatus: 'NOT_SUBMITTED', 
  
  // --- TEMPORARY FOR DEVELOPMENT: Start directly on the Dashboard ---
  isAuthenticated: true,
  phoneNumber: DEMO_VERIFICATION_MODE ? DEMO_PHONE : null,
  kycStatus: 'APPROVED', 
  
  initialPhone: DEMO_VERIFICATION_MODE ? DEMO_PHONE : '',
  initialOtp: DEMO_VERIFICATION_MODE ? DEMO_OTP : '',
  login: (token: string, phone: string) => set({ isAuthenticated: true, kycStatus: 'NOT_SUBMITTED', phoneNumber: phone }),
  logout: () => set({ isAuthenticated: false, kycStatus: null, phoneNumber: null }),
  setKycStatus: (status) => set({ kycStatus: status }),
}));
