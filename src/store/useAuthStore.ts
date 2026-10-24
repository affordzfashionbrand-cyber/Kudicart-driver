import { create } from 'zustand';
import { useDriverStore } from './useDriverStore';

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
  // Default mock state configured to land directly on Verification Approved (Success) on reload
  isAuthenticated: true,
  phoneNumber: '9876543210',
  kycStatus: 'APPROVED',
  
  initialPhone: '9876543210',
  initialOtp: '123456',
  login: (token: string, phone: string) =>
    set({ isAuthenticated: true, kycStatus: 'PENDING', phoneNumber: phone }),
  logout: () => {
    set({ isAuthenticated: false, kycStatus: null, phoneNumber: null });
  },
  setKycStatus: (status) => set({ kycStatus: status }),
}));
