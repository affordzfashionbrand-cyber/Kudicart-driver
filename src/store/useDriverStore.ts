import { create } from 'zustand';


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
  workPreference: 'FULL_TIME' | 'PART_TIME' | '';
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
  selfie: DocumentFile | null;
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
  schedule?: {
    timeRange: string;
    status: 'BEFORE_START' | 'IN_PROGRESS' | 'COMPLETED';
  };
  assignedStore?: {
    name: string;
    address: string;
  };
  workSummary?: {
    totalEarnings: number;
    loginHours: string;
    ordersDone: number;
    totalSlot?: string;
    workingDays?: string;
  };
  weeklyBonusProgress?: {
    eligibleOrders: number;
    workingDays: number;
    status: 'IN_PROGRESS' | 'ELIGIBLE';
  };
  
  // Actions
  setIsOnline?: (isOnline: boolean) => void;
  updateProfile: (updates: Partial<DriverProfile>) => void;
  updateVehicle: (updates: Partial<VehicleProfile>) => void;
  updateDocument: (docType: keyof Omit<DocumentsProfile, 'selfie'>, side: 'front' | 'back', file: DocumentFile | null) => void;
  setSelfie: (file: DocumentFile | null) => void;
  clearKycData: () => void;
}

export const useDriverStore = create<DriverState>((set) => ({
  profile: {
    id: 'KC-DRV-8492',
    fullName: 'Babajide Samuel Adeleke',
    name: 'Babajide A.',
    role: 'Delivery Partner',
    status: 'Active',
    phone: '+91 9876543210',
    tier: 'Gold Tier',
    avatarInitial: 'BA',
    aadhaarNumber: 'XXXX-XXXX-1234',
    panNumber: 'ABCDE1234F',
    dob: '01/01/1990',
    licenseNumber: 'TN-1420230000001',
    workPreference: 'FULL_TIME',
  },
  vehicle: {
    registrationNumber: 'MH 12 AB 1234',
    vehicleType: 'Two Wheeler',
    make: 'Honda',
    model: 'Activa 6G',
    rcStatus: 'Verified',
  },
  documents: {
    aadhaar: { front: null, back: null },
    pan: { front: null, back: null },
    drivingLicence: { front: null, back: null },
    vehicleRc: { front: null, back: null },
    selfie: null,
  },
  kyc: {
    licenseStatus: 'Verified',
    licenseNumber: 'DL-14202100',
    aadhaarStatus: 'Verified',
    aadhaarNumber: 'XXXX-XXXX-1234',
  },
  isOnline: false,
  schedule: {
    timeRange: '09:00 AM — 06:00 PM',
    status: 'IN_PROGRESS',
  },
  assignedStore: {
    name: 'KudiCart Darkstore',
    address: 'HSR Sector 2, 12th Main Road, Bengaluru — 560102',
  },
  workSummary: {
    totalEarnings: 840.50,
    loginHours: '6h 42m',
    ordersDone: 14,
    totalSlot: '04:00 PM — 09:00 PM', // This will only be shown for PART_TIME
    workingDays: '5 / 6 days' // This will be shown for FULL_TIME
  },
  weeklyBonusProgress: {
    eligibleOrders: 64,
    workingDays: 5,
    status: 'IN_PROGRESS',
  },
  setIsOnline: (isOnline: boolean) => set({ isOnline }),

  updateProfile: (updates) => set((state) => ({ profile: { ...state.profile, ...updates } })),
  updateVehicle: (updates) => set((state) => ({ vehicle: { ...state.vehicle, ...updates } })),
  updateDocument: (docType, side, file) => set((state) => ({
    documents: {
      ...state.documents,
      [docType]: {
        ...(state.documents[docType] as DocumentState),
        [side]: file
      }
    }
  })),
  setSelfie: (file) => set((state) => ({
    documents: {
      ...state.documents,
      selfie: file
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
      workPreference: '',
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
      selfie: null,
    },
  })
}));
