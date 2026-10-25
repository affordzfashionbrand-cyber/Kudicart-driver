import { create } from 'zustand';
import { profileApi, ordersApi } from '../api';


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
  
  fetchProfileAsync: () => Promise<void>;
  fetchDashboardAsync: () => Promise<void>;
  setIsOnline: (isOnline: boolean) => void;
  setIsOnlineAsync: (isOnline: boolean) => Promise<boolean>;
  setActiveSurges: (surges: SurgeIncentive[]) => void;
  updateProfile: (updates: Partial<DriverProfile>) => void;
  updateVehicle: (updates: Partial<VehicleProfile>) => void;
  updateDocument: (docType: keyof Omit<DocumentsProfile, 'selfie'>, side: 'front' | 'back', file: DocumentFile | null) => void;
  setSelfie: (file: DocumentFile | null) => void;
  clearKycData: () => void;
}

export const useDriverStore = create<DriverState>((set) => ({
  profile: {
    id: '',
    fullName: '',
    name: '',
    role: 'Delivery Partner',
    status: 'Active',
    phone: '',
    tier: 'Silver Tier',
    avatarInitial: 'DP',
    aadhaarNumber: '',
    panNumber: '',
    dob: '',
    licenseNumber: '',
    workPreference: 'FULL_TIME',
  },
  vehicle: {
    registrationNumber: '',
    vehicleType: 'Bike',
    make: '',
    model: '',
    rcStatus: 'Under review',
    rcNumber: '',
  },
  documents: {
    aadhaar: { front: null, back: null },
    pan: { front: null, back: null },
    drivingLicence: { front: null, back: null },
    vehicleRc: { front: null, back: null },
    selfie: null,
  },
  kyc: {
    licenseStatus: 'Under review',
    licenseNumber: '',
    aadhaarStatus: 'Under review',
    aadhaarNumber: '',
    panStatus: 'Under review',
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
    totalEarnings: 0,
    loginHours: '0h 00m',
    ordersDone: 0,
    totalSlot: '09:00 AM — 06:00 PM',
    workingDays: '0 / 6 days',
  },
  weeklyBonusProgress: {
    eligibleOrders: 0,
    workingDays: 0,
    status: 'IN_PROGRESS',
  },
  activeSurges: [],

  fetchProfileAsync: async () => {
    try {
      const res = await profileApi.getProfile();
      if (!res) return;
      set((state) => {
        const fullName = res.fullName || res.name || state.profile.fullName;
        const parts = (fullName || '').trim().split(' ');
        const first = parts[0] || '';
        const lastInitial = parts.length > 1 ? ` ${parts[parts.length - 1][0]}.` : '';
        const name = res.name || (first ? `${first}${lastInitial}` : state.profile.name);
        const avatarInitial =
          res.avatarInitial ||
          (parts.length > 0 && parts[0]
            ? parts
                .map((p: string) => p[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
            : state.profile.avatarInitial);

        return {
          profile: {
            ...state.profile,
            id: res.id || state.profile.id,
            fullName,
            name,
            role: res.role || state.profile.role,
            status: res.status || state.profile.status,
            phone: res.phone || state.profile.phone,
            tier: res.tier || state.profile.tier,
            avatarInitial,
            aadhaarNumber: res.aadhaarNumber || state.profile.aadhaarNumber,
            panNumber: res.panNumber || state.profile.panNumber,
            dob: res.dob || state.profile.dob,
            licenseNumber: res.licenseNumber || state.profile.licenseNumber,
            workPreference: res.workPreference || state.profile.workPreference,
          },
          vehicle: res.vehicle ? { ...state.vehicle, ...res.vehicle } : state.vehicle,
          kyc: {
            ...state.kyc,
            status: res.kycStatus || state.kyc?.status,
            licenseStatus: res.kycStatus || state.kyc?.licenseStatus,
            aadhaarStatus: res.kycStatus || state.kyc?.aadhaarStatus,
            panStatus: res.kycStatus || state.kyc?.panStatus,
            ...(res.kyc || {}),
          },
          isOnline: typeof res.isOnline === 'boolean' ? res.isOnline : state.isOnline,
          assignedStore: res.assignedStore || state.assignedStore,
          workSummary: res.workSummary || state.workSummary,
        };
      });
    } catch {
      // Offline or unauthenticated
    }
  },

  fetchDashboardAsync: async () => {
    try {
      const data = await ordersApi.getDashboard();
      if (!data) return;
      set((state) => {
        const profileData = data.profile;
        let updatedProfile = state.profile;
        if (profileData) {
          const fullName = profileData.fullName || profileData.name || state.profile.fullName;
          const parts = (fullName || '').trim().split(' ');
          const first = parts[0] || '';
          const lastInitial = parts.length > 1 ? ` ${parts[parts.length - 1][0]}.` : '';
          const name = profileData.name || (first ? `${first}${lastInitial}` : state.profile.name);
          const avatarInitial =
            profileData.avatarInitial ||
            (parts.length > 0 && parts[0]
              ? parts
                  .map((p: string) => p[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
              : state.profile.avatarInitial);

          updatedProfile = {
            ...state.profile,
            id: profileData.id || state.profile.id,
            fullName,
            name,
            role: profileData.role || state.profile.role,
            phone: profileData.phone || state.profile.phone,
            tier: profileData.tier || state.profile.tier,
            avatarInitial,
            workPreference: profileData.workPreference || state.profile.workPreference,
            status: profileData.status || state.profile.status,
          };
        }

        return {
          profile: updatedProfile,
          isOnline: typeof data.isOnline === 'boolean' ? data.isOnline : state.isOnline,
          workSummary: data.workSummary || state.workSummary,
          activeSurges: Array.isArray(data.activeSurges) ? data.activeSurges : state.activeSurges,
        };
      });
    } catch {
      // Offline fallback
    }
  },

  setIsOnline: (isOnline: boolean) => set({ isOnline }),

  setIsOnlineAsync: async (isOnline: boolean) => {
    const res = await profileApi.updateAvailability(isOnline);
    set({ isOnline: res.isOnline });
    return true;
  },
  setActiveSurges: (activeSurges: SurgeIncentive[]) => set({ activeSurges }),

  updateProfile: (updates) => {
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
    });
    profileApi.updateDetails(updates).catch(() => {});
  },

  updateVehicle: (updates) => {
    set((state) => ({ vehicle: { ...state.vehicle, ...updates } }));
    profileApi.updateVehicle(updates).catch(() => {});
  },

  updateDocument: (docType, side, file) => {
    set((state) => ({
      documents: {
        ...state.documents,
        [docType]: {
          ...(state.documents[docType] as DocumentState),
          [side]: file,
        },
      },
    }));
    if (file) {
      profileApi.uploadDocument({
        docType: docType as any,
        side,
        fileUri: file.uri,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      }).catch(() => {});
    }
  },

  setSelfie: (file) => {
    set((state) => ({
      documents: {
        ...state.documents,
        selfie: file,
      },
    }));
    if (file) {
      profileApi.uploadDocument({
        docType: 'selfie',
        fileUri: file.uri,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      }).catch(() => {});
    }
  },
  clearKycData: () => set({
    profile: {
      id: '',
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
