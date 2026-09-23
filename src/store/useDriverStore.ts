import { create } from 'zustand';

export interface DriverProfile {
  id: string; // Internal, can remain
  fullName: string;
  aadhaarNumber: string;
  panNumber: string;
  dob: string;
  licenseNumber: string;
}

export interface RcDocument {
  uri: string;
  name: string;
  size: string;
  type: string;
}

export interface VehicleProfile {
  registrationNumber: string;
  vehicleType: string;
  make: string;
  model: string;
}

interface DriverState {
  profile: DriverProfile;
  vehicle: VehicleProfile;
  rcDocument: RcDocument | null;
  
  // Actions
  updateProfile: (updates: Partial<DriverProfile>) => void;
  updateVehicle: (updates: Partial<VehicleProfile>) => void;
  setRcDocument: (doc: RcDocument | null) => void;
  clearKycData: () => void;
}

export const useDriverStore = create<DriverState>((set) => ({
  profile: {
    id: 'KC-DRV-8492', // Static driver ID for now since there's no backend auth
    fullName: '',
    aadhaarNumber: '',
    panNumber: '',
    dob: '',
    licenseNumber: '',
  },
  vehicle: {
    registrationNumber: '',
    vehicleType: '',
    make: '',
    model: '',
  },
  rcDocument: null,

  updateProfile: (updates) => set((state) => ({ profile: { ...state.profile, ...updates } })),
  updateVehicle: (updates) => set((state) => ({ vehicle: { ...state.vehicle, ...updates } })),
  setRcDocument: (doc) => set({ rcDocument: doc }),
  clearKycData: () => set({
    profile: {
      id: 'KC-DRV-8492',
      fullName: '',
      aadhaarNumber: '',
      panNumber: '',
      dob: '',
      licenseNumber: '',
    },
    vehicle: {
      registrationNumber: '',
      vehicleType: '',
      make: '',
      model: '',
    },
    rcDocument: null,
  })
}));
