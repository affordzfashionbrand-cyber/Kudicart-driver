import { create } from 'zustand';

export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

interface AuthState {
  isAuthenticated: boolean;
  phoneNumber: string | null;
  kycStatus: KycStatus | null;
  login: (token: string, phone: string) => void;
  logout: () => void;
  setKycStatus: (status: KycStatus) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  phoneNumber: null,
  kycStatus: 'NOT_SUBMITTED', // Default mock state for demo purposes
  login: (token: string, phone: string) => set({ isAuthenticated: true, kycStatus: 'NOT_SUBMITTED', phoneNumber: phone }),
  logout: () => set({ isAuthenticated: false, kycStatus: null, phoneNumber: null }),
  setKycStatus: (status) => set({ kycStatus: status }),
}));
