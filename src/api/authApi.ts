import { request, setAuthToken } from './client';

export interface SendOtpResponse {
  success: boolean;
  message: string;
  countdownSeconds?: number;
  mockOtp?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  token: string;
  role: string;
  kycStatus: string;
  user: {
    id: string;
    driverId: string;
    name: string;
    fullName: string;
    phone: string;
    email: string;
    kycStatus: string;
    isOnline: boolean;
    workPreference: string;
  };
}

export interface AccountStatusResponse {
  success: boolean;
  driverId: string;
  fullName: string;
  kycStatus: string;
  isApproved: boolean;
  isOnline: boolean;
  workPreference: string;
  rejectionReason: string | null;
}

export const authApi = {
  sendOtp: async (phone: string): Promise<SendOtpResponse> => {
    return request<SendOtpResponse>('/driver/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone, phoneNumber: phone }),
    });
  },

  verifyOtp: async (phone: string, otp: string): Promise<VerifyOtpResponse> => {
    const res = await request<VerifyOtpResponse>('/driver/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, phoneNumber: phone, otp }),
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  getStatus: async (): Promise<AccountStatusResponse> => {
    return request<AccountStatusResponse>('/driver/auth/status', {
      method: 'GET',
    });
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await request<{ success: boolean; message: string }>('/driver/auth/logout', {
        method: 'POST',
      });
      setAuthToken(null);
      return res;
    } catch (e) {
      setAuthToken(null);
      return { success: true, message: 'Logged out locally' };
    }
  },
};
