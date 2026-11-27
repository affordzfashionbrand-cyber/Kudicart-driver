import { classifyOtpError, getFriendlyErrorMessage, isNetworkFailureError } from '../utils/errorHandling';
import { calculateDistanceMeters, evaluateHubProximity } from '../utils/geospatial';
import { APP_VERSION, compareSemver } from '../config/appInfo';
import { getDocStatusConfig } from '../features/profile/subviews/DocumentsSubview';
import { useAuthStore } from '../store/useAuthStore';
import { useDriverStore } from '../store/useDriverStore';
import { authApi, profileApi } from '../api';

describe('Driver Audit Modules — Comprehensive Unit & Integration Verification', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Module 1: OTP Error Classification & Friendly Messages', () => {
    it('classifies invalid OTP accurately', () => {
      const res = classifyOtpError({ code: 'auth/invalid-verification-code', message: 'Firebase invalid code' });
      expect(res.category).toBe('INVALID_OTP');
      expect(res.message).toBe('Invalid OTP. Please try again.');
    });

    it('classifies expired OTP separately from invalid OTP', () => {
      const res = classifyOtpError({ code: 'auth/code-expired', message: 'Code expired' });
      expect(res.category).toBe('EXPIRED_OTP');
      expect(res.message).toContain('expired');
    });

    it('classifies already-used OTP separately', () => {
      const res = classifyOtpError({ status: 401, message: 'This OTP has already been used. Please request a new OTP.' });
      expect(res.category).toBe('USED_OTP');
      expect(res.message).toContain('already been used');
    });

    it('classifies missing active OTP / unreceived OTP separately', () => {
      const res = classifyOtpError({ status: 401, message: 'No active OTP request found. Please request a new OTP.' });
      expect(res.category).toBe('NO_ACTIVE_OTP');
      expect(res.message).toContain('No active OTP');
    });

    it('classifies too many verification attempts / HTTP 429', () => {
      const res = classifyOtpError({ status: 429, message: 'Too many requests' });
      expect(res.category).toBe('TOO_MANY_ATTEMPTS');
      expect(res.isRetryable).toBe(false);
    });

    it('classifies resend OTP failures clearly', () => {
      const res = classifyOtpError({ status: 400, message: 'SMS provider throttled' }, 'resend');
      expect(res.category).toBe('RESEND_FAILED');
      expect(res.message).toBe('SMS provider throttled');
    });

    it('classifies network failures without leaking raw technical exceptions', () => {
      const err = { message: 'TypeError: Failed to fetch', isNetworkError: true };
      expect(isNetworkFailureError(err)).toBe(true);
      const otpRes = classifyOtpError(err);
      expect(otpRes.category).toBe('NETWORK');
      expect(otpRes.message).toContain('network');
      expect(getFriendlyErrorMessage(err)).not.toContain('TypeError');
    });

    it('classifies 5xx server failures cleanly', () => {
      const res = classifyOtpError({ status: 503, message: 'Bad Gateway' });
      expect(res.category).toBe('SERVER');
      expect(res.message).toContain('temporarily unavailable');
    });
  });

  describe('Module 2 & 3: One-Time Approval Flow & DTO Sanitization', () => {
    it('acknowledges approval on backend and preserves seen flag across logout when returning approved', async () => {
      const ackSpy = jest.spyOn(profileApi, 'acknowledgeApproval').mockResolvedValue({
        success: true,
        driverId: 'drv-test-1',
        hasSeenApproval: true,
        approvalAcknowledgedAt: new Date().toISOString(),
      });

      useAuthStore.setState({
        isAuthenticated: true,
        driverId: 'drv-test-1',
        phoneNumber: '+91 98765 43210',
        kycStatus: 'APPROVED',
        hasSeenKycApproved: false,
      });

      await useAuthStore.getState().acknowledgeApprovalAsync();
      expect(ackSpy).toHaveBeenCalledTimes(1);
      expect(useAuthStore.getState().hasSeenKycApproved).toBe(true);

      // Re-login after logout should honor server hasSeenApproval
      jest.spyOn(authApi, 'verifyOtp').mockResolvedValue({
        success: true,
        token: 'jwt-123',
        role: 'DRIVER',
        driverId: 'drv-test-1',
        kycStatus: 'APPROVED',
        hasSeenApproval: true,
        user: {
          id: 'usr-1',
          driverId: 'drv-test-1',
          name: 'Rajesh',
          fullName: 'Rajesh Kumar',
          phone: '+91 98765 43210',
          email: '',
          kycStatus: 'APPROVED',
          hasSeenApproval: true,
          isOnline: false,
          workPreference: 'FULL_TIME',
        },
      });

      await useAuthStore.getState().verifyOtpAsync('+91 98765 43210', '123456');
      expect(useAuthStore.getState().hasSeenKycApproved).toBe(true);
    });

    it('never sends disallowed status property to backend updateDetails DTO', () => {
      const updateSpy = jest.spyOn(profileApi, 'updateDetails').mockResolvedValue({});
      useDriverStore.getState().updateProfile({ status: 'Active' } as any);
      expect(updateSpy).not.toHaveBeenCalled();

      useDriverStore.getState().updateProfile({ fullName: 'Rajesh Updated', status: 'Active' } as any);
      expect(updateSpy).toHaveBeenCalledWith({ fullName: 'Rajesh Updated' });
    });
  });

  describe('Module 9 & 11: Real App Version Semver & Document Status Labels', () => {
    it('compares app semantic versions accurately', () => {
      expect(APP_VERSION).toBe('1.0.0');
      expect(compareSemver('1.0.1', '1.0.0')).toBeGreaterThan(0);
      expect(compareSemver('1.0.0', '1.0.0')).toBe(0);
      expect(compareSemver('0.9.9', '1.0.0')).toBeLessThan(0);
    });

    it('maps every real document verification status accurately', () => {
      expect(getDocStatusConfig('VERIFIED').label).toBe('Verified');
      expect(getDocStatusConfig('APPROVED').label).toBe('Verified');
      expect(getDocStatusConfig('UNDER_REVIEW').label).toBe('Under review');
      expect(getDocStatusConfig('PENDING').label).toBe('Pending');
      expect(getDocStatusConfig('REJECTED').label).toBe('Rejected');
      expect(getDocStatusConfig('NOT_UPLOADED').label).toBe('Not uploaded');
      expect(getDocStatusConfig('').label).toBe('Not uploaded');
    });
  });

  describe('Module 13: 50m Hub Proximity Geofence Verification', () => {
    const HUB_LAT = 12.9716;
    const HUB_LNG = 77.6412;

    it('allows duty login when driver is within 50 meters of assigned hub', () => {
      // ~11 meters north of hub
      const res = evaluateHubProximity({
        driverLat: 12.9717,
        driverLng: 77.6412,
        hubLat: HUB_LAT,
        hubLng: HUB_LNG,
        accuracyMeters: 12,
      });
      expect(res.allowed).toBe(true);
      expect(res.distanceMeters).toBeLessThanOrEqual(50);
    });

    it('blocks duty login when driver is farther than 50 meters from assigned hub', () => {
      // ~222 meters north of hub
      const dist = calculateDistanceMeters(12.9736, 77.6412, HUB_LAT, HUB_LNG);
      expect(dist).toBeGreaterThan(50);

      const res = evaluateHubProximity({
        driverLat: 12.9736,
        driverLng: 77.6412,
        hubLat: HUB_LAT,
        hubLng: HUB_LNG,
        accuracyMeters: 15,
      });
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Move within 50m');
    });

    it('blocks duty login when GPS accuracy is too weak or coordinates are missing', () => {
      expect(
        evaluateHubProximity({
          driverLat: HUB_LAT,
          driverLng: HUB_LNG,
          hubLat: HUB_LAT,
          hubLng: HUB_LNG,
          accuracyMeters: 300,
        }).allowed,
      ).toBe(false);

      expect(
        evaluateHubProximity({
          driverLat: null,
          driverLng: null,
          hubLat: HUB_LAT,
          hubLng: HUB_LNG,
        }).allowed,
      ).toBe(false);
    });
  });
});
