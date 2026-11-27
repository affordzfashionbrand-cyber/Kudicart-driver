import { create } from 'zustand';
import { profileApi, ordersApi } from '../api';
import { isLocalFileUri } from '../api/mediaApi';


export interface DriverProfile {
  id: string; // Internal, can remain
  fullName: string;
  name?: string;
  role?: string;
  status?: string;
  phone?: string;
  tier?: string;
  rating?: number;
  completedDeliveries?: number;
  avatarInitial?: string;
  aadhaarNumber: string;
  panNumber: string;
  dob: string;
  licenseNumber: string;
  workPreference: 'FULL_TIME' | 'PART_TIME' | '';
  createdAt?: string | null;
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
  assignedHub?: {
    id: string;
    name: string;
    locality: string;
    address: string;
    lat?: number | null;
    lng?: number | null;
    deliveryMinutes?: number;
  } | null;
  supportConfig?: {
    phone?: string | null;
    email?: string | null;
  };
  cashInHandCod?: number;
  floatingCashLimit?: number;
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
  setIsOnlineAsync: (
    isOnline: boolean,
    coords?: { latitude: number; longitude: number; accuracy?: number },
  ) => Promise<boolean>;
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
    tier: '',
    avatarInitial: 'DP',
    aadhaarNumber: '',
    panNumber: '',
    dob: '',
    licenseNumber: '',
    workPreference: 'FULL_TIME',
    createdAt: null,
  },
  vehicle: {
    registrationNumber: '',
    vehicleType: 'Bike',
    make: '',
    model: '',
    rcStatus: '',
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
    licenseStatus: '',
    licenseNumber: '',
    aadhaarStatus: '',
    aadhaarNumber: '',
    panStatus: '',
  },
  isOnline: false,
  schedule: undefined,
  assignedStore: {
    name: '',
    address: '',
  },
  supportConfig: {},
  workSummary: {
    totalEarnings: 0,
    loginHours: '0h 00m',
    ordersDone: 0,
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
            rating: typeof res.rating === 'number' ? res.rating : state.profile.rating,
            completedDeliveries:
              typeof res.completedDeliveries === 'number'
                ? res.completedDeliveries
                : state.profile.completedDeliveries,
            avatarInitial,
            aadhaarNumber: res.aadhaarNumber || state.profile.aadhaarNumber,
            panNumber: res.panNumber || state.profile.panNumber,
            dob: res.dob || state.profile.dob,
            licenseNumber: res.licenseNumber || state.profile.licenseNumber,
            workPreference: res.workPreference || state.profile.workPreference,
            createdAt: res.createdAt || state.profile.createdAt,
          },
          vehicle: res.vehicle
            ? {
                ...state.vehicle,
                ...res.vehicle,
                rcStatus:
                  res.documents?.vehicleRc?.status ||
                  res.vehicle?.rcStatus ||
                  state.vehicle.rcStatus,
              }
            : state.vehicle,
          kyc: {
            ...state.kyc,
            status: res.kycStatus || state.kyc?.status,
            licenseStatus:
              res.documents?.drivingLicence?.status ||
              res.kycStatus ||
              state.kyc?.licenseStatus,
            aadhaarStatus:
              res.documents?.aadhaar?.status ||
              res.kycStatus ||
              state.kyc?.aadhaarStatus,
            panStatus:
              res.documents?.pan?.status ||
              res.kycStatus ||
              state.kyc?.panStatus,
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
          assignedHub: res.assignedHub !== undefined ? res.assignedHub : state.assignedHub,
          supportConfig: res.supportConfig || state.supportConfig,
          cashInHandCod:
            typeof res.cashInHandCod === 'number' ? res.cashInHandCod : state.cashInHandCod,
          floatingCashLimit:
            typeof res.floatingCashLimit === 'number'
              ? res.floatingCashLimit
              : state.floatingCashLimit,
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
              licenseStatus:
                profileData?.documents?.drivingLicence?.status ||
                state.kyc?.licenseStatus ||
                profileData.kycStatus,
              aadhaarStatus:
                profileData?.documents?.aadhaar?.status ||
                state.kyc?.aadhaarStatus ||
                profileData.kycStatus,
              panStatus:
                profileData?.documents?.pan?.status ||
                state.kyc?.panStatus ||
                profileData.kycStatus,
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

  setIsOnlineAsync: async (
    isOnline: boolean,
    coords?: { latitude: number; longitude: number; accuracy?: number },
  ) => {
    const res = await profileApi.updateAvailability(isOnline, coords);
    set({ isOnline: res.isOnline });
    return true;
  },
  setActiveSurges: (activeSurges: SurgeIncentive[]) => set({ activeSurges }),

  updateProfile: (updates) => {
    const ALLOWED_KEYS: Array<keyof DriverProfile> = [
      'fullName',
      'aadhaarNumber',
      'panNumber',
      'dob',
      'licenseNumber',
      'workPreference',
    ];
    const sanitizedUpdates = ALLOWED_KEYS.reduce((acc, key) => {
      if (updates[key] !== undefined) {
        (acc as any)[key] = updates[key];
      }
      return acc;
    }, {} as Partial<DriverProfile>);

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

    if (Object.keys(sanitizedUpdates).length === 0) {
      return;
    }

    profileApi.updateDetails(sanitizedUpdates).catch((err: any) => {
      const msg = err?.message || 'Unable to save profile details';
      set({ lastError: msg });
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
      return { success: false, error: msg };
    }
  },

  updateVehicle: (updates) => {
    set((state) => ({ vehicle: { ...state.vehicle, ...updates }, lastError: null }));
    profileApi.updateVehicle(updates).catch((err: any) => {
      const msg = err?.message || 'Unable to save vehicle details';
      set({ lastError: msg });
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
