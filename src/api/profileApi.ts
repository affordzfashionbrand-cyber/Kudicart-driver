import { getApiBaseUrl, getAuthToken, request } from './client';
import { isLocalFileUri, uploadMediaFile } from './mediaApi';
import { DriverProfile, VehicleProfile } from '../store/useDriverStore';

export interface DocumentUploadPayload {
  docType: 'aadhaar' | 'pan' | 'drivingLicence' | 'vehicleRc' | 'selfie';
  side?: 'front' | 'back';
  fileUri: string;
  fileName: string;
  fileSize?: string;
  mimeType?: string;
}

export interface AppVersionStatus {
  currentVersion: string | null;
  latestVersion: string | null;
  minSupportedVersion: string | null;
  updateAvailable: boolean;
  forceUpdate: boolean;
  updateUrl: string | null;
  releaseNotes: string | null;
  checkedAt?: string;
}

export const profileApi = {
  getProfile: async () => {
    return request<any>('/driver/profile', { method: 'GET' });
  },

  acknowledgeApproval: async () => {
    return request<{
      success: boolean;
      driverId: string;
      hasSeenApproval: boolean;
      approvalAcknowledgedAt: string;
    }>('/driver/profile/approval-acknowledge', {
      method: 'POST',
    });
  },

  getAppVersionStatus: async (currentVersion: string): Promise<AppVersionStatus> => {
    return request<AppVersionStatus>(
      `/driver/profile/app-version?currentVersion=${encodeURIComponent(currentVersion)}`,
      { method: 'GET' },
    );
  },

  getDocumentFileUrl: (docType: string, side = 'front', download = false): string => {
    const base = getApiBaseUrl().replace(/\/+$/, '').replace(/\/api\/v1$/, '');
    return `${base}/api/v1/driver/profile/documents/${encodeURIComponent(docType)}/${encodeURIComponent(side)}/file${download ? '?download=1' : ''}`;
  },

  fetchDocumentFile: async (
    docType: string,
    side = 'front',
    download = false,
  ): Promise<{ blob?: Blob; base64?: string; mimeType: string; fileName: string }> => {
    const url = profileApi.getDocumentFileUrl(docType, side, download);
    const token = getAuthToken();
    const res = await fetch(url, {
      method: 'GET',
      headers: token
        ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` }
        : {},
    });
    if (!res.ok) {
      let msg = `Failed to load document (${res.status})`;
      try {
        const data = await res.json();
        if (data?.message) msg = Array.isArray(data.message) ? data.message.join('. ') : data.message;
      } catch {}
      throw new Error(msg);
    }
    const mimeType = res.headers.get('content-type') || 'application/octet-stream';
    const disposition = res.headers.get('content-disposition') || '';
    const match = disposition.match(/filename="?([^";]+)"?/i);
    const fileName = match?.[1] || `${docType}_${side}`;
    const blob = await res.blob();
    return { blob, mimeType, fileName };
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
    let resolvedUri = payload.fileUri;
    if (isLocalFileUri(resolvedUri)) {
      resolvedUri = await uploadMediaFile(
        resolvedUri,
        payload.fileName,
        payload.mimeType,
      );
    }
    return request<any>('/driver/profile/documents/upload', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        fileUri: resolvedUri,
      }),
    });
  },

  getKycStatus: async () => {
    return request<any>('/driver/profile/kyc/status', { method: 'GET' });
  },

  submitKyc: async () => {
    return request<any>('/driver/profile/kyc/submit', { method: 'POST' });
  },

  updateAvailability: async (
    isOnline: boolean,
    coords?: { latitude: number; longitude: number; accuracy?: number },
  ) => {
    return request<{
      success?: boolean;
      isOnline: boolean;
      status?: string;
      hubDistanceMeters?: number | null;
      hubName?: string | null;
      message?: string;
    }>('/driver/profile/availability', {
      method: 'PUT',
      body: JSON.stringify({
        isOnline,
        ...(coords
          ? {
              latitude: coords.latitude,
              longitude: coords.longitude,
              ...(typeof coords.accuracy === 'number' ? { accuracy: coords.accuracy } : {}),
            }
          : {}),
      }),
    });
  },

  updateLocation: async (coords: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    accuracy?: number;
    timestamp?: number;
    orderId?: string;
  }) => {
    return request<any>('/driver/profile/location', {
      method: 'POST',
      body: JSON.stringify(coords),
    });
  },
};
