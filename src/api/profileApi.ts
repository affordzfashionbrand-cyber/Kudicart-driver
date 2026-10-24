import { request } from './client';
import { DriverProfile, VehicleProfile, DocumentFile } from '../store/useDriverStore';

export interface DocumentUploadPayload {
  docType: 'aadhaar' | 'pan' | 'drivingLicence' | 'vehicleRc' | 'selfie';
  side?: 'front' | 'back';
  fileUri: string;
  fileName: string;
  fileSize?: string;
  mimeType?: string;
}

export const profileApi = {
  getProfile: async () => {
    return request<any>('/driver/profile', { method: 'GET' });
  },

  updateDetails: async (updates: Partial<DriverProfile>) => {
    return request<any>('/driver/profile/details', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  updateVehicle: async (updates: Partial<VehicleProfile>) => {
    return request<any>('/driver/profile/vehicle', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  uploadDocument: async (payload: DocumentUploadPayload) => {
    return request<any>('/driver/profile/documents/upload', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getKycStatus: async () => {
    return request<any>('/driver/profile/kyc/status', { method: 'GET' });
  },

  submitKyc: async () => {
    return request<any>('/driver/profile/kyc/submit', { method: 'POST' });
  },

  updateAvailability: async (isOnline: boolean) => {
    return request<{ isOnline: boolean; status: string }>('/driver/profile/availability', {
      method: 'PUT',
      body: JSON.stringify({ isOnline }),
    });
  },

  updateLocation: async (coords: { latitude: number; longitude: number; heading?: number }) => {
    return request<any>('/driver/profile/location', {
      method: 'POST',
      body: JSON.stringify(coords),
    });
  },
};
