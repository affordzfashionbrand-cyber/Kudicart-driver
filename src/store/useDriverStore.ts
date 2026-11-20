import { create } from 'zustand';
import { profileApi, ordersApi } from '../api';
import { isLocalFileUri } from '../api/mediaApi';
import { toast } from './useToastStore';


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
  lastError: string | null;

  fetchProfileAsync: () => Promise<void>;
  fetchDashboardAsync: () => Promise<void>;
  setIsOnline: (isOnline: boolean) => void;
  setIsOnlineAsync: (isOnline: boolean) => Promise<boolean>;
  setActiveSurges: (surges: SurgeIncentive[]) => void;
  updateProfile: (updates: Partial<DriverProfile>) => void;
  updateProfileAsync: (updates: Partial<DriverProfile>) => Promise<{ success: boolean; error?: string }>;
  updateVehicle: (updates: Partial<VehicleProfile>) => void;
  updateVehicleAsync: (updates: Partial<VehicleProfile>) => Promise<{ success: boolean; error?: string }>;
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
  lastError: null,

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
            rejectionReason: res.rejectionReason || state.kyc?.rejectionReason,
            ...(res.kyc || {}),
          },
          documents: res.documents
            ? {
                aadhaar: {
                  ...state.documents.aadhaar,
                  ...(res.documents.aadhaar || {}),
                  front: res.documents.aadhaar?.front || state.documents.aadhaar?.front || null,
                  back: res.documents.aadhaar?.back || state.documents.aadhaar?.back || null,
                },
                pan: {
                  ...state.documents.pan,
                  ...(res.documents.pan || {}),
                  front: res.documents.pan?.front || state.documents.pan?.front || null,
                  back: res.documents.pan?.back || state.documents.pan?.back || null,
                },
                drivingLicence: {
                  ...state.documents.drivingLicence,
                  ...(res.documents.drivingLicence || {}),
                  front: res.documents.drivingLicence?.front || state.documents.drivingLicence?.front || null,
                  back: res.documents.drivingLicence?.back || state.documents.drivingLicence?.back || null,
                },
                vehicleRc: {
                  ...state.documents.vehicleRc,
                  ...(res.documents.vehicleRc || {}),
                  front: res.documents.vehicleRc?.front || state.documents.vehicleRc?.front || null,
                  back: res.documents.vehicleRc?.back || state.documents.vehicleRc?.back || null,
                },
                selfie: res.documents.selfie || state.documents.selfie,
              }
            : state.documents,
          isOnline: typeof res.isOnline === 'boolean' ? res.isOnline : state.isOnline,
          assignedStore: res.assignedStore || state.assignedStore,
          workSummary: res.workSummary || state.workSummary,
          lastError: null,
        };
      });
    } catch (err: any) {
      set({ lastError: err?.message || 'Unable to load driver profile' });
    }
  },

  fetchDashboardAsync: async () => {
    try {
      const data = await ordersApi.getDashboard();
      if (!data) return;
      set((state) => {
        const profileData = data.profile || data.driver;
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

        const hasBackendWorkMetrics =
          typeof data.todayEarnings === 'number' ||
          typeof data.deliveriesCompletedToday === 'number';
        const resolvedWorkSummary =
          data.workSummary ||
          (hasBackendWorkMetrics
            ? {
                ...(state.workSummary || {
                  totalEarnings: 0,
                  loginHours: '0h 00m',
                  ordersDone: 0,
                }),
                totalEarnings:
                  typeof data.todayEarnings === 'number'
                    ? data.todayEarnings
                    : state.workSummary?.totalEarnings ?? 0,
                ordersDone:
                  typeof data.deliveriesCompletedToday === 'number'
                    ? data.deliveriesCompletedToday
                    : state.workSummary?.ordersDone ?? 0,
              }
            : state.workSummary);

        const resolvedKyc = profileData?.kycStatus
          ? {
              ...state.kyc,
              status: profileData.kycStatus,
              licenseStatus: state.kyc?.licenseStatus || profileData.kycStatus,
              aadhaarStatus: state.kyc?.aadhaarStatus || profileData.kycStatus,
              panStatus: state.kyc?.panStatus || profileData.kycStatus,
              rejectionReason: profileData?.rejectionReason || state.kyc?.rejectionReason,
            }
          : state.kyc;

        const resolvedDocuments = profileData?.documents
          ? {
              aadhaar: {
                ...state.documents.aadhaar,
                ...(profileData.documents.aadhaar || {}),
                front: profileData.documents.aadhaar?.front || state.documents.aadhaar?.front || null,
                back: profileData.documents.aadhaar?.back || state.documents.aadhaar?.back || null,
              },
              pan: {
                ...state.documents.pan,
                ...(profileData.documents.pan || {}),
                front: profileData.documents.pan?.front || state.documents.pan?.front || null,
                back: profileData.documents.pan?.back || state.documents.pan?.back || null,
              },
              drivingLicence: {
                ...state.documents.drivingLicence,
                ...(profileData.documents.drivingLicence || {}),
                front: profileData.documents.drivingLicence?.front || state.documents.drivingLicence?.front || null,
                back: profileData.documents.drivingLicence?.back || state.documents.drivingLicence?.back || null,
              },
              vehicleRc: {
                ...state.documents.vehicleRc,
                ...(profileData.documents.vehicleRc || {}),
                front: profileData.documents.vehicleRc?.front || state.documents.vehicleRc?.front || null,
                back: profileData.documents.vehicleRc?.back || state.documents.vehicleRc?.back || null,
              },
              selfie: profileData.documents.selfie || state.documents.selfie,
            }
          : state.documents;

        return {
          profile: updatedProfile,
          kyc: resolvedKyc,
          documents: resolvedDocuments,
          isOnline:
            typeof data.isOnline === 'boolean'
              ? data.isOnline
              : typeof profileData?.isOnline === 'boolean'
                ? profileData.isOnline
                : state.isOnline,
          workSummary: resolvedWorkSummary,
          activeSurges: Array.isArray(data.activeSurges) ? data.activeSurges : state.activeSurges,
          lastError: null,
        };
      });
    } catch (err: any) {
      set({ lastError: err?.message || 'Unable to load driver dashboard' });
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
      return { profile: updatedProfile, lastError: null };
    });
    profileApi.updateDetails(updates).catch((err: any) => {
      const msg = err?.message || 'Unable to save profile details';
      set({ lastError: msg });
      try {
        toast.show({ type: 'error', message: msg });
      } catch {}
    });
  },

  updateProfileAsync: async (updates) => {
    set((state) => {
      const updatedProfile = { ...state.profile, ...updates };
      if (updates.fullName) {
        const parts = updates.fullName.trim().split(' ');
        const first = parts[0] || '';
        const lastInitial = parts.length > 1 ? ` ${parts[parts.length - 1][0]}.` : '';
        updatedProfile.name = `${first}${lastInitial}`;
        updatedProfile.avatarInitial = parts.map((p) => p[0]).slice(0, 2).join('').toUpperCase() || 'DP';
      }
      return { profile: updatedProfile, lastError: null };
    });

    try {
      const res = await profileApi.updateDetails(updates);
      if (res) {
        set((state) => ({
          profile: {
            ...state.profile,
            ...(res.profile || res),
          },
          lastError: null,
        }));
      }
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Unable to save profile details';
      set({ lastError: msg });
      try {
        toast.show({ type: 'error', message: msg });
      } catch {}
      return { success: false, error: msg };
    }
  },

  updateVehicle: (updates) => {
    set((state) => ({ vehicle: { ...state.vehicle, ...updates }, lastError: null }));
    profileApi.updateVehicle(updates).catch((err: any) => {
      const msg = err?.message || 'Unable to save vehicle details';
      set({ lastError: msg });
      try {
        toast.show({ type: 'error', message: msg });
      } catch {}
    });
  },

  updateVehicleAsync: async (updates) => {
    set((state) => ({ vehicle: { ...state.vehicle, ...updates }, lastError: null }));
    try {
      const res = await profileApi.updateVehicle(updates);
      if (res) {
        set((state) => ({
          vehicle: {
            ...state.vehicle,
            ...(res.vehicle || res),
          },
          lastError: null,
        }));
      }
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Unable to save vehicle details';
      set({ lastError: msg });
      try {
        toast.show({ type: 'error', message: msg });
      } catch {}
      return { success: false, error: msg };
    }
  },

  updateDocument: (docType, side, file) => {
    set((state) => {
      const existingDoc = (state.documents[docType] as any) || {};
      return {
        lastError: null,
        documents: {
          ...state.documents,
          [docType]: {
            ...existingDoc,
            [side]: file,
            status: 'PENDING',
            rejectionReason: null,
            isReuploaded: true,
          },
        },
      };
    });
    if (file && isLocalFileUri(file.uri)) {
      profileApi
        .uploadDocument({
          docType: docType as any,
          side,
          fileUri: file.uri,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        })
        .then((res: any) => {
          if (res?.documents?.[docType]) {
            set((state) => ({
              documents: {
                ...state.documents,
                [docType]: {
                  ...(state.documents[docType] as any),
                  ...res.documents[docType],
                  isReuploaded: true,
                },
              },
            }));
          }
        })
        .catch((err: any) => {
          const msg = err?.message || 'Unable to upload KYC document';
          set({ lastError: msg });
          try {
            toast.show({ type: 'error', message: msg });
          } catch {}
        });
    }
  },

  setSelfie: (file) => {
    set((state) => ({
      lastError: null,
      documents: {
        ...state.documents,
        selfie: file,
      },
    }));
    if (file && isLocalFileUri(file.uri)) {
      profileApi
        .uploadDocument({
          docType: 'selfie',
          fileUri: file.uri,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        })
        .catch((err: any) => {
          const msg = err?.message || 'Unable to upload selfie';
          set({ lastError: msg });
          try {
            toast.show({ type: 'error', message: msg });
          } catch {}
        });
    }
  },
  clearKycData: () => {
    try {
      const { useAuthStore } = require('./useAuthStore');
      useAuthStore.getState().setHasSeenKycApproved(false);
    } catch {}
    set({
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
    });
  },
}));
