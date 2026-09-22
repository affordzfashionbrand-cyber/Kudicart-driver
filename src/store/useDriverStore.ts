import { create } from 'zustand';

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  role: string;
  tier: string;
  status: string; // e.g., 'Active Fleet'
  avatarInitial: string;
}

export interface DriverVehicle {
  rcStatus: string;
  rcNumber: string;
}

export interface DriverKyc {
  licenseStatus: string;
  licenseNumber: string;
  aadhaarStatus: string;
  aadhaarNumber: string;
}

interface DriverState {
  profile: DriverProfile;
  vehicle: DriverVehicle;
  kyc: DriverKyc;
  isOnline: boolean;
  
  // Actions
  setIsOnline: (online: boolean) => void;
  updateProfile: (updates: Partial<DriverProfile>) => void;
}

export const useDriverStore = create<DriverState>((set) => ({
  profile: {
    id: 'KC-DRV-8492',
    name: 'Arjun Sharma',
    phone: '+91 98765 43210',
    role: 'Fleet Delivery Partner',
    tier: 'Tier 1 Secured',
    status: 'Active Fleet',
    avatarInitial: 'AS',
  },
  vehicle: {
    rcStatus: 'Verified',
    rcNumber: 'KA - 05 - •• 41',
  },
  kyc: {
    licenseStatus: 'Verified',
    licenseNumber: 'DL - •••• 9024',
    aadhaarStatus: 'Verified',
    aadhaarNumber: 'UID - •••• 7381',
  },
  isOnline: false,

  setIsOnline: (online) => set({ isOnline: online }),
  updateProfile: (updates) => set((state) => ({ profile: { ...state.profile, ...updates } })),
}));
