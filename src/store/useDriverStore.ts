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

export interface SurgeIncentive {
  id: string;
  type: 'SURGE' | 'RAIN_SURGE';
  headline: string;
  amountText: string;
  bonusAmount: number;
  supportingText: string;
  timeRemaining?: string;
  zone?: string;
  condition?: string;
}

interface DriverState {
  profile: DriverProfile;
  vehicle: VehicleProfile;
  documents: DocumentsProfile;
  kyc?: any;
  isOnline?: boolean;
  activeSurges?: SurgeIncentive[];
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
  setIsOnline: (isOnline: boolean) => void;
  setActiveSurges: (surges: SurgeIncentive[]) => void;
  updateProfile: (updates: Partial<DriverProfile>) => void;
  updateVehicle: (updates: Partial<VehicleProfile>) => void;
  updateDocument: (docType: keyof Omit<DocumentsProfile, 'selfie'>, side: 'front' | 'back', file: DocumentFile | null) => void;
  setSelfie: (file: DocumentFile | null) => void;
  clearKycData: () => void;
}

export const useDriverStore = create<DriverState>((set) => ({
  profile: {
    id: 'KC-DRV-8492',
    fullName: 'Rahul Sharma',
    name: 'Rahul S.',
    role: 'Delivery Partner',
    status: 'Active',
    phone: '+91 98765 43210',
    tier: 'Silver Tier',
    avatarInitial: 'RS',
    aadhaarNumber: '4532 8910 2341',
    panNumber: 'ABCDE1234F',
    dob: '15/08/1996',
    licenseNumber: 'KA-0120220004581',
    workPreference: 'PART_TIME',
  },
  vehicle: {
    registrationNumber: 'KA 05 MJ 4821',
    vehicleType: 'Bike',
    make: 'Honda',
    model: 'Activa 6G',
    rcStatus: 'Under review',
    rcNumber: 'KA 05 MJ 4821',
  },
  documents: {
    aadhaar: {
      front: {
        uri: 'file:///mock/aadhaar_front.jpg',
        name: 'aadhaar_front.jpg',
        size: '2.4 MB',
        type: 'image/jpeg',
      },
      back: {
        uri: 'file:///mock/aadhaar_back.jpg',
        name: 'aadhaar_back.jpg',
        size: '2.1 MB',
        type: 'image/jpeg',
      },
    },
    pan: {
      front: {
        uri: 'file:///mock/pan_card.jpg',
        name: 'pan_card.jpg',
        size: '1.8 MB',
        type: 'image/jpeg',
      },
      back: {
        uri: 'file:///mock/pan_back.jpg',
        name: 'pan_back.jpg',
        size: '1.5 MB',
        type: 'image/jpeg',
      },
    },
    drivingLicence: {
      front: {
        uri: 'file:///mock/driving_licence_front.jpg',
        name: 'driving_licence_front.jpg',
        size: '2.6 MB',
        type: 'image/jpeg',
      },
      back: {
        uri: 'file:///mock/driving_licence_back.jpg',
        name: 'driving_licence_back.jpg',
        size: '2.3 MB',
        type: 'image/jpeg',
      },
    },
    vehicleRc: {
      front: {
        uri: 'file:///mock/rc_book_front.jpg',
        name: 'rc_book_front.jpg',
        size: '2.8 MB',
        type: 'image/jpeg',
      },
      back: {
        uri: 'file:///mock/rc_book_back.jpg',
        name: 'rc_book_back.jpg',
        size: '2.5 MB',
        type: 'image/jpeg',
      },
    },
    selfie: {
      uri: 'file:///mock/driver_selfie.jpg',
      name: 'driver_selfie.jpg',
      size: '1.4 MB',
      type: 'image/jpeg',
    },
  },
  kyc: {
    licenseStatus: 'Under review',
    licenseNumber: 'KA-0120220004581',
    aadhaarStatus: 'Under review',
    aadhaarNumber: '4532 8910 2341',
    panStatus: 'Verified',
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
    totalEarnings: 850,
    loginHours: '4h 15m',
    ordersDone: 8,
    totalSlot: '04:00 PM — 09:00 PM',
    workingDays: '4 / 6 days',
  },
  weeklyBonusProgress: {
    eligibleOrders: 8,
    workingDays: 4,
    status: 'IN_PROGRESS',
  },
  activeSurges: [
    {
      id: 'surge-demand-1',
      type: 'SURGE',
      headline: 'SURGE ACTIVE',
      amountText: '+₹25',
      bonusAmount: 25,
      supportingText: 'Extra earnings per eligible order',
      timeRemaining: 'Ends in 1h 45m',
      zone: 'HSR Darkstore & Koramangala Hub',
      condition: 'Applies automatically to all orders completed during the peak window.',
    },
    {
      id: 'surge-rain-1',
      type: 'RAIN_SURGE',
      headline: 'RAIN SURGE ACTIVE',
      amountText: '+₹35',
      bonusAmount: 35,
      supportingText: 'Applicable weather-related incentive',
      timeRemaining: 'Active now · Rain detected',
      zone: 'Southeast Bengaluru Delivery Zones',
      condition: 'Added directly to base order payout during active rain conditions.',
    },
  ],
  setIsOnline: (isOnline: boolean) => set({ isOnline }),
  setActiveSurges: (activeSurges: SurgeIncentive[]) => set({ activeSurges }),

  updateProfile: (updates) =>
    set((state) => {
      const updatedProfile = { ...state.profile, ...updates };
      if (updates.fullName) {
        const parts = updates.fullName.trim().split(' ');
        const first = parts[0] || '';
        const lastInitial = parts.length > 1 ? ` ${parts[parts.length - 1][0]}.` : '';
        updatedProfile.name = `${first}${lastInitial}`;
        updatedProfile.avatarInitial = parts.map((p) => p[0]).slice(0, 2).join('').toUpperCase() || 'DP';
      }
      return { profile: updatedProfile };
    }),
  setIsOnline: (isOnline: boolean) => set({ isOnline }),
  setActiveSurges: (activeSurges: SurgeIncentive[]) => set({ activeSurges }),
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
