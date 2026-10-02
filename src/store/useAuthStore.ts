import { create } from 'zustand';


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

  // --- TEMPORARY: Start directly on Verified/Dashboard ---
  isAuthenticated: true,
  phoneNumber: '9876543210',
  kycStatus: 'APPROVED', 
  
  initialPhone: '',
  initialOtp: '',
  login: (token: string, phone: string) => set({ isAuthenticated: true, kycStatus: 'NOT_SUBMITTED', phoneNumber: phone }),
  logout: () => set({ isAuthenticated: false, kycStatus: null, phoneNumber: null }),
  setKycStatus: (status) => set({ kycStatus: status }),
}));
