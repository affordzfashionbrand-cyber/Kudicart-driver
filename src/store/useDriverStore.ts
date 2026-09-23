import { create } from 'zustand';
import { 
  DEMO_VERIFICATION_MODE, 
  DEMO_DRIVER_PROFILE, 
  DEMO_VEHICLE_PROFILE, 
  DEMO_DOCUMENTS 
} from './demoVerificationState';

export interface DriverProfile {
  id: string; // Internal, can remain
  fullName: string;
  name?: string;
  role?: string;
  status?: string;
  phone?: string;
  tier?: string;
  avatarInitial?: string;
  aadhaarNumber: string;
  panNumber: string;
  dob: string;
  licenseNumber: string;
}

export interface DocumentFile {
  uri: string;
  name: string;
  size: string;
  type: string;
}

export interface DocumentState {
  front: DocumentFile | null;
  back: DocumentFile | null;
}

export interface DocumentsProfile {
  aadhaar: DocumentState;
  pan: DocumentState;
  drivingLicence: DocumentState;
  vehicleRc: DocumentState;
}

export interface VehicleProfile {
  registrationNumber: string;
  vehicleType: string;
  make: string;
  model: string;
  rcStatus?: string;
  rcNumber?: string;
}

interface DriverState {
  profile: DriverProfile;
  vehicle: VehicleProfile;
  documents: DocumentsProfile;
  kyc?: any;
  isOnline?: boolean;
  
  // Actions
  setIsOnline?: (isOnline: boolean) => void;
  updateProfile: (updates: Partial<DriverProfile>) => void;
  updateVehicle: (updates: Partial<VehicleProfile>) => void;
  updateDocument: (docType: keyof DocumentsProfile, side: 'front' | 'back', file: DocumentFile | null) => void;
  clearKycData: () => void;
}

export const useDriverStore = create<DriverState>((set) => ({
  profile: DEMO_VERIFICATION_MODE 
    ? { ...DEMO_DRIVER_PROFILE, name: '', role: '', status: '', phone: '', tier: '', avatarInitial: '' }
    : {
        id: 'KC-DRV-8492', // Static driver ID for now since there's no backend auth
        fullName: '',
        name: '',
        role: '',
        status: '',
        phone: '',
        tier: '',
        avatarInitial: '',
        aadhaarNumber: '',
        panNumber: '',
        dob: '',
        licenseNumber: '',
      },
  vehicle: DEMO_VERIFICATION_MODE 
    ? { ...DEMO_VEHICLE_PROFILE }
    : {
        registrationNumber: '',
        vehicleType: '',
        make: '',
        model: '',
      },
  documents: DEMO_VERIFICATION_MODE 
    ? { ...DEMO_DOCUMENTS }
    : {
        aadhaar: { front: null, back: null },
        pan: { front: null, back: null },
        drivingLicence: { front: null, back: null },
        vehicleRc: { front: null, back: null },
      },
  isOnline: false,
  setIsOnline: (isOnline: boolean) => set({ isOnline }),

  updateProfile: (updates) => set((state) => ({ profile: { ...state.profile, ...updates } })),
  updateVehicle: (updates) => set((state) => ({ vehicle: { ...state.vehicle, ...updates } })),
  updateDocument: (docType, side, file) => set((state) => ({
    documents: {
      ...state.documents,
      [docType]: {
        ...state.documents[docType],
        [side]: file
      }
    }
  })),
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
    documents: {
      aadhaar: { front: null, back: null },
      pan: { front: null, back: null },
      drivingLicence: { front: null, back: null },
      vehicleRc: { front: null, back: null },
    },
  })
}));
