import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  login: (token: string) => void;
  logout: () => void;
  setKycStatus: (status: 'PENDING' | 'APPROVED' | 'REJECTED') => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  kycStatus: null, // Initially null, set upon login
  login: (token: string) => set({ isAuthenticated: true, kycStatus: 'APPROVED' }), // Mock set to APPROVED for testing main flow
  logout: () => set({ isAuthenticated: false, kycStatus: null }),
  setKycStatus: (status) => set({ kycStatus: status }),
}));
